(() => {
  'use strict';

  const KEYWORDS = Object.freeze({
    audience: [
      'user', 'customer', 'team', 'business', 'student', 'patient', 'parent',
      'usuario', 'cliente', 'equipo', 'empresa', 'estudiante', 'paciente',
    ],
    problem: [
      'problem', 'pain', 'diffic', 'slow', 'expens', 'wast', 'risk', 'manual',
      'proble', 'dolor', 'dificil', 'lento', 'costos', 'desperdici', 'riesg',
    ],
    solution: [
      'app', 'platform', 'tool', 'service', 'system', 'software', 'automat', 'marketplace',
      'aplicacion', 'plataforma', 'herramienta', 'servicio', 'sistema',
    ],
    feasibility: [
      'web', 'mobile', 'api', 'data', 'workflow', 'protot', 'mvp', 'integr', 'local',
      'movil', 'datos', 'flujo', 'navegador',
    ],
    impact: [
      'reduc', 'sav', 'improv', 'increas', 'fast', 'safe', 'access', 'optimiz',
      'ahorr', 'mejor', 'aument', 'rapid', 'segur',
    ],
    originality: [
      'unique', 'novel', 'unlike', 'combin', 'special', 'tailor', 'alternat',
      'unico', 'noved', 'diferente',
    ],
  });

  const normalize = (text) =>
    text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

  const tokenize = (text) => normalize(text).split(/[^a-z0-9]+/).filter(Boolean);

  const countSignals = (words, keywords) =>
    keywords.filter((keyword) => words.some((word) => word.startsWith(keyword))).length;

  const clampRating = (value) => Math.max(1, Math.min(10, Math.round(value)));

  const rateIdea = (description) => {
    const words = tokenize(description);
    const wordCount = words.length;
    const uniqueRatio = wordCount === 0 ? 0 : new Set(words).size / wordCount;
    const hasNumber = /\d/.test(description);

    const signals = Object.fromEntries(
      Object.entries(KEYWORDS).map(([name, keywords]) => [
        name,
        countSignals(words, keywords),
      ]),
    );

    const has = (signal) => Number(signals[signal] > 0);
    const detail = Math.min(3, wordCount / 10);

    const dimensions = {
      quality: clampRating(
        2 + detail + has('audience') + has('problem') + has('solution') + has('impact'),
      ),
      feasibility: clampRating(
        2 + Math.min(3, signals.feasibility) + has('solution') + hasNumber + Number(wordCount >= 15),
      ),
      impact: clampRating(
        2 + Math.min(3, signals.impact) + has('problem') + has('audience') + hasNumber,
      ),
      originality: clampRating(
        2 + Math.min(3, signals.originality * 2) + Math.min(3, uniqueRatio * 3)
          + Number(has('solution') && has('audience')),
      ),
      clarity: clampRating(
        2 + Math.min(4, wordCount / 8) + has('audience') + has('problem') + has('solution'),
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
