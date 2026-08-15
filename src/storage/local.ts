import { access, appendFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { Event, Job, Manifest, Page, ProjectData, StateCache } from '../core/types.js';
import { SCHEMA_VERSION } from '../core/types.js';
import { discoverProject } from './discovery.js';

const PROTECTIVE_GITIGNORE = '*\n!.gitignore\n';

function trxPath(root: string, file: string): string {
  return path.join(root, '.trx', file);
}

async function readJson<T>(file: string): Promise<T> {
  return JSON.parse(await readFile(file, 'utf8')) as T;
}

export interface InitOptions {
  jobId: string;
  sourceLanguage: string;
  targetLanguage: string;
  country?: string;
  region?: string;
  physicalPageCount: number;
  billablePages: number[];
  quotedTotal?: number;
  currency?: string;
  netFactor?: number;
  now?: Date;
}

export async function initializeProject(root: string, options: InitOptions): Promise<ProjectData> {
  const trxDir = path.join(root, '.trx');
  await mkdir(trxDir, { recursive: true });
  try {
    await access(path.join(trxDir, 'job.json'));
    throw new Error(`A TRX project already exists at ${trxDir}.`);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
  }
  const now = (options.now ?? new Date()).toISOString();
  const pages: Page[] = options.billablePages.map((pdfPage, index) => ({
    pdf_page: pdfPage,
    billable_page: index + 1,
    country: options.country,
    region: options.region,
    status: 'PENDING',
    active_seconds: 0,
  }));
  const job: Job = {
    schema_version: SCHEMA_VERSION,
    job_id: options.jobId,
    source_language: options.sourceLanguage,
    target_language: options.targetLanguage,
    default_country: options.country,
    default_region: options.region,
    quoted_pages: options.billablePages.length,
    quoted_total: options.quotedTotal,
    currency: options.currency,
    net_factor: options.netFactor,
    status: 'ACTIVE',
    created_at: now,
  };
  const manifest: Manifest = {
    schema_version: SCHEMA_VERSION,
    physical_page_count: options.physicalPageCount,
    non_billable_pages: Array.from({ length: options.physicalPageCount }, (_, index) => index + 1)
      .filter((page) => !options.billablePages.includes(page)),
    pages,
  };
  const state: StateCache = {
    schema_version: SCHEMA_VERSION,
    current_page: null,
    last_action: 'Initialized the project',
    updated_at: now,
  };
  try {
    await access(path.join(trxDir, '.gitignore'));
  } catch {
    await writeFile(path.join(trxDir, '.gitignore'), PROTECTIVE_GITIGNORE);
  }
  await writeJson(trxPath(root, 'job.json'), job);
  await writeJson(trxPath(root, 'manifest.json'), manifest);
  await writeJson(trxPath(root, 'state.json'), state);
  const event: Event = { schema_version: SCHEMA_VERSION, type: 'job_initialized', timestamp: now };
  await writeFile(trxPath(root, 'events.jsonl'), `${JSON.stringify(event)}\n`);
  return { root, trxDir, job, manifest, state };
}

async function writeJson(file: string, value: unknown): Promise<void> {
  await writeFile(file, `${JSON.stringify(value, null, 2)}\n`);
}

export async function loadProject(root?: string): Promise<ProjectData> {
  const resolvedRoot = await discoverProject(root ?? process.cwd());
  if (!resolvedRoot) throw new Error('No TRX project found. Run `trx init` in a translation project.');
  const [job, manifest, state] = await Promise.all([
    readJson<Job>(trxPath(resolvedRoot, 'job.json')),
    readJson<Manifest>(trxPath(resolvedRoot, 'manifest.json')),
    readJson<StateCache>(trxPath(resolvedRoot, 'state.json')),
  ]);
  return { root: resolvedRoot, trxDir: path.join(resolvedRoot, '.trx'), job, manifest, state };
}

export async function persistResult(project: ProjectData, result: { job: Job; manifest: Manifest; state: StateCache; event: Event }): Promise<ProjectData> {
  await writeJson(path.join(project.trxDir, 'job.json'), result.job);
  await writeJson(path.join(project.trxDir, 'manifest.json'), result.manifest);
  await writeJson(path.join(project.trxDir, 'state.json'), result.state);
  await appendFile(path.join(project.trxDir, 'events.jsonl'), `${JSON.stringify(result.event)}\n`);
  return { ...project, job: result.job, manifest: result.manifest, state: result.state };
}
