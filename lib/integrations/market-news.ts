import type { LiveCatalyst, MarketEventImportance } from "@/lib/integrations/market-events";
import { MARKET_EVENT_REFRESH_INTERVAL_MS } from "@/lib/integrations/market-events";

export const LIVE_CATALYST_REVALIDATE_SECONDS = MARKET_EVENT_REFRESH_INTERVAL_MS / 1000;

type Confidence = "High" | "Medium" | "Low";

interface GdeltArticle {
  url?: string;
  title?: string;
  seendate?: string;
  domain?: string;
  sourceCountry?: string;
  language?: string;
}

interface GdeltResponse {
  articles?: GdeltArticle[];
}

interface CatalystTopic {
  title: string;
  category: string;
  importance: MarketEventImportance;
  query: string;
  keywords: string[];
  affectedMarkets: string[];
  narratives: string[];
  watchNext: string[];
  why: string;
  historicalImpact: string[];
  reactions: string[];
}

export interface LiveCatalystsPayload {
  status: "live" | "unavailable";
  label: "Live news" | "Live news unavailable";
  refreshedAt: string;
  nextRefreshAt: string;
  catalysts: LiveCatalyst[];
  errors: string[];
}

interface NewsArticle {
  title: string;
  url: string;
  publishedAt: string;
  source: string;
}

const RSS_FEEDS = [
  { source: "Federal Reserve", url: "https://www.federalreserve.gov/feeds/press_all.xml" },
  { source: "SEC", url: "https://www.sec.gov/news/pressreleases.rss" },
  { source: "Yahoo Finance", url: "https://feeds.finance.yahoo.com/rss/2.0/headline?s=BTC-USD,ETH-USD,SOL-USD,NVDA,AMD,TSM,AVGO,META,MSFT,GOOGL,AMZN&region=US&lang=en-US" },
  { source: "CoinDesk", url: "https://www.coindesk.com/arc/outboundfeeds/rss/" },
  { source: "CNBC Markets", url: "https://www.cnbc.com/id/100003114/device/rss/rss.html" },
];

