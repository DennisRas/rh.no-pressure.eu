import chalk from "chalk";
import isUnicodeSupported from "is-unicode-supported";
import { getBorderCharacters, table } from "table";
import { listCachedEvents } from "../../cache/events.ts";
import type { EventFilters } from "../../types/events.ts";
import type { LeaderboardOptions, RoleRow } from "../../types/reports.ts";

export async function buildRoles(filters: EventFilters = {}, options: LeaderboardOptions = {}): Promise<RoleRow[]> {
  const { limit = 25, order = "desc", min, max } = options;

  const events = await listCachedEvents(filters);
  if (events.length === 0) {
    throw new Error("No events in cache for this range. Run npm run data first.");
  }
  if (!events.some((event) => (event.signUps?.length ?? 0) > 0)) {
    throw new Error("No signup data in cache for this range. Re-run npm run data without --no-signups.");
  }

  const byRole = new Map<string, { role: string; signups: number; eventIds: Set<string> }>();

  for (const event of events) {
    for (const signup of event.signUps ?? []) {
      const role = (signup.className || "(empty)").trim() || "(empty)";
      const key = role.toLowerCase();
      let row = byRole.get(key);
      if (!row) {
        row = { role, signups: 0, eventIds: new Set() };
        byRole.set(key, row);
      }
      row.signups += 1;
      row.eventIds.add(event.id);
    }
  }

  let rows = [...byRole.values()].map((row) => ({
    role: row.role,
    signups: row.signups,
    events: row.eventIds.size,
  }));

  if (min != null) rows = rows.filter((row) => row.signups >= min);
  if (max != null) rows = rows.filter((row) => row.signups <= max);

  rows.sort((a, b) => {
    const bySignups = order === "asc" ? a.signups - b.signups : b.signups - a.signups;
    return bySignups || a.role.localeCompare(b.role);
  });

  const ranked = rows.map((row, index) => ({
    rank: index + 1,
    role: row.role,
    signups: row.signups,
    events: row.events,
  }));

  if (limit <= 0) return ranked;
  return ranked.slice(0, limit);
}

export function formatRoles(rows: RoleRow[]): string {
  if (rows.length === 0) return "No roles found.";

  return table(
    [
      [chalk.cyan("#"), chalk.cyan("Role"), chalk.cyan("Signups"), chalk.cyan("Events")],
      ...rows.map((row) => [String(row.rank), row.role, String(row.signups), String(row.events)]),
    ],
    {
      border: getBorderCharacters(isUnicodeSupported() ? "norc" : "ramac"),
      columns: {
        0: { alignment: "right" },
        2: { alignment: "right" },
        3: { alignment: "right" },
      },
      drawHorizontalLine: (index, count) => index === 0 || index === 1 || index === count,
    },
  );
}
