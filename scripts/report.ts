import { toIsoDate, toUnix } from "../helpers/time.ts";
import type { EventFilters } from "../types/events.ts";
import type { LeaderboardOptions, RaidersOptions } from "../types/reports.ts";
import { buildAlts, formatAlts } from "./reports/alts.ts";
import { buildClasses, formatClasses } from "./reports/classes.ts";
import { buildDifficulties, formatDifficulties } from "./reports/difficulties.ts";
import { buildLeaders, formatLeaders } from "./reports/leaders.ts";
import { buildRaiders, formatRaiders } from "./reports/raiders.ts";
import { buildRoles, formatRoles } from "./reports/roles.ts";
import { buildSpecs, formatSpecs } from "./reports/specs.ts";
import { buildStreaks, formatStreaks } from "./reports/streaks.ts";
import { buildSummary, formatSummary } from "./reports/summary.ts";
import { buildCalendar, formatCalendar } from "./reports/calendar.ts";

const REPORTS = [
  "summary",
  "calendar",
  "leaders",
  "raiders",
  "roles",
  "specs",
  "classes",
  "streaks",
  "alts",
  "difficulties",
] as const;
type ReportName = (typeof REPORTS)[number];
const LEADERBOARDS = new Set<ReportName>([
  "leaders",
  "raiders",
  "roles",
  "specs",
  "classes",
  "streaks",
  "alts",
  "difficulties",
]);
const EXCLUDE_REPORTS = new Set<ReportName>(["raiders", "streaks", "specs", "classes"]);

type ReportArgs = {
  name: ReportName;
  from?: number;
  to?: number;
  limit: number;
  order: "asc" | "desc";
  min?: number;
  max?: number;
  exclude: string[];
  json: boolean;
};

function formatReportHeader(args: ReportArgs): string {
  const lines = [`Report: ${args.name}`];

  if (args.from != null && args.to != null) {
    lines.push(`From:   ${toIsoDate(args.from)}`);
    lines.push(`To:     ${toIsoDate(args.to)}`);
  } else if (args.from != null) {
    lines.push(`From:   ${toIsoDate(args.from)}`);
    lines.push("To:     (open)");
  } else if (args.to != null) {
    lines.push("From:   (open)");
    lines.push(`To:     ${toIsoDate(args.to)}`);
  } else {
    lines.push("Range:  all cached events");
  }

  if (LEADERBOARDS.has(args.name)) {
    lines.push(`Order:  ${args.order}`);
    if (args.min != null || args.max != null) {
      lines.push(`Min:    ${args.min ?? "(open)"}`);
      lines.push(`Max:    ${args.max ?? "(open)"}`);
    }
    if (EXCLUDE_REPORTS.has(args.name) && args.exclude.length > 0) {
      lines.push(`Exclude: ${args.exclude.join(", ")}`);
    }
    lines.push(`Limit:  ${args.limit <= 0 ? "all" : args.limit}`);
  }

  return `${lines.join("\n")}\n`;
}

function printHelp() {
  console.log(`Usage: npm run report -- <name> [options]

Reports (cache only):
  summary
  calendar
  leaders
  raiders
  roles
  specs
  classes
  streaks
  alts
  difficulties

Options:
  --from <date|unix>   Earliest event start (calendar defaults to now)
  --to <date|unix>     Latest event start
  --limit <n>          Max rows (leaderboards default 25, calendar default all)
  --order <asc|desc>   Sort order (leaderboards, default desc)
  --min <n>            Minimum primary count (leaderboards)
  --max <n>            Maximum primary count (leaderboards)
  --exclude <list>     Skip signup classNames (raiders/streaks/specs/classes)
  --json               Print JSON
  -h, --help           Help

Examples:
  npm run report -- summary
  npm run report -- calendar
  npm run report -- calendar --from 2026-08-01 --to 2026-08-31
  npm run report -- specs --exclude absence,bench,tentative
  npm run report -- alts --min 2
`);
}

function parseNonNegInt(flag: string, value: string): number {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 0) {
    throw new Error(`${flag} must be an integer >= 0`);
  }
  return n;
}

function parseExcludeList(value: string): string[] {
  const items = value
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  if (items.length === 0) {
    throw new Error("--exclude needs at least one className");
  }
  return [...new Set(items)];
}

