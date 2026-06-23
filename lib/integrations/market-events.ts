export const MARKET_EVENT_REFRESH_INTERVAL_MINUTES = 30;
export const MARKET_EVENT_REFRESH_INTERVAL_MS = MARKET_EVENT_REFRESH_INTERVAL_MINUTES * 60 * 1000;
export const MARKET_EVENT_REFRESH_INTERVAL_HOURS = MARKET_EVENT_REFRESH_INTERVAL_MINUTES / 60;

export type MarketEventImportance = "Critical" | "High" | "Medium" | "Low";

export type MarketEventSourceKind =
  | "economic-calendar"
  | "token-unlocks"
  | "etf-calendar"
  | "crypto-catalyst"
  | "news-monitoring";

export interface MarketEvent {
  event: string;
  date: string;
  dateValue: string | null;
  time: string;
  region: string;
  importance: MarketEventImportance;
  affected: string[];
  type: string;
  source: string;
  sourceUrl: string;
  sourceKind: MarketEventSourceKind;
  why: string;
}

export interface CatalystDevelopment {
  time: string;
  headline: string;
  source: string;
  sourceUrl: string;
  timestamp?: string;
}

export interface LiveCatalyst {
  title: string;
  category: string;
  importance: MarketEventImportance;
  lastUpdate: string;
  latestDevelopment: string;
  source: string;
  sourceUrl: string;
  summary?: string;
  timestamp?: string;
  confidence?: "High" | "Medium" | "Low";
  timeline: CatalystDevelopment[];
  affectedMarkets: string[];
  oracleXAssessment: string;
  why: string;
  historicalImpact: string[];
  reactions: string[];
  narratives: string[];
  flows: string;
  smartMoney: string;
  watchNext: string[];
}

export interface EventFeed<TEvent> {
  id: string;
  sourceKind: MarketEventSourceKind;
  refreshCadenceMs: number;
  fetchEvents(): Promise<TEvent[]>;
}

export interface EconomicCalendarFeed extends EventFeed<MarketEvent> {
  sourceKind: "economic-calendar";
}

export interface TokenUnlockFeed extends EventFeed<MarketEvent> {
  sourceKind: "token-unlocks";
}

export interface EtfEventCalendarFeed extends EventFeed<MarketEvent> {
  sourceKind: "etf-calendar";
}

export interface CryptoCatalystFeed extends EventFeed<LiveCatalyst> {
  sourceKind: "crypto-catalyst";
}

export interface MarketEventIngestionResult {
  refreshedAt: string;
  nextRefreshAt: string;
  events: MarketEvent[];
  catalysts: LiveCatalyst[];
}

export class StaticMarketEventFeed<TEvent> implements EventFeed<TEvent> {
  constructor(
    public readonly id: string,
    public readonly sourceKind: MarketEventSourceKind,
    private readonly events: TEvent[],
    public readonly refreshCadenceMs = MARKET_EVENT_REFRESH_INTERVAL_MS,
  ) {}

  async fetchEvents() {
    return this.events;
  }
}

export function shouldRefreshMarketEvents(lastRefreshAt: Date | null, now = new Date()) {
  if (!lastRefreshAt) return true;

  return now.getTime() - lastRefreshAt.getTime() >= MARKET_EVENT_REFRESH_INTERVAL_MS;
}

export function filterUpcomingMarketEvents(events: MarketEvent[], now = new Date()) {
  const startOfTodayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());

  return events
    .filter((event) => {
      if (!event.dateValue) return true;
      const eventTime = new Date(`${event.dateValue}T23:59:59.999Z`).getTime();
      return Number.isFinite(eventTime) && eventTime >= startOfTodayUtc;
    })
    .sort((a, b) => {
      if (!a.dateValue && !b.dateValue) return a.event.localeCompare(b.event);
      if (!a.dateValue) return 1;
      if (!b.dateValue) return -1;
      return a.dateValue.localeCompare(b.dateValue);
    });
}

export async function ingestMarketEvents({
  calendarFeeds,
  catalystFeeds,
  now = new Date(),
}: {
  calendarFeeds: Array<EventFeed<MarketEvent>>;
  catalystFeeds: Array<EventFeed<LiveCatalyst>>;
  now?: Date;
}): Promise<MarketEventIngestionResult> {
  const [eventGroups, catalystGroups] = await Promise.all([
    Promise.all(calendarFeeds.map((feed) => feed.fetchEvents())),
    Promise.all(catalystFeeds.map((feed) => feed.fetchEvents())),
  ]);

  const nextRefreshAt = new Date(now.getTime() + MARKET_EVENT_REFRESH_INTERVAL_MS);

  // Future live integrations should keep this orchestration layer stable and
  // swap StaticMarketEventFeed for vendor adapters:
  // - BLS/Fed/Treasury or paid economic calendar APIs
  // - SEC/issuer ETF calendar parsers
  // - Reuters/Bloomberg/news API connectors
  // - geopolitical alert and prediction-market catalyst feeds
  return {
    refreshedAt: now.toISOString(),
    nextRefreshAt: nextRefreshAt.toISOString(),
    events: filterUpcomingMarketEvents(eventGroups.flat(), now),
    catalysts: catalystGroups.flat(),
  };
}
