(() => {
  'use strict';

  const THRESHOLD = 65;

  /** @type {ReadonlyArray<{ key: string, weight: number }>} */
  const POC_CRITERIA = Object.freeze([
    { key: 'novelty', weight: 3 },
    { key: 'scope', weight: 4 },
    { key: 'resources', weight: 2 },
    { key: 'outcome', weight: 1 },
  ]);

  /** @type {ReadonlyArray<{ key: string, weight: number }>} */
  const MARKET_CRITERIA = Object.freeze([
    { key: 'pain', weight: 4 },
    { key: 'pay', weight: 3 },
    { key: 'size', weight: 2 },
    { key: 'diff', weight: 1 },
  ]);

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

  const readInputs = (elements) => {
    const title = elements.title.value.trim();
    if (title === '') {
      return { ok: false, error: 'Idea title is required.' };
    }

    const description = elements.description.value.trim();
    if (description.length < 20) {
      return {
        ok: false,
        error: 'Describe the idea in at least 20 characters so ratings can be estimated.',
      };
    }

    return {
      ok: true,
      data: { title, description },
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
    { autoScore, dimensions, pocScore, marketScore, verdict, explanation, insights },
  ) => {
    elements.autoScore.textContent = `${autoScore} / 100`;
    for (const [dimension, score] of Object.entries(dimensions)) {
      elements.dimensionScores[dimension].textContent = String(score);
    }

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
    elements.autoScore.textContent = '';
    Object.values(elements.dimensionScores).forEach((element) => {
      element.textContent = '';
    });
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
    return {
      form: $('evaluation-form'),
      title: $('idea-title'),
      description: $('idea-description'),
      error: $('error-message'),
      results: $('results'),
      autoScore: $('auto-score'),
      dimensionScores: {
        quality: $('rating-quality'),
        feasibility: $('rating-feasibility'),
        impact: $('rating-impact'),
        originality: $('rating-originality'),
        clarity: $('rating-clarity'),
      },
      pocScore: $('poc-score'),
      marketScore: $('market-score'),
      recommendation: $('recommendation'),
      explanation: $('explanation'),
      insights: $('learning-insights'),
      insightList: $('insight-list'),
    };
  };

  const handleEvaluate = (elements) => {
    const input = readInputs(elements);

    if (!input.ok) {
      showError(elements, input.error);
      clearResults(elements);
      return;
    }

    const rating = window.VScoreIdeaRater.rateIdea(input.data.description);
    const pocScore = calculatePocScore(rating.poc);
    const marketScore = calculateMarketScore(rating.market);
    const recommendation = getRecommendation(pocScore, marketScore);

    const evaluation = {
      timestamp: new Date().toISOString(),
      ideaTitle: input.data.title,
      ideaDescription: input.data.description,
      automaticScore: rating.autoScore,
      automaticRatings: rating.dimensions,
      pocCriteria: rating.poc,
      marketCriteria: rating.market,
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
    renderResults(elements, {
      autoScore: rating.autoScore,
      dimensions: rating.dimensions,
      pocScore,
      marketScore,
      ...recommendation,
      insights,
    });
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
