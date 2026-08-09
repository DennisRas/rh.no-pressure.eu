import type { Character } from "../types/people.ts";

export function parseCharacters(raw: string): Character[] {
  const cleaned = raw.replaceAll(/\(.*?\)|\[.*?\]/gi, "").replaceAll(/\s+/g, "");
  if (!cleaned) return [];

  const characters: Character[] = [];
  for (const part of cleaned.split("/")) {
    if (!part) continue;
    const dash = part.indexOf("-");
    if (dash === -1) {
      characters.push({ name: part });
      continue;
    }
    const name = part.slice(0, dash);
    const realm = part.slice(dash + 1);
    if (name) characters.push({ name, realm: realm || undefined });
  }
  return characters;
}

export function uniqueCharacters(rawNames: Iterable<string>): Character[] {
  const byKey = new Map<string, Character>();
  for (const raw of rawNames) {
    for (const character of parseCharacters(raw)) {
      const key = `${character.name.toLowerCase()}-${(character.realm ?? "").toLowerCase()}`;
      if (!byKey.has(key)) byKey.set(key, character);
    }
  }
  return [...byKey.values()];
}
