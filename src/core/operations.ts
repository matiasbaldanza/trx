import { DomainError } from './errors.js';
import { SCHEMA_VERSION, type DomainResult, type Event, type Job, type Manifest, type Page, type StateCache } from './types.js';

const measurement = { method: 'timer' as const, confidence: 'high' as const };

function iso(now: Date): string {
  return now.toISOString();
}

function secondsBetween(start: string, end: Date): number {
  return Math.max(0, (end.getTime() - new Date(start).getTime()) / 1000);
}

function currentPage(manifest: Manifest, state: StateCache): Page {
  if (state.current_page === null) {
    throw new DomainError('No page is currently active.');
  }
  const page = manifest.pages.find((candidate) => candidate.pdf_page === state.current_page);
  if (!page) {
    throw new DomainError(`Current page ${state.current_page} is missing from the manifest.`);
  }
  return page;
}

function result(job: Job, manifest: Manifest, state: StateCache, event: Event): DomainResult {
  return { job, manifest, state, event };
}

export function nextPendingPage(manifest: Manifest): Page | undefined {
  return manifest.pages
    .filter((page) => page.status === 'PENDING')
    .sort((a, b) => a.billable_page - b.billable_page)[0];
}

export function startPage(
  job: Job,
  manifest: Manifest,
  state: StateCache,
  now: Date,
  requestedPdfPage?: number,
): DomainResult {
  if (job.status !== 'ACTIVE') throw new DomainError('The job is finished. Run `trx reopen` before starting work.');
  if (state.current_page !== null) throw new DomainError('A page is already in progress. Complete, pause, or resume it first.');

  const page = requestedPdfPage === undefined
    ? nextPendingPage(manifest)
    : manifest.pages.find((candidate) => candidate.pdf_page === requestedPdfPage);
  if (!page) {
    throw new DomainError(requestedPdfPage === undefined ? 'There are no pending billable pages.' : `PDF page ${requestedPdfPage} is not in the billable manifest.`);
  }
  if (page.status !== 'PENDING') throw new DomainError(`PDF page ${page.pdf_page} is already ${page.status.toLowerCase()}.`);

  const timestamp = iso(now);
  page.status = 'WORKING';
  page.started_at = timestamp;
  page.active_started_at = timestamp;
  page.measurement = measurement;
  state.current_page = page.pdf_page;
  state.last_action = `Started page ${page.pdf_page}`;
  state.updated_at = timestamp;
  return result(job, manifest, state, { schema_version: SCHEMA_VERSION, type: 'page_started', timestamp, page: page.pdf_page });
}

export function pausePage(job: Job, manifest: Manifest, state: StateCache, now: Date): DomainResult {
  const page = currentPage(manifest, state);
  if (page.status !== 'WORKING' || !page.active_started_at) throw new DomainError('The current page is not actively running.');
  page.active_seconds += secondsBetween(page.active_started_at, now);
  page.active_started_at = undefined;
  page.status = 'PAUSED';
  const timestamp = iso(now);
  state.last_action = `Paused page ${page.pdf_page}`;
  state.updated_at = timestamp;
  return result(job, manifest, state, { schema_version: SCHEMA_VERSION, type: 'timer_paused', timestamp, page: page.pdf_page, active_seconds: page.active_seconds });
}

export function resumePage(job: Job, manifest: Manifest, state: StateCache, now: Date): DomainResult {
  const page = currentPage(manifest, state);
  if (page.status !== 'PAUSED') throw new DomainError('The current page is not paused.');
  const timestamp = iso(now);
  page.active_started_at = timestamp;
  page.status = 'WORKING';
  state.last_action = `Resumed page ${page.pdf_page}`;
  state.updated_at = timestamp;
  return result(job, manifest, state, { schema_version: SCHEMA_VERSION, type: 'timer_resumed', timestamp, page: page.pdf_page });
}

export function completePage(job: Job, manifest: Manifest, state: StateCache, now: Date): DomainResult {
  const page = currentPage(manifest, state);
  if (page.status !== 'WORKING' && page.status !== 'PAUSED') throw new DomainError('The current page cannot be completed.');
  if (page.status === 'WORKING' && page.active_started_at) {
    page.active_seconds += secondsBetween(page.active_started_at, now);
  }
  page.active_started_at = undefined;
  page.status = 'COMPLETED';
  page.completed_at = iso(now);
  page.measurement = measurement;
  state.current_page = null;
  state.last_action = `Completed page ${page.pdf_page}`;
  state.updated_at = iso(now);
  return result(job, manifest, state, { schema_version: SCHEMA_VERSION, type: 'page_completed', timestamp: iso(now), page: page.pdf_page, active_seconds: page.active_seconds });
}

export function finishJob(job: Job, manifest: Manifest, state: StateCache, now: Date): DomainResult {
  if (job.status === 'FINISHED') throw new DomainError('The job is already finished.');
  if (state.current_page !== null) throw new DomainError('A page is still in progress. Complete it before finishing the job.');
  const pending = nextPendingPage(manifest);
  if (pending) throw new DomainError(`Page ${pending.pdf_page} is still pending. Complete all billable pages before finishing.`);
  const timestamp = iso(now);
  job.status = 'FINISHED';
  job.finished_at = timestamp;
  state.last_action = 'Finished the job';
  state.updated_at = timestamp;
  return result(job, manifest, state, { schema_version: SCHEMA_VERSION, type: 'job_finished', timestamp });
}

export function reopenJob(job: Job, manifest: Manifest, state: StateCache, now: Date): DomainResult {
  if (job.status === 'ACTIVE') throw new DomainError('The job is already active.');
  const timestamp = iso(now);
  job.status = 'ACTIVE';
  job.finished_at = undefined;
  state.last_action = 'Reopened the job';
  state.updated_at = timestamp;
  return result(job, manifest, state, { schema_version: SCHEMA_VERSION, type: 'job_reopened', timestamp });
}