const TOPICS: CatalystTopic[] = [
  {
    title: "Geopolitical Risk Monitor",
    category: "Geopolitical",
    importance: "High",
    query: "Iran Israel Ukraine Russia Taiwan oil sanctions escalation",
    keywords: ["iran", "israel", "ukraine", "russia", "taiwan", "oil", "sanctions", "escalation", "shipping", "ceasefire"],
    affectedMarkets: ["BTC breaks ATH this quarter", "Oil closes above $90 in 2026", "Fed cuts rates at next meeting", "Risk assets rally this quarter"],
    narratives: ["Geopolitical risk", "Energy security", "Risk-off liquidity"],
    watchNext: ["official government statements", "energy prices", "shipping disruptions", "Treasury yields", "BTC liquidity"],
    why: "Geopolitical shocks can move energy inflation, dollar liquidity, and crypto risk appetite before scheduled macro data confirms the impact.",
    historicalImpact: ["Escalation headlines have previously lifted oil-risk premiums and pressured high-beta crypto.", "Energy shocks can complicate rate-cut pricing when inflation expectations rise.", "Ceasefire confirmations can unwind risk-off positioning quickly."],
    reactions: ["Higher oil-volatility pricing", "Risk-off pressure on crypto beta", "Defensive rotation in macro-linked markets"],
  },
  {
    title: "Fed And Macro Repricing",
    category: "Macro / Rates",
    importance: "Critical",
    query: "Federal Reserve FOMC Powell inflation CPI payrolls rates yields",
    keywords: ["federal reserve", "fomc", "powell", "inflation", "cpi", "pce", "payrolls", "jobless", "rates", "yields"],
    affectedMarkets: ["Fed cuts rates at next meeting", "BTC breaks ATH this quarter", "10Y yield closes above 4.75%", "US recession in 2026"],
    narratives: ["Fed path", "Inflation persistence", "Labor market"],
    watchNext: ["Fed speeches", "CPI/PCE details", "jobless claims", "Treasury auction tails", "dollar liquidity"],
    why: "Fed and inflation headlines directly reprice liquidity expectations, which can dominate crypto-native catalysts.",
    historicalImpact: ["Hot inflation surprises have raised yields and compressed crypto upside.", "Soft labor data can increase rate-cut probability and support risk assets.", "Hawkish Fed commentary can reverse risk rallies even without a policy decision."],
    reactions: ["Rate-cut probability repricing", "Treasury yield volatility", "BTC implied-volatility expansion"],
  },
  {
    title: "BTC ETH SOL ETF Developments",
    category: "ETF / Regulation",
    importance: "High",
    query: "Bitcoin Ethereum Solana ETF SEC approval filing issuer flow",
    keywords: ["bitcoin", "btc", "ethereum", "eth", "solana", "sol", "etf", "sec", "approval", "filing", "issuer", "flow"],
    affectedMarkets: ["SOL ETF approved in 2026", "Crypto ETF expansion in 2026", "BTC breaks ATH this quarter", "ETH ETF flows accelerate"],
    narratives: ["ETF approval cycle", "Institutional crypto access", "US crypto regulation"],
    watchNext: ["SEC filings", "issuer amendments", "BTC ETF flows", "ETH ETF flows", "SOL ETF review windows"],
    why: "Regulatory and ETF headlines can rapidly move approval probabilities, issuer expectations, and crypto liquidity.",
    historicalImpact: ["ETF filing updates have previously pulled liquidity into adjacent approval markets.", "Regulatory clarity can broaden institutional crypto participation.", "Enforcement headlines can narrow risk appetite across altcoin markets."],
    reactions: ["Higher attention in ETF probability markets", "Rotation into affected tokens", "Regulatory-risk repricing"],
  },
  {
    title: "Major Crypto Regulation",
    category: "Crypto Regulation",
    importance: "High",
    query: "SEC CFTC Congress stablecoin crypto market structure regulation enforcement",
    keywords: ["sec", "cftc", "congress", "stablecoin", "crypto", "market structure", "regulation", "enforcement", "bill"],
    affectedMarkets: ["Stablecoin bill passes in 2026", "Crypto market structure bill passes", "BTC breaks ATH this quarter", "Crypto ETF expansion in 2026"],
    narratives: ["US crypto regulation", "Stablecoin policy", "Institutional adoption"],
    watchNext: ["committee schedules", "agency statements", "bill text", "issuer compliance updates", "court deadlines"],
    why: "Crypto policy headlines can change institutional participation assumptions and regulatory-risk discounts across tokens.",
    historicalImpact: ["Constructive policy headlines have supported exchange and token beta.", "Enforcement actions can pressure liquidity and widen regulatory-risk premia.", "Stablecoin clarity can improve market-structure confidence."],
    reactions: ["Regulatory-risk repricing", "Exchange-token sensitivity", "Stablecoin-market attention"],
  },
  {
    title: "Major Token And Liquidity Events",
    category: "Token / Liquidity",
    importance: "High",
    query: "token unlock airdrop staking liquidity crypto treasury sale bitcoin ethereum solana",
    keywords: ["token unlock", "unlock", "airdrop", "staking", "liquidity", "treasury", "sale", "bitcoin", "ethereum", "solana"],
    affectedMarkets: ["BTC breaks ATH this quarter", "SOL outperforms ETH this quarter", "Crypto market liquidity tightens", "Altcoin rotation accelerates"],
    narratives: ["Token supply", "Liquidity rotation", "Crypto beta"],
    watchNext: ["unlock calendars", "issuer treasury wallets", "staking queues", "stablecoin supply", "spot/perp basis"],
    why: "Token supply events and liquidity rotations can move crypto prediction markets even without a new macro catalyst.",
    historicalImpact: ["Large unlocks can pressure affected assets when liquidity is thin.", "Airdrop and staking headlines can redirect attention into ecosystem markets.", "Stablecoin supply expansion can support crypto beta."],
    reactions: ["Token-specific volatility", "Liquidity rotation", "Higher derivatives attention"],
  },
  {
    title: "Exchange And Liquidity Events",
    category: "Crypto Liquidity",
    importance: "High",
    query: "Hyperliquid Binance Coinbase Kraken Tether USDC exchange outage hack liquidity reserves flows",
    keywords: ["hyperliquid", "binance", "coinbase", "kraken", "bybit", "okx", "tether", "usdc", "exchange", "outage", "hack", "reserves", "withdrawal", "flow"],
    affectedMarkets: ["BTC breaks ATH this quarter", "Major exchange outage in 2026", "Stablecoin depeg in 2026", "Crypto market liquidity tightens"],
    narratives: ["Exchange stability", "Stablecoin liquidity", "Market structure", "Hyperliquid flows"],
    watchNext: ["Hyperliquid open interest", "exchange status pages", "reserve attestations", "stablecoin redemptions", "funding rates"],
    why: "Exchange and stablecoin shocks can affect trading access, liquidity depth, and forced-risk reduction across crypto markets.",
    historicalImpact: ["Exchange stress has previously widened spreads and reduced risk appetite.", "Stablecoin redemption waves can pressure crypto liquidity.", "Resolved outages often normalize pricing faster than solvency concerns."],
    reactions: ["Wider crypto spreads", "Lower leverage appetite", "Stablecoin-risk repricing"],
  },
  {
    title: "Nvidia And Semiconductor Catalyst",
    category: "Corporate / AI",
    importance: "High",
    query: "Nvidia semiconductor chips AI infrastructure earnings guidance capex AMD TSMC Broadcom",
    keywords: ["nvidia", "nvda", "semiconductor", "chips", "gpu", "ai infrastructure", "data center", "earnings", "guidance", "capex", "amd", "tsmc", "broadcom"],
    affectedMarkets: ["Nvidia market cap above $5T", "AI regulation bill passes in 2026", "AI compute capex accelerates", "Risk assets rally this quarter"],
    narratives: ["AI capex", "Semiconductor supply", "Risk appetite"],
    watchNext: ["NVDA guidance", "hyperscaler capex", "export controls", "chip supply", "AI policy headlines"],
    why: "AI and semiconductor news can spill into broader equity risk appetite and AI-linked prediction markets.",
    historicalImpact: ["Strong AI-capex guidance has lifted attention across compute and infrastructure markets.", "Export-control headlines can hit semiconductor beta and broader risk sentiment.", "AI earnings cycles matter most for crypto when macro liquidity is supportive."],
    reactions: ["AI-linked market attention", "Equity-risk spillover", "Compute-policy repricing"],
  },
  {
    title: "OpenAI Anthropic And Model Releases",
    category: "AI Companies / Models",
    importance: "High",
    query: "OpenAI Anthropic Google DeepMind Meta AI model release agent benchmark partnership",
    keywords: ["openai", "anthropic", "deepmind", "meta ai", "model", "agent", "benchmark", "partnership", "release"],
    affectedMarkets: ["OpenAI releases new frontier model", "AI agent adoption accelerates", "AI compute capex accelerates", "AI regulation bill passes in 2026"],
    narratives: ["Model release cycle", "Agent adoption", "AI platform competition"],
    watchNext: ["model launch posts", "benchmark disclosures", "enterprise partnerships", "developer adoption", "safety-policy updates"],
    why: "Major model and agent releases can shift expectations for AI adoption, compute demand, and regulation-sensitive markets.",
    historicalImpact: ["Frontier model launches have increased attention to compute and platform winners.", "Agent-product releases can move software automation narratives.", "Safety incidents can accelerate regulatory pressure."],
    reactions: ["AI market attention", "Compute-demand repricing", "Regulation probability movement"],
  },
  {
    title: "AI Regulation And Compute Policy",
    category: "AI Policy",
    importance: "High",
    query: "AI regulation compute policy export controls chips data center energy OpenAI Anthropic Nvidia",
    keywords: ["ai regulation", "compute policy", "export controls", "chips", "data center", "energy", "openai", "anthropic", "nvidia"],
    affectedMarkets: ["AI regulation bill passes in 2026", "AI compute capex accelerates", "Nvidia market cap above $5T", "US AI export controls expand"],
    narratives: ["AI regulation", "Compute policy", "Infrastructure constraints"],
    watchNext: ["export-control updates", "data-center approvals", "power-contract announcements", "agency guidance", "model-safety rules"],
    why: "Compute and AI-policy decisions can directly affect chip demand, data-center buildouts, and AI adoption probabilities.",
    historicalImpact: ["Export controls have moved semiconductor expectations quickly.", "Power and data-center constraints can cap AI infrastructure growth.", "Regulatory proposals can shift market probabilities before final rules."],
    reactions: ["Semiconductor beta repricing", "Infrastructure-market attention", "Policy-risk premium"],
  },
];

