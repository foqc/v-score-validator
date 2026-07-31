#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { computePocScore, readFlag } from './lib/scoring.mjs';

const ratingsPath = readFlag(process.argv, '--ratings');
if (!ratingsPath) {
  console.error('Usage: node scripts/compute-poc.mjs --ratings ratings.json');
  process.exit(1);
}

const data = JSON.parse(readFileSync(ratingsPath, 'utf8'));
const poc = data.poc ?? data.pocCriteria ?? data;
try {
  const pocScore = computePocScore(poc);
  console.log(JSON.stringify({ ok: true, pocScore }));
} catch (err) {
  console.error(err.message);
  process.exit(1);
}
