import "server-only";

import {
  mockClusters,
  mockConsensusInsights,
  mockQuestionExamples,
  mockWalletIntelligenceData,
  type ConsensusInsight,
  type WalletCategory,
  type WalletCluster,
  type WalletIntelligenceData,
  type WalletRecord,
  type WalletSignalType,
} from "@/lib/wallet-intelligence-data";
import { type WalletPosition, type WalletProfile } from "@/lib/wallet-profile-data";

const FALCON_URL = "https://narrative.agent.heisenberg.so/api/v2/semantic/retrieve/parameterized";
const MAX_PAGE_LIMIT = 200;
const FALCON_LEADERBOARD_PAGE_SIZE = 50;
const DEFAULT_WALLET_LIMIT = 200;

type FalconAgentId = 556 | 569 | 574 | 575 | 579 | 581 | 584;
type FalconParams = Record<string, string | null | undefined>;
type FalconResult = Record<string, unknown>;
type DataQuality = "live" | "derived" | "fallback" | "unavailable";

type FalconCallOptions = {
  agentId: FalconAgentId;
  params: FalconParams;
  limit?: number;
  offset?: number;
  label: string;
};

type FalconCallResult = {
  label: string;
  ok: boolean;
  status: number | null;
  count: number;
  results: FalconResult[];
  error?: string;
};

export type PredictionMarketAnalyticsData = WalletIntelligenceData & {
  smartMoneyConsensus: SmartMoneyConsensusCard[];
  sourceStatus: {
    source: DataQuality;
    label: string;
    liveFields: string[];
    derivedFields: string[];
    fallbackFields: string[];
    unavailableFields: string[];
  };
  pagination: {
    limit: number;
    offset: number;
    loadedWallets: number;
    offsetWorking: boolean;
    hasMore: boolean;
  };
};

export type SmartMoneyConsensusCard = {
  market: string;
  cohort: string;
  alignedPercent: string;
  side: "YES" | "NO";
  netExposure: string;
  timeframe: string;
  direction: string;
  evidenceStrength: "High" | "Medium";
  alignedWallets: string;
  category: WalletCategory;
  group: string;
  topWalletTags: string[];
  why: string;
  source: DataQuality;
};

export type PredictionMarketWalletProfile = WalletProfile & {
  sourceStatus: PredictionMarketAnalyticsData["sourceStatus"];
  recentTrades: WalletPosition[];
  positionHistory: { label: string; value: string }[];
};

export class FalconAnalyticsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FalconAnalyticsError";
  }
}

