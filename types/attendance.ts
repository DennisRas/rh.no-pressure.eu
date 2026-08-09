export type AttendanceQuery = {
  tagFilter?: string | string[];
  channelFilter?: string | string[];
  timeFilterStart?: number; // unix seconds
  timeFilterEnd?: number;
};

export type AttendanceEntry = {
  id: string;
  name: string;
  attended: number;
  percentage: number;
};

export type AttendanceResponse = {
  result: AttendanceEntry[];
  events: number;
  timeFilterStart?: string | number;
  timeFilterEnd?: string | number;
  tagFilter?: string[];
  channelFilter?: string[];
};
