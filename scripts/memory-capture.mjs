#!/usr/bin/env node
import {
  mkdirSync,
  readFileSync,
  writeFileSync,
  existsSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFlag } from './lib/scoring.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const bankRoot = join(root, 'memory-bank');
const indexPath = join(bankRoot, 'index.json');

const type = readFlag(process.argv, '--type') ?? 'learning';
const title = readFlag(process.argv, '--title') ?? 'Untitled';
const keywordsRaw = readFlag(process.argv, '--keywords') ?? '';
const bodyFile = readFlag(process.argv, '--body-file');
const bodyInline = readFlag(process.argv, '--body');

if (!['evaluation', 'learning'].includes(type)) {
  console.error('--type must be evaluation or learning');
  process.exit(1);
}

if (!bodyFile && bodyInline === null) {
  console.error(
    'Usage: node scripts/memory-capture.mjs --type evaluation|learning --title "..." --keywords a,b --body-file path',
  );
  process.exit(1);
}

const keywords = keywordsRaw
  .split(',')
  .map((k) => k.trim())
  .filter(Boolean);

const body = bodyFile ? readFileSync(bodyFile, 'utf8') : bodyInline;
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const slug = title
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '')
  .slice(0, 48) || 'note';

const dirName = type === 'evaluation' ? 'evaluations' : 'learnings';
const relPath = `memory-bank/${dirName}/${stamp}-${slug}.md`;
const absPath = join(root, relPath);

const headerKeywords = keywords.length > 0 ? keywords.join(', ') : 'general';
const markdown = `---
title: ${JSON.stringify(title)}
type: ${type}
keywords: [${keywords.map((k) => JSON.stringify(k)).join(', ')}]
capturedAt: ${new Date().toISOString()}
---

# ${title}

Keywords: ${headerKeywords}

${body.trim()}
`;

mkdirSync(dirname(absPath), { recursive: true });
writeFileSync(absPath, markdown, 'utf8');

let entries = [];
if (existsSync(indexPath)) {
  const raw = JSON.parse(readFileSync(indexPath, 'utf8'));
  entries = Array.isArray(raw) ? raw : raw.entries ?? [];
}

entries.push({
  path: relPath,
  title,
  type,
  keywords: keywords.length > 0 ? keywords : ['general'],
  capturedAt: new Date().toISOString(),
});

mkdirSync(bankRoot, { recursive: true });
writeFileSync(indexPath, `${JSON.stringify(entries, null, 2)}\n`, 'utf8');

console.log(JSON.stringify({ ok: true, path: relPath, index: indexPath }, null, 2));