export async function getPredictionMarketAnalytics({ limit = DEFAULT_WALLET_LIMIT, offset = 0 }: { limit?: number; offset?: number } = {}): Promise<PredictionMarketAnalyticsData> {
  const debug: FalconCallResult[] = [];
  const walletLimit = clamp(Math.round(limit), 1, DEFAULT_WALLET_LIMIT);
  const walletOffset = Math.max(0, Math.round(offset));

  if (!process.env.POLYMARKET_ANALYTICS_API_KEY) {
    const fallback = fallbackAnalytics("POLYMARKET_ANALYTICS_API_KEY is not configured.");
    logServerDebug("prediction-market-analytics", debug, fallback);
    return fallback;
  }

  const [hScorePages, leaderboardPages, marketInsights] = await Promise.all([
    falconSinglePageCall({
      label: "h-score-leaderboard",
      agentId: 584,
      params: {
        min_win_rate_15d: "0.45",
        max_win_rate_15d: "0.95",
        min_roi_15d: "0",
        min_pnl_15d: "0",
        min_total_trades_15d: "30",
        max_total_trades_15d: "5000",
        sort_by: "pnl",
      },
      limit: walletLimit,
      offset: 0,
    }),
    falconPagedCall({
      label: "polymarket-leaderboard-30d",
      agentId: 579,
      params: { wallet_address: "ALL", leaderboard_period: "30d" },
      limit: walletLimit,
      offset: walletOffset,
    }),
    falconCall({
      label: "polymarket-market-insights",
      agentId: 575,
      params: {
        condition_id: "ALL",
        min_volume_24h: "10000",
        min_liquidity_percentile: "75",
        volume_trend: "UP",
        min_top1_wallet_pct: "0",
        max_unique_traders_7d: "0",
      },
      limit: 50,
    }),
  ]);

  debug.push(...hScorePages.calls, ...leaderboardPages.calls, marketInsights);

  const liveWallets = normalizeWallets(hScorePages.results, leaderboardPages.results);
  const hasLiveWallets = liveWallets.length > 0;
  validateAnalyticsWalletPair(liveWallets);
  const wallets = hasLiveWallets ? liveWallets : mockWalletIntelligenceData.wallets;
  const consensus = normalizeConsensus(marketInsights.results, wallets);
  const analytics: PredictionMarketAnalyticsData = {
    stats: {
      trackedWalletUniverse: Math.max(mockWalletIntelligenceData.stats.trackedWalletUniverse, wallets.length),
      smartMoneyWallets: hasLiveWallets ? wallets.length : mockWalletIntelligenceData.stats.smartMoneyWallets,
      activeWallets: hasLiveWallets ? wallets.filter((wallet) => wallet.activeMarkets > 0).length : mockWalletIntelligenceData.stats.activeWallets,
    },
    wallets,
    consensusInsights: consensus.consensusInsights,
    clusters: consensus.clusters,
    questionExamples: mockQuestionExamples,
    smartMoneyConsensus: consensus.smartMoneyConsensus,
    source: hasLiveWallets ? "polymarket-analytics" : "mock",
    updatedAt: new Date().toISOString(),
    sourceStatus: {
      source: hasLiveWallets ? "live" : "fallback",
      label: hasLiveWallets ? "Live Falcon/Heisenberg data with derived OracleX analytics" : "Demo fallback data. Live Falcon data unavailable.",
      liveFields: hasLiveWallets ? ["wallet addresses", "trader rankings", "PnL", "ROI", "win rate", "volume", "active markets", "h-score"] : [],
      derivedFields: hasLiveWallets ? ["market exposure", "cohort summaries", "smart money consensus", "recent position change labels"] : [],
      fallbackFields: hasLiveWallets ? ["category labels where Falcon omits market taxonomy"] : ["all analytics fields"],
      unavailableFields: [],
    },
    pagination: {
      limit: walletLimit,
      offset: hasLiveWallets ? 0 : walletOffset,
      loadedWallets: wallets.length,
      offsetWorking: hScorePages.offsetWorking,
      hasMore: hScorePages.hasMore,
    },
  };

  logServerDebug("prediction-market-analytics", debug, analytics);
  return analytics;
}

