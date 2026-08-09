import type { AttendanceQuery, AttendanceResponse } from "../types/attendance.ts";
import { credentials, request, type RequestOptions } from "./client.ts";

function headerList(value: string | string[]): string {
  return Array.isArray(value) ? value.join(",") : value;
}

export async function getAttendance(
  query: AttendanceQuery = {},
  options: Pick<RequestOptions, "onRateLimited"> = {},
): Promise<AttendanceResponse> {
  const { serverId } = credentials();
  const headers: Record<string, string> = {};

  if (query.tagFilter != null) headers.TagFilter = headerList(query.tagFilter);
  if (query.channelFilter != null) headers.ChannelFilter = headerList(query.channelFilter);
  if (query.timeFilterStart != null) {
    headers.TimeFilterStart = String(query.timeFilterStart);
  }
  if (query.timeFilterEnd != null) {
    headers.TimeFilterEnd = String(query.timeFilterEnd);
  }

  return request<AttendanceResponse>(`/servers/${serverId}/attendance`, {
    headers,
    onRateLimited: options.onRateLimited,
  });
}
