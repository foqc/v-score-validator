(() => {
  'use strict';

  const API_BASE = (() => {
    if (location.protocol === 'http:' || location.protocol === 'https:') {
      return '';
    }
    return 'http://localhost:8787';
  })();

  const STATUS_COPY = {
    pending: 'Waiting',
    running: 'Analyzing',
    done: 'Complete',
    error: 'Failed',
  };

  const PHASE_COPY = {
    queued: 'Queuing evaluation…',
    experts: 'Experts are analyzing the idea…',
    scoring: 'Computing scores with scripts…',
    done: 'Evaluation finished',
    error: 'Evaluation stopped with an error',
    running: 'Evaluation in progress…',
  };

  const STEP_ORDER = ['queued', 'experts', 'scoring', 'done'];

  const form = document.getElementById('eval-form');
  const titleInput = document.getElementById('title');
  const descriptionInput = document.getElementById('description');
  const btnRun = document.getElementById('btn-run');
  const btnLabel = btnRun.querySelector('.btn-label');
  const formError = document.getElementById('form-error');
  const progress = document.getElementById('progress');
  const results = document.getElementById('results');
  const phaseCopy = document.getElementById('phase-copy');
  const stepsRoot = document.getElementById('steps');

  let eventSource = null;

  const agentUi = (name) => {
    const root = document.querySelector(`.agent[data-agent="${name}"]`);
    return {
      root,
      label: root.querySelector('[data-status]'),
      log: root.querySelector('[data-log]'),
      placeholder: root.querySelector('[data-placeholder]'),
    };
  };

  const setLoading = (loading) => {
    btnRun.disabled = loading;
    btnRun.classList.toggle('is-loading', loading);
    btnRun.setAttribute('aria-busy', loading ? 'true' : 'false');
    btnLabel.textContent = loading ? 'Evaluating…' : 'Evaluate';
    titleInput.disabled = loading;
    descriptionInput.disabled = loading;
  };

  const setError = (message) => {
    if (!message) {
      formError.hidden = true;
      formError.textContent = '';
      return;
    }
    formError.hidden = false;
    formError.textContent = message;
  };

  const setPhase = (phase) => {
    const key = PHASE_COPY[phase] ? phase : 'running';
    phaseCopy.textContent = PHASE_COPY[key];

    const activeIdx = STEP_ORDER.indexOf(phase === 'error' ? 'scoring' : phase);
    const steps = stepsRoot.querySelectorAll('.step');
    steps.forEach((step) => {
      const idx = STEP_ORDER.indexOf(step.dataset.step);
      step.classList.remove('is-active', 'is-complete', 'is-error');
      if (phase === 'error' && idx === activeIdx) {
        step.classList.add('is-error');
      } else if (idx < activeIdx || phase === 'done') {
        step.classList.add('is-complete');
      } else if (idx === activeIdx) {
        step.classList.add('is-active');
      }
    });
  };

  const setAgentStatus = (name, status) => {
    const ui = agentUi(name);
    const normalized = STATUS_COPY[status] ? status : 'pending';
    ui.root.dataset.state = normalized;
    ui.label.textContent = STATUS_COPY[normalized];

    const hasLog = ui.log.textContent.trim().length > 0;
    ui.log.classList.toggle('is-empty', !hasLog);
    ui.placeholder.classList.toggle(
      'is-visible',
      !hasLog && (normalized === 'pending' || normalized === 'running'),
    );
  };

  const resetProgress = () => {
    agentUi('technical').log.textContent = '';
    agentUi('market').log.textContent = '';
    setAgentStatus('technical', 'pending');
    setAgentStatus('market', 'pending');
    setPhase('queued');
    progress.classList.remove('is-hidden');
    results.classList.add('is-hidden');
  };

  const showResult = (result) => {
    document.getElementById('poc-score').textContent = String(result.pocScore ?? result.poc ?? '—');
    document.getElementById('market-score').textContent = String(
      result.marketScore ?? result.market ?? '—',
    );
    document.getElementById('recommendation').textContent = result.recommendation ?? '—';
    document.getElementById('explanation').textContent = result.explanation ?? '—';
    results.classList.remove('is-hidden');
  };

  const closeStream = () => {
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
  };

  const watchJob = (jobId) => {
    closeStream();
    const url = `${API_BASE}/api/jobs/${encodeURIComponent(jobId)}/events`;
    eventSource = new EventSource(url);

    eventSource.addEventListener('status', (ev) => {
      const data = JSON.parse(ev.data);
      setPhase(data.phase || data.status || 'running');
      if (data.agents?.technical?.status) setAgentStatus('technical', data.agents.technical.status);
      if (data.agents?.market?.status) setAgentStatus('market', data.agents.market.status);
      if (data.error) setError(data.error);
    });

    eventSource.addEventListener('log', (ev) => {
      const data = JSON.parse(ev.data);
      const ui = agentUi(data.agent);
      ui.log.textContent += data.text || '';
      ui.log.classList.remove('is-empty');
      ui.placeholder.classList.remove('is-visible');
      ui.log.scrollTop = ui.log.scrollHeight;
    });

    eventSource.addEventListener('done', (ev) => {
      const data = JSON.parse(ev.data);
      setPhase('done');
      setAgentStatus('technical', 'done');
      setAgentStatus('market', 'done');
      showResult(data.result || {});
      setLoading(false);
      closeStream();
    });

    eventSource.addEventListener('error', (ev) => {
      if (ev.data) {
        try {
          const data = JSON.parse(ev.data);
          setError(data.message || 'Evaluation failed');
        } catch {
          setError('Evaluation failed');
        }
        setPhase('error');
        setLoading(false);
        closeStream();
      }
    });
  };

  const runEvaluate = async () => {
    setError('');

    if (location.protocol !== 'http:' && location.protocol !== 'https:') {
      setError('Open http://localhost:8787 (run: cd bridge && npm start).');
      document.getElementById('boot-warning')?.classList.add('is-visible');
      return;
    }

    const title = titleInput.value.trim();
    const description = descriptionInput.value.trim();
    if (!title || description.length < 20) {
      setError('Title required; description must be at least 20 characters.');
      return;
    }

    setLoading(true);
    resetProgress();

    try {
      const res = await fetch(`${API_BASE}/api/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      if (!body.jobId) {
        throw new Error('Server did not return a jobId');
      }
      watchJob(body.jobId);
    } catch (err) {
      setError(err.message || String(err));
      setPhase('error');
      setLoading(false);
    }
  };

  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    runEvaluate();
  });

  btnRun.addEventListener('click', (ev) => {
    ev.preventDefault();
    runEvaluate();
  });
})();
