import chalk from "chalk";
import isUnicodeSupported from "is-unicode-supported";
import { getBorderCharacters, table } from "table";
import { listCachedEvents } from "../../cache/events.ts";
import { uniqueCharacters } from "../../helpers/characters.ts";
import type { EventFilters } from "../../types/events.ts";
import type { AltRow, LeaderboardOptions } from "../../types/reports.ts";

function formatCharacterList(names: string[], max = 4): string {
  const characters = uniqueCharacters(names).map((character) =>
    character.realm ? `${character.name}-${character.realm}` : character.name,
  );
  if (characters.length <= max) return characters.join(", ");
  return `${characters.slice(0, max).join(", ")}, +${characters.length - max}`;
}

export async function buildAlts(filters: EventFilters = {}, options: LeaderboardOptions = {}): Promise<AltRow[]> {
  const { limit = 25, order = "desc", min, max } = options;

  const events = await listCachedEvents(filters);
  if (events.length === 0) {
    throw new Error("No events in cache for this range. Run npm run data first.");
  }
  if (!events.some((event) => (event.signUps?.length ?? 0) > 0)) {
    throw new Error("No signup data in cache for this range. Re-run npm run data without --no-signups.");
  }

  const byUser = new Map<
    string,
    {
      userId: string;
      name: string;
      names: Set<string>;
      eventIds: Set<string>;
    }
  >();

  for (const event of events) {
    for (const signup of event.signUps ?? []) {
      if (!signup.userId || !signup.name) continue;

      let user = byUser.get(signup.userId);
      if (!user) {
        user = {
          userId: signup.userId,
          name: signup.name,
          names: new Set(),
          eventIds: new Set(),
        };
        byUser.set(signup.userId, user);
      }

      user.name = signup.name;
      user.names.add(signup.name);
      user.eventIds.add(event.id);
    }
  }

  let rows = [...byUser.values()].map((user) => {
    const characters = uniqueCharacters(user.names);
    return {
      userId: user.userId,
      name: user.name,
      alts: characters.length,
      events: user.eventIds.size,
      characters: formatCharacterList([...user.names]),
    };
  });

  if (min != null) rows = rows.filter((row) => row.alts >= min);
  if (max != null) rows = rows.filter((row) => row.alts <= max);

  rows.sort((a, b) => {
    const byAlts = order === "asc" ? a.alts - b.alts : b.alts - a.alts;
    return byAlts || b.events - a.events || a.name.localeCompare(b.name);
  });

  const ranked = rows.map((row, index) => ({
    rank: index + 1,
    userId: row.userId,
    name: row.name,
    alts: row.alts,
    events: row.events,
    characters: row.characters,
  }));

  if (limit <= 0) return ranked;
  return ranked.slice(0, limit);
}

export function formatAlts(rows: AltRow[]): string {
  if (rows.length === 0) return "No alts found.";

  return table(
    [
      [chalk.cyan("#"), chalk.cyan("Name"), chalk.cyan("Alts"), chalk.cyan("Events"), chalk.cyan("Characters")],
      ...rows.map((row) => [String(row.rank), row.name, String(row.alts), String(row.events), row.characters]),
    ],
    {
      border: getBorderCharacters(isUnicodeSupported() ? "norc" : "ramac"),
      columns: {
        0: { alignment: "right" },
        2: { alignment: "right" },
        3: { alignment: "right" },
      },
      drawHorizontalLine: (index, count) => index === 0 || index === 1 || index === count,
    },
  );
}
