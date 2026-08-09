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

Scalar stats for events in range.

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

Leaderboard by events led.

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

Leaderboard by distinct events signed.

| Argument              | Default | Description                                  |
| --------------------- | ------- | -------------------------------------------- |
| `--from <date\|unix>` | open    | Earliest event start                         |
| `--to <date\|unix>`   | open    | Latest event start                           |
| `--order <asc\|desc>` | `desc`  | Sort by event count                          |
| `--min <n>`           | open    | Minimum event count (inclusive)              |
| `--max <n>`           | open    | Maximum event count (inclusive)              |
| `--exclude <list>`    | none    | Ignore signup classNames (`absence,bench,…`) |
| `--limit <n>`         | `25`    | Max rows (`0` = all)                         |
| `--json`              | off     | Print JSON                                   |

```bash
npm run report -- raiders
npm run report -- raiders --exclude absence,bench,tentative
npm run report -- raiders --from 2026-01-01 --to 2026-12-31
npm run report -- raiders --order asc --min 1 --max 5
npm run report -- raiders --limit 0 --json
```

### `roles`

Signup role buttons (`className`: melee, tank, absence, …).

| Argument              | Default | Description          |
| --------------------- | ------- | -------------------- |
| `--from <date\|unix>` | open    | Earliest event start |
| `--to <date\|unix>`   | open    | Latest event start   |
| `--order <asc\|desc>` | `desc`  | Sort by signup count |
| `--min <n>`           | open    | Minimum signup count |
| `--max <n>`           | open    | Maximum signup count |
| `--limit <n>`         | `25`    | Max rows (`0` = all) |
| `--json`              | off     | Print JSON           |

```bash
npm run report -- roles
npm run report -- roles --limit 0
```

### `specs`

Signup specs from Raid-Helper emote names, normalized (e.g. `Frost1` → Frost (Death Knight)).

| Argument              | Default | Description                                  |
| --------------------- | ------- | -------------------------------------------- |
| `--from <date\|unix>` | open    | Earliest event start                         |
| `--to <date\|unix>`   | open    | Latest event start                           |
| `--order <asc\|desc>` | `desc`  | Sort by signup count                         |
| `--min <n>`           | open    | Minimum signup count                         |
| `--max <n>`           | open    | Maximum signup count                         |
| `--exclude <list>`    | none    | Ignore signup classNames (`absence,bench,…`) |
| `--limit <n>`         | `25`    | Max rows (`0` = all)                         |
| `--json`              | off     | Print JSON                                   |

```bash
npm run report -- specs
npm run report -- specs --exclude absence,bench,tentative
```

### `classes`

WoW classes resolved from class buttons or mapped from specs.

| Argument              | Default | Description                                  |
| --------------------- | ------- | -------------------------------------------- |
| `--from <date\|unix>` | open    | Earliest event start                         |
| `--to <date\|unix>`   | open    | Latest event start                           |
| `--order <asc\|desc>` | `desc`  | Sort by signup count                         |
| `--min <n>`           | open    | Minimum signup count                         |
| `--max <n>`           | open    | Maximum signup count                         |
| `--exclude <list>`    | none    | Ignore signup classNames (`absence,bench,…`) |
| `--limit <n>`         | `25`    | Max rows (`0` = all)                         |
| `--json`              | off     | Print JSON                                   |

```bash
npm run report -- classes
npm run report -- classes --exclude absence,bench,tentative
```

### `streaks`

Longest consecutive weeks with at least one signup (UTC weeks starting Monday).

| Argument              | Default | Description                                  |
| --------------------- | ------- | -------------------------------------------- |
| `--from <date\|unix>` | open    | Earliest event start                         |
| `--to <date\|unix>`   | open    | Latest event start                           |
| `--order <asc\|desc>` | `desc`  | Sort by streak length                        |
| `--min <n>`           | open    | Minimum streak weeks                         |
| `--max <n>`           | open    | Maximum streak weeks                         |
| `--exclude <list>`    | none    | Ignore signup classNames (`absence,bench,…`) |
| `--limit <n>`         | `25`    | Max rows (`0` = all)                         |
| `--json`              | off     | Print JSON                                   |

```bash
npm run report -- streaks
npm run report -- streaks --exclude absence,bench,tentative --min 4
```

### `alts`

Discord users ranked by distinct characters parsed from signup names.

| Argument              | Default | Description                 |
| --------------------- | ------- | --------------------------- |
| `--from <date\|unix>` | open    | Earliest event start        |
| `--to <date\|unix>`   | open    | Latest event start          |
| `--order <asc\|desc>` | `desc`  | Sort by alt count           |
| `--min <n>`           | open    | Minimum distinct characters |
| `--max <n>`           | open    | Maximum distinct characters |
| `--limit <n>`         | `25`    | Max rows (`0` = all)        |
| `--json`              | off     | Print JSON                  |

```bash
npm run report -- alts
npm run report -- alts --min 2
```

### `difficulties`

Events grouped by title keyword: mythic, heroic, normal, other.

| Argument              | Default | Description          |
| --------------------- | ------- | -------------------- |
| `--from <date\|unix>` | open    | Earliest event start |
| `--to <date\|unix>`   | open    | Latest event start   |
| `--order <asc\|desc>` | `desc`  | Sort by event count  |
| `--min <n>`           | open    | Minimum event count  |
| `--max <n>`           | open    | Maximum event count  |
| `--limit <n>`         | `25`    | Max rows (`0` = all) |
| `--json`              | off     | Print JSON           |

```bash
npm run report -- difficulties
npm run report -- difficulties --from 2026-01-01
```

## Development

```bash
npm run typecheck
npm run format
```
