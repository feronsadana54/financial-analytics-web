import { describe, expect, it } from "vitest";
import { formatPercent } from "../src/utils/formatters";

describe("formatters", () => {
  it("formats percentage values", () => {
    expect(formatPercent(12.345)).toBe("12.35%");
  });
});
