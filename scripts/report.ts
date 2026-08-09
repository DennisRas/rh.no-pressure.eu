import { toIsoDate, toUnix } from "../helpers/time.ts";
import type { EventFilters } from "../types/events.ts";
import { buildLeaders, formatLeaders } from "./reports/leaders.ts";
import { buildSummary, formatSummary } from "./reports/summary.ts";

const REPORTS = ["summary", "leaders"] as const;
type ReportName = (typeof REPORTS)[number];

type ReportArgs = {
  name: ReportName;
  from?: number;
  to?: number;
  limit: number;
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

  if (args.name === "leaders") {
    lines.push(`Limit:  ${args.limit <= 0 ? "all" : args.limit}`);
  }

  return `${lines.join("\n")}\n`;
}

function printHelp() {
  console.log(`Usage: npm run report -- <name> [options]

Reports (cache only):
  summary
  leaders

Options:
  --from <date|unix>   Earliest event start
  --to <date|unix>     Latest event start
  --limit <n>          Max rows for leaderboards (default 25, 0 = all)
  --json               Print JSON
  -h, --help           Help

Examples:
  npm run report -- summary
  npm run report -- leaders
  npm run report -- leaders --from 2024-01-01 --to 2024-12-31
  npm run report -- leaders --limit 50 --json
`);
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
  let limit = 25;
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
      limit = Number(next);
      if (!Number.isFinite(limit) || limit < 0) {
        throw new Error("--limit must be a number >= 0");
      }
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

  return { name: name as ReportName, from, to, limit, json } satisfies ReportArgs;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
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

  if (args.name === "leaders") {
    const rows = await buildLeaders(filters, args.limit);
    if (args.json) {
      console.log(JSON.stringify(rows, null, 2));
    } else {
      console.log(formatLeaders(rows));
    }
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
