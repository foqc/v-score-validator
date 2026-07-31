import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { Agent, CursorAgentError } from '@cursor/sdk';
import { appendLog, emit, updateJob } from './jobs.mjs';
import { loadExpertRatings } from './parse-ratings.mjs';

function loadEnvFile(bridgeRoot) {
  const envPath = join(bridgeRoot, '.env');
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

function slugify(title) {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);
  return slug || 'idea';
}

function runNode(repoRoot, scriptRel, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [join(repoRoot, scriptRel), ...args], {
      cwd: repoRoot,
      env: process.env,
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => {
      stdout += chunk;
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk;
    });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) resolve({ stdout, stderr });
      else reject(new Error(stderr.trim() || stdout.trim() || `${scriptRel} exited ${code}`));
    });
  });
}

function expertPrompt({ role, skillPath, evalId, title, description, jsonOut, mdOut, keys }) {
  return [
    `You are the ${role} for V-Score Validator.`,
    `Read and follow ${skillPath} exactly.`,
    '',
    '## Idea',
    `Title: ${title}`,
    `Description: ${description}`,
    `Evaluation id: ${evalId}`,
    '',
    '## Rules',
    '- Infer all ratings from the idea text only. Do not ask questions.',
    '- Do not compute weighted scores or the Go/No-Go verdict.',
    '- Validate each rating with: node scripts/validate-rating.mjs --value <n>',
    '',
    '## Required artifacts',
    `1. Write ${mdOut} with reasoning per criterion.`,
    `2. Write ${jsonOut} as JSON only:`,
    '```json',
    `{`,
    `  "ratings": { ${keys.map((k) => `"${k}": <1-10>`).join(', ')} },`,
    `  "summary": "<one paragraph>"`,
    `}`,
    '```',
    '',
    'When finished, stop. Do not run scoring or recommendation scripts.',
  ].join('\n');
}

async function streamAgent({ apiKey, model, repoRoot, prompt, job, agentKey }) {
  const agent = await Agent.create({
    apiKey,
    model: { id: model },
    local: {
      cwd: repoRoot,
      settingSources: [],
    },
  });

  try {
    const run = await agent.send(prompt);
    emit(job, 'agent', {
      agent: agentKey,
      agentId: agent.agentId,
      runId: run.id,
    });

    try {
      for await (const event of run.stream()) {
        if (event.type === 'assistant' && event.message?.content) {
          for (const block of event.message.content) {
            if (block.type === 'text' && block.text) {
              appendLog(job, agentKey, block.text);
            }
          }
        }
        if (event.type === 'tool_call' && event.name) {
          appendLog(job, agentKey, `\n[tool:${event.name}]\n`);
        }
      }
    } catch {
      // Stream errors are non-fatal if wait() still succeeds.
    }

    const result = await run.wait();
    if (result.status === 'error') {
      throw new Error(`${agentKey} agent run failed (${run.id})`);
    }
    return result;
  } finally {
    if (typeof agent[Symbol.asyncDispose] === 'function') {
      await agent[Symbol.asyncDispose]();
    } else if (typeof agent.close === 'function') {
      await agent.close();
    }
  }
}

/**
 * Parallel Technical + Market Cursor agents, then core scripts.
 */
export async function runEvaluationJob(job, { bridgeRoot, repoRoot }) {
  loadEnvFile(bridgeRoot);

  const apiKey = process.env.CURSOR_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('CURSOR_API_KEY missing. Copy bridge/.env.example to bridge/.env');
  }
  const model = process.env.CURSOR_MODEL?.trim() || 'composer-2.5';

  const date = new Date().toISOString().slice(0, 10);
  const evalId = `${date}-${slugify(job.title)}`;
  const evalDir = join(repoRoot, 'evaluations', evalId);
  mkdirSync(evalDir, { recursive: true });

  updateJob(job, { status: 'running', phase: 'experts', evalId });
  job.agents.technical.status = 'running';
  job.agents.market.status = 'running';
  updateJob(job, {});

  const technicalPrompt = expertPrompt({
    role: 'Technical Expert',
    skillPath: '.agents/skills/technical-evaluation/SKILL.md',
    evalId,
    title: job.title,
    description: job.description,
    jsonOut: `evaluations/${evalId}/poc.json`,
    mdOut: `evaluations/${evalId}/technical.md`,
    keys: ['novelty', 'scope', 'resources', 'outcome'],
  });

  const marketPrompt = expertPrompt({
    role: 'Market Expert',
    skillPath: '.agents/skills/market-evaluation/SKILL.md',
    evalId,
    title: job.title,
    description: job.description,
    jsonOut: `evaluations/${evalId}/market.json`,
    mdOut: `evaluations/${evalId}/market.md`,
    keys: ['pain', 'pay', 'size', 'diff'],
  });

  const opts = { apiKey, model, repoRoot, job };

  try {
    await Promise.all([
      streamAgent({ ...opts, prompt: technicalPrompt, agentKey: 'technical' }).then(() => {
        job.agents.technical.status = 'done';
        updateJob(job, {});
      }),
      streamAgent({ ...opts, prompt: marketPrompt, agentKey: 'market' }).then(() => {
        job.agents.market.status = 'done';
        updateJob(job, {});
      }),
    ]);
  } catch (err) {
    if (err instanceof CursorAgentError) {
      throw new Error(`Cursor agent failed to start: ${err.message}`);
    }
    throw err;
  }

  updateJob(job, { phase: 'scoring' });

  const poc = loadExpertRatings(repoRoot, evalId, 'poc');
  const market = loadExpertRatings(repoRoot, evalId, 'market');

  const ratingsPath = join(evalDir, 'ratings.json');
  const ratingsPayload = {
    id: evalId,
    timestamp: new Date().toISOString(),
    ideaTitle: job.title,
    ideaDescription: job.description,
    poc: poc.ratings,
    market: market.ratings,
    technicalSummary: poc.summary,
    marketSummary: market.summary,
  };
  writeFileSync(ratingsPath, `${JSON.stringify(ratingsPayload, null, 2)}\n`, 'utf8');

  await runNode(repoRoot, 'scripts/run-evaluation.mjs', ['--ratings', ratingsPath]);
  await runNode(repoRoot, 'scripts/write-ui-result.mjs', [
    '--ratings',
    ratingsPath,
    '--out',
    join(repoRoot, 'evaluations', 'latest.json'),
  ]);

  const result = JSON.parse(readFileSync(join(repoRoot, 'evaluations', 'latest.json'), 'utf8'));
  job.result = result;
  updateJob(job, { status: 'done', phase: 'done' });
  emit(job, 'done', { result, evalId, ratingsPath });
  return result;
}
