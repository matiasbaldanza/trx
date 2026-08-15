import { access } from 'node:fs/promises';
import path from 'node:path';

export async function discoverProject(startDirectory: string = process.cwd()): Promise<string | undefined> {
  let directory = path.resolve(startDirectory);
  while (true) {
    try {
      await access(path.join(directory, '.trx'));
      return directory;
    } catch {
      const parent = path.dirname(directory);
      if (parent === directory) return undefined;
      directory = parent;
    }
  }
}
