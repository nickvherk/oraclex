import {
  filterUpcomingMarketEvents,
  MARKET_EVENT_REFRESH_INTERVAL_HOURS,
  StaticMarketEventFeed,
  type MarketEvent,
} from "@/lib/integrations/market-events";

export const marketEventsRefreshLabel = `${MARKET_EVENT_REFRESH_INTERVAL_HOURS * 60}m refresh`;

function formatEventDate(dateValue: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${dateValue}T12:00:00Z`));
}

function getNextWeekdayDateValue(targetWeekday: number, now = new Date()) {
  const current = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const delta = (targetWeekday - current.getUTCDay() + 7) % 7;
  current.setUTCDate(current.getUTCDate() + delta);
  return current.toISOString().slice(0, 10);
}

const nextJoblessClaimsDate = getNextWeekdayDateValue(4);

const scheduledMarketEvents: MarketEvent[] = [
  {
    event: "US Nonfarm Payrolls",
    dateValue: "2026-07-02",
    date: formatEventDate("2026-07-02"),
    time: "08:30 ET",
    region: "US",
    importance: "Critical",
    affected: ["Fed cuts rates at next meeting", "BTC breaks ATH this quarter", "US recession in 2026"],
    type: "Macro",
    source: "BLS Employment Situation",
    sourceUrl: "https://www.bls.gov/schedule/news_release/empsit.htm",
    sourceKind: "economic-calendar",
    why: "Can rapidly reprice labor softness, Fed expectations, and crypto volatility.",
  },
  {
    event: "US CPI Inflation Release",
    dateValue: "2026-07-14",
    date: formatEventDate("2026-07-14"),
    time: "08:30 ET",
    region: "US",
    importance: "Critical",
    affected: ["Fed cuts rates at next meeting", "BTC breaks ATH this quarter", "Inflation falls below 3% in 2026"],
    type: "Macro",
    source: "BLS CPI Calendar",
    sourceUrl: "https://www.bls.gov/schedule/news_release/cpi.htm",
    sourceKind: "economic-calendar",
    why: "Can rapidly reprice Fed expectations and crypto volatility.",
  },
  {
    event: "US Treasury Coupon Auction Window",
    dateValue: null,
    date: "Date TBA",
    time: "Auction time TBA",
    region: "US",
    importance: "High",
    affected: ["10Y yield closes above 4.75%", "Fed cuts rates at next meeting", "BTC breaks ATH this quarter"],
    type: "Rates",
    source: "TreasuryDirect Upcoming Auctions",
    sourceUrl: "https://www.treasurydirect.gov/auctions/upcoming/",
    sourceKind: "economic-calendar",
    why: "Auction announcements and tails can pressure duration, risk assets, and macro prediction markets.",
  },
  {
    event: "US PPI Inflation Release",
    dateValue: "2026-07-15",
    date: formatEventDate("2026-07-15"),
    time: "08:30 ET",
    region: "US",
    importance: "High",
    affected: ["Fed cuts rates at next meeting", "Inflation falls below 3% in 2026", "BTC breaks ATH this quarter"],
    type: "Macro",
    source: "BLS PPI Calendar",
    sourceUrl: "https://www.bls.gov/ppi/",
    sourceKind: "economic-calendar",
    why: "Producer inflation can confirm or challenge CPI-driven Fed repricing.",
  },
  {
    event: "Initial Jobless Claims",
    dateValue: nextJoblessClaimsDate,
    date: formatEventDate(nextJoblessClaimsDate),
    time: "08:30 ET expected",
    region: "US",
    importance: "Medium",
    affected: ["Fed cuts rates at next meeting", "US recession in 2026", "Continuing claims rise in June"],
    type: "Labor",
    source: "US Department of Labor",
    sourceUrl: "https://www.dol.gov/ui/data.pdf",
    sourceKind: "economic-calendar",
    why: "Weekly labor weakness can move rate-cut and recession probabilities before monthly payrolls confirm.",
  },
  {
    event: "FOMC Rate Decision",
    dateValue: "2026-07-29",
    date: formatEventDate("2026-07-29"),
    time: "14:00 ET",
    region: "US",
    importance: "Critical",
    affected: ["Fed cuts rates at next meeting", "BTC breaks ATH this quarter", "US recession in 2026"],
    type: "Central bank",
    source: "Federal Reserve FOMC Calendar",
    sourceUrl: "https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm",
    sourceKind: "economic-calendar",
    why: "Impacts liquidity conditions, risk assets, and rate-sensitive markets.",
  },
  {
    event: "Fed Chair Press Conference",
    dateValue: "2026-07-29",
    date: formatEventDate("2026-07-29"),
    time: "14:30 ET expected",
    region: "US",
    importance: "High",
    affected: ["Fed cuts rates at next meeting", "BTC breaks ATH this quarter", "Powell signals policy pivot"],
    type: "Central bank",
    source: "Federal Reserve FOMC Calendar",
    sourceUrl: "https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm",
    sourceKind: "economic-calendar",
    why: "Forward guidance can move probabilities even when the rate decision itself is priced.",
  },
  {
    event: "SOL ETF SEC Review Window",
    dateValue: null,
    date: "Q3 2026 review window",
    time: "Regulatory window",
    region: "US",
    importance: "High",
    affected: ["SOL ETF approved in 2026", "SOL outperforms ETH this quarter", "Crypto ETF expansion in 2026"],
    type: "ETF calendar",
    source: "SEC Filings",
    sourceUrl: "https://www.sec.gov/edgar/search/",
    sourceKind: "etf-calendar",
    why: "Can reprice approval probabilities and smart money positioning.",
  },
  {
    event: "NVIDIA Q2 FY2027 Earnings Window",
    dateValue: null,
    date: "Late August 2026 expected",
    time: "Post-market expected",
    region: "US",
    importance: "High",
    affected: ["Nvidia market cap above $5T", "AI regulation bill passes in 2026", "AI compute capex accelerates"],
    type: "Corporate",
    source: "NVIDIA Investor Relations",
    sourceUrl: "https://investor.nvidia.com/financial-info/financial-reports/default.aspx",
    sourceKind: "crypto-catalyst",
    why: "AI earnings can reprice compute demand, risk appetite, and AI-linked prediction markets.",
  },
  {
    event: "US Midterm Election",
    dateValue: "2026-11-03",
    date: "November 3, 2026",
    time: "Election day",
    region: "US",
    importance: "Critical",
    affected: ["Republicans keep House in 2026", "Democrats win Senate in 2026", "US policy volatility after midterms"],
    type: "Geopolitical",
    source: "FEC Election Calendar",
    sourceUrl: "https://www.fec.gov/help-candidates-and-committees/dates-and-deadlines/2026-reporting-dates/federal-election-activity-periods-each-state-2026/",
    sourceKind: "news-monitoring",
    why: "Election-control probabilities can move fiscal, regulatory, crypto, and geopolitical policy markets.",
  },
];

export function getUpcomingMarketEvents(now = new Date()) {
  return filterUpcomingMarketEvents(scheduledMarketEvents, now);
}

export const upcomingEvents: MarketEvent[] = getUpcomingMarketEvents();

export const liveCatalysts = [];

export const marketEventFeeds = {
  economicCalendar: new StaticMarketEventFeed("economic-calendar-adapter", "economic-calendar", upcomingEvents.filter((event) => event.sourceKind === "economic-calendar")),
  etfCalendar: new StaticMarketEventFeed("etf-calendar-adapter", "etf-calendar", upcomingEvents.filter((event) => event.sourceKind === "etf-calendar")),
  geopoliticalMonitoring: new StaticMarketEventFeed("geopolitical-monitoring-adapter", "news-monitoring", upcomingEvents.filter((event) => event.sourceKind === "news-monitoring")),
  cryptoCatalysts: new StaticMarketEventFeed("crypto-catalyst-adapter", "crypto-catalyst", liveCatalysts),
};