export async function getPredictionMarketWalletProfile(wallet: string): Promise<PredictionMarketWalletProfile> {
  const debug: FalconCallResult[] = [];
  const requestedWallet = wallet.toLowerCase();

  if (!process.env.POLYMARKET_ANALYTICS_API_KEY) {
    const profile = unavailableWalletProfile(wallet, "POLYMARKET_ANALYTICS_API_KEY is not configured.");
    logServerDebug("prediction-market-wallet-profile", debug, profile);
    return profile;
  }

  const today = new Date();
  const start = new Date(today);
  start.setDate(start.getDate() - 90);

  const [wallet360, pnl, trades, rank] = await Promise.all([
    falconCall({ label: "wallet-360", agentId: 581, params: { proxy_wallet: wallet, window_days: "15" }, limit: 20 }),
    falconCall({
      label: "wallet-pnl-90d",
      agentId: 569,
      params: { wallet, granularity: "1d", start_time: toDateParam(start), end_time: toDateParam(today) },
      limit: 100,
    }),
    falconCall({ label: "wallet-trades", agentId: 556, params: { proxy_wallet: wallet, condition_id: "ALL" }, limit: 50 }),
    falconCall({ label: "wallet-leaderboard-rank", agentId: 579, params: { wallet_address: wallet, leaderboard_period: "30d" }, limit: 10 }),
  ]);

  debug.push(wallet360, pnl, trades, rank);

  const walletStats = wallet360.results.find((row) => rowMatchesWallet(row, requestedWallet));
  const rankStats = rank.results.find((row) => rowMatchesWallet(row, requestedWallet));
  const matchingTrades = trades.results.filter((row) => rowMatchesWallet(row, requestedWallet));
  const hasLiveStats = Boolean(walletStats);
  const liveTrades = matchingTrades.length > 0;
  const category = hasLiveStats ? categoryFromText(String(walletStats?.performance_by_category ?? "")) : "Unavailable";
  const volume = optionalNumber(walletStats?.total_invested ?? rankStats?.total_invested);
  const roiSource = optionalNumber(walletStats?.roi ?? rankStats?.roi);
  const roi = roiSource === null ? null : normalizeRoi(roiSource);
  const pnlValue = optionalNumber(walletStats?.total_pnl ?? rankStats?.total_pnl);
  const winRateSource = optionalNumber(walletStats?.win_rate ?? rankStats?.win_rate);
  const winRate = winRateSource === null ? null : normalizeWinRate(winRateSource);
  const marketCount = optionalNumber(walletStats?.markets_traded ?? walletStats?.num_markets_traded ?? rankStats?.markets_traded);
  const confidence = optionalNumber(walletStats?.statistical_confidence);
  const profile: PredictionMarketWalletProfile = {
    wallet,
    tag: hasLiveStats ? `Rank #${numberFromAny(rankStats?.rank, 0) || "Live"}` : "Unavailable",
    category,
    cohort: hasLiveStats ? `${category} live wallet profile` : "Unavailable",
    roi,
    pnl: pnlValue,
    winRate,
    volume,
    openPositions: marketCount,
    conviction: confidence === null ? null : clamp(Math.round(confidence * 100), 1, 99),
    exposure: hasLiveStats ? `${formatMoney(volume)} invested / ${formatMoney(pnlValue)} realized PnL` : "Unavailable",
    interpretation: hasLiveStats
      ? `Live Wallet 360 shows ${formatMoney(pnlValue)} realized PnL, ${formatPercent(roi)} ROI, ${formatPercent(winRate, 0)} win rate, and ${formatCount(marketCount)} active or recently traded markets. Recent position rows are live only when Falcon returns trades for this exact proxy wallet.`
      : "Not provided by Falcon endpoint",
    positions: [],
    recentChanges: liveTrades ? matchingTrades.slice(0, 6).map(tradeToChange) : ["No recent trades returned by Falcon for this wallet."],
    marketExposure: [
      { label: "Realized PnL", value: formatMoney(pnlValue), tone: (pnlValue ?? 0) >= 0 ? "text-emerald-200" : "text-red-200" },
      { label: "Volume", value: formatMoney(volume), tone: "text-blue-100" },
      { label: "Trade count", value: formatCount(optionalNumber(walletStats?.total_trades ?? rankStats?.total_trades)), tone: "text-slate-300" },
    ],
    relatedWallets: [],
    evidence: [
      hasLiveStats ? "Wallet 360 metrics loaded from Falcon/Heisenberg." : "Wallet 360 unavailable; no wallet-specific fallback data shown.",
      liveTrades ? `${matchingTrades.length} matching recent trades loaded for this wallet.` : "No recent trades returned by Falcon for this wallet.",
      pnl.results.length > 0 ? `${pnl.results.length} PnL history rows loaded.` : "PnL history unavailable or empty.",
      "Related wallets unavailable.",
    ],
    performance: [
      { label: "ROI", value: formatPercent(roi) },
      { label: "Win rate", value: formatPercent(winRate, 0) },
      { label: "Risk level", value: String(walletStats?.risk_level ?? "unavailable") },
      { label: "Markets traded", value: formatCount(marketCount) },
    ],
    recentTrades: liveTrades ? tradesToPositions(matchingTrades.slice(0, 10)) : [],
    positionHistory: pnl.results.length ? pnl.results.slice(0, 20).map(pnlToHistoryPoint) : [{ label: "PnL history", value: "unavailable" }],
    sourceStatus: {
      source: hasLiveStats ? "live" : "fallback",
      label: hasLiveStats ? "Live Wallet 360 with derived display fields" : "Wallet-specific Falcon profile unavailable.",
      liveFields: hasLiveStats ? ["wallet address", "rank", "total PnL", "ROI", "win rate", "volume", "market count", "h-score", ...(liveTrades ? ["recent trades"] : [])] : [],
      derivedFields: hasLiveStats ? ["market exposure summary", "profile interpretation"] : [],
      fallbackFields: [],
      unavailableFields: [
        "active positions",
        "related wallets",
        ...(liveTrades ? [] : ["recent trades"]),
        ...(pnl.results.length ? [] : ["position history time series"]),
      ],
    },
  };

  validateWalletProfile(profile, requestedWallet, liveTrades);
  logServerDebug("prediction-market-wallet-profile", debug, profile);
  return profile;
}

