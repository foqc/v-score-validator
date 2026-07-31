#!/usr/bin/env node
import { POC_RESOURCE_ITEMS } from './lib/scoring.mjs';

const payload = {
  description:
    'Mark each resource factor as available (true) or not (false). Pass answers to score-item.mjs.',
  items: POC_RESOURCE_ITEMS.map(({ id, label }) => ({ id, label })),
};

console.log(JSON.stringify(payload, null, 2));
