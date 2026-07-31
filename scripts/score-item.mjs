#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import {
  validateRating,
  scoreResourcesFromAnswers,
  readFlag,
} from './lib/scoring.mjs';

const criterion = readFlag(process.argv, '--criterion');
const answersPath = readFlag(process.argv, '--answers');
const value = readFlag(process.argv, '--value');

if (!criterion) {
  console.error(
    'Usage:\n' +
      '  node scripts/score-item.mjs --criterion resources --answers answers.json\n' +
      '  node scripts/score-item.mjs --criterion <name> --value <1-10>',
  );
  process.exit(1);
}

if (criterion === 'resources') {
  if (!answersPath) {
    console.error('Resources scoring requires --answers <path-to-json>');
    process.exit(1);
  }
  const answers = JSON.parse(readFileSync(answersPath, 'utf8'));
  const list = Array.isArray(answers) ? answers : answers.answers;
  if (!Array.isArray(list)) {
    console.error('Answers JSON must be an array or { "answers": [...] }');
    process.exit(1);
  }
  try {
    const rating = scoreResourcesFromAnswers(list);
    console.log(JSON.stringify({ ok: true, criterion, rating }));
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
  process.exit(0);
}

if (value === null) {
  console.error(`Criterion "${criterion}" requires --value <1-10>`);
  process.exit(1);
}

const rating = validateRating(value);
if (rating === null) {
  console.error(`Invalid input '${value}'. Please enter a whole number 1-10.`);
  process.exit(1);
}

console.log(JSON.stringify({ ok: true, criterion, rating }));