export async function falconSemanticRetrieveWithDebug(query: string) {
  const result = await falconCall({
    label: "legacy-semantic-query",
    agentId: 584,
    params: {
      min_win_rate_15d: "0.45",
      max_win_rate_15d: "0.95",
      min_roi_15d: "0",
      min_pnl_15d: "0",
      min_total_trades_15d: "30",
      max_total_trades_15d: "5000",
      sort_by: query.toLowerCase().includes("roi") ? "roi" : "pnl",
    },
    limit: 10,
  });

  if (!result.ok) {
    throw new FalconAnalyticsError(result.error ?? "Falcon semantic retrieve failed.");
  }

  return {
    data: { results: result.results },
    debug: {
      apiKeyExists: Boolean(process.env.POLYMARKET_ANALYTICS_API_KEY),
      apiKeyLength: process.env.POLYMARKET_ANALYTICS_API_KEY?.length ?? 0,
      endpointUrl: FALCON_URL,
      method: "POST",
      attempts: [result],
      success: true,
      workingRequestBodyFormat: "parameterized",
    },
  };
}

export async function falconSemanticRetrieve(query: string): Promise<unknown> {
  const result = await falconSemanticRetrieveWithDebug(query);
  return result.data;
}

async function falconCall({ agentId, params, limit = 50, offset = 0, label }: FalconCallOptions): Promise<FalconCallResult> {
  const apiKey = process.env.POLYMARKET_ANALYTICS_API_KEY;

  if (!apiKey) {
    return { label, ok: false, status: null, count: 0, results: [], error: "POLYMARKET_ANALYTICS_API_KEY is not configured." };
  }

  const body = {
    agent_id: agentId,
    params: omitEmpty(params),
    pagination: { limit: Math.min(limit, MAX_PAGE_LIMIT), offset },
    formatter_config: { format_type: "raw" },
  };

  try {
    const response = await fetch(FALCON_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const text = await response.text();
    const payload = parseJson(text);
    const results = extractResults(payload);
    const error = response.ok ? undefined : extractError(payload) ?? `Falcon request failed with ${response.status}`;

    return { label, ok: response.ok, status: response.status, count: results.length, results, error };
  } catch (error) {
    return { label, ok: false, status: null, count: 0, results: [], error: error instanceof Error ? error.message : "Unknown Falcon request error" };
  }
}

async function falconPagedCall(options: FalconCallOptions & { limit: number; offset: number }) {
  const results: FalconResult[] = [];
  const calls: FalconCallResult[] = [];
  let nextOffset = options.offset;

  while (results.length < options.limit) {
    const pageLimit = Math.min(FALCON_LEADERBOARD_PAGE_SIZE, options.limit - results.length);
    const call = await falconCall({ ...options, limit: pageLimit, offset: nextOffset, label: `${options.label}@${nextOffset}` });
    calls.push(call);
    results.push(...call.results);

    if (!call.ok || call.results.length < pageLimit) break;
    nextOffset += pageLimit;
  }

  return { results: dedupeRowsByWallet(results), calls };
}

async function falconSinglePageCall(options: FalconCallOptions & { limit: number; offset: number }) {
  const call = await falconCall(options);
  return {
    results: dedupeRowsByWallet(call.results),
    calls: [call],
    offsetWorking: false,
    hasMore: false,
  };
}

function normalizeWallets(hScoreRows: FalconResult[], leaderboardRows: FalconResult[]): WalletRecord[] {
  const leaderboardByWallet = new Map(leaderboardRows.map((row) => [lowerString(row.address), row]));

  return hScoreRows
    .map((row, index): WalletRecord | null => {
      const wallet = lowerString(row.wallet);
      if (!wallet) return null;
      const leaderboard = leaderboardByWallet.get(wallet);
      const rank = numberFromAny(row.leaderboard_rank ?? leaderboard?.rank, index + 1);
      const pnl = numberFromAny(row.total_pnl_15d ?? leaderboard?.total_pnl, 0);
      const roi = normalizeRoi(numberFromAny(row.roi_pct_15d ?? leaderboard?.roi, 0));
      const winRate = normalizeWinRate(numberFromAny(row.win_rate_pct_15d ?? leaderboard?.win_rate, 0));
      const volume = Math.max(numberFromAny(row.total_volume_15d ?? leaderboard?.total_invested, 0), Math.abs(pnl));
      const activeMarkets = numberFromAny(row.markets_traded_15d ?? leaderboard?.markets_traded, 0);
      const totalPositions = numberFromAny(row.total_trades_15d ?? leaderboard?.total_trades, activeMarkets);
      const totalWins = Math.round(totalPositions * (winRate / 100));
      const totalLosses = Math.max(0, totalPositions - totalWins);
      const category = categoryFromText(`${row.tier ?? ""} ${row.trajectory ?? ""}`);
      const conviction = clamp(Math.round(numberFromAny(row.h_score, 0)), 1, 99);

      return {
        rank,
        wallet,
        tag: `Rank #${rank}`,
        category,
        group: `${category} Live H-Score Wallets`,
        pnl,
        pnlSource: "live",
        roi,
        winRate,
        volume,
        bias: pnl >= 0 ? "YES-heavy" : "Contrarian",
        conviction,
        earlySignal: clamp(Math.round(conviction * 0.88 + activeMarkets), 1, 99),
        smartMoneyRating: clamp(Math.round(conviction * 0.8 + winRate * 0.2), 1, 99),
        divergence: clamp(Math.round(Math.abs(roi) / 10 + activeMarkets), 1, 99),
        activeMarkets,
        lastPosition: `${formatMoney(pnl)} realized PnL over 15D (derived)`,
        lastActive: "live 15D window",
        signalType: signalTypeFromTrajectory(String(row.trajectory ?? "")),
        exposure: `${formatMoney(volume)} volume / ${formatMoney(pnl)} PnL`,
        specialization: `${row.tier ?? "Ranked"} H-Score trader. Market/category taxonomy unavailable from leaderboard endpoint.`,
        accuracy: winRate,
        cluster: `${row.tier ?? "Live"} ${row.trajectory ?? "ranked"} traders`,
        marketType: "Binary",
        positionSize: Math.max(numberFromAny(row.total_volume_15d, 0), numberFromAny(leaderboard?.avg_trade_size, 0)),
        totalPositions,
        totalWins,
        totalLosses,
        entries: [`H-Score ${row.h_score ?? "unavailable"}`, `${totalPositions} trades`, `${activeMarkets} markets traded`],
        activeMarketsList: [`${activeMarkets} markets traded (market names unavailable)`],
        interpretation: `Live H-Score trader with ${formatMoney(pnl)} 15D PnL, ${roi.toFixed(1)}% ROI, ${winRate}% win rate, and ${activeMarkets} markets traded. Category and position labels are derived because the leaderboard endpoint does not include market taxonomy.`,
      };
    })
    .filter((wallet): wallet is WalletRecord => Boolean(wallet));
}

function dedupeRowsByWallet(rows: FalconResult[]) {
  const seen = new Set<string>();
  return rows.filter((row) => {
    const wallet = lowerString(row.wallet ?? row.address ?? row.proxy_wallet ?? row.wallet_address);
    if (!wallet) return true;
    if (seen.has(wallet)) return false;
    seen.add(wallet);
    return true;
  });
}

function normalizeConsensus(marketRows: FalconResult[], wallets: WalletRecord[]) {
  if (!marketRows.length) {
    return {
      consensusInsights: mockConsensusInsights,
      clusters: mockClusters,
      smartMoneyConsensus: fallbackSmartMoneyConsensus(),
    };
  }

  const topWallets = wallets.slice(0, 20);
  const totalVolume = topWallets.reduce((sum, wallet) => sum + wallet.volume, 0);
  const aligned = topWallets.filter((wallet) => wallet.bias === "YES-heavy").length;
  const alignedPercent = topWallets.length ? Math.round((aligned / topWallets.length) * 100) : 0;
  const firstMarket = marketRows[0];
  const marketName = titleFromMarket(firstMarket);
  const category = categoryFromText(marketName);
  const consensusInsights: ConsensusInsight[] = [
    {
      segment: "Top 20 H-Score Wallets",
      wallets: topWallets.length,
      volume: totalVolume,
      exposure: `${alignedPercent}% YES / ${100 - alignedPercent}% other`,
      timeframe: "15D",
      confidence: clamp(Math.round(topWallets.reduce((sum, wallet) => sum + wallet.smartMoneyRating, 0) / Math.max(topWallets.length, 1)), 1, 99),
      insight: `${alignedPercent}% of the top live H-Score wallet sample is profitable/YES-biased. Market-level examples are derived from market insights because wallet positions are not part of the leaderboard response.`,
    },
    ...mockConsensusInsights.slice(1),
  ];
  const clusters: WalletCluster[] = [
    {
      title: `${category} markets with rising smart-money attention`,
      wallets: topWallets.length,
      volume: totalVolume,
      confidence: consensusInsights[0].confidence,
      impact: "Medium",
      divergence: `${alignedPercent}% YES-derived exposure`,
      severity: "high",
      detail: `Derived from ${marketRows.length} live market insight rows and ${topWallets.length} live H-Score wallets. Specific wallet-to-market alignment requires trade-level matching.`,
    },
    ...mockClusters.slice(1),
  ];

  return {
    consensusInsights,
    clusters,
    smartMoneyConsensus: [
      {
        market: marketName,
        cohort: "Top 20 H-Score Wallets",
        alignedPercent: `${alignedPercent}%`,
        side: "YES" as const,
        netExposure: `${formatMoney(totalVolume)} tracked volume`,
        timeframe: "15D",
        direction: "Profitable wallet bias",
        evidenceStrength: topWallets.length >= 12 ? ("High" as const) : ("Medium" as const),
        alignedWallets: `${aligned} wallets aligned`,
        category,
        group: "Top 20",
        topWalletTags: topWallets.slice(0, 3).map((wallet) => wallet.tag),
        why: `${alignedPercent}% of the top live H-Score wallet sample is aligned with profitable YES-biased exposure. Market name comes from live market insights; wallet-to-market linkage is derived until trade matching is expanded.`,
        source: "derived" as const,
      },
      ...fallbackSmartMoneyConsensus().slice(1),
    ],
  };
}

function fallbackAnalytics(error?: string): PredictionMarketAnalyticsData {
  return {
    ...mockWalletIntelligenceData,
    smartMoneyConsensus: fallbackSmartMoneyConsensus(),
    updatedAt: new Date().toISOString(),
    sourceStatus: {
      source: "fallback",
      label: error ? `Demo fallback data. Live Falcon data unavailable: ${error}` : "Demo fallback data. Live Falcon data unavailable.",
      liveFields: [],
      derivedFields: [],
      fallbackFields: ["top traders", "rankings", "wallet addresses", "PnL", "ROI", "win rate", "volume", "positions", "consensus"],
      unavailableFields: [],
    },
    pagination: {
      limit: DEFAULT_WALLET_LIMIT,
      offset: 0,
      loadedWallets: mockWalletIntelligenceData.wallets.length,
      offsetWorking: false,
      hasMore: false,
    },
  };
}

function unavailableWalletProfile(wallet: string, error?: string): PredictionMarketWalletProfile {
  return {
    wallet,
    tag: "Unavailable",
    category: "Unavailable",
    cohort: "Unavailable",
    roi: null,
    pnl: null,
    winRate: null,
    volume: null,
    openPositions: null,
    conviction: null,
    exposure: "Unavailable",
    interpretation: "Not provided by Falcon endpoint",
    positions: [],
    recentChanges: ["No recent trades returned by Falcon for this wallet."],
    marketExposure: [
      { label: "Realized PnL", value: "Unavailable", tone: "text-slate-300" },
      { label: "Volume", value: "Unavailable", tone: "text-slate-300" },
      { label: "Trade count", value: "Unavailable", tone: "text-slate-300" },
    ],
    relatedWallets: [],
    evidence: [error ?? "Wallet-specific Falcon profile unavailable.", "No local fallback positions, trades, or related wallets are shown."],
    performance: [
      { label: "ROI", value: "Unavailable" },
      { label: "Win rate", value: "Unavailable" },
      { label: "Risk level", value: "Unavailable" },
      { label: "Markets traded", value: "Unavailable" },
    ],
    recentTrades: [],
    positionHistory: [{ label: "Position history", value: "unavailable" }],
    sourceStatus: {
      source: "fallback",
      label: error ? `Wallet-specific profile unavailable: ${error}` : "Wallet-specific profile unavailable.",
      liveFields: [],
      derivedFields: [],
      fallbackFields: [],
      unavailableFields: ["wallet profile", "active positions", "recent trades", "related wallets", "live position history"],
    },
  };
}

function fallbackSmartMoneyConsensus(): SmartMoneyConsensusCard[] {
  return [
    {
      market: "Lakers Win Tonight",
      cohort: "Top 20 Sports Wallets",
      alignedPercent: "60%",
      side: "YES",
      netExposure: "$6.8M net exposure",
      timeframe: "24h",
      direction: "Lakers YES",
      evidenceStrength: "High",
      alignedWallets: "12 wallets aligned",
      category: "Sports",
      group: "Top 20",
      topWalletTags: ["SPORTS-MM-08", "SPORTS-LATE-87", "NBA-INJURY-14"],
      why: "Fallback example: 60% of tracked top sports wallets are positioned on Lakers YES, with $6.8M net exposure over 24h.",
      source: "fallback",
    },
    {
      market: "SOL ETF Approval",
      cohort: "Top 50 Crypto Wallets",
      alignedPercent: "64%",
      side: "YES",
      netExposure: "$3.8M net exposure",
      timeframe: "6h",
      direction: "SOL ETF YES",
      evidenceStrength: "High",
      alignedWallets: "14 wallets aligned",
      category: "Crypto",
      group: "Top 50",
      topWalletTags: ["CRYPTO-INST-12", "CRYPTO-SOL-142", "SOL-ETF-09"],
      why: "Fallback example: crypto wallets are adding YES exposure faster than public market probability has adjusted.",
      source: "fallback",
    },
    {
      market: "Fed Cuts Next Meeting",
      cohort: "Top 100 Macro Wallets",
      alignedPercent: "53%",
      side: "YES",
      netExposure: "$2.1M net exposure",
      timeframe: "7d",
      direction: "Fed cuts YES",
      evidenceStrength: "Medium",
      alignedWallets: "31 wallets aligned",
      category: "Macro",
      group: "Top 100",
      topWalletTags: ["MACRO-HEDGE-18", "RATES-CUT-44", "CPI-DESK-12"],
      why: "Fallback example: macro specialists are modestly tilted toward cuts.",
      source: "fallback",
    },
  ];
}

function tradesToPositions(rows: FalconResult[]): WalletPosition[] {
  return rows.slice(0, 8).map((row) => {
    const side = String(row.outcome ?? row.side ?? "YES").toUpperCase().includes("DOWN") || String(row.side).toUpperCase() === "SELL" ? "NO" : "YES";
    const size = numberFromAny(row.size, 0) * numberFromAny(row.price, 1);
    const price = numberFromAny(row.price, 0);

    return {
      market: titleFromSlug(String(row.slug ?? row.market_slug ?? "Unknown market")),
      side,
      positionSize: size,
      avgPrice: price ? price.toFixed(2) : "unavailable",
      currentPrice: "unavailable",
      unrealizedPnl: "unavailable",
      conviction: "Watch",
      lastUpdated: row.timestamp ? timeAgo(String(row.timestamp)) : "live",
    };
  });
}

function tradeToChange(row: FalconResult) {
  const size = formatMoney(numberFromAny(row.size, 0) * numberFromAny(row.price, 1));
  const side = String(row.side ?? "TRADE").toUpperCase();
  const outcome = String(row.outcome ?? "outcome");
  return `${side} ${size} ${outcome} on ${titleFromSlug(String(row.slug ?? "unknown market"))}`;
}

function pnlToHistoryPoint(row: FalconResult) {
  return {
    label: String(row.date ?? row.timestamp ?? row.time ?? "PnL point"),
    value: formatMoney(numberFromAny(row.pnl ?? row.total_pnl ?? row.realized_pnl ?? row.value, 0)),
  };
}

function extractResults(payload: unknown): FalconResult[] {
  if (!isRecord(payload)) return [];
  const data = payload.data;
  if (Array.isArray(data)) return data.filter(isRecord);
  if (isRecord(data) && Array.isArray(data.results)) return data.results.filter(isRecord);
  if (Array.isArray(payload.results)) return payload.results.filter(isRecord);
  return [];
}

function extractError(payload: unknown) {
  if (!isRecord(payload)) return null;
  if (isRecord(payload.error) && typeof payload.error.message === "string") return payload.error.message;
  if (typeof payload.message === "string") return payload.message;
  return null;
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

function omitEmpty(params: FalconParams) {
  return Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ""));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function numberFromAny(value: unknown, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const next = Number(value.replace(/[$,%]/g, ""));
    if (Number.isFinite(next)) return next;
  }
  return fallback;
}

