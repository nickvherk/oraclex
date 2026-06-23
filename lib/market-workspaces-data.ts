export const marketCategories = ["crypto", "politics", "macro", "ai", "sports"] as const;

export type MarketCategory = (typeof marketCategories)[number];
export type MarketBias = "Bullish" | "Bearish" | "Neutral";
export type SignalSeverity = "Informational" | "Elevated" | "High Conviction" | "Critical";

export type MarketWorkspaceMarket = {
  id: string;
  rowKind?: "prediction" | "catalyst";
  title: string;
  categoryLabel: string;
  probability: number;
  oracleProbability: number;
  volume: string;
  smartMoneyBias: MarketBias;
  signalSeverity: SignalSeverity;
  lastUpdate: string;
  smartMoneySummary: string;
  narrativeContext: string;
  relatedFlows: string[];
  aiInterpretation: string;
  watchNext: string;
  source?: string;
  sourceUrl?: string;
  affectedMarkets?: string[];
  oracleRead?: string;
  importance?: string;
};

export type MarketWorkspaceSignal = {
  time: string;
  title: string;
  detail: string;
  value: string;
  bias: MarketBias;
  severity: SignalSeverity;
};

export type MarketWorkspaceData = {
  slug: MarketCategory;
  title: string;
  description: string;
  badge: string;
  status?: "live" | "empty" | "unavailable";
  lastUpdatedAt?: string;
  nextRefreshAt?: string;
  refreshCadenceHours?: number;
  sources?: string[];
  sourceNote?: string;
  metrics: {
    activeMarkets: string;
    signalScore: string;
    smartMoneyActivity: string;
    narrativeMomentum: string;
  };
  markets: MarketWorkspaceMarket[];
  feed: MarketWorkspaceSignal[];
  signalCards: {
    title: string;
    value: string;
    detail: string;
    bias: MarketBias;
  }[];
  insights: {
    moving: string;
    matters: string;
    confirmation: string;
    interpretation: string;
  };
};

export function isMarketCategory(value: string): value is MarketCategory {
  return marketCategories.includes(value as MarketCategory);
}

export const marketWorkspaceData: Record<MarketCategory, MarketWorkspaceData> = {
  crypto: createWorkspaceShell({
    slug: "crypto",
    title: "Crypto Market Workspace",
    description: "Live prediction-market intelligence for crypto catalysts, ETF developments, major token events, and exchange/liquidity developments.",
  }),
  politics: createWorkspaceShell({
    slug: "politics",
    title: "Politics Market Workspace",
    description: "Live election, policy, geopolitical, and regulatory prediction-market intelligence with source quality and event-window tracking.",
  }),
  macro: createWorkspaceShell({
    slug: "macro",
    title: "Macro Market Workspace",
    description: "Live Fed, CPI, PPI, Treasury, labor-market, liquidity, and macro catalyst intelligence.",
  }),
  ai: createWorkspaceShell({
    slug: "ai",
    title: "AI Market Workspace",
    description: "Live Nvidia, OpenAI, Anthropic, AI regulation, compute policy, and AI prediction-market intelligence.",
  }),
  sports: createWorkspaceShell({
    slug: "sports",
    title: "Sports Market Workspace",
    description: "Live active sports market, odds movement, injury/news, and sharp-money intelligence. Completed games are not shown as active.",
  }),
};

function createWorkspaceShell({
  slug,
  title,
  description,
}: {
  slug: MarketCategory;
  title: string;
  description: string;
}): MarketWorkspaceData {
  return {
    slug,
    title,
    description,
    badge: "Live category monitor",
    status: "empty",
    sources: ["live market data", "news feed", "catalyst feed", "OracleX analysis"],
    sourceNote: "No active markets currently tracked.",
    metrics: {
      activeMarkets: "0",
      signalScore: "0.0",
      smartMoneyActivity: "$0",
      narrativeMomentum: "0%",
    },
    markets: [],
    feed: [],
    signalCards: [{ title: "Active coverage", value: "None", detail: "No active markets currently tracked.", bias: "Neutral" }],
    insights: {
      moving: "No active markets currently tracked.",
      matters: "OracleX suppresses stale demo content instead of presenting completed events as active.",
      confirmation: "No current live market or catalyst confirmation is available for this category.",
      interpretation: "Wait for new active markets or current source-backed catalysts before treating this category as actionable.",
    },
  };
}
