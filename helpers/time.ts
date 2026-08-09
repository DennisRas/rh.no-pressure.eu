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
