(() => {
  'use strict';

  const MEMORY_KEY = 'v-score-evaluations';

  const getAll = () => {
    const stored = localStorage.getItem(MEMORY_KEY);

    if (stored) {
      try {
        const records = JSON.parse(stored);
        if (Array.isArray(records)) return records;
      } catch {
        // Repair malformed storage below.
      }
    }

    localStorage.setItem(MEMORY_KEY, '[]');
    return [];
  };

  const append = (evaluation) => {
    const records = getAll();
    records.push(evaluation);
    localStorage.setItem(MEMORY_KEY, JSON.stringify(records));
  };

  const initialize = () => {
    getAll();
  };

  window.VScoreMemory = Object.freeze({ initialize, append, getAll });
})();
