(() => {
  'use strict';

  const LEARNING_KEY = 'v-score-learning-rules';
  const MIN_OCCURRENCES = 2;

  const RULE_DEFINITIONS = Object.freeze([
    {
      id: 'low-poc',
      message: 'Ideas with PoC below 40 usually require technical validation.',
      matches: ({ pocScore }) => pocScore < 40,
    },
    {
      id: 'high-market-low-poc',
      message: 'Ideas with Market above 80 but PoC below 50 should prioritize prototyping.',
      matches: ({ pocScore, marketScore }) => marketScore > 80 && pocScore < 50,
    },
    {
      id: 'high-both',
      message: 'Ideas scoring above 80 in both dimensions are strong implementation candidates.',
      matches: ({ pocScore, marketScore }) => pocScore > 80 && marketScore > 80,
    },
  ]);

  const definitionsById = new Map(RULE_DEFINITIONS.map((rule) => [rule.id, rule]));

  const getAll = () => {
    const stored = localStorage.getItem(LEARNING_KEY);

    if (stored) {
      try {
        const rules = JSON.parse(stored);
        if (Array.isArray(rules)) return rules;
      } catch {
        // Repair malformed storage below.
      }
    }

    localStorage.setItem(LEARNING_KEY, '[]');
    return [];
  };

  const generate = (history) => {
    const rules = RULE_DEFINITIONS.flatMap(({ id, message, matches }) => {
      const occurrences = history.filter(matches).length;
      return occurrences >= MIN_OCCURRENCES ? [{ id, message, occurrences }] : [];
    });

    localStorage.setItem(LEARNING_KEY, JSON.stringify(rules));
    return rules;
  };

  const match = (evaluation, rules = getAll()) =>
    rules
      .filter(({ id }) => definitionsById.get(id)?.matches(evaluation))
      .map(({ message }) => message);

  const initialize = () => {
    getAll();
  };

  window.VScoreLearning = Object.freeze({ initialize, getAll, generate, match });
})();
