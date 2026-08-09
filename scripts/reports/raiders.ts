import chalk from "chalk";
import isUnicodeSupported from "is-unicode-supported";
import { getBorderCharacters, table } from "table";
import { listCachedEvents } from "../../cache/events.ts";
import { groupRaiders } from "../../helpers/raiders.ts";
import type { EventFilters } from "../../types/events.ts";
import type { LeaderboardRow, RaidersOptions } from "../../types/reports.ts";

export async function buildRaiders(
  filters: EventFilters = {},
  options: RaidersOptions = {},
): Promise<LeaderboardRow[]> {
  const { limit = 25, order = "desc", min, max, exclude } = options;

  const events = await listCachedEvents(filters);
  if (events.length === 0) {
    throw new Error("No events in cache for this range. Run npm run data first.");
  }

  if (!events.some((event) => (event.signUps?.length ?? 0) > 0)) {
    throw new Error("No signup data in cache for this range. Re-run npm run data without --no-signups.");
  }

  let raiders = groupRaiders(events, { exclude });

  if (min != null) raiders = raiders.filter((raider) => raider.events >= min);
  if (max != null) raiders = raiders.filter((raider) => raider.events <= max);

  raiders.sort((a, b) => {
    const byEvents = order === "asc" ? a.events - b.events : b.events - a.events;
    return byEvents || a.name.localeCompare(b.name);
  });

  const rows = raiders.map((raider, index) => ({
    rank: index + 1,
    userId: raider.userId,
    name: raider.name,
    events: raider.events,
  }));

  if (limit <= 0) return rows;
  return rows.slice(0, limit);
}

export function formatRaiders(rows: LeaderboardRow[]): string {
  if (rows.length === 0) return "No raiders found.";

  return table(
    [
      [chalk.cyan("#"), chalk.cyan("Name"), chalk.cyan("Events")],
      ...rows.map((row) => [String(row.rank), row.name, String(row.events)]),
    ],
    {
      border: getBorderCharacters(isUnicodeSupported() ? "norc" : "ramac"),
      columns: {
        0: { alignment: "right" },
        2: { alignment: "right" },
      },
      drawHorizontalLine: (index, count) => index === 0 || index === 1 || index === count,
    },
  );
}
