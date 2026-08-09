![No Pressure EU](https://www.no-pressure.eu/images/no-pressure-logo-text.png)

Scripts for working with [Raid-Helper](https://raid-helper.xyz) data for the [No Pressure - EU](https://no-pressure.eu) Discord community.

## Setup

Node 20+:

```bash
npm install
cp .env.example .env
```

| Variable                | Source                                          |
| ----------------------- | ----------------------------------------------- |
| `RAID_HELPER_API_KEY`   | Discord `/apikey` (Admin or Manage Server)      |
| `RAID_HELPER_SERVER_ID` | Discord server id (right click the server icon) |

Do not commit `.env` or `data/`.

## Data

Fetch posted events into the local cache (`data/events.json`). A scope is required.

```bash
npm run data -- --all
npm run data -- --since-last
npm run data -- --from 2026-01-01
npm run data -- --from 2026-08-01 --to 2026-08-31
```

| Scope                 | Meaning                                                      |
| --------------------- | ------------------------------------------------------------ |
| `--all`               | All posted events                                            |
| `--since-last`        | From the newest event start time already in the cache        |
| `--from <date\|unix>` | From a given start time                                      |
| `--to <date\|unix>`   | Optional end of the window (with `--from` or `--since-last`) |
| `--no-signups`        | Skip signup lists                                            |

## Reports

Reports read from the cache only. Shared flags: `--from`, `--to`, `--json`. Leaderboards also take `--limit`, `--order`, `--min`, `--max`.

```bash
npm run report -- <name>
npm run report -- <name> --from 2024-01-01 --to 2024-12-31
npm run report -- leaders --order asc --min 1 --max 5
npm run report -- <name> --json
```

| Report    | Description                           |
| --------- | ------------------------------------- |
| `summary` | Overall scalar stats                  |
| `leaders` | Raid leader leaderboard (event count) |

## Development

```bash
npm run typecheck
npm run format
```

## Layout

```text
api/           Raid-Helper client
cache/         Local JSON cache
types/         Shared TypeScript types
helpers/       Shared helpers
scripts/       CLI entrypoints and report modules
data/          Local cache (gitignored)
```
