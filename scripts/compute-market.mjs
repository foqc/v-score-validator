#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { computeMarketScore, readFlag } from './lib/scoring.mjs';

const ratingsPath = readFlag(process.argv, '--ratings');
if (!ratingsPath) {
  console.error('Usage: node scripts/compute-market.mjs --ratings ratings.json');
  process.exit(1);
}

const data = JSON.parse(readFileSync(ratingsPath, 'utf8'));
const market = data.market ?? data.marketCriteria ?? data;
try {
  const marketScore = computeMarketScore(market);
  console.log(JSON.stringify({ ok: true, marketScore }));
} catch (err) {
  console.error(err.message);
  process.exit(1);
}
