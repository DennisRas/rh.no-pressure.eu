export type SummaryStats = {
  events: number;
  firstEvent: string;
  lastEvent: string;
  daysCovered: number; // inclusive days from first event to last
  weeksCovered: number;
  activeYears: number; // years with at least one event
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
  longestGapDays: number; // biggest gap between consecutive events
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
  oneTimeLeaders: number; // hosted exactly one event
  oneTimeRaiders: number; // signed exactly one event
  totalSignups: number;
  avgSignupsPerEvent: number;
  medianSignupsPerEvent: number;
  maxSignupsOnEvent: number;
  minSignupsOnEvent: number;
  emptyEvents: number; // zero signups
  absenceSignups: number;
  benchSignups: number;
  tentativeSignups: number;
  titleMythic: number; // title contains "mythic"
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
