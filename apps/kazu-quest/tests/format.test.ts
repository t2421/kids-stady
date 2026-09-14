import { describe, expect, it } from "vitest";
import { formatPlaytime } from "../src/lib/format";

describe("formatPlaytime", () => {
  it("0 → 0ふん", () => {
    expect(formatPlaytime(0)).toBe("0ふん");
  });

  it("1時間未満は ふん だけ (端数の秒は切り捨て)", () => {
    expect(formatPlaytime(59_999)).toBe("0ふん");
    expect(formatPlaytime(60_000)).toBe("1ふん");
    expect(formatPlaytime(59 * 60_000 + 59_000)).toBe("59ふん");
  });

  it("65分 → 1じかん 5ふん", () => {
    expect(formatPlaytime(65 * 60_000)).toBe("1じかん 5ふん");
  });

  it("ちょうど1時間は 1じかん 0ふん", () => {
    expect(formatPlaytime(60 * 60_000)).toBe("1じかん 0ふん");
  });

  it("不正値 (負数/NaN) は 0ふん", () => {
    expect(formatPlaytime(-5000)).toBe("0ふん");
    expect(formatPlaytime(Number.NaN)).toBe("0ふん");
  });
});