function optionalNumber(value: unknown) {
  const parsed = numberFromAny(value, Number.NaN);
  return Number.isFinite(parsed) ? parsed : null;
}

function lowerString(value: unknown) {
  return typeof value === "string" ? value.toLowerCase() : "";
}

function rowMatchesWallet(row: FalconResult, wallet: string) {
  return [
    row.wallet,
    row.address,
    row.proxy_wallet,
    row.wallet_proxy,
    row.wallet_address,
  ].some((value) => lowerString(value) === wallet);
}

function normalizeRoi(value: number) {
  if (Math.abs(value) <= 2) return value * 100;
  return value;
}

function normalizeWinRate(value: number) {
  if (value <= 1) return Math.round(value * 100);
  return Math.round(value);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function formatMoney(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "Unavailable";
  const sign = value < 0 ? "-" : "";
  const absolute = Math.abs(value);
  if (absolute >= 1000000) return `${sign}$${(absolute / 1000000).toFixed(1)}M`;
  if (absolute >= 1000) return `${sign}$${(absolute / 1000).toFixed(1)}K`;
  return `${sign}$${absolute.toFixed(0)}`;
}

function formatPercent(value: number | null | undefined, digits = 1) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "Unavailable";
  return `${value.toFixed(digits)}%`;
}

