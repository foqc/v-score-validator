(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);

  const getElements = () => ({
    fileInput: $('result-file'),
    clearBtn: $('btn-clear'),
    error: $('error-message'),
    results: $('results'),
    ideaTitle: $('idea-title'),
    ideaDescription: $('idea-description'),
    poc: {
      novelty: $('poc-novelty'),
      scope: $('poc-scope'),
      resources: $('poc-resources'),
      outcome: $('poc-outcome'),
    },
    market: {
      pain: $('market-pain'),
      pay: $('market-pay'),
      size: $('market-size'),
      diff: $('market-diff'),
    },
    pocScore: $('poc-score'),
    marketScore: $('market-score'),
    recommendation: $('recommendation'),
    explanation: $('explanation'),
    expertSummaries: $('expert-summaries'),
    technicalSummary: $('technical-summary'),
    marketSummary: $('market-summary'),
    insights: $('learning-insights'),
    insightList: $('insight-list'),
  });

  const showError = (elements, message) => {
    elements.error.textContent = message;
    elements.error.hidden = false;
  };

  const clearError = (elements) => {
    elements.error.textContent = '';
    elements.error.hidden = true;
  };

  const clearResults = (elements) => {
    elements.ideaTitle.textContent = '';
    elements.ideaDescription.textContent = '';
    Object.values(elements.poc).forEach((el) => {
      el.textContent = '';
    });
    Object.values(elements.market).forEach((el) => {
      el.textContent = '';
    });
    elements.pocScore.textContent = '';
    elements.marketScore.textContent = '';
    elements.recommendation.textContent = '';
    elements.explanation.textContent = '';
    elements.technicalSummary.textContent = '';
    elements.marketSummary.textContent = '';
    elements.insightList.replaceChildren();
    elements.expertSummaries.classList.add('is-hidden');
    elements.insights.classList.add('is-hidden');
    elements.results.classList.add('is-hidden');
  };

  const isRatingMap = (value, keys) =>
    value
    && typeof value === 'object'
    && keys.every((key) => Number.isInteger(value[key]) && value[key] >= 1 && value[key] <= 10);

  const parseResult = (data) => {
    if (!data || typeof data !== 'object') {
      return { ok: false, error: 'Result file must contain a JSON object.' };
    }

    const poc = data.pocCriteria ?? data.poc;
    const market = data.marketCriteria ?? data.market;
    const pocKeys = ['novelty', 'scope', 'resources', 'outcome'];
    const marketKeys = ['pain', 'pay', 'size', 'diff'];

    if (!isRatingMap(poc, pocKeys) || !isRatingMap(market, marketKeys)) {
      return { ok: false, error: 'Result is missing valid PoC or Market criteria (integers 1–10).' };
    }

    if (!Number.isFinite(data.pocScore) || !Number.isFinite(data.marketScore)) {
      return { ok: false, error: 'Result is missing pocScore or marketScore.' };
    }

    if (typeof data.recommendation !== 'string' || data.recommendation.trim() === '') {
      return { ok: false, error: 'Result is missing recommendation.' };
    }

    return {
      ok: true,
      data: {
        ideaTitle: data.ideaTitle ?? '',
        ideaDescription: data.ideaDescription ?? '',
        pocCriteria: poc,
        marketCriteria: market,
        pocScore: data.pocScore,
        marketScore: data.marketScore,
        recommendation: data.recommendation,
        explanation: data.explanation ?? '',
        technicalSummary: data.technicalSummary ?? '',
        marketSummary: data.marketSummary ?? '',
        insights: Array.isArray(data.insights) ? data.insights.filter((s) => typeof s === 'string') : [],
      },
    };
  };

  const renderResults = (elements, data) => {
    elements.ideaTitle.textContent = data.ideaTitle || '(untitled)';
    elements.ideaDescription.textContent = data.ideaDescription;

    for (const [key, el] of Object.entries(elements.poc)) {
      el.textContent = String(data.pocCriteria[key]);
    }
    for (const [key, el] of Object.entries(elements.market)) {
      el.textContent = String(data.marketCriteria[key]);
    }

    elements.pocScore.textContent = String(data.pocScore);
    elements.marketScore.textContent = String(data.marketScore);
    elements.recommendation.textContent = data.recommendation;
    elements.explanation.textContent = data.explanation;

    const hasSummaries = data.technicalSummary || data.marketSummary;
    elements.technicalSummary.textContent = data.technicalSummary
      ? `Technical: ${data.technicalSummary}`
      : '';
    elements.marketSummary.textContent = data.marketSummary
      ? `Market: ${data.marketSummary}`
      : '';
    elements.expertSummaries.classList.toggle('is-hidden', !hasSummaries);

    elements.insightList.replaceChildren(
      ...data.insights.map((insight) => {
        const item = document.createElement('li');
        item.textContent = insight;
        return item;
      }),
    );
    elements.insights.classList.toggle('is-hidden', data.insights.length === 0);
    elements.results.classList.remove('is-hidden');
  };

  const handleFile = async (elements, file) => {
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = parseResult(JSON.parse(text));
      if (!parsed.ok) {
        showError(elements, parsed.error);
        clearResults(elements);
        return;
      }
      clearError(elements);
      renderResults(elements, parsed.data);
    } catch {
      showError(elements, 'Could not parse the selected file as JSON.');
      clearResults(elements);
    }
  };

  const init = () => {
    const elements = getElements();

    elements.fileInput.addEventListener('change', () => {
      const [file] = elements.fileInput.files;
      handleFile(elements, file);
    });

    elements.clearBtn.addEventListener('click', () => {
      elements.fileInput.value = '';
      clearError(elements);
      clearResults(elements);
    });

    clearError(elements);
    clearResults(elements);
  };

  document.addEventListener('DOMContentLoaded', init);
})();
