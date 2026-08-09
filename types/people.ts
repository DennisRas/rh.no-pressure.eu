export type Character = {
  name: string;
  realm?: string;
};

export type Leader = {
  userId: string;
  name: string; // most recent leaderName
  names: string[];
  events: number;
  signupNames: string[];
  characters: Character[];
};

export type Raider = {
  userId: string;
  name: string; // most recent signup name
  names: string[];
  signups: number;
  events: number; // distinct events signed
  characters: Character[];
};
