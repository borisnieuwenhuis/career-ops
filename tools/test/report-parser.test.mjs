import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseReport } from '../lib/report-parser.mjs';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SAMPLE = join(__dirname, 'fixtures', 'report-sample.md');

test('parseReport extracts header fields', () => {
  const text = readFileSync(SAMPLE, 'utf8');
  const r = parseReport(text, SAMPLE);
  assert.equal(r.header.score, '4.2/5');
  assert.equal(r.header.url, 'https://example.com/jobs/42');
  assert.equal(r.header.legitimacy, 'green');
  assert.equal(r.header.date, '2026-04-20');
});

test('parseReport extracts identity from H1', () => {
  const text = readFileSync(SAMPLE, 'utf8');
  const r = parseReport(text, SAMPLE);
  assert.equal(r.identity.company, 'Example Corp');
  assert.equal(r.identity.role, 'Example Role');
});

test('parseReport extracts Block A-G as section map', () => {
  const text = readFileSync(SAMPLE, 'utf8');
  const r = parseReport(text, SAMPLE);
  assert.equal(Object.keys(r.sections).sort().join(','), 'A,B,C,D,E,F,G');
  assert.match(r.sections.A, /Amsterdam hybrid/);
  assert.match(r.sections.G, /Green/);
});

test('parseReport throws loudly when H1 missing', () => {
  assert.throws(
    () => parseReport('no heading here', 'fake.md'),
    /Could not parse/,
  );
});
