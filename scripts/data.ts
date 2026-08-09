import { getEvents } from "../api/events.ts";
import { latestCachedEventStartTime, upsertEvents } from "../cache/events.ts";
import type { EventsQuery } from "../types/events.ts";
import { toUnix } from "../helpers/time.ts";

function printHelp() {
  console.log(`Usage: npm run data -- <scope> [options]

Fetch posted events into data/events.json.

Scope (pick one):
  --all                All posted events
  --since-last         From the newest startTime in the cache
  --from <date|unix>   From this start time

Options:
  --to <date|unix>     End of the window (with --from or --since-last)
  --no-signups         Skip sign-up lists
  -h, --help           Help

Examples:
  npm run data -- --all
  npm run data -- --since-last
  npm run data -- --from 2026-01-01
  npm run data -- --from 2026-08-01 --to 2026-08-31
`);
}

type Scope = { kind: "all" } | { kind: "since-last" } | { kind: "from"; from: number };

function parseArgs(argv: string[]) {
  let all = false;
  let sinceLast = false;
  let from: number | undefined;
  let to: number | undefined;
  let signups = true;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];

    if (arg === "--all") {
      all = true;
    } else if (arg === "--since-last") {
      sinceLast = true;
    } else if (arg === "--from" && next) {
      from = toUnix(next);
      i += 1;
    } else if (arg === "--to" && next) {
      to = toUnix(next);
      i += 1;
    } else if (arg === "--no-signups") {
      signups = false;
    } else if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    } else {
      console.error(`Unknown argument: ${arg}`);
      printHelp();
      process.exit(1);
    }
  }

  const scopeCount = Number(all) + Number(sinceLast) + Number(from != null);
  if (scopeCount === 0) {
    console.error("Error: pass a scope (--all, --since-last, or --from <date>).");
    printHelp();
    process.exit(1);
  }
  if (scopeCount > 1) {
    console.error("Error: use only one of --all, --since-last, or --from.");
    printHelp();
    process.exit(1);
  }
  if (to != null && all) {
    console.error("Error: --to cannot be used with --all.");
    printHelp();
    process.exit(1);
  }

  const scope: Scope = all ? { kind: "all" } : sinceLast ? { kind: "since-last" } : { kind: "from", from: from! };

  return { scope, to, signups };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const query: EventsQuery = {
    includeSignUps: args.signups,
  };

  if (args.scope.kind === "all") {
    console.log("Fetching all posted events...");
  } else if (args.scope.kind === "since-last") {
    const latest = await latestCachedEventStartTime();
    if (latest == null) {
      throw new Error("Cache is empty. Use --all or --from <date>.");
    }
    query.startTime = latest;
    if (args.to != null) query.endTime = args.to;
    console.log(
      `Fetching events since ${new Date(latest * 1000).toISOString()}` +
        (query.endTime != null ? ` until ${new Date(query.endTime * 1000).toISOString()}` : "") +
        "...",
    );
  } else {
    query.startTime = args.scope.from;
    if (args.to != null) query.endTime = args.to;
    console.log(
      `Fetching events from ${new Date(query.startTime * 1000).toISOString()}` +
        (query.endTime != null ? ` until ${new Date(query.endTime * 1000).toISOString()}` : "") +
        "...",
    );
  }

  const events = await getEvents(query, {
    onPage: ({ page, pages, fetched }) => {
      console.log(`Page ${page}/${pages} (${fetched} events)`);
    },
    onRateLimited: ({ path, waitMs }) => {
      console.warn(`Rate limited on ${path}, waiting ${Math.ceil(waitMs / 1000)}s...`);
    },
  });

  const { upserted, total } = await upsertEvents(events);
  console.log(`Upserted ${upserted} event(s). Cache has ${total} event(s).`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
