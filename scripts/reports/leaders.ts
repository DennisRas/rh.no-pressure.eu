import chalk from "chalk";
import isUnicodeSupported from "is-unicode-supported";
import { getBorderCharacters, table } from "table";
import { listCachedEvents } from "../../cache/events.ts";
import { groupLeaders } from "../../helpers/leaders.ts";
import type { EventFilters } from "../../types/events.ts";
import type { LeaderboardOptions, LeaderboardRow } from "../../types/reports.ts";

export async function buildLeaders(
  filters: EventFilters = {},
  options: LeaderboardOptions = {},
): Promise<LeaderboardRow[]> {
  const { limit = 25, order = "desc", min, max } = options;

  const events = await listCachedEvents(filters);
  if (events.length === 0) {
    throw new Error("No events in cache for this range. Run npm run data first.");
  }

  let leaders = groupLeaders(events);
  if (min != null) leaders = leaders.filter((leader) => leader.events >= min);
  if (max != null) leaders = leaders.filter((leader) => leader.events <= max);

  leaders.sort((a, b) => {
    const byEvents = order === "asc" ? a.events - b.events : b.events - a.events;
    return byEvents || a.name.localeCompare(b.name);
  });

  const rows = leaders.map((leader, index) => ({
    rank: index + 1,
    userId: leader.userId,
    name: leader.name,
    events: leader.events,
  }));

  if (limit <= 0) return rows;
  return rows.slice(0, limit);
}

export function formatLeaders(rows: LeaderboardRow[]): string {
  if (rows.length === 0) return "No leaders found.";

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
