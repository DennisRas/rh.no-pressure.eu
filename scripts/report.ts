import type { EventFilters } from "../types/events.ts";
import { buildSummary, formatSummary } from "./reports/summary.ts";
import { toUnix } from "../helpers/time.ts";

const REPORTS = ["summary"] as const;
type ReportName = (typeof REPORTS)[number];

function printHelp() {
  console.log(`Usage: npm run report -- <name> [options]

Reports (cache only):
  summary

Options:
  --from <date|unix>   Earliest event start
  --to <date|unix>     Latest event start
  --json               Print JSON
  -h, --help           Help

Examples:
  npm run report -- summary
  npm run report -- summary --from 2024-01-01
  npm run report -- summary --from 2024-01-01 --to 2024-12-31 --json
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

  return { name: name as ReportName, from, to, json };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const filters: EventFilters = {};
  if (args.from != null) filters.startTime = args.from;
  if (args.to != null) filters.endTime = args.to;

  if (args.name === "summary") {
    const stats = await buildSummary(filters);
    if (args.json) {
      console.log(JSON.stringify(stats, null, 2));
    } else {
      console.log(formatSummary(stats));
    }
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