export async function getLiveMarketCatalysts(now = new Date()): Promise<LiveCatalystsPayload> {
  const refreshedAt = now.toISOString();
  const nextRefreshAt = new Date(now.getTime() + MARKET_EVENT_REFRESH_INTERVAL_MS).toISOString();
  const errors: string[] = [];
  const articles = await fetchPublicNewsArticles(errors);
  const catalysts: LiveCatalyst[] = [];

  for (const topic of TOPICS) {
    try {
      const catalyst = buildTopicCatalyst(topic, articles, now);
      if (catalyst) catalysts.push(catalyst);
    } catch (error) {
      errors.push(`${topic.title}: ${error instanceof Error ? error.message : "unknown error"}`);
    }
  }

  if (!catalysts.length) {
    return {
      status: "unavailable",
      label: "Live news unavailable",
      refreshedAt,
      nextRefreshAt,
      catalysts: [],
      errors: errors.length ? errors : ["No current source-backed catalyst articles returned."],
    };
  }

  return {
    status: "live",
    label: "Live news",
    refreshedAt,
    nextRefreshAt,
    catalysts: catalysts.sort((a, b) => importanceScore(b.importance) - importanceScore(a.importance)),
    errors,
  };
}

function buildTopicCatalyst(topic: CatalystTopic, articles: NewsArticle[], now: Date): LiveCatalyst | null {
  const currentArticles = articles
    .filter((article) => topicMatchesArticle(topic, article))
    .filter((article) => hoursBetween(new Date(article.publishedAt), now) <= 48)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 4);

  if (!currentArticles.length) return null;

  const lead = currentArticles[0];
  const timestamp = lead.publishedAt;
  const source = lead.source;
  const confidence = confidenceForNews(currentArticles, now);

  return {
    title: topic.title,
    category: topic.category,
    importance: confidence === "High" ? topic.importance : downgradeImportance(topic.importance),
    lastUpdate: timeAgo(timestamp, now),
    latestDevelopment: cleanTitle(lead.title),
    source,
    sourceUrl: lead.url,
    summary: buildSummary(topic, currentArticles),
    timestamp,
    confidence,
    timeline: currentArticles.map((article) => ({
      time: timeAgo(article.publishedAt, now),
      headline: cleanTitle(article.title),
      source: article.source,
      sourceUrl: article.url,
      timestamp: article.publishedAt,
    })),
    affectedMarkets: topic.affectedMarkets,
    oracleXAssessment: `${topic.category} catalyst sourced from current live-news coverage; confidence ${confidence.toLowerCase()} based on article recency and source breadth.`,
    why: topic.why,
    historicalImpact: topic.historicalImpact,
    reactions: topic.reactions,
    narratives: topic.narratives,
    flows: "Live source-backed catalyst only; wallet and flow confirmation should be checked in dedicated flow modules.",
    smartMoney: "No hardcoded smart-money reaction attached to live news.",
    watchNext: topic.watchNext,
  };
}

