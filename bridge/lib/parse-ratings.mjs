import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const POC_KEYS = ['novelty', 'scope', 'resources', 'outcome'];
const MARKET_KEYS = ['pain', 'pay', 'size', 'diff'];

function isRatingMap(value, keys) {
  return (
    value &&
    typeof value === 'object' &&
    keys.every((key) => Number.isInteger(value[key]) && value[key] >= 1 && value[key] <= 10)
  );
}

function extractJsonObject(text) {
  if (!text || typeof text !== 'string') return null;
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1].trim() : text.trim();
  try {
    return JSON.parse(candidate);
  } catch {
    const start = candidate.indexOf('{');
    const end = candidate.lastIndexOf('}');
    if (start === -1 || end <= start) return null;
    try {
      return JSON.parse(candidate.slice(start, end + 1));
    } catch {
      return null;
    }
  }
}

function readJsonFile(path) {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return null;
  }
}

/**
 * Prefer machine-written *.json; fall back to JSON block inside *.md.
 */
export function loadExpertRatings(repoRoot, evalId, kind) {
  const dir = join(repoRoot, 'evaluations', evalId);
  const keys = kind === 'poc' ? POC_KEYS : MARKET_KEYS;
  const jsonName = kind === 'poc' ? 'poc.json' : 'market.json';
  const mdName = kind === 'poc' ? 'technical.md' : 'market.md';

  const fromJson = readJsonFile(join(dir, jsonName));
  if (isRatingMap(fromJson, keys)) {
    return { ratings: fromJson, summary: '', source: jsonName };
  }
  if (fromJson?.ratings && isRatingMap(fromJson.ratings, keys)) {
    return {
      ratings: fromJson.ratings,
      summary: typeof fromJson.summary === 'string' ? fromJson.summary : '',
      source: jsonName,
    };
  }

  const mdPath = join(dir, mdName);
  if (!existsSync(mdPath)) {
    throw new Error(`Missing ${mdName} and ${jsonName} under evaluations/${evalId}/`);
  }
  const md = readFileSync(mdPath, 'utf8');
  const parsed = extractJsonObject(md);
  const ratings = parsed?.ratings && isRatingMap(parsed.ratings, keys) ? parsed.ratings : parsed;
  if (!isRatingMap(ratings, keys)) {
    throw new Error(`Could not parse valid ${kind} ratings from ${mdName}`);
  }
  return { ratings, summary: '', source: mdName };
}

export { POC_KEYS, MARKET_KEYS };