function formatCount(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "Unavailable";
  return String(Math.round(value));
}

function categoryFromText(text: string): WalletCategory {
  const value = text.toLowerCase();
  if (value.includes("sport") || value.includes("nba") || value.includes("nfl") || value.includes("lakers")) return "Sports";
  if (value.includes("crypto") || value.includes("btc") || value.includes("bitcoin") || value.includes("sol") || value.includes("eth")) return "Crypto";
  if (value.includes("fed") || value.includes("rate") || value.includes("cpi") || value.includes("macro")) return "Macro";
  if (value.includes("election") || value.includes("trump") || value.includes("approval")) return "Politics";
  if (value.includes("war") || value.includes("ceasefire") || value.includes("sanction")) return "Geopolitics";
  if (value.includes("ai") || value.includes("openai") || value.includes("model")) return "AI";
  return "Crypto";
}

function signalTypeFromTrajectory(trajectory: string): WalletSignalType {
  if (trajectory.toLowerCase().includes("improv")) return "Momentum";
  if (trajectory.toLowerCase().includes("stable")) return "Consensus";
  return "Early Positioning";
}

function titleFromMarket(row: FalconResult) {
  return String(row.title ?? row.market_title ?? row.question ?? row.slug ?? row.market_slug ?? "Live Polymarket Market");
}

