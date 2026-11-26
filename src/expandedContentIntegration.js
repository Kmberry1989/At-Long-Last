// src/expandedContentIntegration.js
// Integration shim for the existing Vite + React + Firestore app.
// Drop this file into src/ and import it where the game picks activities.
// It does NOT replace activityRegistry.ts / duelRegistry — it merges the
// Expanded Edition on top of whatever the checkout already has.

import {
  mergeWithBaseRegistry,
  getExpansionBankForActivity,
  getBankExpansion,
  mergeBank,
} from '../at-long-last-content-pack-v2/expanded/index.js';
import { SESSION_ARCS, getSessionArc } from '../at-long-last-content-pack-v2/expanded/expandedSessionArcs.js';
import { NEW_MOMENT_CARDS, mergeMomentCards } from '../at-long-last-content-pack-v2/expanded/expandedMomentCards.js';

// Re-exported for the game registries that merge a bank at the pick site
// (e.g. the Vault, which also takes the 'vault-additional' expansion).
export { mergeBank, getBankExpansion };

// 1. Board activities — call once at startup with your existing registry.
//    Example: const ALL_ACTIVITIES = buildExpandedActivities(ACTIVITIES);
export function buildExpandedActivities(baseActivities) {
  return mergeWithBaseRegistry(baseActivities);
}

// 2. Prompt picking — drop-in replacement for pickActivityPrompt.
//    Keeps existing behaviour (favour unseen, keep saved prompt) and adds
//    the 4 expansion prompts per activity. For bank-driven activities,
//    pass the bank entries via getBankEntriesForActivity().
export function pickExpandedPrompt(activity, seenPrompts = new Set()) {
  const pool = (activity.prompts ?? []).filter((p) => !seenPrompts.has(p));
  const source = pool.length > 0 ? pool : (activity.prompts ?? []);
  if (source.length === 0) return null;
  return source[Math.floor(Math.random() * source.length)];
}

// 3. Bank entries — for Mind Meld / Prediction Box / Wavelength / etc.,
//    the game already holds a base bank array. Merge the expansion:
//      const mindMeldBank = getBankEntriesForActivity('mind-meld', BASE_MIND_MELD);
export function getBankEntriesForActivity(activityId, baseEntries = []) {
  const bankId = getExpansionBankForActivity(activityId);
  if (!bankId) return baseEntries;
  return mergeBank(baseEntries, bankId);
}
export function getBankExpansionForActivity(activityId) {
  const bankId = getExpansionBankForActivity(activityId);
  return bankId ? getBankExpansion(bankId) : [];
}

// 4. Moment cards — merge 12 new Trash/Treasure cards.
export function buildExpandedMomentCards(baseCards) {
  return mergeMomentCards(baseCards);
}
export { NEW_MOMENT_CARDS };

// 5. Session arcs — suggested orders for one night. Use in the lobby /
//    New Night flow: list arcs, let the couple pick one, then step through it.
export { SESSION_ARCS, getSessionArc };
export function getSessionArcSteps(arcId) {
  return getSessionArc(arcId)?.steps ?? [];
}

// 6. Guardrail for new content — run in tests / CI. Rejects explicit
//    content, scoring language, and lifetime-scale prompts in new entries.
const BLOCKED_PATTERNS = [
  /\bexplicit\b/i,
  /leaderboard/i,
  /high score/i,
  /rank (couples|players)/i,
];
export function validateNewPrompt(prompt) {
  if (typeof prompt !== 'string' || prompt.trim().length === 0) return false;
  return !BLOCKED_PATTERNS.some((re) => re.test(prompt));
}
