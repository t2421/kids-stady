import { describe, expect, it } from "vitest";
import type { EncounterTable } from "../src/content/types";
import { pickEncounterGroup, rollEncounterSteps } from "../src/lib/encounter";
import { mulberry32 } from "../src/lib/curriculum/types";

const TABLE: EncounterTable = {
  id: "t",
  stepRange: [10, 22],
  groups: [
    { monsterIds: ["a"], weight: 3 },
    { monsterIds: ["b", "b"], weight: 1 },
  ],
};

describe("encounter", () => {
  it("rolls steps within the guaranteed range", () => {
    const rng = mulberry32(1);
    for (let i = 0; i < 500; i++) {
      const steps = rollEncounterSteps(TABLE, rng);
      expect(steps).toBeGreaterThanOrEqual(10);
      expect(steps).toBeLessThanOrEqual(22);
    }
  });

  it("picks groups proportionally to weight", () => {
    const rng = mulberry32(2);
    let a = 0;
    const total = 4000;
    for (let i = 0; i < total; i++) {
      if (pickEncounterGroup(TABLE, rng)[0] === "a") a++;
    }
    /* 重み 3:1 → a はおよそ75% */
    expect(a / total).toBeGreaterThan(0.68);
    expect(a / total).toBeLessThan(0.82);
  });
});
