/** In-memory job store for SSE progress. */

const jobs = new Map();

export function createJob({ title, description }) {
  const id = `job-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const job = {
    id,
    title,
    description,
    status: 'queued',
    phase: 'queued',
    agents: {
      technical: { status: 'pending', log: '' },
      market: { status: 'pending', log: '' },
    },
    result: null,
    error: null,
    createdAt: new Date().toISOString(),
    listeners: new Set(),
  };
  jobs.set(id, job);
  return job;
}

export function getJob(id) {
  return jobs.get(id) ?? null;
}

export function emit(job, event, data) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const res of job.listeners) {
    try {
      res.write(payload);
    } catch {
      job.listeners.delete(res);
    }
  }
}

export function updateJob(job, patch) {
  Object.assign(job, patch);
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
}

export function appendLog(job, agent, text) {
  if (!text) return;
  job.agents[agent].log += text;
  emit(job, 'log', { agent, text });
}
