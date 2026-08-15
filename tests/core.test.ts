import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildReport,
  completePage,
  DomainError,
  finishJob,
  nextPendingPage,
  pausePage,
  reopenJob,
  resumePage,
  startPage,
  type Job,
  type Manifest,
  type StateCache,
} from '../src/core/index.js';

const at = (seconds: number) => new Date(seconds * 1000);

function fixture(): { job: Job; manifest: Manifest; state: StateCache } {
  const pages = [1, 2, 3].map((pdfPage, index) => ({
    pdf_page: pdfPage,
    billable_page: index + 1,
    status: 'PENDING' as const,
    active_seconds: 0,
  }));
  return {
    job: {
      schema_version: 1,
      job_id: 'SYN-TEST',
      source_language: 'ES',
      target_language: 'EN',
      quoted_pages: 3,
      quoted_total: 30,
      currency: 'USD',
      net_factor: 0.8,
      status: 'ACTIVE',
      created_at: at(0).toISOString(),
    },
    manifest: { schema_version: 1, physical_page_count: 3, non_billable_pages: [], pages },
    state: { schema_version: 1, current_page: null, updated_at: at(0).toISOString() },
  };
}

test('pause and resume exclude paused time from active seconds', () => {
  const value = fixture();
  startPage(value.job, value.manifest, value.state, at(0));
  pausePage(value.job, value.manifest, value.state, at(10));
  resumePage(value.job, value.manifest, value.state, at(100));
  completePage(value.job, value.manifest, value.state, at(130));
  assert.equal(value.manifest.pages[0].active_seconds, 40);
  assert.equal(value.manifest.pages[0].status, 'COMPLETED');
  assert.equal(value.state.current_page, null);
});

test('start without a page selects the next pending page and explicit page supports out of order work', () => {
  const value = fixture();
  startPage(value.job, value.manifest, value.state, at(0), 3);
  assert.equal(value.state.current_page, 3);
  completePage(value.job, value.manifest, value.state, at(1));
  assert.equal(nextPendingPage(value.manifest)?.pdf_page, 1);
  startPage(value.job, value.manifest, value.state, at(2));
  assert.equal(value.state.current_page, 1);
});

test('next is read-only and finish refuses pending work', () => {
  const value = fixture();
  const before = structuredClone(value);
  assert.equal(nextPendingPage(value.manifest)?.pdf_page, 1);
  assert.deepEqual(value, before);
  assert.throws(() => finishJob(value.job, value.manifest, value.state, at(0)), DomainError);
});

test('report derives timing and profitability metrics from completed pages', () => {
  const value = fixture();
  startPage(value.job, value.manifest, value.state, at(0));
  completePage(value.job, value.manifest, value.state, at(60));
  startPage(value.job, value.manifest, value.state, at(70), 2);
  completePage(value.job, value.manifest, value.state, at(190));
  const report = buildReport(value.job, value.manifest, value.state, at(200));
  assert.equal(report.active_seconds, 180);
  assert.equal(report.average_active_seconds, 90);
  assert.equal(report.median_active_seconds, 90);
  assert.equal(report.pages_per_hour, 40);
  assert.equal(report.net_revenue, 24);
  assert.equal(report.effective_hourly_rate, 480);
});

test('finish closes a complete job and reopen only reopens the job', () => {
  const value = fixture();
  for (const page of [1, 2, 3]) {
    startPage(value.job, value.manifest, value.state, at(page), page);
    completePage(value.job, value.manifest, value.state, at(page + 1));
  }
  finishJob(value.job, value.manifest, value.state, at(10));
  assert.equal(value.job.status, 'FINISHED');
  reopenJob(value.job, value.manifest, value.state, at(11));
  assert.equal(value.job.status, 'ACTIVE');
  assert.equal(value.manifest.pages.every((page) => page.status === 'COMPLETED'), true);
  assert.equal(value.state.current_page, null);
});
