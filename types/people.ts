export type Character = {
  name: string;
  realm?: string;
};

export type Leader = {
  userId: string;
  name: string; // most recent leaderName
  names: string[]; // all leaderName variants
  events: number;
  signupNames: string[]; // names used when signing on their own events
  characters: Character[];
};

export type Raider = {
  userId: string;
  name: string; // most recent signup name
  names: string[];
  signups: number; // total signup rows
  events: number; // distinct events
  characters: Character[];
};
