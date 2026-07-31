/** Shared pure scoring helpers. No I/O. */

export const HIGH_THRESHOLD = 65;

export const POC_WEIGHTS = Object.freeze({
  novelty: 3,
  scope: 4,
  resources: 2,
  outcome: 1,
});

export const MARKET_WEIGHTS = Object.freeze({
  pain: 4,
  pay: 3,
  size: 2,
  diff: 1,
});

export const POC_KEYS = Object.freeze(Object.keys(POC_WEIGHTS));
export const MARKET_KEYS = Object.freeze(Object.keys(MARKET_WEIGHTS));

export const EXPLANATIONS = Object.freeze({
  'Go / Full Speed Ahead':
    'Both technical feasibility and market viability clear the 65 threshold. The idea is strong enough to pursue at full speed.',
  'De-risk First':
    'Market viability is strong, but technical feasibility is below 65. Reduce technical risk before scaling.',
  'Validate Demand':
    'Technical feasibility is strong, but market viability is below 65. Validate demand and willingness to pay before building further.',
  'Reframe or Shelve':
    'Both scores are below 65. Reframe the idea substantially or shelve it for now.',
});

/** Fixed PoC resource checklist factors (agent may infer availability from the idea; not a user questionnaire). */
export const POC_RESOURCE_ITEMS = Object.freeze([
  {
    id: 'skills',
    label: 'Required technical skills on the team (or able to hire/learn quickly)',
  },
  {
    id: 'tools',
    label: 'Development tools, platforms, and licenses needed to build a PoC',
  },
  {
    id: 'time',
    label: 'Dedicated time to ship a meaningful PoC (weeks, not spare evenings only)',
  },
  {
    id: 'data',
    label: 'Access to the data, APIs, or content the PoC depends on',
  },
  {
    id: 'dependencies',
    label: 'External dependencies under your control (vendors, partners, hardware)',
  },
  {
    id: 'environment',
    label: 'Runtime environment suitable for a PoC (hosting, devices, sandbox)',
  },
  {
    id: 'budget',
    label: 'Minimal budget for PoC infrastructure and experiments',
  },
  {
    id: 'domain',
    label: 'Enough domain knowledge to interpret PoC results correctly',
  },
]);

/**
 * @param {unknown} raw
 * @returns {number | null}
 */
export const validateRating = (raw) => {
  if (typeof raw === 'number') {
    if (!Number.isInteger(raw) || raw < 1 || raw > 10) return null;
    return raw;
  }
  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  if (trimmed === '' || !/^-?\d+$/.test(trimmed)) return null;
  const val = Number(trimmed);
  if (!Number.isInteger(val) || val < 1 || val > 10) return null;
  return val;
};

/**
 * @param {Readonly<Record<string, number>>} weights
 * @param {Readonly<Record<string, number>>} values
 */
export const weightedScore = (weights, values) =>
  Object.entries(weights).reduce((total, [key, weight]) => {
    const rating = values[key];
    if (!Number.isInteger(rating) || rating < 1 || rating > 10) {
      throw new Error(`Missing or invalid rating for "${key}"`);
    }
    return total + rating * weight;
  }, 0);

export const computePocScore = (values) => weightedScore(POC_WEIGHTS, values);
export const computeMarketScore = (values) => weightedScore(MARKET_WEIGHTS, values);

/**
 * Map yes/no answers for resource checklist items to a 1–10 rating.
 * Score = round(1 + 9 * (availableCount / total)).
 * @param {ReadonlyArray<{ id: string, available: boolean }>} answers
 */
export const scoreResourcesFromAnswers = (answers) => {
  const byId = new Map(answers.map((a) => [a.id, Boolean(a.available)]));
  let availableCount = 0;
  for (const item of POC_RESOURCE_ITEMS) {
    if (!byId.has(item.id)) {
      throw new Error(`Missing answer for resource item "${item.id}"`);
    }
    if (byId.get(item.id)) availableCount += 1;
  }
  const strength = availableCount / POC_RESOURCE_ITEMS.length;
  return Math.max(1, Math.min(10, Math.round(1 + 9 * strength)));
};

/**
 * @param {number} pocScore
 * @param {number} marketScore
 * @returns {{ verdict: string, explanation: string }}
 */
export const getRecommendation = (pocScore, marketScore) => {
  const pocOk = pocScore >= HIGH_THRESHOLD;
  const marketOk = marketScore >= HIGH_THRESHOLD;

  let verdict;
  if (pocOk && marketOk) verdict = 'Go / Full Speed Ahead';
  else if (!pocOk && marketOk) verdict = 'De-risk First';
  else if (pocOk && !marketOk) verdict = 'Validate Demand';
  else verdict = 'Reframe or Shelve';

  return { verdict, explanation: EXPLANATIONS[verdict] };
};

/**
 * @param {{
 *   poc: Readonly<Record<string, number>>,
 *   market: Readonly<Record<string, number>>,
 * }} ratings
 */
export const runEvaluation = (ratings) => {
  const pocScore = computePocScore(ratings.poc);
  const marketScore = computeMarketScore(ratings.market);
  const { verdict, explanation } = getRecommendation(pocScore, marketScore);
  return { pocScore, marketScore, recommendation: verdict, explanation };
};

/**
 * @param {string[]} argv
 * @param {string} name
 */
export const readFlag = (argv, name) => {
  const idx = argv.indexOf(name);
  if (idx === -1 || idx === argv.length - 1) return null;
  return argv[idx + 1];
};
