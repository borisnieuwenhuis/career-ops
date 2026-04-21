import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

export function loadCv() {
  const path = join(REPO_ROOT, 'cv.md');
  try {
    return readFileSync(path, 'utf8');
  } catch (err) {
    throw new Error(`Cannot read cv.md at ${path}: ${err.message}`);
  }
}
