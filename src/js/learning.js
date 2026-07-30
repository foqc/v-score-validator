(() => {
  'use strict';

  const LEARNING_KEY = 'v-score-learning-rules';
  const MIN_OCCURRENCES = 2;

  const ratings = (evaluation) => evaluation.automaticRatings;

  // Thresholds are calibrated against the rater's observed distribution so each
  // rule describes a minority of evaluations. A rule that matches every idea, or
  // none, carries no information.
  const ratingAtMost = (dimension, limit) => (evaluation) => {
    const rating = ratings(evaluation)?.[dimension];
    return Number.isInteger(rating) && rating <= limit;
  };

  const RULE_DEFINITIONS = Object.freeze([
    {
      id: 'vague-description',
      message: 'Ideas described this briefly usually need a sharper problem and scope statement.',
      matches: ratingAtMost('clarity', 4),
    },
    {
      id: 'unclear-feasibility',
      message: 'Ideas without implementation details usually require a technical feasibility review.',
      matches: ratingAtMost('feasibility', 3),
    },
    {
      id: 'impact-not-stated',
      message: 'Ideas without stated outcomes usually need measurable impact before investment.',
      matches: ratingAtMost('impact', 3),
    },
    {
      id: 'low-differentiation',
      message: 'Ideas with little stated differentiation usually need a competitive review.',
      matches: ratingAtMost('originality', 4),
    },
    {
      id: 'low-poc',
      message: 'Ideas with PoC below 50 usually require technical validation.',
      matches: ({ pocScore }) => pocScore < 50,
    },
    {
      id: 'well-rounded',
      message: 'Ideas rated 6 or higher on every dimension are strong implementation candidates.',
      matches: (evaluation) => {
        const values = Object.values(ratings(evaluation) ?? {});
        return values.length > 0 && values.every((rating) => rating >= 6);
      },
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
