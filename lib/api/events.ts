import type { EventsPage, EventsQuery, RaidEvent, ScheduledEvent, ScheduledEventsResponse } from "../types/events.ts";
import { credentials, request, type RequestOptions } from "./client.ts";

export type GetEventsOptions = Pick<RequestOptions, "onRateLimited"> & {
  onPage?: (info: { page: number; pages: number; fetched: number }) => void;
};

function eventListHeaders(query: EventsQuery & { page?: number }): Record<string, string> {
  const headers: Record<string, string> = {};

  if (query.page != null) headers.Page = String(query.page);
  if (query.includeSignUps != null) {
    headers.IncludeSignUps = String(query.includeSignUps);
  }
  if (query.channelFilter) headers.ChannelFilter = query.channelFilter;
  if (query.startTime != null) headers.StartTimeFilter = String(query.startTime);
  if (query.endTime != null) headers.EndTimeFilter = String(query.endTime);

  return headers;
}

export async function getEvents(query: EventsQuery = {}, options: GetEventsOptions = {}): Promise<RaidEvent[]> {
  const { serverId } = credentials();
  const postedEvents: RaidEvent[] = [];
  let page = 1;
  let pages = 1;

  do {
    const data = await request<EventsPage>(`/servers/${serverId}/events`, {
      headers: eventListHeaders({ ...query, page }),
      onRateLimited: options.onRateLimited,
    });
    postedEvents.push(...(data.postedEvents ?? []));
    pages = data.pages ?? 1;
    options.onPage?.({
      page: data.currentPage ?? page,
      pages,
      fetched: postedEvents.length,
    });
    page += 1;
  } while (page <= pages);

  return postedEvents;
}

export async function getScheduledEvents(
  query: EventsQuery = {},
  options: GetEventsOptions = {},
): Promise<ScheduledEvent[]> {
  const { serverId } = credentials();
  const data = await request<ScheduledEventsResponse>(`/servers/${serverId}/scheduledevents`, {
    headers: eventListHeaders(query),
    onRateLimited: options.onRateLimited,
  });
  return data.scheduledEvents ?? [];
}

export async function getEvent(eventId: string, options: GetEventsOptions = {}): Promise<RaidEvent> {
  if (!eventId) throw new Error("eventId is required");
  return request<RaidEvent>(`/events/${eventId}`, {
    auth: false,
    onRateLimited: options.onRateLimited,
  });
}
