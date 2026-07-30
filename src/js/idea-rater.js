(() => {
  'use strict';

  // Each signal lists stems matched against the start of a word, so plurals and
  // conjugations count. `target` is the number of distinct stems that represents
  // full strength for that signal.
  const SIGNALS = Object.freeze({
    audience: {
      target: 2,
      stems: [
        'user', 'customer', 'client', 'team', 'business', 'compan', 'student',
        'patient', 'parent', 'freelanc', 'employee', 'staff', 'shop', 'store',
        'restaurant', 'clinic', 'school', 'famil', 'people', 'audience', 'seller',
        'buyer', 'driver', 'developer', 'manager', 'owner',
        'usuario', 'cliente', 'equipo', 'empresa', 'estudiante', 'paciente',
        'padre', 'tienda', 'negocio', 'persona',
      ],
    },
    problem: {
      target: 2,
      stems: [
        'problem', 'pain', 'diffic', 'hard', 'slow', 'expens', 'costl', 'wast',
        'risk', 'manual', 'error', 'mistake', 'confus', 'miss', 'lack', 'struggl',
        'unfair', 'delay', 'bottleneck', 'churn', 'stockout', 'overhead',
        'proble', 'dolor', 'dificil', 'lento', 'costos', 'desperdici', 'riesg',
        'manualment', 'demora', 'falta',
      ],
    },
    solution: {
      target: 2,
      stems: [
        'app', 'platform', 'tool', 'service', 'system', 'software', 'automat',
        'marketplace', 'dashboard', 'extension', 'assistant', 'bot', 'portal',
        'track', 'manage', 'connect', 'schedul', 'book', 'summar', 'convert',
        'generat', 'organiz', 'match', 'monitor', 'aler', 'remind', 'categor',
        'aplicacion', 'plataforma', 'herramienta', 'servicio', 'sistema',
        'gestion', 'conecta', 'organiz', 'agenda',
      ],
    },
    feasibility: {
      target: 3,
      stems: [
        'web', 'mobile', 'browser', 'api', 'data', 'database', 'workflow',
        'protot', 'mvp', 'integr', 'local', 'cloud', 'export', 'import', 'sync',
        'upload', 'login', 'offline', 'spreadsheet', 'csv', 'record', 'file',
        'movil', 'datos', 'flujo', 'navegador', 'nube', 'archivo',
      ],
    },
    impact: {
      target: 3,
      stems: [
        'reduc', 'sav', 'improv', 'increas', 'faster', 'fast', 'safer', 'safe',
        'access', 'optimiz', 'cheap', 'efficien', 'productiv', 'reven', 'profit',
        'cost', 'time', 'growth', 'retent', 'convert', 'quality', 'accura',
        'ahorr', 'mejor', 'aument', 'rapid', 'segur', 'eficien', 'tiempo',
        'ingres', 'calidad',
      ],
    },
    originality: {
      target: 2,
      stems: [
        'unique', 'novel', 'unlike', 'combin', 'special', 'tailor', 'alternat',
        'niche', 'first', 'proprietar', 'custom', 'personaliz', 'differen',
        'instead', 'competitor', 'unmet',
        'unico', 'noved', 'diferente', 'nicho', 'propio', 'competencia',
      ],
    },
  });

  const FULL_DETAIL_WORDS = 32;

  const normalize = (text) =>
    text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

  const tokenize = (text) => normalize(text).split(/[^a-z0-9]+/).filter(Boolean);

  /** Fraction (0-1) of a signal's target stems present in the text. */
  const signalStrength = (words, { stems, target }) => {
    const hits = stems.filter((stem) => words.some((word) => word.startsWith(stem))).length;
    return Math.min(1, hits / target);
  };

  /** Maps a 0-1 strength onto the 1-10 rating scale. */
  const toRating = (strength) =>
    Math.max(1, Math.min(10, Math.round(1 + 9 * Math.max(0, Math.min(1, strength)))));

  const rateIdea = (description) => {
    const words = tokenize(description);
    const wordCount = words.length;

    const detail = Math.min(1, wordCount / FULL_DETAIL_WORDS);
    const variety = wordCount === 0 ? 0 : new Set(words).size / wordCount;
    const quantified = /\d/.test(description) ? 1 : 0;

    const signal = Object.fromEntries(
      Object.entries(SIGNALS).map(([name, definition]) => [
        name,
        signalStrength(words, definition),
      ]),
    );

    const dimensions = {
      quality: toRating(
        0.3 * detail + 0.25 * signal.audience + 0.25 * signal.problem + 0.2 * signal.impact,
      ),
      feasibility: toRating(
        0.4 * signal.feasibility + 0.3 * signal.solution + 0.2 * detail + 0.1 * quantified,
      ),
      impact: toRating(
        0.4 * signal.impact + 0.3 * signal.problem + 0.15 * signal.audience + 0.15 * quantified,
      ),
      originality: toRating(
        0.45 * signal.originality + 0.25 * variety
          + 0.2 * Math.min(signal.solution, signal.audience) + 0.1 * detail,
      ),
      clarity: toRating(
        0.35 * detail + 0.25 * signal.solution + 0.2 * signal.audience + 0.2 * signal.problem,
      ),
    };

    const average = Object.values(dimensions).reduce((sum, score) => sum + score, 0)
      / Object.keys(dimensions).length;

    return {
      dimensions,
      autoScore: Math.round(average * 10),
      poc: {
        novelty: dimensions.originality,
        scope: dimensions.clarity,
        resources: dimensions.feasibility,
        outcome: Math.round((dimensions.quality + dimensions.impact) / 2),
      },
      market: {
        pain: dimensions.impact,
        pay: dimensions.quality,
        size: Math.round((dimensions.impact + dimensions.clarity) / 2),
        diff: dimensions.originality,
      },
    };
  };

  window.VScoreIdeaRater = Object.freeze({ rateIdea });
})();
