import { listCachedEvents } from "../../cache/events.ts";
import { groupLeaders } from "../../helpers/leaders.ts";
import type { EventFilters } from "../../types/events.ts";
import type { LeaderboardRow } from "../../types/reports.ts";

export async function buildLeaders(filters: EventFilters = {}, limit = 25): Promise<LeaderboardRow[]> {
  const events = await listCachedEvents(filters);
  if (events.length === 0) {
    throw new Error("No events in cache for this range. Run npm run data first.");
  }

  const leaders = groupLeaders(events);
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
