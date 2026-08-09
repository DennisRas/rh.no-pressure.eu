![No Pressure EU](https://www.no-pressure.eu/images/no-pressure-logo-text.png)

Scripts for working with [Raid-Helper](https://raid-helper.xyz) data for the [No Pressure - EU](https://no-pressure.eu) Discord community.

Fetch events into a local cache, then run reports against that cache. Dates accept ISO (`2026-01-01`) or unix seconds. Use `-h` on any command for the same reference in the terminal.

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

## `npm run data`

Fetch posted events into `data/events.json`. Exactly one scope is required.

```text
npm run data -- <scope> [options]
```

| Argument              | Default | Description                                                  |
| --------------------- | ------- | ------------------------------------------------------------ |
| `--all`               | —       | Scope: all posted events (slow; API is rate-limited)         |
| `--since-last`        | —       | Scope: from the newest event start time already in the cache |
| `--from <date\|unix>` | —       | Scope: from a given start time                               |
| `--to <date\|unix>`   | open    | End of the window (only with `--from` or `--since-last`)     |
| `--no-signups`        | off     | Skip signup lists (faster; signup-based report stats suffer) |

```bash
npm run data -- --all
npm run data -- --since-last
npm run data -- --from 2026-01-01
npm run data -- --from 2026-08-01 --to 2026-08-31
```

## Reports

Reports read the cache only. Populate it with `npm run data` first.

```text
npm run report -- <name> [options]
```

### `summary`

Overall scalar stats for events in range (counts, averages, busiest periods, top leader/raider, title difficulty tags, and similar).

| Argument              | Default | Description          |
| --------------------- | ------- | -------------------- |
| `--from <date\|unix>` | open    | Earliest event start |
| `--to <date\|unix>`   | open    | Latest event start   |
| `--json`              | off     | Print JSON           |

```bash
npm run report -- summary
npm run report -- summary --from 2026-01-01 --to 2026-12-31
npm run report -- summary --json
```

### `leaders`

Raid leader leaderboard by event count. Filters apply before sort and limit; ranks are recomputed on the result.

| Argument              | Default | Description                     |
| --------------------- | ------- | ------------------------------- |
| `--from <date\|unix>` | open    | Earliest event start            |
| `--to <date\|unix>`   | open    | Latest event start              |
| `--order <asc\|desc>` | `desc`  | Sort by event count             |
| `--min <n>`           | open    | Minimum event count (inclusive) |
| `--max <n>`           | open    | Maximum event count (inclusive) |
| `--limit <n>`         | `25`    | Max rows (`0` = all)            |
| `--json`              | off     | Print JSON                      |

```bash
npm run report -- leaders
npm run report -- leaders --from 2026-01-01 --to 2026-12-31
npm run report -- leaders --order asc --min 1 --max 5
npm run report -- leaders --limit 0 --json
```

### `raiders`

Raider leaderboard by distinct events signed. Needs signup data in the cache. Same filter/order/limit behavior as `leaders`. Use `--exclude` to ignore signup `className` values (Raid-Helper roles like `absence`, `bench`, `tentative`, `melee`, `tank`, …).

| Argument              | Default | Description                            |
| --------------------- | ------- | -------------------------------------- |
| `--from <date\|unix>` | open    | Earliest event start                   |
| `--to <date\|unix>`   | open    | Latest event start                     |
| `--order <asc\|desc>` | `desc`  | Sort by distinct event count           |
| `--min <n>`           | open    | Minimum event count (inclusive)        |
| `--max <n>`           | open    | Maximum event count (inclusive)        |
| `--exclude <list>`    | none    | Comma-separated `className`s to ignore |
| `--limit <n>`         | `25`    | Max rows (`0` = all)                   |
| `--json`              | off     | Print JSON                             |

```bash
npm run report -- raiders
npm run report -- raiders --exclude absence,bench,tentative
npm run report -- raiders --from 2026-01-01 --to 2026-12-31
npm run report -- raiders --order asc --min 1 --max 5
npm run report -- raiders --limit 0 --json
```

## Development

```bash
npm run typecheck
npm run format
```
