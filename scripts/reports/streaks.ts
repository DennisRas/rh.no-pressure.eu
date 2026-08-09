import chalk from "chalk";
import isUnicodeSupported from "is-unicode-supported";
import { getBorderCharacters, table } from "table";
import { listCachedEvents } from "../../cache/events.ts";
import { weekStartUtc } from "../../helpers/time.ts";
import type { EventFilters } from "../../types/events.ts";
import type { RaidersOptions, StreakRow } from "../../types/reports.ts";

const WEEK_SECONDS = 7 * 24 * 60 * 60;

export async function buildStreaks(filters: EventFilters = {}, options: RaidersOptions = {}): Promise<StreakRow[]> {
  const { limit = 25, order = "desc", min, max, exclude = [] } = options;
  const excludeSet = new Set(exclude.map((value) => value.toLowerCase()));

  const events = await listCachedEvents(filters);
  if (events.length === 0) {
    throw new Error("No events in cache for this range. Run npm run data first.");
  }
  if (!events.some((event) => (event.signUps?.length ?? 0) > 0)) {
    throw new Error("No signup data in cache for this range. Re-run npm run data without --no-signups.");
  }

  const byUser = new Map<
    string,
    {
      userId: string;
      name: string;
      weeks: Map<number, Set<string>>;
    }
  >();

  for (const event of events) {
    const week = weekStartUtc(event.startTime);
    for (const signup of event.signUps ?? []) {
      if (!signup.userId) continue;
      if (excludeSet.has((signup.className ?? "").toLowerCase())) continue;

      let user = byUser.get(signup.userId);
      if (!user) {
        user = { userId: signup.userId, name: signup.name, weeks: new Map() };
        byUser.set(signup.userId, user);
      }
      if (signup.name) user.name = signup.name;

      let weekEvents = user.weeks.get(week);
      if (!weekEvents) {
        weekEvents = new Set();
        user.weeks.set(week, weekEvents);
      }
      weekEvents.add(event.id);
    }
  }

  let rows = [...byUser.values()].map((user) => {
    const weeks = [...user.weeks.keys()].sort((a, b) => a - b);
    let bestStreak = 0;
    let bestEvents = 0;
    let runStart = 0;

    for (let i = 0; i < weeks.length; i += 1) {
      if (i > 0 && weeks[i]! - weeks[i - 1]! !== WEEK_SECONDS) {
        runStart = i;
      }
      const streak = i - runStart + 1;
      if (streak > bestStreak) {
        bestStreak = streak;
        bestEvents = 0;
        for (let j = runStart; j <= i; j += 1) {
          bestEvents += user.weeks.get(weeks[j]!)!.size;
        }
      }
    }

    return {
      userId: user.userId,
      name: user.name,
      streak: bestStreak,
      events: bestEvents,
    };
  });

  if (min != null) rows = rows.filter((row) => row.streak >= min);
  if (max != null) rows = rows.filter((row) => row.streak <= max);

  rows.sort((a, b) => {
    const byStreak = order === "asc" ? a.streak - b.streak : b.streak - a.streak;
    return byStreak || b.events - a.events || a.name.localeCompare(b.name);
  });

  const ranked = rows.map((row, index) => ({
    rank: index + 1,
    userId: row.userId,
    name: row.name,
    streak: row.streak,
    events: row.events,
  }));

  if (limit <= 0) return ranked;
  return ranked.slice(0, limit);
}

export function formatStreaks(rows: StreakRow[]): string {
  if (rows.length === 0) return "No streaks found.";

  return table(
    [
      [chalk.cyan("#"), chalk.cyan("Name"), chalk.cyan("Weeks"), chalk.cyan("Events")],
      ...rows.map((row) => [String(row.rank), row.name, String(row.streak), String(row.events)]),
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
