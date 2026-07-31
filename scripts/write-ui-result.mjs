#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFlag, runEvaluation } from './lib/scoring.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const defaultOut = join(root, 'evaluations', 'latest.json');

const resultPath = readFlag(process.argv, '--result');
const ratingsPath = readFlag(process.argv, '--ratings');
const outPath = readFlag(process.argv, '--out') ?? defaultOut;

let payload;

if (resultPath) {
  payload = JSON.parse(readFileSync(resultPath, 'utf8'));
} else if (ratingsPath) {
  const data = JSON.parse(readFileSync(ratingsPath, 'utf8'));
  const poc = data.poc ?? data.pocCriteria;
  const market = data.market ?? data.marketCriteria;
  const scored = runEvaluation({ poc, market });
  payload = {
    id: data.id ?? `eval-${Date.now()}`,
    timestamp: data.timestamp ?? new Date().toISOString(),
    ideaTitle: data.ideaTitle ?? '',
    ideaDescription: data.ideaDescription ?? '',
    pocCriteria: poc,
    marketCriteria: market,
    ...scored,
    technicalSummary: data.technicalSummary ?? '',
    marketSummary: data.marketSummary ?? '',
    insights: data.insights ?? [],
  };
} else {
  console.error(
    'Usage:\n' +
      '  node scripts/write-ui-result.mjs --result result.json [--out path]\n' +
      '  node scripts/write-ui-result.mjs --ratings ratings.json [--out path]',
  );
  process.exit(1);
}

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ ok: true, path: outPath }));