function parseArgs(argv: string[]) {
  const name = argv[0];
  if (!name || name === "--help" || name === "-h") {
    printHelp();
    process.exit(name ? 0 : 1);
  }

  if (!(REPORTS as readonly string[]).includes(name)) {
    console.error(`Unknown report: ${name}`);
    printHelp();
    process.exit(1);
  }

  let from: number | undefined;
  let to: number | undefined;
  let limit = name === "calendar" ? 0 : 25;
  let order: "asc" | "desc" = "desc";
  let min: number | undefined;
  let max: number | undefined;
  let exclude: string[] = [];
  let json = false;

  for (let i = 1; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];

    if (arg === "--from" && next) {
      from = toUnix(next);
      i += 1;
    } else if (arg === "--to" && next) {
      to = toUnix(next);
      i += 1;
    } else if (arg === "--limit" && next) {
      limit = parseNonNegInt("--limit", next);
      i += 1;
    } else if (arg === "--order" && next) {
      if (name === "calendar") {
        throw new Error("--order is not supported for calendar");
      }
      if (next !== "asc" && next !== "desc") {
        throw new Error("--order must be asc or desc");
      }
      order = next;
      i += 1;
    } else if (arg === "--min" && next) {
      if (name === "calendar") {
        throw new Error("--min is not supported for calendar");
      }
      min = parseNonNegInt("--min", next);
      i += 1;
    } else if (arg === "--max" && next) {
      if (name === "calendar") {
        throw new Error("--max is not supported for calendar");
      }
      max = parseNonNegInt("--max", next);
      i += 1;
    } else if (arg === "--exclude" && next) {
      exclude = parseExcludeList(next);
      i += 1;
    } else if (arg === "--json") {
      json = true;
    } else if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    } else {
      console.error(`Unknown argument: ${arg}`);
      printHelp();
      process.exit(1);
    }
  }

  if (min != null && max != null && min > max) {
    throw new Error("--min cannot be greater than --max");
  }
  if (exclude.length > 0 && !EXCLUDE_REPORTS.has(name as ReportName)) {
    throw new Error("--exclude is only supported for raiders, streaks, specs, and classes");
  }
  if (name === "calendar" && exclude.length > 0) {
    throw new Error("--exclude is not supported for calendar");
  }

  return { name: name as ReportName, from, to, limit, order, min, max, exclude, json } satisfies ReportArgs;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.name === "calendar" && args.from == null) {
    args.from = Math.floor(Date.now() / 1000);
  }

  const filters: EventFilters = {};
  if (args.from != null) filters.startTime = args.from;
  if (args.to != null) filters.endTime = args.to;

  if (!args.json) {
    console.log(formatReportHeader(args));
  }

  if (args.name === "summary") {
    const stats = await buildSummary(filters);
    if (args.json) {
      console.log(JSON.stringify(stats, null, 2));
    } else {
      console.log(formatSummary(stats));
    }
    return;
  }

  if (args.name === "calendar") {
    const rows = await buildCalendar(filters, { limit: args.limit });
    console.log(args.json ? JSON.stringify(rows, null, 2) : formatCalendar(rows));
    return;
  }

  const options: LeaderboardOptions = {
    limit: args.limit,
    order: args.order,
    min: args.min,
    max: args.max,
  };

  if (args.name === "leaders") {
    const rows = await buildLeaders(filters, options);
    console.log(args.json ? JSON.stringify(rows, null, 2) : formatLeaders(rows));
    return;
  }

  if (args.name === "raiders") {
    const raiderOptions: RaidersOptions = { ...options, exclude: args.exclude };
    const rows = await buildRaiders(filters, raiderOptions);
    console.log(args.json ? JSON.stringify(rows, null, 2) : formatRaiders(rows));
    return;
  }

  if (args.name === "roles") {
    const rows = await buildRoles(filters, options);
    console.log(args.json ? JSON.stringify(rows, null, 2) : formatRoles(rows));
    return;
  }

  if (args.name === "specs") {
    const specOptions: RaidersOptions = { ...options, exclude: args.exclude };
    const rows = await buildSpecs(filters, specOptions);
    console.log(args.json ? JSON.stringify(rows, null, 2) : formatSpecs(rows));
    return;
  }

  if (args.name === "classes") {
    const classOptions: RaidersOptions = { ...options, exclude: args.exclude };
    const rows = await buildClasses(filters, classOptions);
    console.log(args.json ? JSON.stringify(rows, null, 2) : formatClasses(rows));
    return;
  }

  if (args.name === "streaks") {
    const streakOptions: RaidersOptions = { ...options, exclude: args.exclude };
    const rows = await buildStreaks(filters, streakOptions);
    console.log(args.json ? JSON.stringify(rows, null, 2) : formatStreaks(rows));
    return;
  }

  if (args.name === "alts") {
    const rows = await buildAlts(filters, options);
    console.log(args.json ? JSON.stringify(rows, null, 2) : formatAlts(rows));
    return;
  }

  if (args.name === "difficulties") {
    const rows = await buildDifficulties(filters, options);
    console.log(args.json ? JSON.stringify(rows, null, 2) : formatDifficulties(rows));
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
