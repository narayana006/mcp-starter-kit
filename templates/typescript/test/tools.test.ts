import { describe, expect, it } from "vitest";
import { ToolInputError, daysBetween, slugify } from "../src/tools.js";

describe("slugify", () => {
  it("lowercases, strips accents and joins words with hyphens", () => {
    expect(slugify("  Crème Brûlée: The Recipe! ")).toBe("creme-brulee-the-recipe");
  });

  it("truncates without leaving a trailing hyphen", () => {
    expect(slugify("alpha beta gamma", 11)).toBe("alpha-beta");
  });

  it("rejects text with nothing sluggable in it", () => {
    expect(() => slugify("!!! ???")).toThrow(ToolInputError);
  });
});

describe("daysBetween", () => {
  it("counts across a leap day", () => {
    expect(daysBetween("2024-02-01", "2024-03-01")).toEqual({ days: 29, weeks: 4, remaining_days: 1 });
  });

  it("is negative when end is before start", () => {
    expect(daysBetween("2025-01-10", "2025-01-01").days).toBe(-9);
  });

  it("rejects dates that do not exist", () => {
    expect(() => daysBetween("2025-02-30", "2025-03-01")).toThrow(/start is not a real calendar date/);
  });
});
