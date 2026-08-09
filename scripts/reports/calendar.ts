import chalk from "chalk";
import isUnicodeSupported from "is-unicode-supported";
import { getBorderCharacters, table } from "table";
import { listCachedEvents } from "../../cache/events.ts";
import { signupCount, titleDifficulty } from "../../helpers/events.ts";
import type { EventFilters } from "../../types/events.ts";
import type { CalendarRow } from "../../types/reports.ts";

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const DIFFICULTY_LABEL = {
  mythic: "Mythic",
  heroic: "Heroic",
  normal: "Normal",
  other: "Other",
} as const;

function partsUtc(unixSeconds: number): { date: string; weekday: string; time: string } {
  const date = new Date(unixSeconds * 1000);
  const day = date.toISOString().slice(0, 10);
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  return {
    date: day,
    weekday: WEEKDAYS[date.getUTCDay()]!,
    time: `${hours}:${minutes}`,
  };
}

export async function buildCalendar(
  filters: EventFilters = {},
  options: { limit?: number } = {},
): Promise<CalendarRow[]> {
  const { limit = 0 } = options;
  const startTime = filters.startTime ?? Math.floor(Date.now() / 1000);

  const events = await listCachedEvents({
    startTime,
    endTime: filters.endTime,
    channelId: filters.channelId,
  });

  if (events.length === 0) {
    throw new Error("No events in cache for this range. Run npm run data first.");
  }

  const rows = events.map((event) => {
    const { date, weekday, time } = partsUtc(event.startTime);
    return {
      date,
      weekday,
      time,
      startTime: event.startTime,
      difficulty: DIFFICULTY_LABEL[titleDifficulty(event.title ?? "")],
      signups: signupCount(event),
      leader: event.leaderName?.trim() || "(unknown)",
      title: event.title?.trim() || "(untitled)",
    };
  });

  if (limit <= 0) return rows;
  return rows.slice(0, limit);
}

export function formatCalendar(rows: CalendarRow[]): string {
  if (rows.length === 0) return "No events found.";

  return table(
    [
      [
        chalk.cyan("Day"),
        chalk.cyan("Date (UTC)"),
        chalk.cyan("Time"),
        chalk.cyan("Difficulty"),
        chalk.cyan("Signups"),
        chalk.cyan("Leader"),
        chalk.cyan("Title"),
      ],
      ...rows.map((row) => [
        row.weekday,
        row.date,
        row.time,
        row.difficulty,
        String(row.signups),
        row.leader,
        row.title,
      ]),
    ],
    {
      border: getBorderCharacters(isUnicodeSupported() ? "norc" : "ramac"),
      columns: {
        4: { alignment: "right" },
      },
      drawHorizontalLine: (index, count) => index === 0 || index === 1 || index === count,
    },
  );
}
