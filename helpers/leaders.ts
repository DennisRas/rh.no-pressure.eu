import type { RaidEvent } from "../types/events.ts";
import type { Leader } from "../types/people.ts";
import { uniqueCharacters } from "./characters.ts";

export function groupLeaders(events: Iterable<RaidEvent>): Leader[] {
  const byId = new Map<
    string,
    {
      userId: string;
      name: string;
      names: Set<string>;
      events: number;
      signupNames: Set<string>;
    }
  >();

  for (const event of events) {
    if (!event.leaderId) continue;

    let leader = byId.get(event.leaderId);
    if (!leader) {
      leader = {
        userId: event.leaderId,
        name: event.leaderName ?? event.leaderId,
        names: new Set(),
        events: 0,
        signupNames: new Set(),
      };
      byId.set(event.leaderId, leader);
    }

    leader.events += 1;
    if (event.leaderName) {
      leader.name = event.leaderName;
      leader.names.add(event.leaderName);
    }

    for (const signup of event.signUps ?? []) {
      if (signup.userId === event.leaderId && signup.name) {
        leader.signupNames.add(signup.name);
      }
    }
  }

  return [...byId.values()]
    .map((leader) => ({
      userId: leader.userId,
      name: leader.name,
      names: [...leader.names].sort((a, b) => a.localeCompare(b)),
      events: leader.events,
      signupNames: [...leader.signupNames].sort((a, b) => a.localeCompare(b)),
      characters: uniqueCharacters(leader.signupNames),
    }))
    .sort((a, b) => b.events - a.events || a.name.localeCompare(b.name));
}
