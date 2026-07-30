(() => {
  'use strict';

  const THRESHOLD = 65;

  /** @type {ReadonlyArray<{ id: string, key: string, label: string, weight: number }>} */
  const POC_CRITERIA = Object.freeze([
    { id: 'poc-novelty', key: 'novelty', label: 'Technical Novelty', weight: 3 },
    { id: 'poc-scope', key: 'scope', label: 'Defined Scope', weight: 4 },
    { id: 'poc-resources', key: 'resources', label: 'Resource Accessibility', weight: 2 },
    { id: 'poc-outcome', key: 'outcome', label: 'Measurable Outcome', weight: 1 },
  ]);

  /** @type {ReadonlyArray<{ id: string, key: string, label: string, weight: number }>} */
  const MARKET_CRITERIA = Object.freeze([
    { id: 'market-pain', key: 'pain', label: 'Pain Severity', weight: 4 },
    { id: 'market-pay', key: 'pay', label: 'Willingness to Pay', weight: 3 },
    { id: 'market-size', key: 'size', label: 'Market Size', weight: 2 },
    { id: 'market-diff', key: 'diff', label: 'Differentiation', weight: 1 },
  ]);

  const ALL_CRITERIA = Object.freeze([...POC_CRITERIA, ...MARKET_CRITERIA]);

  const EXPLANATIONS = Object.freeze({
    'Go / Full Speed Ahead':
      'Both technical feasibility and market viability clear the 65 threshold. The idea is strong enough to pursue at full speed.',
    'De-risk First':
      'Market viability is strong, but technical feasibility is below 65. Reduce technical risk before scaling.',
    'Validate Demand':
      'Technical feasibility is strong, but market viability is below 65. Validate demand and willingness to pay before building further.',
    'Reframe or Shelve':
      'Both scores are below 65. Reframe the idea substantially or shelve it for now.',
  });

  const $ = (id) => document.getElementById(id);

  // ---------------------------------------------------------------------------
  // Scoring (pure)
  // ---------------------------------------------------------------------------

  const weightedScore = (criteria, values) =>
    criteria.reduce((total, { key, weight }) => total + values[key] * weight, 0);

  const calculatePocScore = (values) => weightedScore(POC_CRITERIA, values);
  const calculateMarketScore = (values) => weightedScore(MARKET_CRITERIA, values);

  const getRecommendation = (pocScore, marketScore) => {
    const pocOk = pocScore >= THRESHOLD;
    const marketOk = marketScore >= THRESHOLD;

    let verdict;
    if (pocOk && marketOk) verdict = 'Go / Full Speed Ahead';
    else if (!pocOk && marketOk) verdict = 'De-risk First';
    else if (pocOk && !marketOk) verdict = 'Validate Demand';
    else verdict = 'Reframe or Shelve';

    return { verdict, explanation: EXPLANATIONS[verdict] };
  };

  // ---------------------------------------------------------------------------
  // Input
  // ---------------------------------------------------------------------------

  const parseRating = (rawValue, label) => {
    const trimmed = String(rawValue).trim();

    if (trimmed === '') {
      return { ok: false, error: `${label} is required.` };
    }

    const value = Number.parseInt(trimmed, 10);

    // Reject decimals / junk: parseInt("7.5") === 7 but String(7) !== "7.5"
    if (!Number.isInteger(value) || String(value) !== trimmed || value < 1 || value > 10) {
      return {
        ok: false,
        error: `${label} must be a whole number between 1 and 10.`,
      };
    }

    return { ok: true, value };
  };

  const readCriteria = (criteria, elements) => {
    const values = {};

    for (const { id, key, label } of criteria) {
      const result = parseRating(elements.byId.get(id).value, label);
      if (!result.ok) return result;
      values[key] = result.value;
    }

    return { ok: true, values };
  };

  const readInputs = (elements) => {
    const title = elements.title.value.trim();
    if (title === '') {
      return { ok: false, error: 'Idea title is required.' };
    }

    const poc = readCriteria(POC_CRITERIA, elements);
    if (!poc.ok) return poc;

    const market = readCriteria(MARKET_CRITERIA, elements);
    if (!market.ok) return market;

    return {
      ok: true,
      data: { title, poc: poc.values, market: market.values },
    };
  };

  // ---------------------------------------------------------------------------
  // UI
  // ---------------------------------------------------------------------------

  const showError = (elements, message) => {
    elements.error.textContent = message;
    elements.error.hidden = false;
  };

  const clearError = (elements) => {
    elements.error.textContent = '';
    elements.error.hidden = true;
  };

  const renderResults = (
    elements,
    { pocScore, marketScore, verdict, explanation, insights },
  ) => {
    elements.pocScore.textContent = String(pocScore);
    elements.marketScore.textContent = String(marketScore);
    elements.recommendation.textContent = verdict;
    elements.explanation.textContent = explanation;

    elements.insightList.replaceChildren(
      ...insights.map((insight) => {
        const item = document.createElement('li');
        item.textContent = insight;
        return item;
      }),
    );
    elements.insights.classList.toggle('is-hidden', insights.length === 0);
    elements.results.classList.remove('is-hidden');
  };

  const clearResults = (elements) => {
    elements.pocScore.textContent = '';
    elements.marketScore.textContent = '';
    elements.recommendation.textContent = '';
    elements.explanation.textContent = '';
    elements.insightList.replaceChildren();
    elements.insights.classList.add('is-hidden');
    elements.results.classList.add('is-hidden');
  };

  // ---------------------------------------------------------------------------
  // Wiring
  // ---------------------------------------------------------------------------

  const getElements = () => {
    const byId = new Map(ALL_CRITERIA.map(({ id }) => [id, $(id)]));

    return {
      form: $('evaluation-form'),
      title: $('idea-title'),
      error: $('error-message'),
      results: $('results'),
      pocScore: $('poc-score'),
      marketScore: $('market-score'),
      recommendation: $('recommendation'),
      explanation: $('explanation'),
      insights: $('learning-insights'),
      insightList: $('insight-list'),
      byId,
    };
  };

  const handleEvaluate = (elements) => {
    const input = readInputs(elements);

    if (!input.ok) {
      showError(elements, input.error);
      clearResults(elements);
      return;
    }

    const pocScore = calculatePocScore(input.data.poc);
    const marketScore = calculateMarketScore(input.data.market);
    const recommendation = getRecommendation(pocScore, marketScore);

    const evaluation = {
      timestamp: new Date().toISOString(),
      ideaTitle: input.data.title,
      pocCriteria: input.data.poc,
      marketCriteria: input.data.market,
      pocScore,
      marketScore,
      recommendation: recommendation.verdict,
      explanation: recommendation.explanation,
    };

    const existingInsights = window.VScoreLearning.match(evaluation);
    window.VScoreMemory.append(evaluation);

    const rules = window.VScoreLearning.generate(window.VScoreMemory.getAll());
    const generatedInsights = window.VScoreLearning.match(evaluation, rules);
    const insights = [...new Set([...existingInsights, ...generatedInsights])];

    clearError(elements);
    renderResults(elements, { pocScore, marketScore, ...recommendation, insights });
  };

  const init = () => {
    const elements = getElements();
    const { form } = elements;

    window.VScoreMemory.initialize();
    window.VScoreLearning.initialize();

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      handleEvaluate(elements);
    });

    // Native reset clears inputs; we only clear app-owned UI state.
    form.addEventListener('reset', () => {
      clearResults(elements);
      clearError(elements);
    });

    clearError(elements);
    clearResults(elements);
  };

  document.addEventListener('DOMContentLoaded', init);
})();
