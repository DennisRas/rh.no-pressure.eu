import { listCachedEvents } from "../../cache/events.ts";
import { signupCount } from "../../helpers/events.ts";
import { groupLeaders } from "../../helpers/leaders.ts";
import { maxEntry, median, round } from "../../helpers/math.ts";
import { groupRaiders } from "../../helpers/raiders.ts";
import { toIsoDate } from "../../helpers/time.ts";
import type { EventFilters } from "../../types/events.ts";
import type { SummaryStats } from "../../types/reports.ts";

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function minEntry<K>(counts: Map<K, number>): { key: K; count: number } | null {
  let best: { key: K; count: number } | null = null;
  for (const [key, count] of counts) {
    if (!best || count < best.count) best = { key, count };
  }
  return best;
}

function titleBucket(title: string): "mythic" | "heroic" | "normal" | null {
  const t = title.toLowerCase();
  if (t.includes("mythic")) return "mythic";
  if (t.includes("heroic")) return "heroic";
  if (t.includes("normal")) return "normal";
  return null;
}

export async function buildSummary(filters: EventFilters = {}): Promise<SummaryStats> {
  const events = await listCachedEvents(filters);
  if (events.length === 0) {
    throw new Error("No events in cache for this range. Run npm run data first.");
  }

  const first = events[0]!;
  const last = events[events.length - 1]!;
  const daysCovered = Math.max(1, Math.ceil((last.startTime - first.startTime) / 86400) + 1);
  const weeksCovered = daysCovered / 7;
  const monthsCovered = daysCovered / 30.4375;
  const now = Math.floor(Date.now() / 1000);
  const thirtyDaysAgo = now - 30 * 86400;

  const yearCounts = new Map<number, number>();
  const monthCounts = new Map<string, number>();
  const dayCounts = new Map<string, number>();
  const weekdayCounts = new Map<number, number>();
  const hourCounts = new Map<number, number>();
  const signupCounts: number[] = [];

  let weekendEvents = 0;
  let weekdayEvents = 0;
  let emptyEvents = 0;
  let absenceSignups = 0;
  let benchSignups = 0;
  let tentativeSignups = 0;
  let titleMythic = 0;
  let titleHeroic = 0;
  let titleNormal = 0;
  let durationTotal = 0;
  let eventsWithDuration = 0;
  let longestEventMinutes = 0;
  let longestEventTitle = "";
  let shortestEventMinutes = Number.POSITIVE_INFINITY;
  let shortestEventTitle = "";
  let eventsLast30Days = 0;
  let longestGapDays = 0;

  for (let i = 0; i < events.length; i += 1) {
    const event = events[i]!;
    const date = new Date(event.startTime * 1000);
    const year = date.getUTCFullYear();
    const month = `${year}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
    const day = toIsoDate(event.startTime);
    const weekday = date.getUTCDay();

    yearCounts.set(year, (yearCounts.get(year) ?? 0) + 1);
    monthCounts.set(month, (monthCounts.get(month) ?? 0) + 1);
    dayCounts.set(day, (dayCounts.get(day) ?? 0) + 1);
    weekdayCounts.set(weekday, (weekdayCounts.get(weekday) ?? 0) + 1);
    hourCounts.set(date.getUTCHours(), (hourCounts.get(date.getUTCHours()) ?? 0) + 1);

    if (weekday === 0 || weekday === 6) weekendEvents += 1;
    else weekdayEvents += 1;

    if (event.startTime >= thirtyDaysAgo) eventsLast30Days += 1;

    const count = signupCount(event);
    signupCounts.push(count);
    if (count === 0) emptyEvents += 1;

    for (const signup of event.signUps ?? []) {
      const role = signup.className?.toLowerCase() ?? "";
      if (role === "absence") absenceSignups += 1;
      else if (role === "bench") benchSignups += 1;
      else if (role === "tentative") tentativeSignups += 1;
    }

    const bucket = titleBucket(event.title ?? "");
    if (bucket === "mythic") titleMythic += 1;
    else if (bucket === "heroic") titleHeroic += 1;
    else if (bucket === "normal") titleNormal += 1;

    if (event.endTime != null && event.endTime > event.startTime) {
      const minutes = (event.endTime - event.startTime) / 60;
      durationTotal += minutes;
      eventsWithDuration += 1;
      if (minutes > longestEventMinutes) {
        longestEventMinutes = minutes;
        longestEventTitle = event.title;
      }
      if (minutes < shortestEventMinutes) {
        shortestEventMinutes = minutes;
        shortestEventTitle = event.title;
      }
    }

    if (i > 0) {
      const prev = events[i - 1]!;
      const gapDays = (event.startTime - prev.startTime) / 86400;
      if (gapDays > longestGapDays) longestGapDays = gapDays;
    }
  }

  const leaders = groupLeaders(events);
  const raiders = groupRaiders(events);
  const topLeader = leaders[0];
  const topRaider = raiders[0];

  const busiestYear = maxEntry(yearCounts);
  const quietestYear = minEntry(yearCounts);
  const busiestMonth = maxEntry(monthCounts);
  const busiestDay = maxEntry(dayCounts);
  const busiestWeekday = maxEntry(weekdayCounts);
  const busiestHour = maxEntry(hourCounts);
  const totalSignups = signupCounts.reduce((a, b) => a + b, 0);

  return {
    events: events.length,
    firstEvent: toIsoDate(first.startTime),
    lastEvent: toIsoDate(last.startTime),
    daysCovered,
    weeksCovered: round(weeksCovered),
    activeYears: yearCounts.size,
    avgEventsPerWeek: round(events.length / weeksCovered),
    avgEventsPerMonth: round(events.length / Math.max(monthsCovered, 1 / 30.4375)),
    busiestYear: String(busiestYear?.key ?? ""),
    busiestYearEvents: busiestYear?.count ?? 0,
    quietestYear: String(quietestYear?.key ?? ""),
    quietestYearEvents: quietestYear?.count ?? 0,
    busiestMonth: busiestMonth?.key ?? "",
    busiestMonthEvents: busiestMonth?.count ?? 0,
    busiestDay: busiestDay?.key ?? "",
    busiestDayEvents: busiestDay?.count ?? 0,
    longestGapDays: round(longestGapDays, 0),
    weekendEvents,
    weekdayEvents,
    weekendEventPercent: round((weekendEvents / events.length) * 100),
    uniqueLeaders: leaders.length,
    uniqueRaiders: raiders.length,
    avgEventsPerLeader: leaders.length > 0 ? round(events.length / leaders.length) : 0,
    avgSignupsPerRaider: raiders.length > 0 ? round(totalSignups / raiders.length) : 0,
    topLeader: topLeader?.name ?? "",
    topLeaderEvents: topLeader?.events ?? 0,
    topRaider: topRaider?.name ?? "",
    topRaiderEvents: topRaider?.events ?? 0,
    oneTimeLeaders: leaders.filter((leader) => leader.events === 1).length,
    oneTimeRaiders: raiders.filter((raider) => raider.events === 1).length,
    totalSignups,
    avgSignupsPerEvent: round(totalSignups / signupCounts.length),
    medianSignupsPerEvent: round(median(signupCounts)),
    maxSignupsOnEvent: signupCounts.length > 0 ? Math.max(...signupCounts) : 0,
    minSignupsOnEvent: signupCounts.length > 0 ? Math.min(...signupCounts) : 0,
    emptyEvents,
    absenceSignups,
    benchSignups,
    tentativeSignups,
    titleMythic,
    titleHeroic,
    titleNormal,
    busiestWeekday: busiestWeekday ? WEEKDAYS[busiestWeekday.key]! : "",
    busiestWeekdayEvents: busiestWeekday?.count ?? 0,
    busiestHourUtc: busiestHour != null ? `${String(busiestHour.key).padStart(2, "0")}:00` : "",
    busiestHourEvents: busiestHour?.count ?? 0,
    avgDurationMinutes: eventsWithDuration > 0 ? round(durationTotal / eventsWithDuration, 0) : 0,
    eventsWithDuration,
    longestEventMinutes: round(longestEventMinutes, 0),
    longestEventTitle,
    shortestEventMinutes: Number.isFinite(shortestEventMinutes) ? round(shortestEventMinutes, 0) : 0,
    shortestEventTitle,
    eventsLast30Days,
  };
}

export function formatSummary(stats: SummaryStats): string {
  const lines = [
    ["Events", stats.events],
    ["Events in last 30 days", stats.eventsLast30Days],
    ["First event", stats.firstEvent],
    ["Last event", stats.lastEvent],
    ["Days covered", `${stats.daysCovered} (first event to last)`],
    ["Weeks covered", stats.weeksCovered],
    ["Active years", stats.activeYears],
    ["Avg events / week", stats.avgEventsPerWeek],
    ["Avg events / month", stats.avgEventsPerMonth],
    ["Busiest year", `${stats.busiestYear} (${stats.busiestYearEvents} events)`],
    ["Quietest year", `${stats.quietestYear} (${stats.quietestYearEvents} events)`],
    ["Busiest month", `${stats.busiestMonth} (${stats.busiestMonthEvents} events)`],
    ["Busiest day", `${stats.busiestDay} (${stats.busiestDayEvents} events)`],
    ["Longest gap between events", `${stats.longestGapDays} days`],
    ["Weekend events", `${stats.weekendEvents} (${stats.weekendEventPercent}%)`],
    ["Weekday events", stats.weekdayEvents],
    ["Unique leaders", stats.uniqueLeaders],
    ["Unique raiders", stats.uniqueRaiders],
    ["Top leader", `${stats.topLeader} (${stats.topLeaderEvents} events)`],
    ["Top raider", `${stats.topRaider} (${stats.topRaiderEvents} events)`],
    ["One-time leaders", stats.oneTimeLeaders],
    ["One-time raiders", stats.oneTimeRaiders],
    ["Avg events / leader", stats.avgEventsPerLeader],
    ["Avg signups / raider", stats.avgSignupsPerRaider],
    ["Total signups", stats.totalSignups],
    ["Avg signups / event", stats.avgSignupsPerEvent],
    ["Median signups / event", stats.medianSignupsPerEvent],
    ["Most signups on one event", stats.maxSignupsOnEvent],
    ["Fewest signups on one event", stats.minSignupsOnEvent],
    ["Events with no signups", stats.emptyEvents],
    ["Absence signups", stats.absenceSignups],
    ["Bench signups", stats.benchSignups],
    ["Tentative signups", stats.tentativeSignups],
    ['Titles with "mythic"', stats.titleMythic],
    ['Titles with "heroic"', stats.titleHeroic],
    ['Titles with "normal"', stats.titleNormal],
    ["Busiest weekday (UTC)", `${stats.busiestWeekday} (${stats.busiestWeekdayEvents} events)`],
    ["Busiest hour (UTC)", `${stats.busiestHourUtc} (${stats.busiestHourEvents} events)`],
    ["Avg duration (minutes)", stats.avgDurationMinutes],
    ["Events with duration set", stats.eventsWithDuration],
    ["Longest event", `${stats.longestEventMinutes} min - ${stats.longestEventTitle}`],
    ["Shortest event", `${stats.shortestEventMinutes} min - ${stats.shortestEventTitle}`],
  ] as const;

  const width = Math.max(...lines.map(([label]) => label.length));
  return lines.map(([label, value]) => `${label.padEnd(width)}  ${value}`).join("\n");
}
