import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { discoverProject, initializeProject, loadProject } from '../src/storage/index.js';

test('discovers the nearest project while walking upward', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'trx-test-'));
  const nested = path.join(root, 'source', 'nested');
  await mkdir(nested, { recursive: true });
  await initializeProject(root, {
    jobId: 'SYN-DISCOVERY',
    sourceLanguage: 'ES',
    targetLanguage: 'EN',
    physicalPageCount: 2,
    billablePages: [1, 2],
  });
  assert.equal(await discoverProject(nested), root);
  assert.equal((await loadProject(nested)).job.job_id, 'SYN-DISCOVERY');
});

test('init protects local data without overwriting an existing project gitignore', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'trx-test-'));
  await mkdir(path.join(root, '.trx'), { recursive: true });
  await writeFile(path.join(root, '.trx', '.gitignore'), 'custom\n');
  await initializeProject(root, {
    jobId: 'SYN-PRIVACY',
    sourceLanguage: 'ES',
    targetLanguage: 'EN',
    physicalPageCount: 1,
    billablePages: [1],
  });
  assert.equal(await readFile(path.join(root, '.trx', '.gitignore'), 'utf8'), 'custom\n');
});
