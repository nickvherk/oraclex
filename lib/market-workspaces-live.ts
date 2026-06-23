import "server-only";

import { getLiveMarketCatalysts } from "@/lib/integrations/market-news";
import { getUpcomingMarketEvents } from "@/lib/market-events-data";
import type { LiveCatalyst, MarketEvent } from "@/lib/integrations/market-events";
import {
  type MarketBias,
  type MarketCategory,
  type MarketWorkspaceData,
  type MarketWorkspaceMarket,
  type SignalSeverity,
  marketWorkspaceData,
} from "@/lib/market-workspaces-data";

export const MARKET_WORKSPACE_REVALIDATE_SECONDS = 15 * 60;

type GammaMarket = {
  id?: string | number;
  conditionId?: string;
  question?: string;
  title?: string;
  slug?: string;
  category?: string;
  active?: boolean;
  closed?: boolean;
  archived?: boolean;
  resolved?: boolean;
  acceptingOrders?: boolean;
  enableOrderBook?: boolean;
  endDate?: string;
  endDateIso?: string;
  volume?: string | number;
  volumeNum?: number;
  liquidity?: string | number;
  liquidityNum?: number;
  outcomes?: string[] | string;
  outcomePrices?: string[] | string;
  tags?: Array<{ label?: string; name?: string; slug?: string }> | string[];
};

type GammaResponse = GammaMarket[] | { markets?: GammaMarket[]; data?: GammaMarket[] };

const POLYMARKET_GAMMA_URL = "https://gamma-api.polymarket.com/markets";
const MIN_MARKETS_FOR_MARKET_MODE = 2;

type WorkspaceCatalyst = Pick<LiveCatalyst, "title" | "category" | "importance" | "lastUpdate" | "latestDevelopment" | "source" | "sourceUrl" | "timestamp" | "affectedMarkets" | "why" | "watchNext">;

const CATEGORY_FILTERS: Record<MarketCategory, { label: string; keywords: string[]; catalystKeywords: string[] }> = {
  crypto: {
    label: "Crypto",
    keywords: ["bitcoin", "btc", "ethereum", "eth", "solana", "sol", "crypto", "stablecoin", "coinbase", "binance", "hyperliquid", "etf", "token", "xrp"],
    catalystKeywords: ["crypto", "bitcoin", "btc", "ethereum", "eth", "solana", "sol", "stablecoin", "etf", "exchange", "hyperliquid", "liquidity", "sec", "cftc", "token", "unlock"],
  },
  politics: {
    label: "Politics",
    keywords: ["election", "trump", "biden", "congress", "senate", "house", "president", "prime minister", "geopolitical", "ukraine", "russia", "israel parliament", "iran regime", "iran nuclear", "uranium", "policy", "bill", "sanction", "ceasefire", "peace deal"],
    catalystKeywords: ["election", "policy", "geopolitical", "ceasefire", "sanction", "congress", "senate", "regulation"],
  },
  macro: {
    label: "Macro",
    keywords: ["fed", "fomc", "powell", "cpi", "ppi", "inflation", "treasury", "yield", "rates", "jobs", "payrolls", "unemployment", "labor", "recession", "gdp"],
    catalystKeywords: ["fed", "macro", "rates", "inflation", "cpi", "ppi", "payrolls", "labor", "treasury", "yield"],
  },
  ai: {
    label: "AI",
    keywords: ["ai", "artificial intelligence", "openai", "anthropic", "nvidia", "nvda", "compute", "semiconductor", "chip", "model", "ai regulation", "agent", "data center"],
    catalystKeywords: ["ai", "artificial intelligence", "openai", "anthropic", "nvidia", "nvda", "semiconductor", "compute", "chips", "ai regulation", "ai infrastructure", "capex", "agent", "model", "data center", "export controls"],
  },
  sports: {
    label: "Sports",
    keywords: ["nba", "nfl", "mlb", "nhl", "ufc", "mma", "soccer", "tennis", "golf", "wnba", "fight", "match", "game", "championship", "world cup"],
    catalystKeywords: ["sports", "injury", "odds", "nba", "nfl", "mlb", "ufc"],
  },
};

const RESOLVED_TERMS = ["resolved", "final result", "winner was", "will win tonight", "tonight's game"];