async function fetchPublicNewsArticles(errors: string[]) {
  const groups = await Promise.allSettled([
    ...RSS_FEEDS.map(fetchRssFeed),
    ...TOPICS.map(fetchTopicArticles),
  ]);
  return dedupeNewsArticles(groups.flatMap((result, index) => {
    if (result.status === "fulfilled") return result.value;
    const source = index < RSS_FEEDS.length ? RSS_FEEDS[index].source : `GDELT ${TOPICS[index - RSS_FEEDS.length].title}`;
    errors.push(`${source}: ${result.reason instanceof Error ? result.reason.message : "news unavailable"}`);
    return [];
  }));
}

async function fetchTopicArticles(topic: CatalystTopic): Promise<NewsArticle[]> {
  const articles = await fetchGdeltArticles(topic.query);
  return dedupeArticles(articles).map((article) => {
    const publishedAt = parseGdeltDate(article.seendate).toISOString();
    return {
      title: cleanTitle(article.title),
      url: article.url ?? "",
      publishedAt,
      source: sourceName(article),
    };
  }).filter((article) => article.title && article.url && new Date(article.publishedAt).getTime() > 0);
}

async function fetchRssFeed(feed: { source: string; url: string }): Promise<NewsArticle[]> {
  const response = await fetch(feed.url, {
    next: { revalidate: LIVE_CATALYST_REVALIDATE_SECONDS },
    headers: {
      Accept: "application/rss+xml, application/xml, text/xml",
      "User-Agent": "OracleX market events live catalyst monitor",
    },
  });

  if (!response.ok) throw new Error(`RSS returned ${response.status}`);
  const xml = await response.text();
  return parseRssItems(xml, feed.source);
}

