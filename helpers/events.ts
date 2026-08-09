import type { RaidEvent, TitleDifficulty } from "../types/events.ts";

export function signupCount(event: RaidEvent): number {
  if (event.signUps) return event.signUps.length;
  if (event.signUpCount != null) return Number(event.signUpCount) || 0;
  return 0;
}

export function titleDifficulty(title: string): TitleDifficulty {
  const t = title.toLowerCase();
  if (t.includes("mythic")) return "mythic";
  if (t.includes("heroic")) return "heroic";
  if (t.includes("normal")) return "normal";
  return "other";
}