function titleFromSlug(slug: string) {
  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
    .trim();
}

function toDateParam(date: Date) {
  return date.toISOString().slice(0, 10);
}

function timeAgo(timestamp: string) {
  const value = Date.parse(timestamp);
  if (!Number.isFinite(value)) return timestamp;
  const minutes = Math.max(1, Math.round((Date.now() - value) / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.round(minutes / 60)}h ago`;
}

function validateAnalyticsWalletPair(wallets: WalletRecord[]) {
  if (wallets.length < 2) return;
  const [first, second] = wallets;
  console.info("[prediction-market-analytics-validation]", {
    walletAddressesDiffer: first.wallet !== second.wallet,
    firstWallet: first.wallet,
    secondWallet: second.wallet,
    roiDiffers: first.roi !== second.roi,
    firstRoi: first.roi,
    secondRoi: second.roi,
    positionsAreEndpointUnavailable: true,
  });
}

function validateWalletProfile(profile: PredictionMarketWalletProfile, requestedWallet: string, liveTrades: boolean) {
  console.info("[prediction-market-wallet-profile-validation]", {
    requestedWallet,
    profileWallet: profile.wallet.toLowerCase(),
    walletMatchesRequest: profile.wallet.toLowerCase() === requestedWallet,
    positionsSource: "unavailable",
    positionsCount: profile.positions.length,
    recentTradesSource: liveTrades ? "live Falcon trade rows" : "unavailable",
    recentTradesCount: profile.recentTrades.length,
    relatedWalletsUnavailable: profile.relatedWallets.length === 0,
  });
}

function logServerDebug(label: string, calls: FalconCallResult[], payload: { wallets?: unknown[]; positions?: unknown[]; sourceStatus?: { source: string } }) {
  console.info(`[${label}]`, {
    apiReachable: calls.some((call) => call.status !== null),
    authWorks: calls.some((call) => call.status === 200),
    endpointsTested: calls.map((call) => ({ label: call.label, ok: call.ok, status: call.status, count: call.count, error: call.error })),
    responseShapeUnderstood: calls.every((call) => !call.ok || Array.isArray(call.results)),
    tradersLoaded: payload.wallets?.length ?? 0,
    positionsLoaded: payload.positions?.length ?? 0,
    source: payload.sourceStatus?.source,
  });
}
