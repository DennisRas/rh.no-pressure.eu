import type { RaidEvent } from "../types/events.ts";

export function signupCount(event: RaidEvent): number {
  if (event.signUps) return event.signUps.length;
  if (event.signUpCount != null) return Number(event.signUpCount) || 0;
  return 0;
}
