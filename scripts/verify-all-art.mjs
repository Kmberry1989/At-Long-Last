// scripts/verify-all-art.mjs — run: node scripts/verify-all-art.mjs
// NOTE: the pack ships no expandedNewActivities.js (the 12 new activities'
// text lives outside this art package), so the activity check iterates the
// art map itself: every mapped id must have its tile file on disk.
import { existsSync } from "node:fs";
import { NEW_MOMENT_CARDS } from "../at-long-last-content-pack-v2/expanded/expandedMomentCards.js";
import { NEW_ACTIVITY_TILE_ART } from "../src/activityTileArt.js";

let ok = true;
const fail = (m) => { console.error(m); ok = false; };

// Moment cards
if (NEW_MOMENT_CARDS.length !== 12) fail(`Moment cards: expected 12, got ${NEW_MOMENT_CARDS.length}`);
for (const c of NEW_MOMENT_CARDS) {
  for (const k of ["id","kind","title","description","ritual","image"]) if (!c[k]) fail(`Moment ${c.id} missing ${k}`);
  if (!existsSync(`public${c.image}`)) fail(`Moment missing file: public${c.image}`);
}
// Activities
if (Object.keys(NEW_ACTIVITY_TILE_ART).length !== 12) fail(`Activity art map: expected 12, got ${Object.keys(NEW_ACTIVITY_TILE_ART).length}`);
for (const [id, img] of Object.entries(NEW_ACTIVITY_TILE_ART)) {
  if (!existsSync(`public${img}`)) fail(`Activity missing file: public${img} for ${id}`);
}
console.log(ok ? "OK — 12 moment cards + 12 activity tiles, all with art files" : "FAIL");
process.exit(ok ? 0 : 1);
