type SpecInfo = {
  label: string;
  className: string;
};

const WOW_CLASSES = new Map<string, string>([
  ["death knight", "Death Knight"],
  ["demon hunter", "Demon Hunter"],
  ["dk", "Death Knight"],
  ["dh", "Demon Hunter"],
  ["druid", "Druid"],
  ["evoker", "Evoker"],
  ["hunter", "Hunter"],
  ["mage", "Mage"],
  ["monk", "Monk"],
  ["paladin", "Paladin"],
  ["priest", "Priest"],
  ["rogue", "Rogue"],
  ["shaman", "Shaman"],
  ["warlock", "Warlock"],
  ["warrior", "Warrior"],
]);

// Raid-Helper emote/spec names → display label + class.
// Numbered duplicates (Holy1, Frost1, …) are the second class sharing that spec name.
const SPECS = new Map<string, SpecInfo>([
  ["retribution", { label: "Retribution", className: "Paladin" }],
  ["holy1", { label: "Holy (Paladin)", className: "Paladin" }],
  ["protection1", { label: "Protection (Paladin)", className: "Paladin" }],

  ["holy", { label: "Holy (Priest)", className: "Priest" }],
  ["discipline", { label: "Discipline", className: "Priest" }],
  ["shadow", { label: "Shadow", className: "Priest" }],

  ["restoration", { label: "Restoration (Druid)", className: "Druid" }],
  ["balance", { label: "Balance", className: "Druid" }],
  ["feral", { label: "Feral", className: "Druid" }],
  ["guardian", { label: "Guardian", className: "Druid" }],

  ["restoration1", { label: "Restoration (Shaman)", className: "Shaman" }],
  ["elemental", { label: "Elemental", className: "Shaman" }],
  ["enhancement", { label: "Enhancement", className: "Shaman" }],

  ["frost", { label: "Frost (Mage)", className: "Mage" }],
  ["fire", { label: "Fire", className: "Mage" }],
  ["arcane", { label: "Arcane", className: "Mage" }],

  ["frost1", { label: "Frost (Death Knight)", className: "Death Knight" }],
  ["blood", { label: "Blood", className: "Death Knight" }],
  ["unholy", { label: "Unholy", className: "Death Knight" }],

  ["havoc", { label: "Havoc", className: "Demon Hunter" }],
  ["vengeance", { label: "Vengeance", className: "Demon Hunter" }],
  ["devourer", { label: "Devourer", className: "Demon Hunter" }],

  ["beastmastery", { label: "Beast Mastery", className: "Hunter" }],
  ["marksmanship", { label: "Marksmanship", className: "Hunter" }],
  ["survival", { label: "Survival", className: "Hunter" }],

  ["affliction", { label: "Affliction", className: "Warlock" }],
  ["demonology", { label: "Demonology", className: "Warlock" }],
  ["destruction", { label: "Destruction", className: "Warlock" }],

  ["arms", { label: "Arms", className: "Warrior" }],
  ["fury", { label: "Fury", className: "Warrior" }],
  ["protection", { label: "Protection (Warrior)", className: "Warrior" }],

  ["brewmaster", { label: "Brewmaster", className: "Monk" }],
  ["mistweaver", { label: "Mistweaver", className: "Monk" }],
  ["windwalker", { label: "Windwalker", className: "Monk" }],

  ["devastation", { label: "Devastation", className: "Evoker" }],
  ["preservation", { label: "Preservation", className: "Evoker" }],
  ["augmentation", { label: "Augmentation", className: "Evoker" }],

  ["assassination", { label: "Assassination", className: "Rogue" }],
  ["outlaw", { label: "Outlaw", className: "Rogue" }],
  ["subtlety", { label: "Subtlety", className: "Rogue" }],
  ["combat", { label: "Combat", className: "Rogue" }],
]);

export function wowClassLabel(className: string): string | null {
  return WOW_CLASSES.get(className.trim().toLowerCase()) ?? null;
}

export function wowSpecInfo(specName: string): SpecInfo | null {
  return SPECS.get(specName.trim().toLowerCase()) ?? null;
}

export function resolveWowClass(className: string, specName: string): string | null {
  return wowClassLabel(className) ?? wowSpecInfo(specName)?.className ?? wowClassLabel(specName);
}
