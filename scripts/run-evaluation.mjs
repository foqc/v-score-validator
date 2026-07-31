#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { runEvaluation, readFlag } from './lib/scoring.mjs';

const ratingsPath = readFlag(process.argv, '--ratings');
if (!ratingsPath) {
  console.error('Usage: node scripts/run-evaluation.mjs --ratings ratings.json');
  process.exit(1);
}

const data = JSON.parse(readFileSync(ratingsPath, 'utf8'));
const poc = data.poc ?? data.pocCriteria;
const market = data.market ?? data.marketCriteria;

if (!poc || !market) {
  console.error('ratings.json must include poc/pocCriteria and market/marketCriteria');
  process.exit(1);
}

try {
  const result = runEvaluation({ poc, market });
  console.log(
    JSON.stringify(
      {
        ok: true,
        pocCriteria: poc,
        marketCriteria: market,
        ...result,
      },
      null,
      2,
    ),
  );
} catch (err) {
  console.error(err.message);
  process.exit(1);
}
