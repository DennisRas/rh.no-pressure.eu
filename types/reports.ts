export type LeaderboardRow = {
  rank: number;
  userId: string;
  name: string;
  events: number;
};

export type LeadersOptions = {
  limit?: number;
  order?: "asc" | "desc";
  min?: number;
  max?: number;
};

export type SummaryStats = {
  events: number;
  firstEvent: string;
  lastEvent: string;
  daysCovered: number;
  weeksCovered: number;
  activeYears: number;
  avgEventsPerWeek: number;
  avgEventsPerMonth: number;
  busiestYear: string;
  busiestYearEvents: number;
  quietestYear: string;
  quietestYearEvents: number;
  busiestMonth: string; // YYYY-MM
  busiestMonthEvents: number;
  busiestDay: string; // YYYY-MM-DD
  busiestDayEvents: number;
  longestGapDays: number;
  weekendEvents: number;
  weekdayEvents: number;
  weekendEventPercent: number;
  uniqueLeaders: number;
  uniqueRaiders: number;
  avgEventsPerLeader: number;
  avgSignupsPerRaider: number;
  topLeader: string;
  topLeaderEvents: number;
  topRaider: string;
  topRaiderEvents: number;
  oneTimeLeaders: number;
  oneTimeRaiders: number;
  totalSignups: number;
  avgSignupsPerEvent: number;
  medianSignupsPerEvent: number;
  maxSignupsOnEvent: number;
  minSignupsOnEvent: number;
  emptyEvents: number;
  absenceSignups: number;
  benchSignups: number;
  tentativeSignups: number;
  titleMythic: number;
  titleHeroic: number;
  titleNormal: number;
  busiestWeekday: string;
  busiestWeekdayEvents: number;
  busiestHourUtc: string;
  busiestHourEvents: number;
  avgDurationMinutes: number;
  eventsWithDuration: number;
  longestEventMinutes: number;
  longestEventTitle: string;
  shortestEventMinutes: number;
  shortestEventTitle: string;
  eventsLast30Days: number;
};
