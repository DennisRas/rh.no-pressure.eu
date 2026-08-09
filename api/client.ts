import "dotenv/config";
import type { RequestOptions } from "../types/api.ts";

const BASE_URL = "https://raid-helper.xyz/api/v4";

// Observed limit: 2 requests / 5s (applied across this client).
const RATE_LIMIT_MAX = 2;
const RATE_LIMIT_WINDOW_MS = 5000;
const RATE_LIMIT_RETRIES = 5;

const recentRequestTimes: number[] = [];

export function credentials() {
  const apiKey = process.env.RAID_HELPER_API_KEY;
  const serverId = process.env.RAID_HELPER_SERVER_ID;

  if (!apiKey) {
    throw new Error("Missing Raid-Helper API key (RAID_HELPER_API_KEY)");
  }
  if (!serverId) {
    throw new Error("Missing Raid-Helper server id (RAID_HELPER_SERVER_ID)");
  }

  return { apiKey, serverId };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForRateLimit() {
  const now = Date.now();
  while (recentRequestTimes.length > 0 && recentRequestTimes[0]! <= now - RATE_LIMIT_WINDOW_MS) {
    recentRequestTimes.shift();
  }

  if (recentRequestTimes.length >= RATE_LIMIT_MAX) {
    const waitMs = recentRequestTimes[0]! + RATE_LIMIT_WINDOW_MS - Date.now() + 100;
    if (waitMs > 0) {
      await sleep(waitMs);
    }
    return waitForRateLimit();
  }

  recentRequestTimes.push(Date.now());
}

function retryAfterMs(response: Response, body: string) {
  const header = response.headers.get("retry-after");
  if (header) {
    const seconds = Number(header);
    if (Number.isFinite(seconds)) return Math.max(seconds, 1) * 1000;
  }

  const match = body.match(/try again in (\d+)\s*second/i);
  if (match) {
    const seconds = Number(match[1]);
    // "0 seconds" still needs a full window wait.
    if (!Number.isFinite(seconds) || seconds <= 0) return RATE_LIMIT_WINDOW_MS;
    return seconds * 1000;
  }

  return RATE_LIMIT_WINDOW_MS;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { headers = {}, auth = true, onRateLimited } = options;
  const finalHeaders = { ...headers };
  if (auth) {
    finalHeaders.Authorization = credentials().apiKey;
  }

  for (let attempt = 0; attempt <= RATE_LIMIT_RETRIES; attempt += 1) {
    await waitForRateLimit();

    const response = await fetch(`${BASE_URL}${path}`, { headers: finalHeaders });

    if (response.status === 429 && attempt < RATE_LIMIT_RETRIES) {
      const body = await response.text().catch(() => "");
      const waitMs = retryAfterMs(response, body);
      onRateLimited?.({ path, waitMs, attempt: attempt + 1 });
      await sleep(waitMs);
      continue;
    }

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(
        `Raid-Helper ${response.status} ${response.statusText} for ${path}` + (body ? `: ${body.slice(0, 300)}` : ""),
      );
    }

    return response.json() as Promise<T>;
  }

  throw new Error(`Raid-Helper rate limit exceeded for ${path}`);
}
