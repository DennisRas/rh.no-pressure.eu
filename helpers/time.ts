// Accepts ISO date or unix seconds.
export function toUnix(value: string): number {
  if (/^\d+$/.test(value)) return Number(value);
  const ms = Date.parse(value);
  if (Number.isNaN(ms)) {
    throw new Error(`Invalid date/time: ${value}`);
  }
  return Math.floor(ms / 1000);
}

export function toIsoDate(unixSeconds: number): string {
  return new Date(unixSeconds * 1000).toISOString().slice(0, 10);
}

// Monday 00:00 UTC for the week containing this instant.
export function weekStartUtc(unixSeconds: number): number {
  const date = new Date(unixSeconds * 1000);
  const day = date.getUTCDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  date.setUTCDate(date.getUTCDate() + mondayOffset);
  date.setUTCHours(0, 0, 0, 0);
  return Math.floor(date.getTime() / 1000);
}
