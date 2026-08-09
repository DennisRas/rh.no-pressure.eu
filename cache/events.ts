import type { EventFilters, EventsCache, RaidEvent } from "../types/events.ts";
import { readCache, writeCache } from "./store.ts";

export function eventId(event: Pick<RaidEvent, "id">): string {
  if (event.id == null) {
    throw new Error("Event is missing an id");
  }
  return String(event.id);
}

export async function readEventsCache(): Promise<EventsCache> {
  return readCache<EventsCache>("events.json", { updatedAt: null, events: {} });
}

export async function writeEventsCache(events: Iterable<RaidEvent>): Promise<EventsCache> {
  const byId: Record<string, RaidEvent> = {};
  for (const event of events) {
    byId[eventId(event)] = event;
  }

  const payload: EventsCache = {
    updatedAt: new Date().toISOString(),
    events: byId,
  };

  await writeCache("events.json", payload);
  return payload;
}

export async function upsertEvents(events: Iterable<RaidEvent>) {
  const cache = await readEventsCache();
  let upserted = 0;

  for (const event of events) {
    cache.events[eventId(event)] = event;
    upserted += 1;
  }

  cache.updatedAt = new Date().toISOString();
  await writeCache("events.json", cache);

  return { upserted, total: Object.keys(cache.events).length, cache };
}

export async function listCachedEvents(filters: EventFilters = {}): Promise<RaidEvent[]> {
  const { events } = await readEventsCache();
  let list = Object.values(events);

  if (filters.startTime != null) {
    const startTime = filters.startTime;
    list = list.filter((event) => event.startTime >= startTime);
  }
  if (filters.endTime != null) {
    const endTime = filters.endTime;
    list = list.filter((event) => event.startTime <= endTime);
  }
  if (filters.channelId) {
    const channelId = String(filters.channelId);
    list = list.filter((event) => String(event.channelId) === channelId);
  }

  list.sort((a, b) => a.startTime - b.startTime);
  return list;
}

export async function latestCachedEventStartTime(): Promise<number | null> {
  const { events } = await readEventsCache();
  let latest: number | null = null;

  for (const event of Object.values(events)) {
    if (latest == null || event.startTime > latest) {
      latest = event.startTime;
    }
  }

  return latest;
}
