import { listCachedEvents } from "../../cache/events.ts";
import { groupLeaders } from "../../helpers/leaders.ts";
import type { EventFilters } from "../../types/events.ts";
import type { LeaderboardRow, LeadersOptions } from "../../types/reports.ts";

export async function buildLeaders(
  filters: EventFilters = {},
  options: LeadersOptions = {},
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

  const rankWidth = String(rows[rows.length - 1]!.rank).length;
  const nameWidth = Math.max(4, ...rows.map((row) => row.name.length));
  const eventsWidth = Math.max(6, ...rows.map((row) => String(row.events).length));

  const header = `${"#".padStart(rankWidth)}  ${"Name".padEnd(nameWidth)}  ${"Events".padStart(eventsWidth)}`;
  const lines = rows.map(
    (row) =>
      `${String(row.rank).padStart(rankWidth)}  ${row.name.padEnd(nameWidth)}  ${String(row.events).padStart(eventsWidth)}`,
  );

  return [header, ...lines].join("\n");
}
