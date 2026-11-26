// activityTileArt.js — image map for the 12 NEW activities only (76 → 88)
// At Long Last — Expanded Edition + Art (Nov 26, 2026)
// ADDITIVE ONLY. Does not change prompts / design / intensity.
// Use withActivityArt() to attach `image` to the 12 new activities at merge time,
// or copy the map into expandedNewActivities.js if you prefer image inline.

export const NEW_ACTIVITY_TILE_ART = {
  "repair-kit": "/assets/activity-tiles/repair-kit.webp",
  "long-distance-window": "/assets/activity-tiles/long-distance-window.webp",
  "kindness-ledger": "/assets/activity-tiles/kindness-ledger.webp",
  "quiet-company": "/assets/activity-tiles/quiet-company.webp",
  "couple-coop": "/assets/activity-tiles/couple-coop.webp",
  "what-if-machine": "/assets/activity-tiles/what-if-machine.webp",
  "museum-gift-shop": "/assets/activity-tiles/museum-gift-shop.webp",
  "daily-double": "/assets/activity-tiles/daily-double.webp",
  "longing-ledger": "/assets/activity-tiles/longing-ledger.webp",
  "slow-hello": "/assets/activity-tiles/slow-hello.webp",
  "whispered-map": "/assets/activity-tiles/whispered-map.webp",
  "afterglow-notes": "/assets/activity-tiles/afterglow-notes.webp",
};

// Attach art to new activities only. Base activities pass through unchanged.
export function withActivityArt(activities) {
  return activities.map((a) => {
    const image = NEW_ACTIVITY_TILE_ART[a.id];
    if (!image) return a;
    return { ...a, image };
  });
}

// If your board tile component reads `activity.image`, it will now show art
// for the 12 new tiles and keep the existing rendering for the 76 base tiles
// (or your existing tile art, if base tiles already have image).
