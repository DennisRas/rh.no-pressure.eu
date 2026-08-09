import type { RaidEvent, TitleDifficulty } from "../types/events.ts";

export function signupCount(event: RaidEvent): number {
  if (event.signUps) return event.signUps.length;
  if (event.signUpCount != null) return Number(event.signUpCount) || 0;
  return 0;
}

const STUCK = {
  m: /\d+(?:\/\d+)?m\b/,
  h: /\d+(?:\/\d+)?(?:hc|h)\b/,
  n: /\d+(?:\/\d+)?(?:nm|n)\b/,
} as const;

function hasDifficultyToken(title: string, letter: "m" | "h" | "n"): boolean {
  const wrapped = new RegExp(`[\\(\\[]\\s*${letter}\\s*[\\)\\]]`);
  return wrapped.test(title) || STUCK[letter].test(title);
}

export function titleDifficulty(title: string): TitleDifficulty {
  const t = title.toLowerCase();

  if (t.includes("mythic") || /\bmyth\b/.test(t) || hasDifficultyToken(t, "m")) return "mythic";
  if (t.includes("heroic") || /\bhc\b/.test(t) || hasDifficultyToken(t, "h")) return "heroic";
  if (t.includes("normal") || /\bnm\b/.test(t) || hasDifficultyToken(t, "n")) return "normal";
  return "other";
}