function parseRssItems(xml: string, fallbackSource: string): NewsArticle[] {
  const itemBlocks = Array.from(xml.matchAll(/<item\b[\s\S]*?<\/item>/gi), (match) => match[0]);
  const entryBlocks = itemBlocks.length ? itemBlocks : Array.from(xml.matchAll(/<entry\b[\s\S]*?<\/entry>/gi), (match) => match[0]);

  return entryBlocks.flatMap((item) => {
    const title = decodeXml(textFromTag(item, "title"));
    const url = decodeXml(textFromTag(item, "link") || hrefFromLinkTag(item));
    const source = decodeXml(textFromTag(item, "source")) || fallbackSource;
    const dateValue = textFromTag(item, "pubDate") || textFromTag(item, "updated") || textFromTag(item, "published") || textFromTag(item, "dc:date");
    const publishedAt = parseFeedDate(dateValue);

    if (!title || !url || !publishedAt) return [];
    return [{ title, url, publishedAt, source }];
  });
}

function textFromTag(xml: string, tag: string) {
  const escaped = tag.replace(":", "\\:");
  const match = xml.match(new RegExp(`<${escaped}\\b[^>]*>([\\s\\S]*?)<\\/${escaped}>`, "i"));
  return stripCdata(match?.[1] ?? "").trim();
}

function hrefFromLinkTag(xml: string) {
  const match = xml.match(/<link\b[^>]*href=["']([^"']+)["'][^>]*\/?>/i);
  return match?.[1] ?? "";
}

function stripCdata(value: string) {
  return value.replace(/^<!\[CDATA\[/, "").replace(/\]\]>$/, "");
}

function decodeXml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function parseFeedDate(value: string) {
  if (!value) return null;
  const parsed = new Date(decodeXml(value));
  return Number.isFinite(parsed.getTime()) ? parsed.toISOString() : null;
}

