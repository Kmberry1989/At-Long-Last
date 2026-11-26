// tests/allArt.test.js
import { describe, it, expect } from "vitest";
import { NEW_MOMENT_CARDS, mergeMomentCards } from "../at-long-last-content-pack-v2/expanded/expandedMomentCards.js";
import { NEW_ACTIVITY_TILE_ART, withActivityArt } from "./activityTileArt.js";

describe("all art — moment cards + activity tiles", () => {
  it("adds 12 moment cards, all with image, 6+6", () => {
    expect(NEW_MOMENT_CARDS).toHaveLength(12);
    expect(NEW_MOMENT_CARDS.filter((c) => c.kind === "trash")).toHaveLength(6);
    expect(NEW_MOMENT_CARDS.filter((c) => c.kind === "treasure")).toHaveLength(6);
    for (const c of NEW_MOMENT_CARDS) expect(c.image).toMatch(/^\/assets\/moment-cards\/.+\.webp$/);
  });
  it("does not duplicate base moment cards", () => {
    const base = [{ id: "trash-dead-phone", kind: "trash", title: "x", description: "x", ritual: "x" }];
    expect(mergeMomentCards(base).filter((c) => c.id === "trash-dead-phone")).toHaveLength(1);
  });
  it("maps 12 activity tiles", () => {
    expect(Object.keys(NEW_ACTIVITY_TILE_ART)).toHaveLength(12);
    for (const [id, img] of Object.entries(NEW_ACTIVITY_TILE_ART)) {
      expect(img).toBe(`/assets/activity-tiles/${id}.webp`);
    }
  });
  it("withActivityArt only touches the 12 new, leaves base alone", () => {
    const base = { id: "some-base-activity", title: "Base" };
    const out = withActivityArt([base, { id: "repair-kit", title: "Repair Kit" }]);
    expect(out[0]).toEqual(base);
    expect(out[1].image).toBe("/assets/activity-tiles/repair-kit.webp");
    expect(out[1].title).toBe("Repair Kit");
  });
});
