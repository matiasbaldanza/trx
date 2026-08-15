#!/usr/bin/env node

import process from 'node:process';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
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
  type Page,
  type ProjectData,
  type Report,
} from '../core/index.js';
import { initializeProject, loadProject, persistResult } from '../storage/index.js';

type Flags = Record<string, string | boolean>;

function parseFlags(args: string[]): Flags {
  const flags: Flags = {};
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (!arg.startsWith('--')) continue;
    const [inlineKey, inlineValue] = arg.slice(2).split('=', 2);
    if (inlineValue !== undefined) {
      flags[inlineKey] = inlineValue;
    } else if (args[index + 1] && !args[index + 1].startsWith('--')) {
      flags[inlineKey] = args[index + 1];
      index += 1;
    } else {
      flags[inlineKey] = true;
    }
  }
  return flags;
}

function flag(flags: Flags, ...names: string[]): string | undefined {
  for (const name of names) {
    const value = flags[name];
    if (typeof value === 'string') return value;
  }
  return undefined;
}

function parseNumber(value: string | undefined, name: string): number | undefined {
  if (value === undefined) return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) throw new Error(`--${name} must be a number.`);
  return parsed;
}

export function parsePageList(value: string): number[] {
  const pages = new Set<number>();
  for (const part of value.split(',')) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const range = trimmed.match(/^(\d+)\s*-\s*(\d+)$/);
    if (range) {
      const start = Number(range[1]);
      const end = Number(range[2]);
      if (end < start) throw new Error(`Invalid page range: ${trimmed}.`);
      for (let page = start; page <= end; page += 1) pages.add(page);
    } else if (/^\d+$/.test(trimmed)) {
      pages.add(Number(trimmed));
    } else {
      throw new Error(`Invalid page list item: ${trimmed}.`);
    }
  }
  const result = [...pages].sort((a, b) => a - b);
  if (result.some((page) => page < 1)) throw new Error('Pages must be positive numbers.');
  if (result.length === 0) throw new Error('At least one billable page is required.');
  return result;
}

