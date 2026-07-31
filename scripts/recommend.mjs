#!/usr/bin/env node
import { getRecommendation, readFlag } from './lib/scoring.mjs';

const pocRaw = readFlag(process.argv, '--poc');
const marketRaw = readFlag(process.argv, '--market');

if (pocRaw === null || marketRaw === null) {
  console.error('Usage: node scripts/recommend.mjs --poc <n> --market <n>');
  process.exit(1);
}

const pocScore = Number(pocRaw);
const marketScore = Number(marketRaw);
if (!Number.isFinite(pocScore) || !Number.isFinite(marketScore)) {
  console.error('PoC and Market scores must be numbers');
  process.exit(1);
}

const { verdict, explanation } = getRecommendation(pocScore, marketScore);
console.log(
  JSON.stringify({
    ok: true,
    pocScore,
    marketScore,
    recommendation: verdict,
    explanation,
  }),
);
