![No Pressure EU](https://www.no-pressure.eu/images/no-pressure-logo-text.png)

Scripts for working with [Raid-Helper](https://raid-helper.xyz) data for the [No Pressure - EU](https://no-pressure.eu) Discord community.

## Setup

Node 20+, then:

```bash
npm install
cp .env.example .env
```

Fill in `.env`:

| Variable                | Source                                      |
| ----------------------- | ------------------------------------------- |
| `RAID_HELPER_API_KEY`   | Discord `/apikey` (Admin or Manage Server)  |
| `RAID_HELPER_SERVER_ID` | Discord server id (Right click server icon) |

Keep `.env` and `data/` out of git.

## Commands

Fetch events into `data/events.json`. You must pass a scope:

```bash
npm run data -- --all
npm run data -- --since-last
npm run data -- --from 2026-01-01
npm run data -- --from 2026-08-01 --to 2026-08-31
```

| Command                   | What it does                      |
| ------------------------- | --------------------------------- |
| `npm run data -- <scope>` | Fetch events into the local cache |
| `npm run typecheck`       | Run `tsc --noEmit`                |
| `npm run format`          | Run Prettier                      |

## Layout

```text
lib/api/      Raid-Helper client
lib/cache/    Local JSON cache
lib/types/    Types
scripts/      CLI scripts
data/         Cache files (gitignored)
```
