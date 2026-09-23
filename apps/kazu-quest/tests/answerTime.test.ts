import { describe, expect, it } from "vitest";
import { defaultAnswerTimeFor, effectiveTimeLimit } from "../src/lib/answerTime";
import { defaultSave, normalizeSave } from "../src/lib/save";

describe("effectiveTimeLimit", () => {
  it("keeps, stretches or removes the battle timer", () => {
    expect(effectiveTimeLimit(10000, "normal")).toBe(10000);
    expect(effectiveTimeLimit(10000, "slow")).toBe(16000);
    expect(effectiveTimeLimit(10000, "off")).toBeNull();
  });

  it("suggests slow answers for grades 1-2 only", () => {
    expect(defaultAnswerTimeFor(1)).toBe("slow");
    expect(defaultAnswerTimeFor(2)).toBe("slow");
    expect(defaultAnswerTimeFor(3)).toBe("normal");
    expect(defaultAnswerTimeFor(null)).toBe("normal");
  });
});

describe("settings normalization", () => {
  it("defaults old saves to normal time and unknown grade", () => {
    const raw = { ...defaultSave(), settings: { sound: true, volume: 2 } };
    const s = normalizeSave(raw).settings;
    expect(s.answerTime).toBe("normal");
    expect(s.schoolGrade).toBeNull();
  });

  it("rejects invalid values", () => {
    const raw = { ...defaultSave(), settings: { answerTime: "fast", schoolGrade: 9 } };
    const s = normalizeSave(raw).settings;
    expect(s.answerTime).toBe("normal");
    expect(s.schoolGrade).toBeNull();
    const ok = normalizeSave({ ...defaultSave(), settings: { answerTime: "off", schoolGrade: 2 } }).settings;
    expect(ok).toMatchObject({ answerTime: "off", schoolGrade: 2 });
  });
});