function formatDuration(seconds: number): string {
  const total = Math.max(0, Math.round(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const remaining = total % 60;
  if (hours) return `${hours}h ${minutes}m ${remaining}s`;
  if (minutes) return `${minutes}m ${remaining}s`;
  return `${remaining}s`;
}

function pageLabel(page: Page | undefined): string {
  return page ? `PDF page ${page.pdf_page} (billable ${page.billable_page})` : 'none';
}

function recommendation(project: ProjectData): string {
  if (project.job.status === 'FINISHED') return 'trx reopen';
  if (project.state.current_page !== null) {
    const page = project.manifest.pages.find((candidate) => candidate.pdf_page === project.state.current_page);
    return page?.status === 'PAUSED' ? 'trx resume' : 'trx done';
  }
  const next = nextPendingPage(project.manifest);
  return next ? 'trx start' : 'trx finish';
}

export function contextText(project: ProjectData, message: string, now = new Date()): string {
  const current = project.state.current_page === null
    ? undefined
    : project.manifest.pages.find((page) => page.pdf_page === project.state.current_page);
  const next = nextPendingPage(project.manifest);
  const completed = project.manifest.pages.filter((page) => page.status === 'COMPLETED').length;
  const currentTime = current && current.status === 'WORKING' && current.active_started_at
    ? current.active_seconds + (now.getTime() - new Date(current.active_started_at).getTime()) / 1000
    : current?.active_seconds;
  return [
    `\nTRX — ${project.job.job_id}`,
    `Location: ${project.root}`,
    `${project.job.source_language} → ${project.job.target_language}${project.job.default_country ? ` · ${project.job.default_country}` : ''}`,
    `State: ${project.job.status}`,
    `Progress: ${completed} / ${project.manifest.pages.length} billable pages`,
    `Current: ${current ? `${pageLabel(current)} — ${current.status}${currentTime !== undefined ? ` — ${formatDuration(currentTime)}` : ''}` : 'none'}`,
    `Last: ${project.state.last_action ?? 'none'}`,
    `Next: ${next ? pageLabel(next) : 'all billable pages complete'}`,
    `Recommended: ${recommendation(project)}`,
    message ? `\n✓ ${message}` : '',
  ].filter(Boolean).join('\n');
}

function reportText(report: Report, currency = ''): string {
  const money = (value: number | undefined) => value === undefined ? 'n/a' : `${currency ? `${currency} ` : ''}${value.toFixed(2)}`;
  return [
    '\nREPORT',
    `Completed: ${report.completed_pages} / ${report.total_pages} billable pages`,
    `Active time: ${formatDuration(report.active_seconds)}`,
    `Average per completed page: ${formatDuration(report.average_active_seconds)}`,
    `Median per completed page: ${formatDuration(report.median_active_seconds)}`,
    `Pages/hour: ${report.pages_per_hour.toFixed(2)}`,
    `Quoted total: ${money(report.quoted_total)}`,
    `Net revenue: ${money(report.net_revenue)}`,
    `Effective hourly rate: ${money(report.effective_hourly_rate)}`,
  ].join('\n');
}

async function initCommand(args: string[]): Promise<void> {
  const flags = parseFlags(args);
  const rl = process.stdin.isTTY ? createInterface({ input, output }) : undefined;
  const ask = async (label: string, fallback: string): Promise<string> => {
    if (!rl) return fallback;
    const answer = await rl.question(`${label} [${fallback}]: `);
    return answer.trim() || fallback;
  };
  try {
    const now = new Date();
    const jobId = flag(flags, 'job-id') ?? await ask('Job ID', `TRX-${now.toISOString().slice(0, 10)}`);
    const sourceLanguage = flag(flags, 'source', 'source-language') ?? await ask('Source language', 'ES');
    const targetLanguage = flag(flags, 'target', 'target-language') ?? await ask('Target language', 'EN');
    const country = flag(flags, 'country') ?? await ask('Default country', '');
    const region = flag(flags, 'region') ?? await ask('Default region', '');
    const pagesInput = flag(flags, 'pages', 'billable-pages') ?? await ask('Billable PDF pages', '1');
    const billablePages = parsePageList(pagesInput);
    const physicalPageCount = parseNumber(flag(flags, 'physical-pages'), 'physical-pages') ?? Math.max(...billablePages);
    const quotedTotal = parseNumber(flag(flags, 'quoted-total'), 'quoted-total');
    const netFactor = parseNumber(flag(flags, 'net-factor'), 'net-factor');
    const currency = flag(flags, 'currency') ?? (quotedTotal !== undefined ? 'USD' : undefined);
    const project = await initializeProject(process.cwd(), {
      jobId,
      sourceLanguage,
      targetLanguage,
      country: country || undefined,
      region: region || undefined,
      physicalPageCount,
      billablePages,
      quotedTotal,
      currency,
      netFactor,
    });
    console.log(contextText(project, `Initialized ${billablePages.length} billable pages.`));
  } finally {
    rl?.close();
  }
}

async function mutate(project: ProjectData, operation: (project: ProjectData) => ReturnType<typeof startPage>, message: (project: ProjectData) => string): Promise<void> {
  const result = operation(project);
  const updated = await persistResult(project, result);
  console.log(contextText(updated, message(updated)));
}

async function command(args: string[]): Promise<void> {
  const name = args[0] ?? '';
  if (name === 'init') return initCommand(args.slice(1));
  if (name === 'help' || name === '--help' || name === '-h') {
    console.log('trx [init|status|current|next|start [page]|pause|resume|done|report|finish|reopen]');
    return;
  }
  const project = await loadProject();
  if (name === 'status') {
    console.log(contextText(project, 'Status refreshed.'));
    return;
  }
  if (name === 'current') {
    const current = project.state.current_page === null ? undefined : project.manifest.pages.find((page) => page.pdf_page === project.state.current_page);
    console.log(contextText(project, current ? `Current work: ${pageLabel(current)}.` : 'There is no current page.'));
    return;
  }
  if (name === 'next') {
    const next = nextPendingPage(project.manifest);
    console.log(contextText(project, next ? `Next page: ${pageLabel(next)}.` : 'All billable pages are complete.'));
    return;
  }
  if (name === 'report') {
    const report = buildReport(project.job, project.manifest, project.state, new Date());
    console.log(contextText(project, 'Report calculated.'));
    console.log(reportText(report, report.currency));
    return;
  }
  if (name === 'start') {
    let requestedPage: number | undefined;
    if (args[1] !== undefined) {
      requestedPage = Number(args[1]);
      if (!Number.isInteger(requestedPage) || requestedPage < 1) throw new Error('Usage: trx start [positive PDF page number].');
    }
    return mutate(project, (value) => startPage(value.job, value.manifest, value.state, new Date(), requestedPage), (value) => `Started ${pageLabel(value.manifest.pages.find((candidate) => candidate.pdf_page === value.state.current_page))}.`);
  }
  if (name === 'pause') return mutate(project, (value) => pausePage(value.job, value.manifest, value.state, new Date()), () => 'Timer paused; paused time will not count toward active time.');
  if (name === 'resume') return mutate(project, (value) => resumePage(value.job, value.manifest, value.state, new Date()), () => 'Timer resumed.');
  if (name === 'done') return mutate(project, (value) => completePage(value.job, value.manifest, value.state, new Date()), () => 'Current page completed; the job remains open.');
  if (name === 'finish') return mutate(project, (value) => finishJob(value.job, value.manifest, value.state, new Date()), () => 'Job finished.');
  if (name === 'reopen') return mutate(project, (value) => reopenJob(value.job, value.manifest, value.state, new Date()), () => 'Job reopened; completed pages remain complete.');
  throw new Error(`Unknown command: ${name || '(none)'}. Run 'trx --help'.`);
}

async function bareCommand(): Promise<void> {
  const project = await loadProject();
  console.log(contextText(project, 'Context refreshed.'));
  if (!process.stdin.isTTY) return;
  const current = project.state.current_page === null ? undefined : project.manifest.pages.find((page) => page.pdf_page === project.state.current_page);
  const choices = current?.status === 'WORKING'
    ? ['done', 'pause', 'current', 'status', 'quit']
    : current?.status === 'PAUSED'
      ? ['resume', 'done', 'current', 'status', 'quit']
      : nextPendingPage(project.manifest)
        ? ['start', 'status', 'report', 'finish', 'quit']
        : ['report', 'finish', 'quit'];
  const rl = createInterface({ input, output });
  try {
    console.log('\nChoose an action:');
    choices.forEach((choice, index) => console.log(`  ${index + 1}. ${choice}`));
    const answer = await rl.question('Action: ');
    const selected = choices[Number(answer) - 1];
    if (selected && selected !== 'quit') await command([selected]);
  } finally {
    rl.close();
  }
}

export async function runCli(args = process.argv.slice(2)): Promise<void> {
  try {
    if (args.length === 0) await bareCommand();
    else await command(args);
  } catch (error) {
    const message = error instanceof DomainError || error instanceof Error ? error.message : String(error);
    console.error(`ERROR: ${message}`);
    process.exitCode = 1;
  }
}

const invokedPath = process.argv[1]?.replaceAll('\\', '/');
if (invokedPath?.endsWith('/cli/index.js')) {
  await runCli();
}