export async function getLiveMarketWorkspace(category: MarketCategory, now = new Date()): Promise<MarketWorkspaceData> {
  const baseline = marketWorkspaceData[category];
  const refreshedAt = now.toISOString();
  const nextRefreshAt = new Date(now.getTime() + MARKET_WORKSPACE_REVALIDATE_SECONDS * 1000).toISOString();
  const [predictionMarkets, catalystsPayload] = await Promise.all([
    fetchCurrentPolymarketMarkets(category, now),
    getLiveMarketCatalysts(now).catch(() => null),
  ]);
  const liveCatalysts = (catalystsPayload?.catalysts ?? []).filter((catalyst) => catalystMatchesCategory(category, catalyst.title, catalyst.category, catalyst.latestDevelopment, catalyst.why));
  const eventCatalysts = getUpcomingMarketEvents(now)
    .filter((event) => catalystMatchesCategory(category, event.event, event.type, event.why, event.affected.join(" ")))
    .map((event) => marketEventToCatalyst(event, now));
  const catalysts = dedupeCatalysts([...liveCatalysts, ...eventCatalysts]);
  const markets = predictionMarkets.length ? predictionMarkets : catalysts.slice(0, 8).map((catalyst, index) => catalystToWorkspaceMarket(category, catalyst, index));
  const catalystFeedUnavailable = !catalysts.length && catalystsPayload?.status === "unavailable";
  const status: MarketWorkspaceData["status"] = predictionMarkets.length || catalysts.length ? "live" : catalystFeedUnavailable ? "unavailable" : "empty";
  const sourceNote = buildSourceNote(category, predictionMarkets.length, catalysts.length, catalystFeedUnavailable);
  const feed = catalystFeedUnavailable ? buildUnavailableFeed(now) : buildLiveFeed(predictionMarkets, catalysts, now);

  return {
    ...baseline,
    badge: status === "live" ? (predictionMarkets.length >= MIN_MARKETS_FOR_MARKET_MODE ? "Live category monitor" : "Catalyst monitor") : "No active markets",
    status,
    lastUpdatedAt: refreshedAt,
    nextRefreshAt,
    refreshCadenceHours: 0.25,
    sources: ["live market data", "news feed", "catalyst feed", "OracleX analysis"],
    sourceNote,
    markets,
    feed,
    signalCards: buildSignalCards(category, predictionMarkets, catalysts),
    metrics: buildMetrics(markets, catalysts),
    insights: buildInsights(category, predictionMarkets, catalysts, catalystFeedUnavailable),
  };
}

