// tests/expandedContent.test.js — Vitest
// Run: npm test -- tests/expandedContent.test.js
// These tests guard the Expanded Edition counts and guardrails without
// needing Firebase. They import only the additive expanded/ folder.

import { describe, it, expect } from 'vitest';
import { EXPANDED_ACTIVITY_REGISTRY, getExpandedActivity } from '../at-long-last-content-pack-v2/expanded/expandedActivityRegistry.js';
import { EXPANDED_BOARD_PROMPTS } from '../at-long-last-content-pack-v2/expanded/expandedBoardPrompts.js';
import { NEW_BOARD_ACTIVITIES } from '../at-long-last-content-pack-v2/expanded/expandedNewActivities.js';
import { ACTIVITY_DESIGN } from '../at-long-last-content-pack-v2/expanded/expandedActivityDesign.js';
import { EXPANDED_BANKS, BANK_META, mergeBank } from '../at-long-last-content-pack-v2/expanded/expandedBanks.js';
import { NEW_TRASH_CARDS, NEW_TREASURE_CARDS } from '../at-long-last-content-pack-v2/expanded/expandedMomentCards.js';
import { SESSION_ARCS } from '../at-long-last-content-pack-v2/expanded/expandedSessionArcs.js';
import { DUEL_DESIGN, getSelectableDuelDesigns } from '../at-long-last-content-pack-v2/expanded/expandedDuelDesign.js';

