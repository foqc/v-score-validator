#!/usr/bin/env node
import {
  runEvaluation,
  validateRating,
  getRecommendation,
  HIGH_THRESHOLD,
} from './lib/scoring.mjs';

const cases = [];

const assertEqual = (label, actual, expected) => {
  const ok = Object.is(actual, expected) || actual === expected;
  cases.push({ label, ok, actual, expected });
  if (!ok) {
    console.error(`FAIL ${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  } else {
    console.log(`PASS ${label}`);
  }
};

// validate-rating unit checks
assertEqual('validate 7', validateRating('7'), 7);
assertEqual('validate 0', validateRating('0'), null);
assertEqual('validate 11', validateRating('11'), null);
assertEqual('validate five', validateRating('five'), null);
assertEqual('validate 5.5', validateRating('5.5'), null);
assertEqual('validate empty', validateRating(''), null);

// Case 1: all 10s
{
  const poc = { novelty: 10, scope: 10, resources: 10, outcome: 10 };
  const market = { pain: 10, pay: 10, size: 10, diff: 10 };
  const result = runEvaluation({ poc, market });
  assertEqual('all10s poc', result.pocScore, 100);
  assertEqual('all10s market', result.marketScore, 100);
  assertEqual('all10s verdict', result.recommendation, 'Go / Full Speed Ahead');
}

// Case 2: all 1s
{
  const poc = { novelty: 1, scope: 1, resources: 1, outcome: 1 };
  const market = { pain: 1, pay: 1, size: 1, diff: 1 };
  const result = runEvaluation({ poc, market });
  assertEqual('all1s poc', result.pocScore, 10);
  assertEqual('all1s market', result.marketScore, 10);
  assertEqual('all1s verdict', result.recommendation, 'Reframe or Shelve');
}

// Case 3: boundary 65 / 64
{
  const poc = { novelty: 7, scope: 7, resources: 5, outcome: 6 };
  const market = { pain: 8, pay: 6, size: 5, diff: 4 };
  const result = runEvaluation({ poc, market });
  assertEqual('boundary poc', result.pocScore, 65);
  assertEqual('boundary market', result.marketScore, 64);
  assertEqual('boundary verdict', result.recommendation, 'Validate Demand');
  assertEqual('threshold inclusive', 65 >= HIGH_THRESHOLD, true);
}

// Extra matrix corners
assertEqual(
  'matrix 65/65',
  getRecommendation(65, 65).verdict,
  'Go / Full Speed Ahead',
);
assertEqual('matrix 64/65', getRecommendation(64, 65).verdict, 'De-risk First');
assertEqual('matrix 65/64', getRecommendation(65, 64).verdict, 'Validate Demand');
assertEqual('matrix 64/64', getRecommendation(64, 64).verdict, 'Reframe or Shelve');

const failed = cases.filter((c) => !c.ok).length;
console.log(`\n${cases.length - failed}/${cases.length} passed`);
process.exit(failed === 0 ? 0 : 1);
