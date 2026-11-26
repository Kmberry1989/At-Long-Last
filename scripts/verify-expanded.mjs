// scripts/verify-expanded.mjs — no-dependency count check
// Run: node scripts/verify-expanded.mjs
// Prints the Expanded Edition counts table. Fails (exit 1) if counts drift.

import { readFileSync } from 'node:fs';

// Lightweight: parse the generated JS files for counts without importing
// (so this runs even if the app's bundler config differs).
const registry = readFileSync(new URL('../at-long-last-content-pack-v2/expanded/expandedActivityRegistry.js', import.meta.url), 'utf8');
const banks = readFileSync(new URL('../at-long-last-content-pack-v2/expanded/expandedBanks.js', import.meta.url), 'utf8');

function countOccurrences(text, needle) {
  return text.split(needle).length - 1;
}
const checks = [
  ['Board activities (registry entries)', countOccurrences(registry, '"isNew"'), 88],
];
console.log('\nAt Long Last — Expanded Edition — verification');
console.log('----------------------------------------------');
for (const [label, got, want] of checks) {
  const ok = got === want ? 'OK ' : 'FAIL';
  console.log(`${ok} ${label}: ${got} (expected ${want})`);
}
console.log('\nFor full assertions, run: npm test -- tests/expandedContent.test.js');
const failed = checks.some(([, got, want]) => got !== want);
if (failed) process.exit(1);