describe('board activities — 76 → 88', () => {
  it('has 88 activities', () => {
    expect(EXPANDED_ACTIVITY_REGISTRY.length).toBe(88);
  });
  it('has 12 new activities with 12 prompts each', () => {
    expect(NEW_BOARD_ACTIVITIES.length).toBe(12);
    for (const a of NEW_BOARD_ACTIVITIES) expect(a.prompts.length).toBe(12);
  });
  it('has unique activity ids', () => {
    const ids = EXPANDED_ACTIVITY_REGISTRY.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it('gives 63 non-bank activities exactly 4 expansion prompts', () => {
    const expanded = Object.entries(EXPANDED_BOARD_PROMPTS).filter(([, v]) => v.length > 0);
    expect(expanded.length).toBe(63);
    for (const [, prompts] of expanded) expect(prompts.length).toBe(4);
  });
  it('gives every activity a design reading', () => {
    for (const a of EXPANDED_ACTIVITY_REGISTRY) {
      const d = ACTIVITY_DESIGN[a.id];
      expect(d, a.id).toBeTruthy();
      expect(d.whatItDoes.length).toBeGreaterThan(20);
      expect(d.playWhen.length).toBeGreaterThan(5);
      // Original 76 have a Twist; the 12 new activities have What + Play
      // (their twist lives in the activity's own prompts, not a separate line).
      if (!a.isNew) expect(d.twist.length).toBeGreaterThan(5);
    }
  });
  it('keeps Intensity in 1–3 and Mutual Yes as the only Intensity 3', () => {
    for (const a of EXPANDED_ACTIVITY_REGISTRY) {
      expect(a.intensity).toBeGreaterThanOrEqual(1);
      expect(a.intensity).toBeLessThanOrEqual(3);
    }
    const i3 = EXPANDED_ACTIVITY_REGISTRY.filter((a) => a.intensity === 3);
    expect(i3.map((a) => a.id)).toEqual(['mutual-yes']);
  });
  it('keeps vibe in tender / playful / spicy', () => {
    for (const a of EXPANDED_ACTIVITY_REGISTRY) {
      expect(['tender', 'playful', 'spicy']).toContain(a.vibe);
    }
  });
  it('has no empty prompts', () => {
    for (const a of EXPANDED_ACTIVITY_REGISTRY) {
      for (const p of a.prompts) expect(p.trim().length).toBeGreaterThan(0);
    }
  });
});

describe('banks — expansions append, never replace', () => {
  it('has the expected expansion sizes', () => {
    expect(EXPANDED_BANKS['mind-meld'].length).toBe(12);
    expect(EXPANDED_BANKS['prediction-box'].length).toBe(12);
    expect(EXPANDED_BANKS['vault'].length).toBe(10);
    expect(EXPANDED_BANKS['vault-additional'].length).toBe(4);
    expect(EXPANDED_BANKS['same-wavelength'].length).toBe(12);
    expect(EXPANDED_BANKS['mutual-yes'].length).toBe(10);
    expect(EXPANDED_BANKS['vibe-check'].length).toBe(10);
    expect(EXPANDED_BANKS['tempo-tap'].length).toBe(6);
    expect(EXPANDED_BANKS['word-weaver'].length).toBe(4);
    expect(EXPANDED_BANKS['dual-axis-maze'].length).toBe(4);
    expect(EXPANDED_BANKS['blind-canvas'].length).toBe(10);
    expect(EXPANDED_BANKS['harmonic-lock'].length).toBe(6);
    expect(EXPANDED_BANKS['bluff-bidding'].length).toBe(10);
    expect(EXPANDED_BANKS['photo-flashback'].length).toBe(10);
    expect(EXPANDED_BANKS['wavelength'].length).toBe(24);
    expect(EXPANDED_BANKS['letterpress'].length).toBe(12);
    expect(EXPANDED_BANKS['gratitude-duel'].length).toBe(12);
    expect(EXPANDED_BANKS['say-it-without-saying'].length).toBe(12);
    expect(EXPANDED_BANKS['love-in-the-blanks'].length).toBe(4);
    expect(EXPANDED_BANKS['star-map'].length).toBe(6);
    expect(EXPANDED_BANKS['portrait-panic'].length).toBe(8);
    expect(EXPANDED_BANKS['our-next-line'].length).toBe(4);
  });
  it('gives choice banks exactly 4 choices', () => {
    for (const bankId of ['mind-meld', 'prediction-box', 'wavelength']) {
      for (const e of EXPANDED_BANKS[bankId]) expect(e.choices.length).toBe(4);
    }
  });
  it('gives scale banks a low/high pair', () => {
    for (const e of EXPANDED_BANKS['vibe-check']) {
      expect(e.scale.low.length).toBeGreaterThan(0);
      expect(e.scale.high.length).toBeGreaterThan(0);
    }
  });
  it('gives round banks a round name', () => {
    for (const bankId of ['tempo-tap', 'harmonic-lock', 'dual-axis-maze']) {
      for (const e of EXPANDED_BANKS[bankId]) expect(e.round.length).toBeGreaterThan(0);
    }
  });
  it('mergeBank appends without duplicating', () => {
    const base = [{ prompt: 'Base prompt' }];
    const merged = mergeBank(base, 'mind-meld');
    expect(merged.length).toBe(13);
    expect(merged[0]).toEqual(base[0]);
    const twice = mergeBank(merged, 'mind-meld');
    expect(twice.length).toBe(13);
  });
  it('bank meta before/after matches the catalog', () => {
    expect(BANK_META['mind-meld']).toMatchObject({ before: 56, after: 68 });
    expect(BANK_META['wavelength']).toMatchObject({ before: 157, after: 181 });
    expect(BANK_META['vault']).toMatchObject({ before: 20, after: 30 });
  });
});

describe('moment cards, arcs, duels', () => {
  it('adds 6 Trash + 6 Treasure cards', () => {
    expect(NEW_TRASH_CARDS.length).toBe(6);
    expect(NEW_TREASURE_CARDS.length).toBe(6);
  });
  it('has 5 session arcs, each ending on a sealed/ritual step', () => {
    expect(SESSION_ARCS.length).toBe(5);
    for (const arc of SESSION_ARCS) expect(arc.steps.length).toBeGreaterThanOrEqual(5);
  });
  it('keeps 18 duels with a teaches + variant reading', () => {
    expect(DUEL_DESIGN.length).toBe(18);
    const selectable = new Set(getSelectableDuelDesigns().map((d) => d.id));
    for (const d of DUEL_DESIGN) {
      expect(d.teaches.length).toBeGreaterThan(20);
      // Archived / folded duels (Registered, not selectable) have no
      // variant by design — their teaches line says why they were folded.
      if (selectable.has(d.id)) expect(d.variant.length).toBeGreaterThan(5);
    }
  });
});

describe('guardrails', () => {
  it('adds no explicit content markers in new prompts', () => {
    const all = [
      ...EXPANDED_ACTIVITY_REGISTRY.flatMap((a) => a.prompts),
      ...Object.values(EXPANDED_BANKS).flat().map((e) => e.prompt ?? e.value ?? e.cue ?? e.seed ?? ''),
    ];
    const bad = all.filter((p) => /\bexplicit\b|porn|erotica/i.test(p));
    expect(bad).toEqual([]);
  });
});