async function fetchCurrentPolymarketMarkets(category: MarketCategory, now: Date) {
  try {
    const url = new URL(POLYMARKET_GAMMA_URL);
    url.searchParams.set("active", "true");
    url.searchParams.set("closed", "false");
    url.searchParams.set("archived", "false");
    url.searchParams.set("limit", "250");
    url.searchParams.set("order", "volume24hr");
    url.searchParams.set("ascending", "false");

    const response = await fetch(url, {
      next: { revalidate: MARKET_WORKSPACE_REVALIDATE_SECONDS },
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return [];

    const payload = (await response.json()) as GammaResponse;
    const rawMarkets = Array.isArray(payload) ? payload : payload.markets ?? payload.data ?? [];
    return rawMarkets
      .filter((market) => isCurrentActiveMarket(market, now))
      .filter((market) => marketMatchesCategory(category, market))
      .sort((a, b) => marketVolume(b) - marketVolume(a))
      .slice(0, 8)
      .map((market, index) => toWorkspaceMarket(category, market, index, now));
  } catch {
    return [];
  }
}

function isCurrentActiveMarket(market: GammaMarket, now: Date) {
  if (market.active === false || market.closed || market.archived || market.resolved) return false;
  const title = marketTitle(market).toLowerCase();
  if (!title || RESOLVED_TERMS.some((term) => title.includes(term))) return false;
  const endDate = market.endDateIso ?? market.endDate;
  if (!endDate) return true;
  const endTime = new Date(endDate).getTime();
  return Number.isFinite(endTime) && endTime > now.getTime();
}

function marketMatchesCategory(category: MarketCategory, market: GammaMarket) {
  const filters = CATEGORY_FILTERS[category];
  if (category !== "sports" && looksLikeSportsMarket(market)) return false;
  const haystack = [
    marketTitle(market),
    market.slug ?? "",
    tagText(market.tags),
  ].join(" ").toLowerCase();

  return filters.keywords.some((keyword) => keywordMatches(haystack, keyword));
}

function looksLikeSportsMarket(market: GammaMarket) {
  const haystack = [
    marketTitle(market),
    market.category ?? "",
    market.slug ?? "",
    tagText(market.tags),
  ].join(" ").toLowerCase();
  return hasAny(haystack, ["fifa world cup", "nba", "nfl", "mlb", "nhl", "ufc", "mma", "soccer", "tennis", "golf", "match", "game"]);
}

function hasAny(value: string, keywords: string[]) {
  return keywords.some((keyword) => keywordMatches(value, keyword));
}

function catalystMatchesCategory(category: MarketCategory, ...values: string[]) {
  const haystack = values.join(" ").toLowerCase();
  return CATEGORY_FILTERS[category].catalystKeywords.some((keyword) => keywordMatches(haystack, keyword));
}

function marketEventToCatalyst(event: MarketEvent, now: Date): WorkspaceCatalyst {
  return {
    title: event.event,
    category: event.type,
    importance: event.importance,
    lastUpdate: event.dateValue ? relativeEventTime(event.dateValue, now) : event.date,
    latestDevelopment: `${event.date} / ${event.time}. ${event.why}`,
    source: event.source,
    sourceUrl: event.sourceUrl,
    timestamp: event.dateValue ? `${event.dateValue}T12:00:00.000Z` : undefined,
    affectedMarkets: event.affected,
    why: event.why,
    watchNext: event.affected,
  };
}

function dedupeCatalysts(catalysts: WorkspaceCatalyst[]) {
  const seen = new Set<string>();
  return catalysts.filter((catalyst) => {
    const key = `${catalyst.title}:${catalyst.source}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function buildSourceNote(category: MarketCategory, marketCount: number, catalystCount: number, catalystFeedUnavailable: boolean) {
  if (catalystFeedUnavailable) return "Live catalyst feed unavailable.";
  if (marketCount > 0) {
    return "Active markets are sourced from Polymarket Gamma and filtered for active, unresolved, non-expired contracts.";
  }
  if (catalystCount && category === "crypto") {
    return "Live prediction market coverage limited. Showing current crypto catalysts instead.";
  }
  if (catalystCount && category === "ai") {
    return "Live prediction market coverage limited. Showing current AI catalysts instead.";
  }
  if (catalystCount) {
    return "Live prediction market coverage limited. Showing current category catalysts instead.";
  }
  return "No active markets currently tracked.";
}

function toWorkspaceMarket(category: MarketCategory, market: GammaMarket, index: number, now: Date): MarketWorkspaceMarket {
  const probability = impliedProbability(market);
  const catalystBias = oracleAdjustment(category, market);
  const oracleProbability = clamp(probability + catalystBias, 1, 99);
  const gap = oracleProbability - probability;
  const bias: MarketBias = gap > 2 ? "Bullish" : gap < -2 ? "Bearish" : "Neutral";
  const severity: SignalSeverity = Math.abs(gap) >= 7 ? "Critical" : Math.abs(gap) >= 4 ? "High Conviction" : Math.abs(gap) >= 2 ? "Elevated" : "Informational";
  const volume = marketVolume(market);
  const endDate = market.endDateIso ?? market.endDate;
  const endCopy = endDate ? `Resolves ${formatDate(endDate)}` : "Resolution date not published";

  return {
    id: String(market.conditionId ?? market.id ?? market.slug ?? `${category}-${index}`),
    rowKind: "prediction",
    title: marketTitle(market),
    categoryLabel: `${CATEGORY_FILTERS[category].label} / Active Market`,
    probability,
    oracleProbability,
    volume: formatUsd(volume),
    smartMoneyBias: bias,
    signalSeverity: severity,
    lastUpdate: "Refreshed this cycle",
    smartMoneySummary: volume > 0 ? `${formatUsd(volume)} in reported Polymarket volume; OracleX is not showing resolved or expired contracts.` : "Active contract detected; reported volume is unavailable from the market feed.",
    narrativeContext: categoryContext(category),
    relatedFlows: [
      "Source: live market data",
      "Status filter: active, unresolved, non-expired",
      endCopy,
    ],
    aiInterpretation: `OracleX compares live market probability with current category catalysts and flags a ${gap >= 0 ? "positive" : "negative"} ${Math.abs(gap).toFixed(1)} point divergence.`,
    watchNext: categoryWatchNext(category),
    source: "Polymarket Gamma live market data",
  };
}

function catalystToWorkspaceMarket(category: MarketCategory, catalyst: WorkspaceCatalyst, index: number): MarketWorkspaceMarket {
  const importance = catalyst.importance;
  const severity: SignalSeverity = importance === "Critical" ? "Critical" : importance === "High" ? "High Conviction" : importance === "Medium" ? "Elevated" : "Informational";
  const affectedMarkets = catalyst.affectedMarkets?.length ? catalyst.affectedMarkets : catalyst.watchNext ?? [];
  const source = catalyst.source || "OracleX analysis";

  return {
    id: `catalyst-${category}-${index}-${slugify(catalyst.title)}`,
    rowKind: "catalyst",
    title: catalyst.title,
    categoryLabel: `${CATEGORY_FILTERS[category].label} / Catalyst`,
    probability: Number.NaN,
    oracleProbability: Number.NaN,
    volume: "Unavailable",
    smartMoneyBias: "Neutral",
    signalSeverity: severity,
    lastUpdate: catalyst.lastUpdate || "Current cycle",
    smartMoneySummary: `Source-backed catalyst row from ${source}. Prediction market probability is unavailable for this catalyst.`,
    narrativeContext: catalyst.latestDevelopment || catalyst.why || categoryContext(category),
    relatedFlows: [
      `Source: ${source}`,
      "Probability: unavailable",
      ...affectedMarkets.slice(0, 4).map((market) => `Affected: ${market}`),
    ],
    aiInterpretation: catalyst.why || "OracleX is monitoring this current catalyst because it maps to active category market outcomes.",
    watchNext: (catalyst.watchNext ?? affectedMarkets).slice(0, 4).join(", ") || categoryWatchNext(category),
    source,
    sourceUrl: catalyst.sourceUrl,
    affectedMarkets,
    oracleRead: catalyst.why || catalyst.latestDevelopment || "Catalyst watch",
    importance,
  };
}

function buildLiveFeed(markets: MarketWorkspaceMarket[], catalysts: WorkspaceCatalyst[], now: Date): MarketWorkspaceData["feed"] {
  const marketSignals = markets.slice(0, 4).map((market) => ({
    time: shortTime(now),
    title: market.title,
    detail: `${market.source ?? "Live market data"} reports this as active. ${market.watchNext}`,
    value: probabilityLabel(market.probability),
    bias: market.smartMoneyBias,
    severity: market.signalSeverity,
  }));
  const catalystSignals = catalysts.slice(0, Math.max(0, 4 - marketSignals.length)).map((catalyst) => ({
    time: catalyst.lastUpdate,
    title: catalyst.title,
    detail: `${catalyst.latestDevelopment} Source: ${catalyst.source}.`,
    value: catalyst.importance,
    bias: "Neutral" as MarketBias,
    severity: catalyst.importance === "Critical" ? "Critical" as SignalSeverity : catalyst.importance === "High" ? "High Conviction" as SignalSeverity : "Elevated" as SignalSeverity,
  }));
  return [...marketSignals, ...catalystSignals];
}

function buildUnavailableFeed(now: Date): MarketWorkspaceData["feed"] {
  return [{
    time: shortTime(now),
    title: "Live catalyst feed unavailable.",
    detail: "OracleX could not load current news or Market Events catalysts for this category during this refresh.",
    value: "Unavailable",
    bias: "Neutral",
    severity: "Informational",
  }];
}

function buildSignalCards(category: MarketCategory, markets: MarketWorkspaceMarket[], catalysts: WorkspaceCatalyst[]): MarketWorkspaceData["signalCards"] {
  if (!markets.length && !catalysts.length) {
    return [{ title: "Active coverage", value: "None", detail: "Live catalyst feed unavailable.", bias: "Neutral" }];
  }

  const bullish = markets.filter((market) => market.smartMoneyBias === "Bullish").length;
  const bearish = markets.filter((market) => market.smartMoneyBias === "Bearish").length;
  return [
    {
      title: markets.length ? "Tracked markets" : "Catalyst rows",
      value: String(markets.length || catalysts.length),
      detail: markets.length ? "Current active markets from live market data." : "Source-backed catalyst rows shown while prediction probability is unavailable.",
      bias: markets.length ? "Bullish" : "Neutral",
    },
    { title: "Catalysts", value: String(catalysts.length), detail: "Current news and Market Events catalyst items mapped to this category.", bias: catalysts.length ? "Neutral" : "Neutral" },
    { title: "OracleX bias", value: bullish > bearish ? "Positive" : bearish > bullish ? "Negative" : "Mixed", detail: categoryContext(category), bias: bullish > bearish ? "Bullish" : bearish > bullish ? "Bearish" : "Neutral" },
    { title: "Refresh", value: "15m", detail: "Server refresh cadence for category market workspaces.", bias: "Neutral" },
  ];
}

function buildMetrics(markets: MarketWorkspaceMarket[], catalysts: WorkspaceCatalyst[]): MarketWorkspaceData["metrics"] {
  const predictionMarkets = markets.filter((market) => market.rowKind !== "catalyst");
  const totalVolume = predictionMarkets.reduce((sum, market) => sum + parseMoney(market.volume), 0);
  const avgDivergence = predictionMarkets.length
    ? predictionMarkets.reduce((sum, market) => sum + Math.abs(market.oracleProbability - market.probability), 0) / predictionMarkets.length
    : 0;
  return {
    activeMarkets: String(markets.length),
    signalScore: markets.length ? Math.min(99, 45 + avgDivergence * 5 + catalysts.length * 4).toFixed(1) : "0.0",
    smartMoneyActivity: totalVolume ? formatUsd(totalVolume) : "$0",
    narrativeMomentum: catalysts.length ? `+${Math.min(99, catalysts.length * 12)}%` : "0%",
  };
}

function buildInsights(category: MarketCategory, markets: MarketWorkspaceMarket[], catalysts: WorkspaceCatalyst[], catalystFeedUnavailable: boolean): MarketWorkspaceData["insights"] {
  if (catalystFeedUnavailable) {
    return {
      moving: "Live catalyst feed unavailable.",
      matters: categoryContext(category),
      confirmation: "No current live market or catalyst confirmation is available for this category during this refresh.",
      interpretation: "OracleX is suppressing stale demo content and waiting for source-backed live markets or catalysts.",
    };
  }

  if (!markets.length && !catalysts.length) {
    return {
      moving: "No active markets currently tracked.",
      matters: "OracleX is suppressing stale demo content instead of presenting completed events as active.",
      confirmation: "No current live market or catalyst confirmation is available for this category.",
      interpretation: "Wait for new active markets or current source-backed catalysts before treating this category as actionable.",
    };
  }

  const leadMarket = markets[0]?.title;
  const leadCatalyst = catalysts[0]?.title;
  return {
    moving: leadMarket ? `${leadMarket} is the highest-volume active market currently tracked.` : `${leadCatalyst} is the freshest catalyst currently tracked.`,
    matters: categoryContext(category),
    confirmation: markets.length ? "Market rows are filtered for active, unresolved, non-expired contracts before display." : "No active market rows passed the live filter; only source-backed catalysts are shown.",
    interpretation: markets.length ? `OracleX is tracking ${markets.length} current ${CATEGORY_FILTERS[category].label.toLowerCase()} market${markets.length === 1 ? "" : "s"} with live source labels.` : "Current catalysts exist, but no active prediction market passed the filter.",
  };
}

function marketTitle(market: GammaMarket) {
  return (market.question ?? market.title ?? "").replace(/\s+/g, " ").trim();
}

function tagText(tags: GammaMarket["tags"]) {
  if (!Array.isArray(tags)) return "";
  return tags.map((tag) => typeof tag === "string" ? tag : tag.label ?? tag.name ?? tag.slug ?? "").join(" ");
}

function impliedProbability(market: GammaMarket) {
  const prices = parsePrices(market.outcomePrices);
  const outcomes = parseOutcomes(market.outcomes);
  const yesIndex = outcomes.findIndex((outcome) => outcome.toLowerCase() === "yes");
  const price = prices[yesIndex >= 0 ? yesIndex : 0];
  if (typeof price === "number" && Number.isFinite(price)) return clamp(price * 100, 1, 99);
  return 50;
}

function parsePrices(value: GammaMarket["outcomePrices"]) {
  const values = Array.isArray(value) ? value : parseJsonArray(value);
  return values.map((item) => Number(item)).filter(Number.isFinite);
}

function parseOutcomes(value: GammaMarket["outcomes"]) {
  const values = Array.isArray(value) ? value : parseJsonArray(value);
  return values.map(String);
}

function parseJsonArray(value: unknown) {
  if (typeof value !== "string") return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function marketVolume(market: GammaMarket) {
  return Number(market.volumeNum ?? market.volume ?? market.liquidityNum ?? market.liquidity ?? 0) || 0;
}

function oracleAdjustment(category: MarketCategory, market: GammaMarket) {
  const text = marketTitle(market).toLowerCase();
  const volume = marketVolume(market);
  const liquidityWeight = volume > 1000000 ? 2 : volume > 100000 ? 1 : 0;
  const categoryWeight = CATEGORY_FILTERS[category].keywords.filter((keyword) => keywordMatches(text, keyword)).length;
  return clamp(categoryWeight + liquidityWeight - 2, -6, 6);
}

function keywordMatches(value: string, keyword: string) {
  const normalizedKeyword = keyword.toLowerCase();
  if (/^[a-z0-9]{1,3}$/.test(normalizedKeyword)) {
    return new RegExp(`(^|[^a-z0-9])${escapeRegExp(normalizedKeyword)}([^a-z0-9]|$)`).test(value);
  }
  return value.includes(normalizedKeyword);
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function categoryContext(category: MarketCategory) {
  const copy: Record<MarketCategory, string> = {
    crypto: "Crypto focus includes active prediction markets, ETF developments, token events, and exchange/liquidity catalysts.",
    politics: "Politics focus includes active election, geopolitical, policy, and regulatory prediction markets.",
    macro: "Macro focus includes Fed, CPI, PPI, Treasury, labor-market, and liquidity catalysts.",
    ai: "AI focus includes Nvidia, OpenAI, Anthropic, AI regulation, compute policy, and infrastructure catalysts.",
    sports: "Sports focus includes only active game, futures, odds-shift, injury, and sharp-money markets.",
  };
  return copy[category];
}

function categoryWatchNext(category: MarketCategory) {
  const copy: Record<MarketCategory, string> = {
    crypto: "Watch ETF filings, issuer updates, exchange liquidity, token unlocks, and spot/perp confirmation.",
    politics: "Watch official election calendars, policy votes, primary-source geopolitical statements, and procedural deadlines.",
    macro: "Watch Fed communications, CPI/PPI releases, Treasury auctions, labor data, and front-end yield reaction.",
    ai: "Watch Nvidia guidance, OpenAI/Anthropic product or policy updates, export controls, and hyperscaler capex.",
    sports: "Watch market close time, injury reports, starting lineups, odds movement, and whether the event is still pending.",
  };
  return copy[category];
}

function relativeEventTime(dateValue: string, now: Date) {
  const eventTime = new Date(`${dateValue}T12:00:00Z`).getTime();
  if (!Number.isFinite(eventTime)) return "Scheduled";
  const diffDays = Math.ceil((eventTime - now.getTime()) / (24 * 60 * 60 * 1000));
  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  return `${diffDays}d ahead`;
}

function shortTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "UTC" }).format(date);
}

function formatDate(value: string) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(date);
}

function formatUsd(value: number) {
  const abs = Math.abs(value);
  if (abs >= 1000000000) return `$${(value / 1000000000).toFixed(1)}B`;
  if (abs >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (abs >= 1000) return `$${(value / 1000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

function parseMoney(value: string) {
  const match = value.match(/\$([0-9.]+)([BMK]?)/);
  if (!match) return 0;
  const amount = Number(match[1]);
  const multiplier = match[2] === "B" ? 1000000000 : match[2] === "M" ? 1000000 : match[2] === "K" ? 1000 : 1;
  return amount * multiplier;
}

function probabilityLabel(value: number) {
  return `${value.toFixed(1)}%`;
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
