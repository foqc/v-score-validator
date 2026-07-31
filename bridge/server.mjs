#!/usr/bin/env node
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { dirname, join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createJob, getJob, emit } from './lib/jobs.mjs';
import { runEvaluationJob } from './lib/evaluate.mjs';

const bridgeRoot = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(bridgeRoot, '..');
const publicDir = join(bridgeRoot, 'public');
const PORT = Number(process.env.PORT) || 8787;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function sendJson(res, status, body) {
  const raw = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(raw),
    ...corsHeaders(),
  });
  res.end(raw);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function serveStatic(req, res) {
  let rel = (req.url?.split('?')[0] || '/').replace(/^\/+/, '');
  if (!rel || rel === '') rel = 'index.html';
  const filePath = join(publicDir, rel);
  if (!filePath.startsWith(publicDir) || !existsSync(filePath) || !statSync(filePath).isFile()) {
    sendJson(res, 404, { error: 'Not found' });
    return;
  }
  const body = readFileSync(filePath);
  res.writeHead(200, {
    'Content-Type': MIME[extname(filePath)] || 'application/octet-stream',
    ...corsHeaders(),
  });
  res.end(body);
}

async function handleEvaluate(req, res) {
  let data;
  try {
    data = JSON.parse(await readBody(req));
  } catch {
    sendJson(res, 400, { error: 'Invalid JSON body' });
    return;
  }

  const title = typeof data.title === 'string' ? data.title.trim() : '';
  const description = typeof data.description === 'string' ? data.description.trim() : '';
  if (!title) {
    sendJson(res, 400, { error: 'title is required' });
    return;
  }
  if (description.length < 20) {
    sendJson(res, 400, { error: 'description must be at least 20 characters' });
    return;
  }

  const job = createJob({ title, description });
  sendJson(res, 202, { jobId: job.id });

  runEvaluationJob(job, { bridgeRoot, repoRoot }).catch((err) => {
    job.error = err.message || String(err);
    job.status = 'error';
    job.phase = 'error';
    job.agents.technical.status =
      job.agents.technical.status === 'running' ? 'error' : job.agents.technical.status;
    job.agents.market.status =
      job.agents.market.status === 'running' ? 'error' : job.agents.market.status;
    emit(job, 'error', { message: job.error });
    emit(job, 'status', {
      id: job.id,
      status: job.status,
      phase: job.phase,
      agents: {
        technical: { status: job.agents.technical.status },
        market: { status: job.agents.market.status },
      },
      error: job.error,
    });
  });
}

function handleEvents(req, res, jobId) {
  const job = getJob(jobId);
  if (!job) {
    sendJson(res, 404, { error: 'Unknown job' });
    return;
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    ...corsHeaders(),
  });
  res.write(': connected\n\n');

  job.listeners.add(res);
  req.on('close', () => {
    job.listeners.delete(res);
  });

  emit(job, 'status', {
    id: job.id,
    status: job.status,
    phase: job.phase,
    agents: {
      technical: { status: job.agents.technical.status },
      market: { status: job.agents.market.status },
    },
    error: job.error,
  });

  if (job.agents.technical.log) {
    emit(job, 'log', { agent: 'technical', text: job.agents.technical.log });
  }
  if (job.agents.market.log) {
    emit(job, 'log', { agent: 'market', text: job.agents.market.log });
  }
  if (job.result) {
    emit(job, 'done', { result: job.result, evalId: job.evalId });
  }
  if (job.error && job.status === 'error') {
    emit(job, 'error', { message: job.error });
  }
}

function handleJob(req, res, jobId) {
  const job = getJob(jobId);
  if (!job) {
    sendJson(res, 404, { error: 'Unknown job' });
    return;
  }
  sendJson(res, 200, {
    id: job.id,
    status: job.status,
    phase: job.phase,
    evalId: job.evalId ?? null,
    agents: {
      technical: { status: job.agents.technical.status },
      market: { status: job.agents.market.status },
    },
    result: job.result,
    error: job.error,
  });
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

  try {
    if (req.method === 'OPTIONS') {
      res.writeHead(204, corsHeaders());
      res.end();
      return;
    }
    if (req.method === 'POST' && url.pathname === '/api/evaluate') {
      await handleEvaluate(req, res);
      return;
    }
    if (req.method === 'GET' && url.pathname.startsWith('/api/jobs/')) {
      const parts = url.pathname.split('/');
      const jobId = parts[3];
      if (parts[4] === 'events') {
        handleEvents(req, res, jobId);
        return;
      }
      handleJob(req, res, jobId);
      return;
    }
    if (req.method === 'GET') {
      serveStatic(req, res);
      return;
    }
    sendJson(res, 405, { error: 'Method not allowed' });
  } catch (err) {
    sendJson(res, 500, { error: err.message || String(err) });
  }
});

server.listen(PORT, () => {
  console.log(`V-Score bridge listening on http://localhost:${PORT}`);
  console.log(`Repo root: ${repoRoot}`);
  console.log('Set CURSOR_API_KEY in bridge/.env before evaluating.');
});
