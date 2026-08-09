import chalk from "chalk";
import isUnicodeSupported from "is-unicode-supported";
import { getBorderCharacters, table } from "table";
import { listCachedEvents } from "../../cache/events.ts";
import { wowSpecInfo } from "../../helpers/wow.ts";
import type { EventFilters } from "../../types/events.ts";
import type { RaidersOptions, SpecRow } from "../../types/reports.ts";

export async function buildSpecs(filters: EventFilters = {}, options: RaidersOptions = {}): Promise<SpecRow[]> {
  const { limit = 25, order = "desc", min, max, exclude = [] } = options;
  const excludeSet = new Set(exclude.map((value) => value.toLowerCase()));

  const events = await listCachedEvents(filters);
  if (events.length === 0) {
    throw new Error("No events in cache for this range. Run npm run data first.");
  }
  if (!events.some((event) => (event.signUps?.length ?? 0) > 0)) {
    throw new Error("No signup data in cache for this range. Re-run npm run data without --no-signups.");
  }

  const bySpec = new Map<string, { spec: string; signups: number; eventIds: Set<string> }>();

  for (const event of events) {
    for (const signup of event.signUps ?? []) {
      if (excludeSet.has((signup.className ?? "").toLowerCase())) continue;

      const info = wowSpecInfo(signup.specName ?? "");
      if (!info) continue;

      const key = info.label.toLowerCase();
      let row = bySpec.get(key);
      if (!row) {
        row = { spec: info.label, signups: 0, eventIds: new Set() };
        bySpec.set(key, row);
      }
      row.signups += 1;
      row.eventIds.add(event.id);
    }
  }

  let rows = [...bySpec.values()].map((row) => ({
    spec: row.spec,
    signups: row.signups,
    events: row.eventIds.size,
  }));

  if (min != null) rows = rows.filter((row) => row.signups >= min);
  if (max != null) rows = rows.filter((row) => row.signups <= max);

  rows.sort((a, b) => {
    const bySignups = order === "asc" ? a.signups - b.signups : b.signups - a.signups;
    return bySignups || a.spec.localeCompare(b.spec);
  });

  const ranked = rows.map((row, index) => ({
    rank: index + 1,
    spec: row.spec,
    signups: row.signups,
    events: row.events,
  }));

  if (limit <= 0) return ranked;
  return ranked.slice(0, limit);
}

export function formatSpecs(rows: SpecRow[]): string {
  if (rows.length === 0) return "No specs found.";

  return table(
    [
      [chalk.cyan("#"), chalk.cyan("Spec"), chalk.cyan("Signups"), chalk.cyan("Events")],
      ...rows.map((row) => [String(row.rank), row.spec, String(row.signups), String(row.events)]),
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
