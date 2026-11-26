// index.js — barrel for the Expanded Edition
// Import this from your app or from tests. For an existing checkout, the
// safest integration is: keep activityRegistry.ts as-is, import the
// EXPANDED_* modules below, and merge at runtime with mergeWithBaseRegistry().

export * from './expandedBoardPrompts.js';
export * from './expandedActivityDesign.js';
export * from './expandedNewActivities.js';
export * from './expandedBanks.js';
export * from './expandedMomentCards.js';
export * from './expandedSessionArcs.js';
export * from './expandedDuelDesign.js';
export * from './expandedActivityRegistry.js';

// Merge helper for checkouts that already have a base registry:
//   import { ACTIVITIES } from '../activityRegistry.js';
//   import { mergeWithBaseRegistry } from './expanded/index.js';
//   const ALL = mergeWithBaseRegistry(ACTIVITIES);
import { EXPANDED_BOARD_PROMPTS, EXPANSION_BANK_BY_ACTIVITY } from './expandedBoardPrompts.js';
import { NEW_BOARD_ACTIVITIES } from './expandedNewActivities.js';
import { ACTIVITY_DESIGN } from './expandedActivityDesign.js';

export function mergeWithBaseRegistry(baseActivities) {
  const byId = new Map(baseActivities.map((a) => [a.id, { ...a }]));
  for (const [id, extra] of Object.entries(EXPANDED_BOARD_PROMPTS)) {
    if (!byId.has(id)) continue;
    const base = byId.get(id);
    const existing = base.prompts ?? base.questions ?? [];
    const fresh = extra.filter((p) => !existing.includes(p));
    byId.set(id, { ...base, prompts: [...existing, ...fresh], design: ACTIVITY_DESIGN[id] ?? base.design });
  }
  for (const act of NEW_BOARD_ACTIVITIES) {
    if (!byId.has(act.id)) {
      byId.set(act.id, { ...act, prompts: act.prompts, design: ACTIVITY_DESIGN[act.id] ?? null });
    }
  }
  // Attach design to every activity that has one.
  for (const [id, act] of byId) {
    if (ACTIVITY_DESIGN[id] && !act.design) byId.set(id, { ...act, design: ACTIVITY_DESIGN[id] });
  }
  return [...byId.values()];
}
export function getExpansionBankForActivity(activityId) {
  return EXPANSION_BANK_BY_ACTIVITY[activityId] ?? null;
}
