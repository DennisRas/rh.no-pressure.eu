import chalk from "chalk";
import isUnicodeSupported from "is-unicode-supported";
import { getBorderCharacters, table } from "table";
import { listCachedEvents } from "../../cache/events.ts";
import { titleDifficulty } from "../../helpers/events.ts";
import type { EventFilters, TitleDifficulty } from "../../types/events.ts";
import type { DifficultyRow, LeaderboardOptions } from "../../types/reports.ts";

const LABELS: Record<TitleDifficulty, string> = {
  mythic: "Mythic",
  heroic: "Heroic",
  normal: "Normal",
  other: "Other",
};

const ORDER: TitleDifficulty[] = ["mythic", "heroic", "normal", "other"];

export async function buildDifficulties(
  filters: EventFilters = {},
  options: LeaderboardOptions = {},
): Promise<DifficultyRow[]> {
  const { limit = 0, order = "desc", min, max } = options;

  const events = await listCachedEvents(filters);
  if (events.length === 0) {
    throw new Error("No events in cache for this range. Run npm run data first.");
  }

  const buckets = new Map<TitleDifficulty, { events: number; signups: number; raiders: Set<string> }>();
  for (const key of ORDER) {
    buckets.set(key, { events: 0, signups: 0, raiders: new Set() });
  }

  for (const event of events) {
    const key = titleDifficulty(event.title ?? "");
    const bucket = buckets.get(key)!;
    bucket.events += 1;
    for (const signup of event.signUps ?? []) {
      bucket.signups += 1;
      if (signup.userId) bucket.raiders.add(signup.userId);
    }
  }

  let rows = ORDER.map((key) => ({
    difficulty: LABELS[key],
    events: buckets.get(key)!.events,
    signups: buckets.get(key)!.signups,
    raiders: buckets.get(key)!.raiders.size,
  }));

  if (min != null) rows = rows.filter((row) => row.events >= min);
  if (max != null) rows = rows.filter((row) => row.events <= max);

  rows.sort((a, b) => {
    const byEvents = order === "asc" ? a.events - b.events : b.events - a.events;
    return byEvents || a.difficulty.localeCompare(b.difficulty);
  });

  const ranked = rows.map((row, index) => ({
    rank: index + 1,
    difficulty: row.difficulty,
    events: row.events,
    signups: row.signups,
    raiders: row.raiders,
  }));

  if (limit <= 0) return ranked;
  return ranked.slice(0, limit);
}

export function formatDifficulties(rows: DifficultyRow[]): string {
  if (rows.length === 0) return "No difficulties found.";

  return table(
    [
      [chalk.cyan("#"), chalk.cyan("Difficulty"), chalk.cyan("Events"), chalk.cyan("Signups"), chalk.cyan("Raiders")],
      ...rows.map((row) => [
        String(row.rank),
        row.difficulty,
        String(row.events),
        String(row.signups),
        String(row.raiders),
      ]),
    ],
    {
      border: getBorderCharacters(isUnicodeSupported() ? "norc" : "ramac"),
      columns: {
        0: { alignment: "right" },
        2: { alignment: "right" },
        3: { alignment: "right" },
        4: { alignment: "right" },
      },
      drawHorizontalLine: (index, count) => index === 0 || index === 1 || index === count,
    },
  );
}
