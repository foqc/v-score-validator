#!/usr/bin/env node
import { validateRating, readFlag } from './lib/scoring.mjs';

const raw = readFlag(process.argv, '--value') ?? process.argv[2];
if (raw === undefined || raw === null) {
  console.error("Usage: node scripts/validate-rating.mjs --value <raw>");
  process.exit(1);
}

const rating = validateRating(raw);
if (rating === null) {
  console.error(`Invalid input '${raw}'. Please enter a whole number 1-10.`);
  process.exit(1);
}

console.log(JSON.stringify({ ok: true, rating }));
