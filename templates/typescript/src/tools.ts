/**
 * Example tools. Each tool is a zod input schema plus a pure function, so the
 * logic can be unit-tested without a server and the schema is the single
 * source of truth for validation and for the JSON Schema clients see.
 *
 * Replace these with your own tools and register them in server.ts.
 */
import { z } from "zod";

/** Thrown for failures the caller can fix. The message is returned to the client. */
export class ToolInputError extends Error {}

// --- slugify ---------------------------------------------------------------

export const slugifyInput = {
  text: z.string().min(1).max(500).describe("Text to turn into a URL slug, 1 to 500 characters"),
  max_length: z
    .number()
    .int()
    .min(1)
    .max(200)
    .default(60)
    .describe("Maximum length of the slug (default 60)"),
};

export function slugify(text: string, maxLength = 60): string {
  const slug = text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip accents left by NFKD
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLength)
    .replace(/-+$/, "");
  if (slug === "") {
    throw new ToolInputError("text contains no letters or digits, so the slug would be empty");
  }
  return slug;
}

// --- days_between ----------------------------------------------------------

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "must be a date in YYYY-MM-DD format");

export const daysBetweenInput = {
  start: isoDate.describe("Start date, YYYY-MM-DD"),
  end: isoDate.describe("End date, YYYY-MM-DD; may be before start"),
};

export const daysBetweenOutput = {
  days: z.number().int().describe("Whole days from start to end; negative if end is earlier"),
  weeks: z.number().int().describe("Whole weeks in the absolute difference"),
  remaining_days: z.number().int().describe("Days left over after whole weeks"),
};

export type DaysBetween = { days: number; weeks: number; remaining_days: number };

function parseDate(value: string, field: string): number {
  const [year, month, day] = value.split("-").map(Number) as [number, number, number];
  const ms = Date.UTC(year, month - 1, day);
  const date = new Date(ms);
  // Date.UTC silently rolls 2024-02-31 over to March; reject that instead.
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    throw new ToolInputError(`${field} is not a real calendar date: ${value}`);
  }
  return ms;
}

export function daysBetween(start: string, end: string): DaysBetween {
  const days = Math.round((parseDate(end, "end") - parseDate(start, "start")) / 86_400_000);
  const abs = Math.abs(days);
  return { days, weeks: Math.floor(abs / 7), remaining_days: abs % 7 };
}
