import type { RaidEvent } from "../types/events.ts";
import type { Raider } from "../types/people.ts";
import { uniqueCharacters } from "./characters.ts";

export function groupRaiders(events: Iterable<RaidEvent>): Raider[] {
  const byId = new Map<
    string,
    {
      userId: string;
      name: string;
      names: Set<string>;
      signups: number;
      eventIds: Set<string>;
    }
  >();

  for (const event of events) {
    for (const signup of event.signUps ?? []) {
      if (!signup.userId) continue;

      let raider = byId.get(signup.userId);
      if (!raider) {
        raider = {
          userId: signup.userId,
          name: signup.name,
          names: new Set(),
          signups: 0,
          eventIds: new Set(),
        };
        byId.set(signup.userId, raider);
      }

      raider.signups += 1;
      raider.eventIds.add(event.id);
      if (signup.name) {
        raider.name = signup.name;
        raider.names.add(signup.name);
      }
    }
  }

  return [...byId.values()]
    .map((raider) => ({
      userId: raider.userId,
      name: raider.name,
      names: [...raider.names].sort((a, b) => a.localeCompare(b)),
      signups: raider.signups,
      events: raider.eventIds.size,
      characters: uniqueCharacters(raider.names),
    }))
    .sort((a, b) => b.events - a.events || b.signups - a.signups || a.name.localeCompare(b.name));
}
