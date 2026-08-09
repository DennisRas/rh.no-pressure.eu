export type SignUp = {
  id: number;
  userId: string;
  name: string;
  className: string;
  specName: string;
  entryTime: number;
  note?: string;
};

export type RaidEvent = {
  id: string;
  title: string;
  description?: string;
  templateId?: string;
  color?: string;
  channelId?: string; // Forum posts sometimes use the event id here.
  leaderId?: string;
  leaderName?: string;
  startTime: number; // unix seconds
  endTime?: number;
  closeTime?: number;
  lastUpdated?: number;
  signUpCount?: string;
  signUps?: SignUp[];
};

export type EventsPage = {
  pages: number;
  currentPage: number;
  eventCountOverall: number;
  eventCountTransmitted: number;
  postedEvents: RaidEvent[];
};

export type EventsQuery = {
  includeSignUps?: boolean;
  channelFilter?: string;
  startTime?: number; // unix seconds
  endTime?: number;
};

export type EventsCache = {
  updatedAt: string | null;
  events: Record<string, RaidEvent>;
};

export type EventFilters = {
  startTime?: number; // unix seconds
  endTime?: number;
  channelId?: string;
};

export type ScheduledEvent = {
  id: string;
  title: string;
  description?: string;
  templateId?: string;
  templateEmoteId?: string;
  color?: string;
  channelId?: string;
  channelName?: string;
  channelType?: string;
  leaderId?: string;
  leaderName?: string;
  startTime: number; // unix seconds
  endTime?: number;
  closeTime?: number;
  postTime?: number;
  interval?: string;
  isPaused?: boolean;
  isScheduled?: boolean;
};

export type ScheduledEventsResponse = {
  scheduledEvents: ScheduledEvent[];
};
