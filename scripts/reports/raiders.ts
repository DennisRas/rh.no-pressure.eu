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
