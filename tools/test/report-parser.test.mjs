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

test('parseReport handles numeric-prefix H1 with em-dash separators', () => {
  const text = [
    '# 046 — Synthesia — Principal ML Platform Engineer',
    '',
    '**Company:** Synthesia',
    '**Role:** Principal ML Platform Engineer (Europe)',
    '',
    '## Block A — Role Summary',
    'body A',
    '',
    '## Block B — Match',
    'body B',
  ].join('\n');
  const r = parseReport(text, 'inline.md');
  assert.equal(r.identity.company, 'Synthesia');
  assert.equal(r.identity.role, 'Principal ML Platform Engineer (Europe)');
  assert.ok('A' in r.sections);
  assert.ok('B' in r.sections);
  assert.match(r.sections.A, /body A/);
  assert.match(r.sections.B, /body B/);
});

test('parseReport falls back to H1 parsing when **Company:** and **Role:** absent', () => {
  const text = [
    '# 003 — Parloa — Staff/Principal Software Engineer',
    '',
    '## A) Role Summary',
    'body',
  ].join('\n');
  const r = parseReport(text, 'inline.md');
  assert.equal(r.identity.company, 'Parloa');
  assert.equal(r.identity.role, 'Staff/Principal Software Engineer');
});

test('parseReport handles Spanish Evaluación: prefix in H1', () => {
  const text = [
    '# Evaluación: Attio — Senior Platform Engineer',
    '',
    '## A) Resumen',
    'body',
  ].join('\n');
  const r = parseReport(text, 'inline.md');
  assert.equal(r.identity.company, 'Attio');
  assert.equal(r.identity.role, 'Senior Platform Engineer');
});

test('parseReport accepts Block A section format', () => {
  const text = [
    '# Example Role at Example Corp',
    '',
    '## Block A — Role Summary',
    'body A',
    '',
    '## Block H — Hiring Panel',
    'body H',
  ].join('\n');
  const r = parseReport(text, 'inline.md');
  assert.ok('A' in r.sections);
  assert.ok('H' in r.sections);
  assert.match(r.sections.A, /body A/);
  assert.match(r.sections.H, /body H/);
});

test('parseReport collects all **Field:** lines into header', () => {
  const text = [
    '# Example Role at Example Corp',
    '',
    '**Arquetipo:** xyz',
    '**Verification:** unconfirmed',
    '**Legitimacy:** High Confidence',
    '**Score:** 4.0/5',
    '',
    '## A) Fit',
    'body',
  ].join('\n');
  const r = parseReport(text, 'inline.md');
  assert.equal(r.header.arquetipo, 'xyz');
  assert.equal(r.header.verification, 'unconfirmed');
  assert.equal(r.header.legitimacy, 'High Confidence');
  assert.equal(r.header.score, '4.0/5');
});

test('parseReport accepts Bloque A Spanish section format', () => {
  const text = [
    '# Example Role at Example Corp',
    '',
    '## Bloque A — Resumen',
    'body A',
    '',
    '## Bloque B — Match',
    'body B',
  ].join('\n');
  const r = parseReport(text, 'inline.md');
  assert.ok('A' in r.sections);
  assert.ok('B' in r.sections);
});

test('parseReport accepts Block A with hyphen separator', () => {
  const text = [
    '# Example Role at Example Corp',
    '',
    '## Block A - Role Summary',
    'body',
  ].join('\n');
  const r = parseReport(text, 'inline.md');
  assert.ok('A' in r.sections);
  assert.match(r.sections.A, /body/);
});