function dedupeNewsArticles(articles: NewsArticle[]) {
  const seen = new Set<string>();
  return articles.filter((article) => {
    const key = article.url || article.title;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function topicMatchesArticle(topic: CatalystTopic, article: NewsArticle) {
  const haystack = `${article.title} ${article.source}`.toLowerCase();
  if (topic.title === "BTC ETH SOL ETF Developments") {
    return hasAny(haystack, ["bitcoin", "ethereum", "solana", "crypto", "stablecoin"]) && hasAny(haystack, ["etf", "sec", "cftc", "regulation", "approval", "filing"]);
  }
  if (topic.title === "Major Crypto Regulation") {
    return hasAny(haystack, ["crypto", "stablecoin", "bitcoin", "ethereum", "solana"]) && hasAny(haystack, ["sec", "cftc", "congress", "regulation", "bill", "enforcement"]);
  }
  if (topic.title === "Major Token And Liquidity Events") {
    return hasAny(haystack, ["bitcoin", "ethereum", "solana", "crypto", "token", "stablecoin"]) && hasAny(haystack, ["unlock", "airdrop", "staking", "liquidity", "treasury", "flow"]);
  }
  if (topic.title === "Exchange And Liquidity Events") {
    return hasAny(haystack, ["hyperliquid", "binance", "coinbase", "kraken", "bybit", "okx", "tether", "usdc", "stablecoin", "bitcoin", "crypto"]) && hasAny(haystack, ["exchange", "outage", "hack", "liquidity", "reserves", "withdrawal", "flow"]);
  }
  if (topic.title === "OpenAI Anthropic And Model Releases") {
    return hasAny(haystack, ["openai", "anthropic", "deepmind", "meta ai", "model", "agent"]) && hasAny(haystack, ["release", "launch", "benchmark", "partnership", "agent", "model"]);
  }
  if (topic.title === "AI Regulation And Compute Policy") {
    return hasAny(haystack, ["ai", "artificial intelligence", "nvidia", "openai", "anthropic", "chip", "compute"]) && hasAny(haystack, ["regulation", "policy", "export control", "data center", "energy", "infrastructure"]);
  }
  return topic.keywords.some((keyword) => haystack.includes(keyword));
}

function hasAny(value: string, keywords: string[]) {
  return keywords.some((keyword) => value.includes(keyword));
}

async function fetchGdeltArticles(query: string) {
  const url = new URL("https://api.gdeltproject.org/api/v2/doc/doc");
  url.searchParams.set("query", `${query} sourcelang:english`);
  url.searchParams.set("mode", "artlist");
  url.searchParams.set("format", "json");
  url.searchParams.set("sort", "hybridrel");
  url.searchParams.set("maxrecords", "25");
  url.searchParams.set("timespan", "48h");

  const response = await fetch(url, {
    next: { revalidate: LIVE_CATALYST_REVALIDATE_SECONDS },
    headers: { Accept: "application/json" },
  });

  if (!response.ok) throw new Error(`GDELT returned ${response.status}`);
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    const text = await response.text();
    throw new Error(`GDELT returned non-JSON response: ${text.slice(0, 120)}`);
  }
  const data = (await response.json()) as GdeltResponse;
  return data.articles ?? [];
}

function dedupeArticles(articles: GdeltArticle[]) {
  const seen = new Set<string>();
  return articles.filter((article) => {
    const key = article.url ?? article.title ?? "";
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function parseGdeltDate(value: string | undefined) {
  if (!value) return new Date(0);
  const normalized = value.includes("T") ? value : `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}T${value.slice(8, 10)}:${value.slice(10, 12)}:${value.slice(12, 14)}Z`;
  const parsed = new Date(normalized);
  return Number.isFinite(parsed.getTime()) ? parsed : new Date(0);
}

function hoursBetween(date: Date, now: Date) {
  return Math.max(0, (now.getTime() - date.getTime()) / (60 * 60 * 1000));
}

function timeAgo(timestamp: string, now: Date) {
  const diffMs = Math.max(0, now.getTime() - new Date(timestamp).getTime());
  const minutes = Math.max(1, Math.round(diffMs / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

function sourceName(article: GdeltArticle) {
  return titleCase((article.domain ?? "Live source").replace(/^www\./, ""));
}

function titleCase(value: string) {
  return value
    .split(/[.\s-]+/)
    .filter(Boolean)
    .slice(0, 3)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function cleanTitle(value: string | undefined) {
  return (value ?? "Live news update").replace(/\s+/g, " ").trim();
}

function buildSummary(topic: CatalystTopic, articles: NewsArticle[]) {
  const sources = Array.from(new Set(articles.map((article) => article.source))).slice(0, 3).join(", ");
  return `${topic.category} coverage is active across ${sources}. Lead item: ${cleanTitle(articles[0]?.title)}`;
}

function confidenceForNews(articles: NewsArticle[], now: Date): Confidence {
  const sources = new Set(articles.map((article) => article.source));
  const newestHours = Math.min(...articles.map((article) => hoursBetween(new Date(article.publishedAt), now)));
  if (articles.length >= 3 && sources.size >= 2 && newestHours <= 6) return "High";
  if (articles.length >= 2 && newestHours <= 18) return "Medium";
  return "Low";
}

function confidenceFor(articles: GdeltArticle[]): Confidence {
  const domains = new Set(articles.map((article) => article.domain).filter(Boolean));
  const newestHours = Math.min(...articles.map((article) => hoursBetween(parseGdeltDate(article.seendate), new Date())));
  if (articles.length >= 3 && domains.size >= 2 && newestHours <= 6) return "High";
  if (articles.length >= 2 && newestHours <= 18) return "Medium";
  return "Low";
}

function downgradeImportance(importance: MarketEventImportance): MarketEventImportance {
  if (importance === "Critical") return "High";
  if (importance === "High") return "Medium";
  return importance;
}

function importanceScore(importance: MarketEventImportance) {
  if (importance === "Critical") return 4;
  if (importance === "High") return 3;
  if (importance === "Medium") return 2;
  return 1;
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
