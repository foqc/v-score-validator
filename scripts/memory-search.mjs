#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFlag } from './lib/scoring.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const indexPath = join(root, 'memory-bank', 'index.json');

const keywordsRaw = readFlag(process.argv, '--keywords');
if (!keywordsRaw) {
  console.error('Usage: node scripts/memory-search.mjs --keywords keyword1,keyword2');
  process.exit(1);
}

const keywords = keywordsRaw
  .split(',')
  .map((k) => k.trim().toLowerCase())
  .filter(Boolean);

if (keywords.length === 0) {
  console.error('Provide at least one keyword');
  process.exit(1);
}

if (!existsSync(indexPath)) {
  console.log(JSON.stringify({ ok: true, matches: [], note: 'No memory-bank/index.json yet' }, null, 2));
  process.exit(0);
}

const index = JSON.parse(readFileSync(indexPath, 'utf8'));
const entries = Array.isArray(index) ? index : index.entries ?? [];

const matches = entries
  .map((entry) => {
    const entryKeywords = (entry.keywords ?? []).map((k) => String(k).toLowerCase());
    const hit = keywords.filter((k) =>
      entryKeywords.some((ek) => ek === k || ek.includes(k) || k.includes(ek)),
    );
    return hit.length > 0
      ? {
          path: entry.path,
          keywords: entry.keywords ?? [],
          matched: hit,
          title: entry.title ?? null,
        }
      : null;
  })
  .filter(Boolean);

const enriched = matches.map((match) => {
  const fullPath = join(root, match.path);
  let preview = null;
  if (existsSync(fullPath)) {
    const text = readFileSync(fullPath, 'utf8');
    preview = text.slice(0, 400);
  }
  return { ...match, preview };
});

console.log(JSON.stringify({ ok: true, query: keywords, matches: enriched }, null, 2));
