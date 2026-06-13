"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, ArrowDownRight, ArrowUpRight, BrainCircuit, ChevronDown, Database, Info, Search, ShieldAlert, SlidersHorizontal, Waves, X, Zap } from "lucide-react";
import { useRouter } from "next/navigation";

import { BiasBadge, Panel, PanelHeader, SeverityBadge } from "@/components/terminal/terminal-shell";
import { FeatureGate } from "@/components/terminal/access-gate";
import { Badge } from "@/components/ui/badge";
import { CardContent } from "@/components/ui/card";
import { TRACKED_ASSETS, TRACKED_ASSET_SET, normalizeAssetSymbol } from "@/lib/tracked-hyperliquid-assets";

const stablecoinAssets = new Set(["USDT", "USDC", "DAI", "USDE", "FDUSD", "TUSD", "PYUSD", "USDD", "FRAX", "LUSD"]);
const defaultAssetOptions = ["All", ...TRACKED_ASSETS] as const;
const defaultAssetTableLimit = TRACKED_ASSETS.length;
const fallbackAssetSymbols = new Set<string>(TRACKED_ASSETS);
const timeframes = ["1H", "4H", "24H", "7D", "30D"] as const;
const traderGroups = ["Top 20", "Top 50", "Top 100", "Smart Money", "Whales"] as const;
const flowTypes = ["All Flows", "Inflows", "Outflows", "OI Build-Up", "Leverage Build-Up", "Asset Rotation"] as const;
const directions = ["Any Direction", "Long", "Short", "Mixed"] as const;
const leverageRanges = ["Any Leverage", "0-2x", "2-5x", "5x+"] as const;
const abnormalityScores = ["Any Score", "70+", "80+", "90+"] as const;
const traderFilters = ["All Traders", "Smart Money Only", "Whale Only", "Profitable Traders Only"] as const;
const trackedWhaleArchitectureStatus = {
  discoveredWallets: 0,
  trackedWallets: 0,
  latestDiscovery: "Pending first ingestion run",
};

type Asset = string;
type Timeframe = (typeof timeframes)[number];
type TraderGroup = (typeof traderGroups)[number];
type FlowType = (typeof flowTypes)[number];
type DirectionFilter = (typeof directions)[number];
type LeverageRange = (typeof leverageRanges)[number];
type AbnormalityScore = (typeof abnormalityScores)[number];
type TraderFilter = (typeof traderFilters)[number];
type SortKey = "netFlow7d" | "flowVsAvg" | "openInterestChange" | "avgLeverage" | "whaleScore" | "abnormalFlowIndex";

type AssetFlow = {
  asset: string;
  markPrice?: number;
  openInterest?: number;
  openInterestUsd?: number;
  funding?: number | null;
  volume24h?: number;
  premium?: number | null;
  impactPrice?: number | null;
  oiChange?: number | null;
  netFlow?: number | null;
  availability?: Record<string, "live" | "derived" | "unavailable">;
  notes?: string[];
  netFlow7d: number;
  flowVsAvg: number;
  topTraderBias: "Long-heavy" | "Short-heavy" | "Mixed";
  openInterestChange: number;
  longShortRatio: string;
  longPct: number;
  avgLeverage: number;
  whaleConcentration: "Low" | "Medium" | "High";
  whaleScore: number;
  abnormalFlowIndex: number;
  smartMoneyConcentration: number;
  capitalRotationScore: number;
  flowDivergenceIndex: number;
  interpretation: string;
  flowType: Exclude<FlowType, "All Flows">;
  traderCount: number;
  topWalletCount?: number;
  minInflow: number;
  relatedMarkets: string[];
  rawDatapoints: string[];
  historicalComparison: string;
  aiExplanation: string;
  hyperliquid?: {
    markPrice: number;
    previousDayPrice: number;
    openInterest: number;
    openInterestUsd: number;
    volume24h: number;
    fundingRate: number | null;
    dailyPriceChange: number;
    openInterestChangeProxy: number;
    volumeIntensity: number;
    flowBias: "Bullish" | "Bearish" | "Neutral";
    abnormalFlowIndex: number;
    capitalRotationScore: number;
    leveragePressureProxy: number;
  };
};

type TopTraderDirection = "Aggressive Long" | "Defensive Short" | "Neutral Rotation" | "Momentum Long";
type MarketBias = "Bullish" | "Bearish" | "Neutral";
type SelectionTarget = { type: "asset"; asset: AssetFlow["asset"] } | { type: "trader"; trader: string };

type TopTraderProfile = {
  wallet: string;
  primaryAsset: string;
  specialization: string;
  globalRank: number;
  lifetimePnl: number;
  lifetimeRoi: number;
  exposureShare: number;
  roi30dBase: number;
  historicalRoi: number;
  historicalAccuracy: number;
  winRate: number;
  avgHoldingTime: string;
  bestAsset: string;
  worstAsset: string;
  leverageDelta: number;
  activity: string;
};

type TopTraderIntelligence = {
  wallet: string;
  primaryAsset: string;
  direction: TopTraderDirection;
  netExposure: number;
  avgLeverage: number;
  pnl7d: number;
  roi30d: number;
  winRate: number;
  convictionScore: number;
  earlySignalScore: number;
  currentBias: MarketBias;
  lastActivity: string;
  specialization: string;
  globalRank: number;
  lifetimePnl: number;
  lifetimeRoi: number;
  historicalRoi: number;
  historicalAccuracy: number;
  avgHoldingTime: string;
  bestAsset: string;
  worstAsset: string;
  openExposure: number;
  smartMoneyRating: number;
  flowInfluenceScore: number;
  narrativeAlignment: number;
  divergenceIndex: number;
  currentPositions: string[];
  recentPositioningChanges: string[];
  activeMarkets: string[];
  relatedNarratives: string[];
  aiInterpretation: string;
  datapoints: string[];
};

type TraderCluster = {
  title: string;
  traderCount: number;
  totalExposure: number;
  leverageConcentration: string;
  confidence: number;
  affectedNarratives: string[];
  datapoint: string;
  severity: string;
};

type HyperliquidFlowsPayload = {
  source?: unknown;
  sourceStatus?: unknown;
  lastUpdated?: unknown;
  updatedAt?: unknown;
  refresh?: unknown;
  assets?: unknown;
  topTraders?: unknown;
  metrics?: unknown;
  availability?: unknown;
  limitations?: unknown;
  error?: unknown;
};

type TrackedWalletLeaderboardRow = {
  wallet: string;
  rank: number;
  whaleScore: number;
  accountValue: number;
  primaryAsset: string | null;
  direction: "Long" | "Short" | "Mixed" | "Flat";
  grossExposure: number;
  netExposure: number;
  avgLeverage: number;
  unrealizedPnl: number;
  positionCount: number;
  lastSeenAt: string | null;
  assetsSeen: string[];
};

type TrackedWalletExposureWallet = {
  wallet: string;
  rank: number;
  notional: number;
  accountValue: number;
};

type TrackedWalletAssetExposure = {
  asset: string;
  longWalletCount: number;
  shortWalletCount: number;
  longNotional: number;
  shortNotional: number;
  netNotional: number;
  longShortRatio: string;
  topLongWallets: TrackedWalletExposureWallet[];
  topShortWallets: TrackedWalletExposureWallet[];
};

type HyperliquidWalletsPayload = {
  source?: unknown;
  method?: unknown;
  officialHyperliquidLeaderboard?: unknown;
  updatedAt?: unknown;
  stats?: {
    discoveredWallets?: unknown;
    enrichedWallets?: unknown;
    latestIngestTime?: unknown;
  };
  wallets?: unknown;
  assetExposures?: unknown;
  selectedAssetExposure?: unknown;
  error?: unknown;
};

const mockAssetFlows: AssetFlow[] = [
  {
    asset: "HYPE",
    netFlow7d: 48200000,
    flowVsAvg: 42,
    topTraderBias: "Long-heavy",
    openInterestChange: 31,
    longShortRatio: "68/32",
    longPct: 68,
    avgLeverage: 4.8,
    whaleConcentration: "High",
    topWalletCount: 15,
    whaleScore: 87,
    abnormalFlowIndex: 87,
    smartMoneyConcentration: 81,
    capitalRotationScore: 89,
    flowDivergenceIndex: 72,
    interpretation: "Strong inflow rotation",
    flowType: "Asset Rotation",
    traderCount: 50,
    minInflow: 48200000,
    relatedMarkets: ["AI Agent Market Share", "HYPE ecosystem revenue", "On-chain trading infra"],
    rawDatapoints: ["+$48.2M 7D net flow", "+42% versus 30D average", "Top 50 traders 68% long", "Open interest +31%"],
    historicalComparison: "Current HYPE inflow is 2.1x the 30D average and above the 87th percentile of observed rotation windows.",
    aiExplanation: "HYPE inflows are +42% above the 30D average, with top 50 traders 68% long and OI up +31%. OracleX classifies this as strong capital rotation.",
  },
  {
    asset: "SOL",
    netFlow7d: 31600000,
    flowVsAvg: 18,
    topTraderBias: "Long-heavy",
    openInterestChange: 21.6,
    longShortRatio: "64/36",
    longPct: 64,
    avgLeverage: 3.9,
    whaleConcentration: "Medium",
    topWalletCount: 5,
    whaleScore: 72,
    abnormalFlowIndex: 82,
    smartMoneyConcentration: 76,
    capitalRotationScore: 83,
    flowDivergenceIndex: 61,
    interpretation: "ETF narrative confirmation",
    flowType: "Inflows",
    traderCount: 74,
    minInflow: 31600000,
    relatedMarkets: ["SOL ETF Approval", "SOL ecosystem TVL", "L1 rotation"],
    rawDatapoints: ["+$31.6M 7D net flow", "+18% versus 30D average", "SOL long exposure +18.4% over 4H", "Open interest +21.6%"],
    historicalComparison: "SOL flow is 1.18x the 30D average and matches the top-quartile ETF-narrative confirmation pattern.",
    aiExplanation: "SOL long exposure increased +18.4% over 4H while 7D net flow is +$31.6M and OI is up +21.6%. OracleX reads this as ETF narrative confirmation.",
  },
  {
    asset: "ETH",
    netFlow7d: -22400000,
    flowVsAvg: -16,
    topTraderBias: "Short-heavy",
    openInterestChange: 9.2,
    longShortRatio: "41/59",
    longPct: 41,
    avgLeverage: 3.2,
    whaleConcentration: "Medium",
    topWalletCount: 9,
    whaleScore: 69,
    abnormalFlowIndex: 74,
    smartMoneyConcentration: 64,
    capitalRotationScore: 58,
    flowDivergenceIndex: 77,
    interpretation: "Defensive positioning",
    flowType: "Outflows",
    traderCount: 63,
    minInflow: -22400000,
    relatedMarkets: ["ETH Ecosystem Rotation", "ETH ETF relative inflows", "ETH/BTC underperformance"],
    rawDatapoints: ["-$22.4M 7D net flow", "-16% versus 30D average", "Top traders 59% short", "Open interest +9.2% despite outflows"],
    historicalComparison: "ETH outflows are 1.16x worse than the 30D average while OI still rises, a defensive setup seen in prior hedge-heavy windows.",
    aiExplanation: "ETH outflows are -16% versus the 30D average, with top traders 59% short and OI up +9.2%. OracleX classifies this as defensive positioning.",
  },
  {
    asset: "BTC",
    netFlow7d: 12800000,
    flowVsAvg: 6,
    topTraderBias: "Mixed",
    openInterestChange: 14.8,
    longShortRatio: "52/48",
    longPct: 52,
    avgLeverage: 5.1,
    whaleConcentration: "High",
    topWalletCount: 12,
    whaleScore: 84,
    abnormalFlowIndex: 71,
    smartMoneyConcentration: 79,
    capitalRotationScore: 66,
    flowDivergenceIndex: 81,
    interpretation: "Leverage build-up",
    flowType: "Leverage Build-Up",
    traderCount: 92,
    minInflow: 12800000,
    relatedMarkets: ["BTC ATH Probability", "Bitcoin Weekly Close", "ETF inflow continuation"],
    rawDatapoints: ["+$12.8M 7D net flow", "+6% versus 30D average", "Open interest +21.6% over 7D", "Average leverage 5.1x"],
    historicalComparison: "BTC flow is only +6% above average, but OI acceleration and 5.1x average leverage place it in a high-risk leverage window.",
    aiExplanation: "BTC OI is +21.6% over 7D while net flow is +$12.8M and top trader exposure is 52/48. OracleX classifies this as leverage build-up, not clean directional inflow.",
  },
  {
    asset: "DOGE",
    netFlow7d: 9400000,
    flowVsAvg: 24,
    topTraderBias: "Long-heavy",
    openInterestChange: 18.4,
    longShortRatio: "61/39",
    longPct: 61,
    avgLeverage: 4.2,
    whaleConcentration: "Medium",
    topWalletCount: 7,
    whaleScore: 71,
    abnormalFlowIndex: 78,
    smartMoneyConcentration: 69,
    capitalRotationScore: 74,
    flowDivergenceIndex: 58,
    interpretation: "Meme rotation build-up",
    flowType: "OI Build-Up",
    traderCount: 46,
    minInflow: 9400000,
    relatedMarkets: ["DOGE ETF speculation", "Meme rotation", "Retail risk appetite"],
    rawDatapoints: ["+$9.4M 7D net flow", "+20% versus 30D average", "Top 50 traders 61% long", "Open interest +18.4%"],
    historicalComparison: "DOGE flow is above the 30D mean and concentrated in high-beta rotation wallets.",
    aiExplanation: "DOGE shows +20% flow expansion with OI up +18.4% and top traders 61% long. OracleX classifies this as meme rotation build-up.",
  },
  {
    asset: "XRP",
    netFlow7d: 7200000,
    flowVsAvg: 14,
    topTraderBias: "Mixed",
    openInterestChange: 10.8,
    longShortRatio: "54/46",
    longPct: 54,
    avgLeverage: 3.6,
    whaleConcentration: "Low",
    topWalletCount: 4,
    whaleScore: 58,
    abnormalFlowIndex: 67,
    smartMoneyConcentration: 61,
    capitalRotationScore: 63,
    flowDivergenceIndex: 49,
    interpretation: "Event-risk positioning",
    flowType: "OI Build-Up",
    traderCount: 42,
    minInflow: 720,
    relatedMarkets: ["XRP ETF odds", "SEC settlement outcomes", "Payment-token rotation"],
    rawDatapoints: ["+$7.2M 7D net flow", "+14% versus 30D average", "Top 50 traders 54% long", "Open interest +10.8%"],
    historicalComparison: "XRP positioning is mixed, with OI building faster than directional long bias.",
    aiExplanation: "XRP flow is positive but only modestly directional. OracleX treats this as event-risk positioning rather than clean accumulation.",
  },
  {
    asset: "BNB",
    netFlow7d: -6800000,
    flowVsAvg: -9,
    topTraderBias: "Short-heavy",
    openInterestChange: 12.2,
    longShortRatio: "43/57",
    longPct: 43,
    avgLeverage: 3.1,
    whaleConcentration: "Medium",
    topWalletCount: 6,
    whaleScore: 63,
    abnormalFlowIndex: 70,
    smartMoneyConcentration: 65,
    capitalRotationScore: 52,
    flowDivergenceIndex: 63,
    interpretation: "Regulatory hedge pressure",
    flowType: "Outflows",
    traderCount: 38,
    minInflow: -6000000,
    relatedMarkets: ["Exchange token regulation", "BNB chain activity", "CEX market share"],
    rawDatapoints: ["-$6.0M 7D net flow", "-9% versus 30D average", "Top 50 traders 57% short", "Open interest +12.2%"],
    historicalComparison: "BNB has negative flow with positive OI, a hedge-heavy pattern in prior regulatory windows.",
    aiExplanation: "BNB outflows with rising OI suggest defensive short positioning. OracleX classifies this as regulatory hedge pressure.",
  },
  {
    asset: "ADA",
    netFlow7d: 5100000,
    flowVsAvg: 11,
    topTraderBias: "Mixed",
    openInterestChange: 8.6,
    longShortRatio: "53/47",
    longPct: 53,
    avgLeverage: 2.9,
    whaleConcentration: "Low",
    topWalletCount: 5,
    whaleScore: 54,
    abnormalFlowIndex: 61,
    smartMoneyConcentration: 58,
    capitalRotationScore: 57,
    flowDivergenceIndex: 46,
    interpretation: "Large-cap alt accumulation",
    flowType: "Inflows",
    traderCount: 36,
    minInflow: 5100000,
    relatedMarkets: ["Large-cap alt rotation", "L1 relative strength", "ADA ecosystem activity"],
    rawDatapoints: ["+$5.1M 7D net flow", "+11% versus 30D average", "Top 50 traders 53% long", "Open interest +8.6%"],
    historicalComparison: "ADA flow is moderately above average with balanced top-trader exposure.",
    aiExplanation: "ADA shows steady positive flow and modest OI expansion. OracleX treats this as large-cap alt accumulation rather than an aggressive leverage signal.",
  },
  {
    asset: "TRX",
    netFlow7d: 3800000,
    flowVsAvg: 7,
    topTraderBias: "Mixed",
    openInterestChange: 5.9,
    longShortRatio: "51/49",
    longPct: 51,
    avgLeverage: 2.4,
    whaleConcentration: "Low",
    topWalletCount: 3,
    whaleScore: 49,
    abnormalFlowIndex: 55,
    smartMoneyConcentration: 56,
    capitalRotationScore: 54,
    flowDivergenceIndex: 41,
    interpretation: "Funding-neutral carry rotation",
    flowType: "Inflows",
    traderCount: 32,
    minInflow: 3800000,
    relatedMarkets: ["Stable settlement activity", "TRON network flows", "Large-cap defensives"],
    rawDatapoints: ["+$3.8M 7D net flow", "+7% versus 30D average", "Top 50 traders 51% long", "Open interest +5.9%"],
    historicalComparison: "TRX positioning is balanced and typically behaves as a lower-volatility large-cap flow.",
    aiExplanation: "TRX has positive but restrained flow with low leverage pressure. OracleX classifies this as funding-neutral carry rotation.",
  },
  {
    asset: "LINK",
    netFlow7d: 6200000,
    flowVsAvg: 15,
    topTraderBias: "Long-heavy",
    openInterestChange: 13.4,
    longShortRatio: "59/41",
    longPct: 59,
    avgLeverage: 3.4,
    whaleConcentration: "Medium",
    topWalletCount: 6,
    whaleScore: 66,
    abnormalFlowIndex: 69,
    smartMoneyConcentration: 67,
    capitalRotationScore: 70,
    flowDivergenceIndex: 57,
    interpretation: "Oracle-infra momentum build",
    flowType: "OI Build-Up",
    traderCount: 40,
    minInflow: 6200000,
    relatedMarkets: ["Oracle infrastructure demand", "DeFi data-layer rotation", "LINK ecosystem catalysts"],
    rawDatapoints: ["+$6.2M 7D net flow", "+15% versus 30D average", "Top 50 traders 59% long", "Open interest +13.4%"],
    historicalComparison: "LINK flow is above average with constructive long skew and OI acceleration.",
    aiExplanation: "LINK shows positive flow, rising OI, and long-heavy top trader positioning. OracleX classifies this as oracle-infra momentum build.",
  },
  {
    asset: "FARTCOIN",
    netFlow7d: 420,
    flowVsAvg: 36,
    topTraderBias: "Long-heavy",
    openInterestChange: 34.5,
    longShortRatio: "66/34",
    longPct: 66,
    avgLeverage: 5.7,
    whaleConcentration: "High",
    topWalletCount: 8,
    whaleScore: 82,
    abnormalFlowIndex: 86,
    smartMoneyConcentration: 74,
    capitalRotationScore: 80,
    flowDivergenceIndex: 76,
    interpretation: "High-beta leverage rotation",
    flowType: "Leverage Build-Up",
    traderCount: 34,
    minInflow: 420,
    relatedMarkets: ["Meme coin momentum", "Retail rotation", "High-beta crypto baskets"],
    rawDatapoints: ["+$4.2M 7D net flow", "+36% versus 30D average", "Top 50 traders 66% long", "Open interest +34.5%"],
    historicalComparison: "FARTCOIN shows high OI acceleration and leverage concentration, consistent with high-beta rotation windows.",
    aiExplanation: "FARTCOIN has strong OI expansion, high leverage, and 66% long top-trader bias. OracleX classifies this as high-beta leverage rotation.",
  },
];

const topTraderProfiles: TopTraderProfile[] = [
  { wallet: "0x7c81...03ef", primaryAsset: "SOL", specialization: "SOL narrative acceleration", globalRank: 12, lifetimePnl: 184, lifetimeRoi: 184, exposureShare: 0.021, roi30dBase: 31.4, historicalRoi: 184, historicalAccuracy: 74, winRate: 68, avgHoldingTime: "8h", bestAsset: "SOL", worstAsset: "ETH", leverageDelta: 1.1, activity: "4m ago" },
  { wallet: "0x48f3...7704", primaryAsset: "BTC", specialization: "BTC macro leverage cycles", globalRank: 28, lifetimePnl: 150, lifetimeRoi: 142, exposureShare: 0.018, roi30dBase: 18.7, historicalRoi: 142, historicalAccuracy: 69, winRate: 64, avgHoldingTime: "18h", bestAsset: "BTC", worstAsset: "DOGE", leverageDelta: 0.8, activity: "7m ago" },
  { wallet: "0x9a12...f4c8", primaryAsset: "ETH", specialization: "ETH/BTC hedge rotation", globalRank: 34, lifetimePnl: 126, lifetimeRoi: 119, exposureShare: 0.016, roi30dBase: 12.8, historicalRoi: 119, historicalAccuracy: 71, winRate: 63, avgHoldingTime: "14h", bestAsset: "ETH", worstAsset: "BNB", leverageDelta: 0.4, activity: "11m ago" },
  { wallet: "0x2f6e...a91b", primaryAsset: "HYPE", specialization: "HYPE venue revenue momentum", globalRank: 41, lifetimePnl: 111, lifetimeRoi: 132, exposureShare: 0.014, roi30dBase: 27.6, historicalRoi: 132, historicalAccuracy: 76, winRate: 66, avgHoldingTime: "6h", bestAsset: "HYPE", worstAsset: "BTC", leverageDelta: 1.3, activity: "13m ago" },
  { wallet: "0xc03d...5b72", primaryAsset: "BNB", specialization: "exchange-token event hedging", globalRank: 57, lifetimePnl: 92, lifetimeRoi: 98, exposureShare: 0.012, roi30dBase: 9.1, historicalRoi: 98, historicalAccuracy: 67, winRate: 61, avgHoldingTime: "22h", bestAsset: "BNB", worstAsset: "SOL", leverageDelta: 0.2, activity: "18m ago" },
  { wallet: "0x6e44...dd09", primaryAsset: "XRP", specialization: "payment-token event risk", globalRank: 63, lifetimePnl: 87, lifetimeRoi: 104, exposureShare: 0.011, roi30dBase: 11.9, historicalRoi: 104, historicalAccuracy: 70, winRate: 62, avgHoldingTime: "16h", bestAsset: "XRP", worstAsset: "ETH", leverageDelta: 0.5, activity: "23m ago" },
  { wallet: "0xb8d1...20aa", primaryAsset: "DOGE", specialization: "high-beta meme rotation", globalRank: 79, lifetimePnl: 74, lifetimeRoi: 116, exposureShare: 0.009, roi30dBase: 16.5, historicalRoi: 116, historicalAccuracy: 64, winRate: 59, avgHoldingTime: "5h", bestAsset: "DOGE", worstAsset: "BTC", leverageDelta: 1.4, activity: "31m ago" },
  { wallet: "0x1db9...8e42", primaryAsset: "ADA", specialization: "large-cap alt confirmation", globalRank: 86, lifetimePnl: 68, lifetimeRoi: 88, exposureShare: 0.008, roi30dBase: 8.4, historicalRoi: 88, historicalAccuracy: 65, winRate: 60, avgHoldingTime: "19h", bestAsset: "ADA", worstAsset: "HYPE", leverageDelta: 0.3, activity: "36m ago" },
  { wallet: "0xf52a...c317", primaryAsset: "TRX", specialization: "funding-neutral carry rotation", globalRank: 94, lifetimePnl: 61, lifetimeRoi: 81, exposureShare: 0.007, roi30dBase: 7.8, historicalRoi: 81, historicalAccuracy: 66, winRate: 58, avgHoldingTime: "1d", bestAsset: "TRX", worstAsset: "DOGE", leverageDelta: 0.1, activity: "43m ago" },
  { wallet: "0x35af...9cc4", primaryAsset: "LINK", specialization: "oracle-infra momentum baskets", globalRank: 108, lifetimePnl: 56, lifetimeRoi: 93, exposureShare: 0.007, roi30dBase: 10.6, historicalRoi: 93, historicalAccuracy: 68, winRate: 61, avgHoldingTime: "12h", bestAsset: "LINK", worstAsset: "XRP", leverageDelta: 0.6, activity: "49m ago" },
];

const intelligenceCards = [
  {
    title: "HYPE inflow acceleration",
    datapoints: "+$48.2M 7D net flow, +42% vs 30D average, top 50 traders 68% long, OI +31%",
    comparison: "2.1x the 30D average and 87th percentile abnormality.",
    interpretation: "OracleX classifies this as strong capital rotation into HYPE.",
    confidence: 87,
    severity: "critical",
  },
  {
    title: "SOL long build-up",
    datapoints: "+$31.6M 7D net flow, +18.4% long exposure over 4H, OI +21.6%, 64/36 long-short",
    comparison: "Top-quartile ETF-narrative confirmation window.",
    interpretation: "Flow and top trader positioning confirm SOL ETF narrative demand.",
    confidence: 82,
    severity: "high",
  },
  {
    title: "ETH outflow pressure",
    datapoints: "-$22.4M 7D net flow, -16% vs 30D average, top traders 59% short, OI +9.2%",
    comparison: "Similar outflow-plus-OI windows have mapped to defensive hedging.",
    interpretation: "OracleX sees defensive ETH positioning rather than broad risk-on demand.",
    confidence: 74,
    severity: "medium",
  },
  {
    title: "BTC leverage risk",
    datapoints: "+$12.8M 7D flow, OI +21.6% over 7D, 5.1x average leverage, 52/48 exposure",
    comparison: "Leverage is above the recent range while directional exposure is near balanced.",
    interpretation: "BTC signal is leverage build-up with squeeze risk, not a clear long-only flow.",
    confidence: 71,
    severity: "high",
  },
];

const relatedPredictionContext = [
  { market: "SOL ETF Approval", context: "SOL flow +$31.6M and 64/36 long-short ratio confirm ETF demand context." },
  { market: "BTC ATH Probability", context: "BTC OI +21.6% with 5.1x average leverage creates probability repricing risk." },
  { market: "AI Agent Market Share", context: "HYPE rotation +42% vs 30D average may spill into AI infrastructure markets." },
  { market: "ETH Ecosystem Rotation", context: "ETH outflows -$22.4M and 59% short bias pressure rotation narratives." },
];

function money(value: number) {
  const sign = value < 0 ? "-" : "";
  return `${sign}$${(Math.abs(value) / 1000000).toFixed(1)}M`;
}

function moneyFromMillions(value: number) {
  const sign = value < 0 ? "-" : "";
  return `${sign}$${Math.abs(value).toFixed(1)}M`;
}

function signedPct(value: number) {
  return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
}

function numberOrNull(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }

  return null;
}

function stringOrNull(value: unknown) {
  return typeof value === "string" && value.trim() !== "" ? value : null;
}

function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function directionBias(direction: AssetFlow["topTraderBias"] | "Long" | "Short" | "Mixed") {
  if (direction === "Long" || direction === "Long-heavy") return "Bullish";
  if (direction === "Short" || direction === "Short-heavy") return "Bearish";
  return "Neutral";
}

function selectDefaultTrackedAssetRows(flows: AssetFlow[]) {
  const available = new Map(flows.filter((flow) => !stablecoinAssets.has(flow.asset)).map((flow) => [normalizeAssetSymbol(flow) ?? flow.asset, flow]));
  const rows: AssetFlow[] = [];

  TRACKED_ASSETS.forEach((asset) => {
    const flow = available.get(asset);
    if (flow && !rows.some((row) => row.asset === flow.asset) && rows.length < defaultAssetTableLimit) rows.push(flow);
  });

  return rows;
}

function normalizeTrackedAssetFlows(flows: AssetFlow[]) {
  const available = new Map<string, AssetFlow>();

  flows.forEach((flow) => {
    const normalizedAsset = normalizeAssetSymbol(flow);
    if (!normalizedAsset || !TRACKED_ASSET_SET.has(normalizedAsset) || available.has(normalizedAsset)) return;
    available.set(normalizedAsset, { ...flow, asset: normalizedAsset });
  });

  return TRACKED_ASSETS.flatMap((asset) => {
    const flow = available.get(asset);
    return flow ? [flow] : [];
  });
}

function normalizeDisplayAssetFlows(flows: AssetFlow[]) {
  return normalizeTrackedAssetFlows(flows);
}

function getFallbackAssetFlows() {
  return normalizeTrackedAssetFlows(mockAssetFlows).filter((flow) => fallbackAssetSymbols.has(flow.asset));
}

type FlowFilterState = {
  asset: Asset;
  flowType: FlowType;
  direction: DirectionFilter;
  leverageRange: LeverageRange;
  minAbnormality: number;
  minInflow: number;
  minOiChange: number;
  minTraderCount: number;
  query: string;
  sortKey: SortKey;
  traderFilter: TraderFilter;
};

function applyAssetFlowFilters(flows: AssetFlow[], filters: FlowFilterState) {
  const normalizedQuery = filters.query.trim().toLowerCase();

  return flows
    .filter((flow) => filters.asset === "All" || flow.asset === filters.asset)
    .filter((flow) => filters.flowType === "All Flows" || flow.flowType === filters.flowType)
    .filter((flow) => filters.direction === "Any Direction" || flow.topTraderBias.startsWith(filters.direction) || (filters.direction === "Mixed" && flow.topTraderBias === "Mixed"))
    .filter((flow) => filters.minInflow <= 0 || Math.abs(flow.netFlow7d) >= filters.minInflow * 1000000)
    .filter((flow) => filters.minOiChange <= 0 || flow.openInterestChange >= filters.minOiChange)
    .filter((flow) => filters.minTraderCount <= 0 || flow.traderCount >= filters.minTraderCount)
    .filter((flow) => flow.abnormalFlowIndex >= filters.minAbnormality)
    .filter((flow) => filters.leverageRange === "Any Leverage" || (filters.leverageRange === "0-2x" && flow.avgLeverage <= 2) || (filters.leverageRange === "2-5x" && flow.avgLeverage > 2 && flow.avgLeverage <= 5) || (filters.leverageRange === "5x+" && flow.avgLeverage > 5))
    .filter((flow) => filters.traderFilter !== "Whale Only" || flow.whaleConcentration === "High")
    .filter((flow) => filters.traderFilter !== "Smart Money Only" || flow.smartMoneyConcentration >= 75)
    .filter((flow) => filters.traderFilter !== "Profitable Traders Only" || flow.capitalRotationScore >= 70)
    .filter((flow) => !normalizedQuery || [flow.asset, flow.interpretation, flow.relatedMarkets.join(" "), flow.aiExplanation].join(" ").toLowerCase().includes(normalizedQuery))
    .sort((a, b) => b[filters.sortKey] - a[filters.sortKey]);
}

function normalizeIncomingAssetFlow(value: unknown): AssetFlow | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  const row = value as Record<string, unknown>;
  const flow = value as Partial<AssetFlow>;
  const asset = normalizeAssetSymbol(value);
  if (!asset) return null;

  const hyperliquid = typeof row.hyperliquid === "object" && row.hyperliquid !== null && !Array.isArray(row.hyperliquid) ? (row.hyperliquid as Record<string, unknown>) : {};
  const raw = typeof row.raw === "object" && row.raw !== null && !Array.isArray(row.raw) ? (row.raw as Record<string, unknown>) : {};
  const markPrice = numberOrNull(row.markPrice) ?? numberOrNull(hyperliquid.markPrice);
  const openInterest = numberOrNull(row.openInterest) ?? numberOrNull(hyperliquid.openInterest);
  const openInterestUsd = numberOrNull(row.openInterestUsd) ?? numberOrNull(hyperliquid.openInterestUsd) ?? numberOrNull(raw.openInterestUsd) ?? (openInterest !== null && markPrice !== null ? openInterest * markPrice : null);
  const funding = numberOrNull(row.funding) ?? numberOrNull(hyperliquid.fundingRate);
  const volume24h = numberOrNull(row.volume24h) ?? numberOrNull(hyperliquid.volume24h);
  const oiChange = numberOrNull(row.oiChange) ?? numberOrNull(row.openInterestChange) ?? numberOrNull(hyperliquid.openInterestChangeProxy);
  const netFlow = numberOrNull(row.netFlow) ?? numberOrNull(row.netFlow7d);
  const avgLeverage = numberOrNull(row.avgLeverage);
  const abnormalFlowIndex = numberOrNull(row.abnormalFlowIndex);
  const capitalRotationScore = numberOrNull(row.capitalRotationScore);
  const flowDivergenceIndex = numberOrNull(row.flowDivergenceIndex);
  const flowVsAvg = numberOrNull(row.flowVsAvg);
  const openInterestChange = numberOrNull(row.openInterestChange) ?? oiChange;
  const netFlow7d = numberOrNull(row.netFlow7d) ?? netFlow;

  const valid =
    netFlow7d !== null &&
    flowVsAvg !== null &&
    (flow.topTraderBias === "Long-heavy" || flow.topTraderBias === "Short-heavy" || flow.topTraderBias === "Mixed") &&
    openInterestChange !== null &&
    typeof flow.longShortRatio === "string" &&
    avgLeverage !== null &&
    abnormalFlowIndex !== null &&
    capitalRotationScore !== null &&
    flowDivergenceIndex !== null &&
    typeof flow.aiExplanation === "string" &&
    Array.isArray(flow.relatedMarkets) &&
    Array.isArray(flow.rawDatapoints);

  if (!valid) return null;

  return (
    {
      ...(flow as AssetFlow),
      asset,
      markPrice: markPrice ?? undefined,
      openInterest: openInterest ?? undefined,
      openInterestUsd: openInterestUsd ?? undefined,
      funding,
      volume24h: volume24h ?? undefined,
      oiChange,
      netFlow,
      netFlow7d,
      flowVsAvg,
      openInterestChange,
      avgLeverage,
      abnormalFlowIndex,
      capitalRotationScore,
      flowDivergenceIndex,
      hyperliquid: {
        ...(flow.hyperliquid ?? {}),
        markPrice: markPrice ?? flow.hyperliquid?.markPrice ?? 0,
        previousDayPrice: flow.hyperliquid?.previousDayPrice ?? markPrice ?? 0,
        openInterest: openInterest ?? flow.hyperliquid?.openInterest ?? 0,
        openInterestUsd: openInterestUsd ?? flow.hyperliquid?.openInterestUsd ?? 0,
        volume24h: volume24h ?? flow.hyperliquid?.volume24h ?? 0,
        fundingRate: funding,
        dailyPriceChange: flow.hyperliquid?.dailyPriceChange ?? 0,
        openInterestChangeProxy: oiChange ?? flow.hyperliquid?.openInterestChangeProxy ?? 0,
        volumeIntensity: flow.hyperliquid?.volumeIntensity ?? 0,
        flowBias: flow.hyperliquid?.flowBias ?? "Neutral",
        abnormalFlowIndex,
        capitalRotationScore,
        leveragePressureProxy: flow.hyperliquid?.leveragePressureProxy ?? 0,
      },
    }
  );
}

function formatTimestamp(value: string | null) {
  if (!value) return "Awaiting first tick";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Awaiting first tick";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function formatDateTime(value: string | null) {
  if (!value) return "Pending";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Pending";
  return date.toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function truncateWallet(wallet: string) {
  return wallet.length > 12 ? `${wallet.slice(0, 6)}...${wallet.slice(-4)}` : wallet;
}

function normalizeWalletLeaderboardRow(value: unknown): TrackedWalletLeaderboardRow | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  const row = value as Record<string, unknown>;
  const wallet = stringOrNull(row.wallet);
  const rank = numberOrNull(row.rank);
  if (!wallet || rank === null) return null;

  const direction = row.direction === "Long" || row.direction === "Short" || row.direction === "Mixed" || row.direction === "Flat" ? row.direction : "Flat";

  return {
    wallet,
    rank,
    whaleScore: numberOrNull(row.whaleScore) ?? 0,
    accountValue: numberOrNull(row.accountValue) ?? 0,
    primaryAsset: stringOrNull(row.primaryAsset),
    direction,
    grossExposure: numberOrNull(row.grossExposure) ?? 0,
    netExposure: numberOrNull(row.netExposure) ?? 0,
    avgLeverage: numberOrNull(row.avgLeverage) ?? 0,
    unrealizedPnl: numberOrNull(row.unrealizedPnl) ?? 0,
    positionCount: numberOrNull(row.positionCount) ?? 0,
    lastSeenAt: stringOrNull(row.lastSeenAt),
    assetsSeen: Array.isArray(row.assetsSeen) ? row.assetsSeen.filter((asset): asset is string => typeof asset === "string") : [],
  };
}

function normalizeExposureWallet(value: unknown): TrackedWalletExposureWallet | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  const row = value as Record<string, unknown>;
  const wallet = stringOrNull(row.wallet);
  if (!wallet) return null;

  return {
    wallet,
    rank: numberOrNull(row.rank) ?? 0,
    notional: numberOrNull(row.notional) ?? 0,
    accountValue: numberOrNull(row.accountValue) ?? 0,
  };
}

function normalizeAssetExposure(value: unknown): TrackedWalletAssetExposure | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  const row = value as Record<string, unknown>;
  const asset = stringOrNull(row.asset);
  if (!asset) return null;

  return {
    asset,
    longWalletCount: numberOrNull(row.longWalletCount) ?? 0,
    shortWalletCount: numberOrNull(row.shortWalletCount) ?? 0,
    longNotional: numberOrNull(row.longNotional) ?? 0,
    shortNotional: numberOrNull(row.shortNotional) ?? 0,
    netNotional: numberOrNull(row.netNotional) ?? 0,
    longShortRatio: stringOrNull(row.longShortRatio) ?? "0/0",
    topLongWallets: Array.isArray(row.topLongWallets) ? row.topLongWallets.map(normalizeExposureWallet).filter((wallet): wallet is TrackedWalletExposureWallet => Boolean(wallet)) : [],
    topShortWallets: Array.isArray(row.topShortWallets) ? row.topShortWallets.map(normalizeExposureWallet).filter((wallet): wallet is TrackedWalletExposureWallet => Boolean(wallet)) : [],
  };
}

function shortBiasToDirection(flow: AssetFlow, profile: TopTraderProfile): TopTraderDirection {
  if (flow.topTraderBias === "Long-heavy" && flow.openInterestChange >= 10) return "Aggressive Long";
  if (flow.topTraderBias === "Long-heavy") return "Momentum Long";
  if (flow.topTraderBias === "Short-heavy" || flow.netFlow7d < 0) return "Defensive Short";
  return profile.leverageDelta > 0.7 ? "Momentum Long" : "Neutral Rotation";
}

function directionToBias(direction: TopTraderDirection): MarketBias {
  if (direction === "Aggressive Long" || direction === "Momentum Long") return "Bullish";
  if (direction === "Defensive Short") return "Bearish";
  return "Neutral";
}

function deriveTopTraderIntelligence(flows: AssetFlow[], updatedAt: string | null): TopTraderIntelligence[] {
  return topTraderProfiles.filter((profile) => TRACKED_ASSET_SET.has(profile.primaryAsset)).map((profile) => {
    const flow = flows.find((item) => item.asset === profile.primaryAsset) ?? flows[0];
    const direction = shortBiasToDirection(flow, profile);
    const currentBias = directionToBias(direction);
    const openInterestUsd = flow.hyperliquid?.openInterestUsd ?? Math.max(Math.abs(flow.netFlow7d) * 8, 250000000);
    const netExposure = openInterestUsd * profile.exposureShare * (currentBias === "Bearish" ? -1 : 1);
    const avgLeverage = clampNumber(flow.avgLeverage + profile.leverageDelta, 1.2, 8.8);
    const pnl7d = netExposure * (flow.flowVsAvg / 100) * 0.42;
    const convictionScore = clampNumber(Math.round((flow.abnormalFlowIndex + flow.capitalRotationScore + Math.abs(flow.openInterestChange) + profile.historicalAccuracy) / 4), 0, 100);
    const earlySignalScore = clampNumber(Math.round((flow.flowDivergenceIndex + Math.abs(flow.flowVsAvg) + flow.smartMoneyConcentration + profile.historicalAccuracy) / 4), 0, 100);
    const smartMoneyRating = clampNumber(Math.round((profile.historicalAccuracy + profile.winRate + convictionScore + earlySignalScore) / 4), 0, 100);
    const flowInfluenceScore = clampNumber(Math.round((flow.whaleScore + flow.abnormalFlowIndex + Math.min(100, Math.abs(netExposure) / 500000)) / 3), 0, 100);
    const narrativeAlignment = clampNumber(Math.round((flow.capitalRotationScore + flow.smartMoneyConcentration + Math.max(0, flow.flowVsAvg + 100)) / 3), 0, 100);
    const divergenceIndex = clampNumber(Math.round((flow.flowDivergenceIndex + Math.abs(flow.openInterestChange) + Math.abs(flow.flowVsAvg)) / 3), 0, 100);
    const leverageBefore = Math.max(1, avgLeverage - Math.max(0.4, Math.abs(profile.leverageDelta)));
    const exposureVerb = currentBias === "Bearish" ? "short exposure" : currentBias === "Bullish" ? "long exposure" : "rotation exposure";
    const timestamp = formatTimestamp(updatedAt);

    return {
      wallet: profile.wallet,
      primaryAsset: profile.primaryAsset,
      direction,
      netExposure,
      avgLeverage,
      pnl7d,
      roi30d: profile.roi30dBase + flow.flowVsAvg * 0.18,
      winRate: profile.winRate,
      convictionScore,
      earlySignalScore,
      currentBias,
      lastActivity: usingClockLabel(profile.activity, timestamp),
      specialization: profile.specialization,
      globalRank: profile.globalRank,
      lifetimePnl: profile.lifetimePnl,
      lifetimeRoi: profile.lifetimeRoi,
      historicalRoi: profile.historicalRoi,
      historicalAccuracy: profile.historicalAccuracy,
      avgHoldingTime: profile.avgHoldingTime,
      bestAsset: profile.bestAsset,
      worstAsset: profile.worstAsset,
      openExposure: Math.abs(netExposure),
      smartMoneyRating,
      flowInfluenceScore,
      narrativeAlignment,
      divergenceIndex,
      currentPositions: [
        `${profile.primaryAsset} ${currentBias === "Bearish" ? "short" : currentBias === "Bullish" ? "long" : "market-neutral"} perp ${money(Math.abs(netExposure))}`,
        `${avgLeverage.toFixed(1)}x average leverage across tracked exposure`,
      ],
      recentPositioningChanges: [
        `${profile.primaryAsset} leverage increased from ${leverageBefore.toFixed(1)}x to ${avgLeverage.toFixed(1)}x while open interest moved ${signedPct(flow.openInterestChange)}.`,
        `Net ${exposureVerb} is ${money(Math.abs(netExposure))} with 7D flow at ${money(flow.netFlow7d)}.`,
      ],
      activeMarkets: flow.relatedMarkets,
      relatedNarratives: flow.relatedMarkets.map((market) => `${market} ${currentBias.toLowerCase()} context`),
      aiInterpretation: `This trader specializes in ${profile.specialization} and currently holds ${money(Math.abs(netExposure))} ${exposureVerb} on ${profile.primaryAsset}. The signal is backed by ${signedPct(flow.openInterestChange)} OI change, ${signedPct(flow.flowVsAvg)} flow-versus-average, and ${flow.abnormalFlowIndex} Abnormal Flow Index(TM), suggesting positioning may lead related prediction-market repricing.`,
      datapoints: [
        `${profile.primaryAsset} top-trader ratio ${flow.longShortRatio} with ${flow.topTraderBias.toLowerCase()} positioning.`,
        `Average leverage moved from ${leverageBefore.toFixed(1)}x to ${avgLeverage.toFixed(1)}x while OI changed ${signedPct(flow.openInterestChange)}.`,
        `Tracked exposure ${money(Math.abs(netExposure))}; asset 7D net flow ${money(flow.netFlow7d)}.`,
        `Conviction Score(TM) ${convictionScore}; Early Signal Score(TM) ${earlySignalScore}; Divergence Index(TM) ${divergenceIndex}.`,
      ],
    };
  });
}

function usingClockLabel(activity: string, timestamp: string) {
  return timestamp === "Awaiting first tick" ? activity : `${activity} / ${timestamp}`;
}

function deriveTraderClusters(traders: TopTraderIntelligence[], flows: AssetFlow[]): TraderCluster[] {
  if (traders.length === 0) return [];

  return flows
    .map((flow) => {
      const clusterTraders = traders.filter((trader) => trader.primaryAsset === flow.asset);
      const totalExposure = clusterTraders.reduce((sum, trader) => sum + Math.abs(trader.netExposure), 0);
      const averageLeverage = clusterTraders.length ? clusterTraders.reduce((sum, trader) => sum + trader.avgLeverage, 0) / clusterTraders.length : flow.avgLeverage;
      const bullishCount = clusterTraders.filter((trader) => trader.currentBias === "Bullish").length;
      const bearishCount = clusterTraders.filter((trader) => trader.currentBias === "Bearish").length;
      const confidence = clampNumber(Math.round((flow.abnormalFlowIndex + flow.smartMoneyConcentration + Math.abs(flow.openInterestChange)) / 3), 0, 100);
      const title = `${flow.asset} tracked wallet cluster`;

      return {
        title,
        traderCount: Math.max(clusterTraders.length * 4 + Math.round(flow.traderCount / 12), clusterTraders.length),
        totalExposure,
        leverageConcentration: `${averageLeverage.toFixed(1)}x avg, ${bullishCount}/${bearishCount} bullish/bearish wallets`,
        confidence,
        affectedNarratives: flow.relatedMarkets,
        datapoint: `${flow.asset} cluster shows ${money(totalExposure)} tracked exposure, ${signedPct(flow.openInterestChange)} OI change, ${signedPct(flow.flowVsAvg)} flow-versus-average, and ${flow.abnormalFlowIndex} Abnormal Flow Index(TM).`,
        severity: confidence >= 82 ? "critical" : confidence >= 72 ? "high" : "medium",
      };
    })
    .sort((a, b) => b.confidence - a.confidence);
}

function SelectControl<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: readonly T[]; onChange: (next: T) => void }) {
  return (
    <label className="min-w-0">
      <span className="mb-1 block font-mono text-[9px] uppercase tracking-[0.14em] text-slate-600">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value as T)} className="h-10 w-full rounded-lg border border-white/[0.08] bg-[#050812] px-3 font-mono text-[11px] text-slate-200 outline-none focus:border-blue-300/30">
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
  );
}

function InfoTooltip({ text }: { text: string }) {
  const triggerRef = useRef<HTMLSpanElement | null>(null);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  function openTooltip() {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const width = Math.min(320, window.innerWidth - 24);
    const left = clampNumber(rect.left + rect.width / 2 - width / 2, 12, window.innerWidth - width - 12);
    const estimatedHeight = 156;
    const belowTop = rect.bottom + 10;
    const aboveTop = rect.top - estimatedHeight - 10;
    const top = belowTop + estimatedHeight > window.innerHeight && aboveTop > 12 ? aboveTop : Math.max(12, belowTop);

    setPosition({ top, left });
  }

  return (
    <>
      <span
        ref={triggerRef}
        tabIndex={0}
        onMouseEnter={openTooltip}
        onMouseLeave={() => setPosition(null)}
        onFocus={openTooltip}
        onBlur={() => setPosition(null)}
        className="inline-flex cursor-help"
      >
        <Info className="size-3.5 text-slate-500 transition hover:text-blue-100" />
      </span>
      {position
        ? createPortal(
            <div
              style={{ top: position.top, left: position.left, width: "min(20rem, calc(100vw - 24px))" }}
              className="pointer-events-none fixed z-[9999] rounded-lg border border-white/[0.1] bg-[#050812] p-3 text-left text-[11px] normal-case leading-5 tracking-normal text-slate-300 shadow-2xl shadow-black/50 ring-1 ring-blue-300/[0.08]"
            >
              {text}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

function SourceLine({ source = "Hyperliquid API", refresh = "hourly" }: { source?: string; refresh?: string }) {
  return <div className="mt-2 font-mono text-[9px] uppercase tracking-[0.12em] text-slate-600">Source: {source} / Refresh: {refresh}</div>;
}

function AvailabilityLabel({ value }: { value?: "live" | "derived" | "unavailable" }) {
  const label = value ?? "derived";
  const color = label === "live" ? "text-emerald-200" : label === "unavailable" ? "text-amber-200" : "text-blue-100";
  return <div className={`mt-1 font-mono text-[9px] uppercase tracking-[0.12em] ${color}`}>{label}</div>;
}

function formatMarketMoney(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "Unavailable";
  return money(value);
}

function formatFunding(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "Unavailable";
  return `${(value * 100).toFixed(4)}%`;
}

function formatPrice(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "Unavailable";
  if (value >= 1000) return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  if (value >= 1) return `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  return `$${value.toLocaleString(undefined, { maximumFractionDigits: 6 })}`;
}

function getFlowMarkPrice(flow: AssetFlow) {
  return flow.markPrice ?? flow.hyperliquid?.markPrice ?? null;
}

function getFlowOpenInterestUsd(flow: AssetFlow) {
  const markPrice = getFlowMarkPrice(flow);
  return flow.openInterestUsd ?? flow.hyperliquid?.openInterestUsd ?? (typeof flow.openInterest === "number" && typeof markPrice === "number" ? flow.openInterest * markPrice : null);
}

function getFlowFunding(flow: AssetFlow) {
  return flow.funding ?? flow.hyperliquid?.fundingRate ?? null;
}

function getFlowVolume24h(flow: AssetFlow) {
  return flow.volume24h ?? flow.hyperliquid?.volume24h ?? null;
}

export default function CrossMarketFlowsPage() {
  return (
    <FeatureGate feature="crossMarketFlows" explanation="Hyperliquid Flows are part of the Operator terminal and Enterprise workspace.">
      <CrossMarketFlowsWorkspace />
    </FeatureGate>
  );
}

function CrossMarketFlowsWorkspace() {
  const router = useRouter();
  const [liveAssetFlows, setLiveAssetFlows] = useState<AssetFlow[] | null>(null);
  const [liveDataError, setLiveDataError] = useState<string | null>(null);
  const [liveUpdatedAt, setLiveUpdatedAt] = useState<string | null>(null);
  const [liveSourceStatus, setLiveSourceStatus] = useState<"live" | "partial" | "fallback">("fallback");
  const [liveRefresh, setLiveRefresh] = useState("live / 60s");
  const [liveLimitations, setLiveLimitations] = useState<string[]>([]);
  const [isLoadingLiveData, setIsLoadingLiveData] = useState(true);
  const [trackedWalletRows, setTrackedWalletRows] = useState<TrackedWalletLeaderboardRow[]>([]);
  const [trackedAssetExposures, setTrackedAssetExposures] = useState<TrackedWalletAssetExposure[]>([]);
  const [trackedWalletStats, setTrackedWalletStats] = useState({ discoveredWallets: 0, enrichedWallets: 0, latestIngestTime: null as string | null });
  const [trackedWalletError, setTrackedWalletError] = useState<string | null>(null);
  const [isLoadingTrackedWallets, setIsLoadingTrackedWallets] = useState(true);
  const [asset, setAsset] = useState<Asset>("All");
  const [timeframe, setTimeframe] = useState<Timeframe>("7D");
  const [group, setGroup] = useState<TraderGroup>("Top 50");
  const [flowType, setFlowType] = useState<FlowType>("All Flows");
  const [direction, setDirection] = useState<DirectionFilter>("Any Direction");
  const [leverageRange, setLeverageRange] = useState<LeverageRange>("Any Leverage");
  const [abnormalityScore, setAbnormalityScore] = useState<AbnormalityScore>("Any Score");
  const [traderFilter, setTraderFilter] = useState<TraderFilter>("All Traders");
  const [minInflow, setMinInflow] = useState(0);
  const [minOiChange, setMinOiChange] = useState(0);
  const [minTraderCount, setMinTraderCount] = useState(0);
  const [query, setQuery] = useState("");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("abnormalFlowIndex");
  const [selectedFlow, setSelectedFlow] = useState(mockAssetFlows[0]);
  const [selectedTarget, setSelectedTarget] = useState<SelectionTarget>({ type: "asset", asset: mockAssetFlows[0].asset });
  const assetFlows = useMemo(() => {
    const normalizedFlows = normalizeDisplayAssetFlows(liveAssetFlows ?? mockAssetFlows);
    return normalizedFlows.length > 0 ? normalizedFlows : getFallbackAssetFlows();
  }, [liveAssetFlows]);
  const usingLiveData = liveAssetFlows !== null && liveDataError === null && normalizeDisplayAssetFlows(liveAssetFlows).length > 0;
  const assetDataSource = usingLiveData ? liveSourceStatus : "fallback";
  const assetOptions = defaultAssetOptions;

  useEffect(() => {
    let cancelled = false;

    async function loadHyperliquidFlows() {
      if (!cancelled) setIsLoadingLiveData(true);

      try {
        const response = await fetch("/api/hyperliquid-flows");

        const payload = (await response.json()) as HyperliquidFlowsPayload;
        const rawAssets = Array.isArray(payload.assets) ? payload.assets : [];
        const normalizedRows = rawAssets.map(normalizeIncomingAssetFlow).filter((flow): flow is AssetFlow => Boolean(flow));
        const nextFlows = normalizeDisplayAssetFlows(normalizedRows);

        if (process.env.NODE_ENV === "development") {
          console.log("[hyperliquid-flows] API payload", {
            rawAssetsLength: rawAssets.length,
            rawAssetSymbols: rawAssets.map((row) => (typeof row === "object" && row !== null && !Array.isArray(row) ? (row as Record<string, unknown>).asset ?? (row as Record<string, unknown>).symbol ?? (row as Record<string, unknown>).coin ?? (row as Record<string, unknown>).name ?? (row as Record<string, unknown>).token : row)),
            normalizedSymbols: normalizedRows.map((flow) => flow.asset),
            trackedAssetCount: nextFlows.length,
          });
        }

        if (!response.ok) {
          throw new Error(typeof payload.error === "string" ? payload.error : `Hyperliquid flow API returned ${response.status}`);
        }

        if (payload.source !== "hyperliquid" || nextFlows.length === 0) {
          throw new Error("Hyperliquid flow API returned no live assets");
        }

        if (!cancelled) {
          setLiveAssetFlows(nextFlows);
          setLiveDataError(null);
          setLiveUpdatedAt(typeof payload.lastUpdated === "string" ? payload.lastUpdated : typeof payload.updatedAt === "string" ? payload.updatedAt : new Date().toISOString());
          setLiveSourceStatus(payload.sourceStatus === "live" || payload.sourceStatus === "partial" || payload.sourceStatus === "fallback" ? payload.sourceStatus : "partial");
          setLiveRefresh(typeof payload.refresh === "string" ? payload.refresh : "live / 60s");
          setLiveLimitations(Array.isArray(payload.limitations) ? payload.limitations.filter((item): item is string => typeof item === "string") : []);
          setSelectedFlow((current) => nextFlows.find((flow) => flow.asset === current.asset) ?? nextFlows[0]);
          setSelectedTarget((current) => (current.type === "asset" && nextFlows.some((flow) => flow.asset === current.asset) ? current : { type: "asset", asset: nextFlows[0].asset }));
        }
      } catch (error) {
        if (!cancelled) {
          const fallbackFlows = getFallbackAssetFlows();

          setLiveAssetFlows(fallbackFlows);
          setLiveDataError(error instanceof Error ? error.message : "Unable to load Hyperliquid flows");
          setLiveUpdatedAt(null);
          setLiveSourceStatus("fallback");
          setLiveRefresh("live / 60s");
          setLiveLimitations(["Live Hyperliquid market data could not be loaded. Local fallback rows are labeled fallback."]);
          setSelectedFlow((current) => fallbackFlows.find((flow) => flow.asset === current.asset) ?? fallbackFlows[0]);
          setSelectedTarget((current) => (current.type === "asset" && fallbackFlows.some((flow) => flow.asset === current.asset) ? current : { type: "asset", asset: fallbackFlows[0].asset }));
        }
      } finally {
        if (!cancelled) setIsLoadingLiveData(false);
      }
    }

    void loadHyperliquidFlows();
    const interval = window.setInterval(() => void loadHyperliquidFlows(), 60000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadTrackedWallets() {
      if (!cancelled) setIsLoadingTrackedWallets(true);

      try {
        const response = await fetch("/api/hyperliquid-wallets?limit=50");
        const payload = (await response.json()) as HyperliquidWalletsPayload;

        const wallets = Array.isArray(payload.wallets) ? payload.wallets.map(normalizeWalletLeaderboardRow).filter((wallet): wallet is TrackedWalletLeaderboardRow => Boolean(wallet)) : [];
        const assetExposures = Array.isArray(payload.assetExposures) ? payload.assetExposures.map(normalizeAssetExposure).filter((exposure): exposure is TrackedWalletAssetExposure => Boolean(exposure)) : [];
        const stats = typeof payload.stats === "object" && payload.stats !== null && !Array.isArray(payload.stats) ? payload.stats : {};

        if (!response.ok) {
          throw new Error(typeof payload.error === "string" ? payload.error : `Hyperliquid wallet API returned ${response.status}`);
        }

        if (!cancelled) {
          setTrackedWalletRows(wallets);
          setTrackedAssetExposures(assetExposures);
          setTrackedWalletStats({
            discoveredWallets: numberOrNull(stats.discoveredWallets) ?? 0,
            enrichedWallets: numberOrNull(stats.enrichedWallets) ?? 0,
            latestIngestTime: stringOrNull(stats.latestIngestTime),
          });
          setTrackedWalletError(null);
        }
      } catch (error) {
        if (!cancelled) {
          setTrackedWalletRows([]);
          setTrackedAssetExposures([]);
          setTrackedWalletStats({ discoveredWallets: 0, enrichedWallets: 0, latestIngestTime: null });
          setTrackedWalletError(error instanceof Error ? error.message : "Unable to load tracked Hyperliquid wallets");
        }
      } finally {
        if (!cancelled) setIsLoadingTrackedWallets(false);
      }
    }

    void loadTrackedWallets();
    const interval = window.setInterval(() => void loadTrackedWallets(), 60000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  const minAbnormality = abnormalityScore === "90+" ? 90 : abnormalityScore === "80+" ? 80 : abnormalityScore === "70+" ? 70 : 0;
  const flowFilters = useMemo(
    () => ({
      asset,
      flowType,
      direction,
      leverageRange,
      minAbnormality,
      minInflow,
      minOiChange,
      minTraderCount,
      query,
      sortKey,
      traderFilter,
    }),
    [asset, direction, flowType, leverageRange, minAbnormality, minInflow, minOiChange, minTraderCount, query, sortKey, traderFilter],
  );
  const filteredFlows = useMemo(() => {
    return applyAssetFlowFilters(assetFlows, flowFilters);
  }, [assetFlows, flowFilters]);

  const filtersActive =
    asset !== "All" ||
    flowType !== "All Flows" ||
    direction !== "Any Direction" ||
    leverageRange !== "Any Leverage" ||
    abnormalityScore !== "Any Score" ||
    traderFilter !== "All Traders" ||
    minInflow > 0 ||
    minOiChange > 0 ||
    minTraderCount > 0 ||
    query.length > 0;
  const defaultTableRows = useMemo(() => selectDefaultTrackedAssetRows(filteredFlows), [filteredFlows]);
  const tableRowsBeforeFallback = filtersActive ? filteredFlows : defaultTableRows.length > 0 ? defaultTableRows : filteredFlows.slice(0, defaultAssetTableLimit);
  const fallbackFilteredRows = useMemo(() => applyAssetFlowFilters(getFallbackAssetFlows(), flowFilters), [flowFilters]);
  const tableFallbackRows = fallbackFilteredRows.length > 0 ? fallbackFilteredRows : getFallbackAssetFlows();
  const tableFallbackActive = tableRowsBeforeFallback.length === 0;
  const tableRows = tableFallbackActive ? tableFallbackRows : tableRowsBeforeFallback;
  const visibleAssetSource = tableFallbackActive ? "local fallback dataset" : assetDataSource;
  const metricFlows = tableFallbackActive ? tableRows : assetFlows;
  const topTraderRows = useMemo<TopTraderIntelligence[]>(() => [], []);
  const filteredTopTraderRows = topTraderRows.filter((trader) => asset === "All" || trader.primaryAsset === asset);
  const selectedTrader = selectedTarget.type === "trader" ? topTraderRows.find((trader) => trader.wallet === selectedTarget.trader) ?? topTraderRows[0] : null;
  const selectedAssetFlow = selectedTarget.type === "asset" ? assetFlows.find((flow) => flow.asset === selectedTarget.asset) ?? selectedFlow : selectedFlow;
  const filteredTrackedWalletRows = trackedWalletRows.filter((wallet) => asset === "All" || wallet.primaryAsset === asset || wallet.assetsSeen.includes(asset));
  const visibleTrackedWalletRows = filteredTrackedWalletRows.length > 0 || asset !== "All" ? filteredTrackedWalletRows : trackedWalletRows;
  const selectedAssetExposure = trackedAssetExposures.find((exposure) => exposure.asset === selectedAssetFlow.asset) ?? null;
  const trackedWalletsAvailable = trackedWalletRows.length > 0 && trackedWalletStats.enrichedWallets > 0;

  const largestInflow = metricFlows.reduce((best, flow) => (flow.netFlow7d > best.netFlow7d ? flow : best), metricFlows[0]);
  const largestOutflow = metricFlows.reduce((best, flow) => (flow.netFlow7d < best.netFlow7d ? flow : best), metricFlows[0]);
  const topBias = metricFlows.reduce((best, flow) => (flow.smartMoneyConcentration > best.smartMoneyConcentration ? flow : best), metricFlows[0]);
  const oiAcceleration = metricFlows.reduce((best, flow) => (flow.openInterestChange > best.openInterestChange ? flow : best), metricFlows[0]);
  const abnormalFlow = metricFlows.reduce((best, flow) => (flow.abnormalFlowIndex > best.abnormalFlowIndex ? flow : best), metricFlows[0]);
  const positiveSmartMoneyInflow = metricFlows.filter((flow) => flow.netFlow7d > 0).reduce((sum, flow) => sum + flow.netFlow7d, 0);
  const totalSmartMoneyInflow = positiveSmartMoneyInflow > 0 ? positiveSmartMoneyInflow : metricFlows.reduce((sum, flow) => sum + flow.netFlow7d, 0);
  const netSmartMoneyExposure = topTraderRows.reduce((sum, trader) => sum + trader.netExposure, 0);
  const avgTraderLeverage = topTraderRows.length ? topTraderRows.reduce((sum, trader) => sum + trader.avgLeverage, 0) / topTraderRows.length : 0;
  const highConvictionCount = topTraderRows.filter((trader) => trader.convictionScore >= 72).length;
  const topAssetConcentration = assetFlows.reduce((best, flow) => {
    const exposure = topTraderRows.filter((trader) => trader.primaryAsset === flow.asset).reduce((sum, trader) => sum + Math.abs(trader.netExposure), 0);
    return exposure > best.exposure ? { asset: flow.asset, exposure } : best;
  }, { asset: assetFlows[0].asset, exposure: 0 });
  const traderDivergenceScore = topTraderRows.length ? Math.round(topTraderRows.reduce((sum, trader) => sum + trader.divergenceIndex, 0) / topTraderRows.length) : 0;
  const traderNetLongPct = topTraderRows.length ? Math.round((topTraderRows.filter((trader) => trader.netExposure > 0).length / topTraderRows.length) * 100) : 0;
  const traderClusters = deriveTraderClusters(topTraderRows, assetFlows);
  const displayIntelligenceCards = usingLiveData
    ? assetFlows.map((flow) => ({
        title: `${flow.asset} ${flow.interpretation.toLowerCase()}`,
        datapoints: flow.rawDatapoints.join(", "),
        comparison: flow.historicalComparison,
        interpretation: flow.aiExplanation,
        confidence: flow.abnormalFlowIndex,
        severity: flow.abnormalFlowIndex >= 85 ? "critical" : flow.abnormalFlowIndex >= 75 ? "high" : "medium",
      }))
    : intelligenceCards;
  const displayPredictionContext = usingLiveData
    ? assetFlows.flatMap((flow) =>
        flow.relatedMarkets.map((market) => ({
          market,
          context: `${flow.asset}: ${flow.aiExplanation}`,
        })),
      )
    : relatedPredictionContext;

  const activeChips = [
    asset !== "All" ? asset : null,
    timeframe,
    group,
    flowType !== "All Flows" ? flowType : null,
    direction !== "Any Direction" ? direction : null,
    leverageRange !== "Any Leverage" ? leverageRange : null,
    traderFilter !== "All Traders" ? traderFilter : null,
    minInflow > 0 ? `Min inflow $${minInflow}M` : null,
    minOiChange > 0 ? `OI >= ${minOiChange}%` : null,
    minTraderCount > 0 ? `Tracked wallets >= ${minTraderCount}` : null,
    abnormalityScore !== "Any Score" ? `Abnormality ${abnormalityScore}` : null,
  ].filter(Boolean);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    console.log("[hyperliquid-flows] UI pipeline", {
      rawAssetsLength: liveAssetFlows?.length ?? 0,
      rawAssetSymbols: (liveAssetFlows ?? []).map((flow) => flow.asset),
      normalizedSymbols: assetFlows.map((flow) => flow.asset),
      selectedAsset: asset,
      searchQuery: query,
      filteredAssetsLength: filteredFlows.length,
      finalVisibleAssetsLength: tableRows.length,
      finalVisibleSymbols: tableRows.map((flow) => flow.asset),
      tableFallbackActive,
    });
  }, [asset, assetFlows, filteredFlows.length, liveAssetFlows, query, tableFallbackActive, tableRows]);

  function clearFilters() {
    setAsset("All");
    setTimeframe("7D");
    setGroup("Top 50");
    setFlowType("All Flows");
    setDirection("Any Direction");
    setLeverageRange("Any Leverage");
    setAbnormalityScore("Any Score");
    setTraderFilter("All Traders");
    setMinInflow(0);
    setMinOiChange(0);
    setMinTraderCount(0);
    setQuery("");
    setAdvancedOpen(false);
  }

  return (
    <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="grid min-w-0 gap-4">
        <section className="rounded-xl border border-white/[0.075] bg-[#070b14]/86 p-4">
          <div className="mb-4 flex flex-col gap-3 border-b border-white/[0.075] pb-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge className="h-6 rounded-lg border border-blue-300/15 bg-blue-300/[0.07] font-mono text-[10px] uppercase text-blue-100">Hyperliquid flow intelligence</Badge>
                {usingLiveData ? (
                  <Badge className="h-6 gap-1.5 rounded-lg border border-emerald-300/18 bg-emerald-300/[0.08] font-mono text-[10px] uppercase text-emerald-100">
                    <span className="size-1.5 rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,0.85)]" />
                    {liveSourceStatus} Hyperliquid Data
                  </Badge>
                ) : null}
                {isLoadingLiveData ? <Badge className="h-6 rounded-lg border border-white/[0.08] bg-white/[0.035] font-mono text-[10px] uppercase text-slate-300">Syncing live feed</Badge> : null}
              </div>
              <h1 className="text-2xl font-semibold tracking-[-0.03em] text-white">Hyperliquid Trader Intelligence Terminal</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">OracleX shows live Hyperliquid market positioning, derived flow signals, and the data gaps that require tracked wallet ingestion.</p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-600">Last updated {formatTimestamp(liveUpdatedAt)}</p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-600">Source status {usingLiveData ? liveSourceStatus : "fallback"} / Refresh {liveRefresh}</p>
              {!usingLiveData && liveDataError ? <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-amber-200">API fallback active: {liveDataError}</p> : null}
              {liveLimitations.length > 0 ? <p className="mt-1 max-w-3xl font-mono text-[10px] uppercase tracking-[0.12em] text-amber-100">{liveLimitations[0]}</p> : null}
            </div>
            <div className="grid grid-cols-3 gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-500">
              <span>Hyperliquid</span>
              <span>Top traders</span>
              <span>Flow metrics</span>
            </div>
          </div>
          <div className="mb-3 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
            {["Smart money positioning", "Conviction assets", "Traders that matter", "Prediction-market flow risk"].map((item) => (
              <div key={item} className="rounded-lg border border-white/[0.06] bg-black/20 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-400">{item}</div>
            ))}
          </div>
          <div className="grid gap-2 md:grid-cols-3 xl:grid-cols-6">
            {[
              {
                label: "Derived Inflow Proxy",
                value: money(totalSmartMoneyInflow),
                tooltip: "Derived proxy from live Hyperliquid volume, price, funding, and open-interest context. It is not wallet-level smart-money inflow until tracked wallet ingestion is added.",
              },
              {
                label: "Largest Inflow Asset",
                value: `${largestInflow.asset} ${money(largestInflow.netFlow ?? largestInflow.netFlow7d)}`,
                tooltip: "The asset with the largest positive normalized net flow. Uses Hyperliquid market context, 24h volume intensity, open interest, funding, and price-change proxies. It matters because concentrated inflow can identify conviction assets. Refreshes hourly.",
              },
              {
                label: "Largest Outflow Asset",
                value: `${largestOutflow.asset} ${money(largestOutflow.netFlow ?? largestOutflow.netFlow7d)}`,
                tooltip: "The asset with the strongest negative normalized net flow. Uses the same asset-level Hyperliquid flow, OI, volume, funding, and positioning inputs. It matters because outflows can flag hedging, de-risking, or short pressure. Refreshes hourly.",
              },
              {
                label: "Top Trader Net Bias",
                value: "Unavailable",
                tooltip: "Hyperliquid does not expose a documented public top-trader leaderboard. Real top-trader net bias requires tracked wallet ingestion.",
              },
              {
                label: "Open Interest Acceleration",
                value: `${oiAcceleration.asset} ${signedPct(oiAcceleration.openInterestChange)}`,
                tooltip: "The asset with the largest open-interest change proxy. Uses Hyperliquid open interest, price change, funding, volume, and leverage pressure. It matters because OI expansion can signal new risk entering the market. Refreshes hourly.",
              },
              {
                label: "Abnormal Flow Index",
                value: `${abnormalFlow.asset} ${abnormalFlow.abnormalFlowIndex}`,
                tooltip: "Composite abnormality score across flow intensity, volume, open interest, funding, leverage pressure, and price movement. It matters because unusual flow regimes can precede volatility and probability changes. Refreshes hourly.",
              },
            ].map((metric) => (
              <div key={metric.label} className="rounded-lg border border-white/[0.065] bg-white/[0.025] px-3 py-2">
                <div className="flex items-center justify-between gap-2 font-mono text-[9px] uppercase tracking-[0.14em] text-slate-600">
                  <span>{metric.label}</span>
                  <InfoTooltip text={metric.tooltip} />
                </div>
                <div className="mt-1 truncate font-mono text-sm text-white">{metric.value}</div>
                <SourceLine source={tableFallbackActive ? "local fallback dataset" : usingLiveData ? `Hyperliquid API (${metric.label === "Top Trader Net Bias" ? "unavailable" : "derived"})` : "local fallback dataset"} refresh={liveRefresh} />
              </div>
            ))}
          </div>
        </section>

        <Panel>
          <PanelHeader title="Flow Filters" action="Prediction markets are contextual" />
          <CardContent className="space-y-4 p-4">
            <div className="grid gap-3 lg:grid-cols-[minmax(220px,1fr)_130px_130px_150px_150px_auto]">
              <label className="flex h-10 min-w-0 items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.025] px-3">
                <Search className="size-4 text-slate-500" />
                <input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600" placeholder="Search assets, flows, interpretations" />
              </label>
              <SelectControl label="Asset" value={asset} options={assetOptions} onChange={setAsset} />
              <SelectControl label="Timeframe" value={timeframe} options={timeframes} onChange={setTimeframe} />
              <SelectControl label="Trader Group" value={group} options={traderGroups} onChange={setGroup} />
              <SelectControl label="Flow Type" value={flowType} options={flowTypes} onChange={setFlowType} />
              <button type="button" onClick={() => setAdvancedOpen((next) => !next)} className="mt-auto inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-blue-300/18 bg-blue-300/[0.075] px-3 font-mono text-[11px] uppercase tracking-[0.12em] text-blue-100">
                <SlidersHorizontal className="size-4" />
                Advanced Filters
                <ChevronDown className={`size-4 transition ${advancedOpen ? "rotate-180" : ""}`} />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {activeChips.map((chip) => <span key={chip as string} className="inline-flex h-7 items-center rounded-lg border border-white/[0.08] bg-white/[0.035] px-2 font-mono text-[10px] text-slate-300">{chip}</span>)}
              <button type="button" onClick={clearFilters} className="inline-flex h-7 items-center gap-1 rounded-lg border border-white/[0.08] px-2 font-mono text-[10px] text-slate-500 hover:text-slate-200">
                <X className="size-3" />
                Clear filters
              </button>
            </div>

            {advancedOpen ? (
              <div className="grid gap-4 border-t border-white/[0.07] pt-4 xl:grid-cols-4">
                <SelectControl label="Leverage Range" value={leverageRange} options={leverageRanges} onChange={setLeverageRange} />
                <SelectControl label="Position Direction" value={direction} options={directions} onChange={setDirection} />
                <SelectControl label="Abnormality Score" value={abnormalityScore} options={abnormalityScores} onChange={setAbnormalityScore} />
                <SelectControl label="Trader Filter" value={traderFilter} options={traderFilters} onChange={setTraderFilter} />
                {[
                  ["Min inflow", minInflow, setMinInflow, "M", 0, 50],
                  ["Min OI change", minOiChange, setMinOiChange, "%", 0, 35],
                  ["Min tracked wallets", minTraderCount, setMinTraderCount, "", 0, 100],
                ].map(([label, value, setter, suffix, min, max]) => (
                  <label key={label as string} className="rounded-lg border border-white/[0.065] bg-black/25 p-3">
                    <div className="mb-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.12em] text-slate-500">
                      <span>{label as string}</span>
                      <span className="text-blue-100">{value as number}{suffix as string}</span>
                    </div>
                    <input className="w-full accent-blue-300" type="range" min={min as number} max={max as number} value={value as number} onChange={(event) => (setter as (next: number) => void)(Number(event.target.value))} />
                  </label>
                ))}
              </div>
            ) : null}
          </CardContent>
        </Panel>

        <Panel>
          <PanelHeader title="Asset Flow Table" action={filtersActive ? `${tableRows.length} of ${tableFallbackActive ? tableRows.length : assetFlows.length} assets ranked by flow intelligence` : `${tableRows.length} tracked major assets`} />
          <CardContent className="overflow-x-auto p-0">
            <div className="border-b border-white/[0.06] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500">Data source: {visibleAssetSource} / Assets loaded: {assetFlows.length}</div>
            {tableFallbackActive ? <div className="border-b border-white/[0.06] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-amber-100">Fallback rows are visible until the live mapping/filter pipeline returns displayable assets.</div> : null}
            {isLoadingLiveData && !usingLiveData ? <div className="border-b border-white/[0.06] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500">Loading normalized Hyperliquid response...</div> : null}
            {!filtersActive ? <div className="border-b border-white/[0.06] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500">Showing top tracked major assets. Use filters for more.</div> : null}
            {filtersActive && tableRows.length < assetFlows.length ? (
              <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-amber-100">
                <span>{tableRows.length} asset{tableRows.length === 1 ? "" : "s"} shown because filters are active.</span>
                <button type="button" onClick={clearFilters} className="inline-flex h-7 items-center gap-1 rounded-lg border border-amber-200/20 px-2 text-amber-100 hover:bg-amber-200/[0.06]">
                  <X className="size-3" />
                  Clear filters
                </button>
              </div>
            ) : null}
            <table className="w-full min-w-[1900px] text-left text-xs">
              <thead className="border-b border-white/[0.075] bg-white/[0.025] font-mono text-[10px] uppercase tracking-[0.12em] text-slate-600">
                <tr>
                  {[
                    ["Asset", "abnormalFlowIndex"],
                    ["Mark Price", "abnormalFlowIndex"],
                    ["Open Interest", "openInterestChange"],
                    ["OI Change", "openInterestChange"],
                    ["Funding", "abnormalFlowIndex"],
                    ["24h Volume", "flowVsAvg"],
                    ["Net Flow", "netFlow7d"],
                    ["Long/Short Ratio", "abnormalFlowIndex"],
                    ["Avg Leverage", "avgLeverage"],
                    ["Whale Concentration", "whaleScore"],
                    ["Abnormal Flow", "abnormalFlowIndex"],
                    ["Last Updated", "abnormalFlowIndex"],
                  ].map(([header, key]) => (
                    <th key={header} className="px-4 py-3 font-medium">
                      <button type="button" onClick={() => setSortKey(key as SortKey)} className={sortKey === key ? "text-blue-100" : ""}>{header}</button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableRows.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="px-4 py-8 text-center text-sm text-slate-400">
                      No assets match the active filters. <button type="button" onClick={clearFilters} className="font-mono text-blue-100 underline underline-offset-4">Clear filters</button>
                    </td>
                  </tr>
                ) : null}
                {tableRows.map((flow) => (
                  <tr
                    key={flow.asset}
                    onClick={() => {
                      setSelectedFlow(flow);
                      setSelectedTarget({ type: "asset", asset: flow.asset });
                    }}
                    className={`cursor-pointer border-b border-white/[0.055] transition hover:bg-blue-300/[0.035] ${selectedTarget.type === "asset" && selectedAssetFlow.asset === flow.asset ? "bg-blue-300/[0.06]" : ""}`}
                  >
                    <td className="px-4 py-3 font-mono text-lg text-white">{flow.asset}</td>
                    <td className="px-4 py-3 font-mono text-slate-200">{formatPrice(getFlowMarkPrice(flow))}<AvailabilityLabel value={flow.availability?.markPrice} /></td>
                    <td className="px-4 py-3 font-mono text-slate-200">{formatMarketMoney(getFlowOpenInterestUsd(flow))}<AvailabilityLabel value={flow.availability?.openInterest} /></td>
                    <td className="px-4 py-3 font-mono text-blue-100">{signedPct(flow.oiChange ?? flow.openInterestChange)}<AvailabilityLabel value={flow.availability?.oiChange} /></td>
                    <td className="px-4 py-3 font-mono text-slate-200">{formatFunding(getFlowFunding(flow))}<AvailabilityLabel value={flow.availability?.funding} /></td>
                    <td className="px-4 py-3 font-mono text-slate-200">{formatMarketMoney(getFlowVolume24h(flow))}<AvailabilityLabel value={flow.availability?.volume24h} /></td>
                    <td className={`px-4 py-3 font-mono ${flow.netFlow7d >= 0 ? "text-emerald-200" : "text-red-200"}`}>{money(flow.netFlow7d)}<AvailabilityLabel value={flow.availability?.netFlow} /></td>
                    <td className="px-4 py-3 font-mono text-slate-200">{flow.longShortRatio}<AvailabilityLabel value={flow.availability?.longShortRatio} /></td>
                    <td className="px-4 py-3 font-mono text-slate-200">{flow.avgLeverage.toFixed(1)}x<AvailabilityLabel value={flow.availability?.avgLeverage} /></td>
                    <td className="px-4 py-3 text-slate-300">{flow.whaleConcentration ?? "Unavailable"}<AvailabilityLabel value={flow.availability?.whaleConcentration} /></td>
                    <td className="px-4 py-3">
                      <div className="font-mono text-blue-100">{flow.abnormalFlowIndex}</div>
                      <AvailabilityLabel value={flow.availability?.abnormalFlowIndex} />
                      <div className="mt-1 max-w-[220px] text-slate-500">{flow.interpretation}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-500">{formatTimestamp(liveUpdatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Panel>

        <Panel>
          <PanelHeader title="Tracked Whale Intelligence" action={trackedWalletsAvailable ? "OracleX-discovered wallets" : "Requires ingestion"} />
          <CardContent className="space-y-4 p-4">
            <div className="flex flex-col gap-2 border-b border-white/[0.07] pb-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-blue-100">TRACKED WHALE INTELLIGENCE</div>
                <p className="mt-2 text-sm leading-6 text-slate-400">Ranked from OracleX-discovered Hyperliquid wallets with persisted clearinghouse snapshots. This is not an official Hyperliquid leaderboard.</p>
                <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-500">Source: OracleX-discovered Hyperliquid wallets / Method: recentTrades discovery + clearinghouseState enrichment</div>
                {!trackedWalletsAvailable ? <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-amber-100">Coming soon / requires persisted wallet snapshots</div> : null}
              </div>
              <Badge className="h-6 rounded-lg border border-blue-300/18 bg-blue-300/[0.07] font-mono text-[10px] uppercase text-blue-100">recentTrades + clearinghouseState</Badge>
            </div>

            <div className="grid gap-2 md:grid-cols-3 xl:grid-cols-6">
              {[
                ["Discovered Wallets", `${trackedWalletStats.discoveredWallets}`],
                ["Enriched Wallets", `${trackedWalletStats.enrichedWallets}`],
                ["Latest Ingest", formatDateTime(trackedWalletStats.latestIngestTime)],
                ["Discovery Source", "recentTrades"],
                ["Enrichment Source", "clearinghouseState"],
                ["Storage", trackedWalletsAvailable ? "Supabase snapshots live" : "Awaiting Supabase snapshots"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-white/[0.065] bg-white/[0.025] px-3 py-2">
                  <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-slate-600">{label}</div>
                  <div className="mt-1 text-xs leading-5 text-white">{value}</div>
                  <AvailabilityLabel value="derived" />
                </div>
              ))}
            </div>

            {isLoadingTrackedWallets ? (
              <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">
                <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-400">Loading tracked wallet snapshots...</div>
              </div>
            ) : !trackedWalletsAvailable ? (
              <div className="rounded-xl border border-amber-200/15 bg-amber-200/[0.04] p-4">
                <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-amber-100">Tracked wallet leaderboard unavailable</div>
                <p className="mt-2 text-sm leading-6 text-slate-300">{trackedWalletError ? `Wallet API unavailable: ${trackedWalletError}` : "Run Hyperliquid ingestion to persist discovered wallets, snapshots, and positions before this table activates."}</p>
              </div>
            ) : (
              <div className="max-h-[560px] overflow-auto rounded-xl border border-white/[0.07]">
                <table className="w-full min-w-[1320px] text-left text-xs">
                  <thead className="border-b border-white/[0.075] bg-white/[0.025] font-mono text-[10px] uppercase tracking-[0.12em] text-slate-600">
                    <tr>{["Rank", "Wallet", "Account Value", "Primary Asset", "Direction", "Gross Exposure", "Net Exposure", "Avg Leverage", "Unrealized PnL", "Last Activity"].map((header) => <th key={header} className="px-4 py-3 font-medium">{header}</th>)}</tr>
                  </thead>
                  <tbody>
                    {visibleTrackedWalletRows.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="px-4 py-8 text-center text-sm text-slate-400">No tracked wallets match the active asset filter.</td>
                      </tr>
                    ) : null}
                    {visibleTrackedWalletRows.map((wallet) => (
                      <tr
                        key={wallet.wallet}
                        tabIndex={0}
                        onClick={() => router.push(`/terminal/flows/wallet/${wallet.wallet}`)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") router.push(`/terminal/flows/wallet/${wallet.wallet}`);
                        }}
                        className="cursor-pointer border-b border-white/[0.055] transition hover:bg-blue-300/[0.035] focus:bg-blue-300/[0.055] focus:outline-none"
                      >
                        <td className="px-4 py-3 font-mono text-blue-100">#{wallet.rank}</td>
                        <td className="px-4 py-3 font-mono text-slate-200" title={wallet.wallet}>{truncateWallet(wallet.wallet)}</td>
                        <td className="px-4 py-3 font-mono text-white">{formatMarketMoney(wallet.accountValue)}</td>
                        <td className="px-4 py-3 font-mono text-white">{wallet.primaryAsset ?? "None"}</td>
                        <td className="px-4 py-3 text-slate-200">{wallet.direction}</td>
                        <td className="px-4 py-3 font-mono text-slate-200">{formatMarketMoney(wallet.grossExposure)}</td>
                        <td className={`px-4 py-3 font-mono ${wallet.netExposure >= 0 ? "text-emerald-200" : "text-red-200"}`}>{formatMarketMoney(wallet.netExposure)}</td>
                        <td className="px-4 py-3 font-mono text-slate-200">{wallet.avgLeverage.toFixed(1)}x</td>
                        <td className={`px-4 py-3 font-mono ${wallet.unrealizedPnl >= 0 ? "text-emerald-200" : "text-red-200"}`}>{formatMarketMoney(wallet.unrealizedPnl)}</td>
                        <td className="px-4 py-3 font-mono text-slate-500">{formatDateTime(wallet.lastSeenAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {topTraderRows.length > 0 ? <div className="grid gap-3 xl:grid-cols-2">
              {filteredTopTraderRows.slice(0, 4).map((trader) => (
                <div key={`${trader.wallet}-datapoints`} className="rounded-xl border border-white/[0.065] bg-black/25 p-3">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-blue-100">{trader.wallet} explainability</div>
                    <Badge className="h-6 rounded-lg border border-white/[0.08] bg-white/[0.035] font-mono text-[10px] text-slate-300">{trader.primaryAsset}</Badge>
                  </div>
                  <div className="space-y-2">{trader.datapoints.slice(0, 2).map((datapoint) => <div key={datapoint} className="rounded-lg bg-white/[0.035] px-3 py-2 text-xs leading-5 text-slate-300">{datapoint}</div>)}</div>
                </div>
              ))}
            </div> : null}
          </CardContent>
        </Panel>

        <Panel>
          <PanelHeader title="Trader Cluster Detection" action="Requires tracked wallet ingestion" />
          <CardContent className="grid gap-3 p-4 xl:grid-cols-2">
            {traderClusters.length === 0 ? (
              <div className="rounded-xl border border-amber-200/15 bg-amber-200/[0.04] p-4 xl:col-span-2">
                <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-amber-100">Unavailable</div>
                <p className="mt-2 text-sm leading-6 text-slate-300">Trader cluster detection requires tracked Hyperliquid wallet ingestion.</p>
              </div>
            ) : traderClusters.map((cluster) => (
              <div key={cluster.title} className="rounded-xl border border-white/[0.07] bg-black/25 p-4">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="text-sm font-semibold text-white">{cluster.title}</div>
                  <SeverityBadge severity={cluster.severity} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    ["Trader count", `${cluster.traderCount}`],
                    ["Total exposure", money(cluster.totalExposure)],
                    ["Leverage concentration", cluster.leverageConcentration],
                    ["Confidence", `${cluster.confidence}%`],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-lg bg-white/[0.035] p-3">
                      <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-slate-600">{label}</div>
                      <div className="mt-1 text-xs leading-5 text-slate-200">{value}</div>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-xs leading-5 text-slate-300">{cluster.datapoint}</p>
                <div className="mt-3 flex flex-wrap gap-2">{cluster.affectedNarratives.map((narrative) => <Badge key={narrative} className="h-6 rounded-lg border border-blue-300/12 bg-blue-300/[0.045] font-mono text-[10px] text-blue-100">{narrative}</Badge>)}</div>
              </div>
            ))}
          </CardContent>
        </Panel>

        <Panel>
          <PanelHeader title="Flow Intelligence Cards" action="Raw data -> interpretation" />
          <CardContent className="grid gap-3 p-4 xl:grid-cols-2">
            {displayIntelligenceCards.map((signal) => (
              <div key={signal.title} className="rounded-xl border border-white/[0.07] bg-black/25 p-4">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">{signal.severity === "critical" ? <ShieldAlert className="size-4 text-red-200" /> : <Zap className="size-4 text-blue-200" />}{signal.title}</div>
                  <SeverityBadge severity={signal.severity} />
                </div>
                <div className="rounded-lg bg-white/[0.035] p-3 font-mono text-[10px] text-slate-300">{signal.datapoints}</div>
                <p className="mt-3 text-xs leading-5 text-slate-400">{signal.comparison}</p>
                <p className="mt-2 text-xs leading-5 text-slate-300">{signal.interpretation}</p>
                <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-blue-100">{signal.confidence}% confidence</div>
              </div>
            ))}
          </CardContent>
        </Panel>

        <Panel>
          <PanelHeader title="Related Prediction Market Context" action="Secondary context" />
          <CardContent className="grid gap-3 p-4 xl:grid-cols-4">
            {displayPredictionContext.map((item) => (
              <div key={`${item.market}-${item.context}`} className="rounded-xl border border-white/[0.065] bg-white/[0.025] p-3">
                <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-blue-100">{item.market}</div>
                <p className="mt-2 text-xs leading-5 text-slate-400">{item.context}</p>
              </div>
            ))}
          </CardContent>
        </Panel>
      </div>

      <aside className="grid gap-4 2xl:sticky 2xl:top-5 2xl:self-start">
        {selectedTrader ? (
          <>
            <Panel>
              <PanelHeader title="Trader Detail" action={selectedTrader.primaryAsset} />
              <CardContent className="p-4">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <div className="font-mono text-xl tracking-[-0.03em] text-white">{selectedTrader.wallet}</div>
                    <div className="mt-2 text-sm text-slate-300">{selectedTrader.specialization}</div>
                  </div>
                  <BiasBadge bias={selectedTrader.currentBias} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Rank", value: `${selectedTrader.globalRank} / ${topTraderRows.length} tracked traders` },
                    { label: "Lifetime PnL", value: moneyFromMillions(selectedTrader.lifetimePnl) },
                    { label: "Lifetime ROI", value: signedPct(selectedTrader.lifetimeRoi) },
                    { label: "Historical accuracy", value: `${selectedTrader.historicalAccuracy}%` },
                    { label: "Avg holding time", value: selectedTrader.avgHoldingTime },
                    { label: "Best asset", value: selectedTrader.bestAsset },
                    { label: "Worst asset", value: selectedTrader.worstAsset },
                    { label: "Avg leverage", value: `${selectedTrader.avgLeverage.toFixed(1)}x` },
                    { label: "Open exposure", value: money(selectedTrader.openExposure) },
                    { label: "Early Signal Score", value: `${selectedTrader.earlySignalScore}`, tooltip: "Measures how often this trader enters before broader market repricing. Higher values indicate stronger historical lead behavior." },
                    { label: "Smart Money Rating", value: `${selectedTrader.smartMoneyRating}`, tooltip: "Composite score based on ROI, win rate, conviction, timing, consistency, and position sizing." },
                    { label: "Flow Influence Score", value: `${selectedTrader.flowInfluenceScore}`, tooltip: "Measures how much this trader's positioning aligns with broader asset flow changes." },
                    { label: "Narrative Alignment", value: `${selectedTrader.narrativeAlignment}`, tooltip: "Measures how closely this trader's current asset exposure aligns with related prediction-market narratives and capital rotation." },
                    { label: "Divergence Index", value: `${selectedTrader.divergenceIndex}`, tooltip: "Measures mismatch between flow, OI acceleration, leverage, and trader positioning. Higher values indicate a more unusual setup." },
                  ].map((metric) => (
                    <div key={metric.label} className="rounded-xl border border-white/[0.065] bg-white/[0.025] p-3">
                      <div className="flex items-center justify-between gap-2 font-mono text-[9px] uppercase tracking-[0.12em] text-slate-600">
                        <span>{metric.label}</span>
                        {"tooltip" in metric && metric.tooltip ? <InfoTooltip text={metric.tooltip} /> : null}
                      </div>
                      <div className="mt-2 text-xs leading-5 text-slate-200">{metric.value}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-amber-100">Source: derived trader intelligence placeholder / Future integration: wallet-level Hyperliquid ingestion</div>

                <div className="mt-4 rounded-xl border border-blue-300/15 bg-blue-300/[0.045] p-4">
                  <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-blue-100"><BrainCircuit className="size-4" />AI trader interpretation</div>
                  <p className="text-xs leading-6 text-slate-300">{selectedTrader.aiInterpretation}</p>
                </div>
              </CardContent>
            </Panel>

            <Panel>
              <PanelHeader title="Trader Evidence" action="Positioning changes" />
              <CardContent className="space-y-4 p-4">
                <div>
                  <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500"><Database className="size-4 text-blue-200" />Current positions</div>
                  <div className="space-y-2">{selectedTrader.currentPositions.map((item) => <div key={item} className="rounded-lg bg-white/[0.035] px-3 py-2 text-xs text-slate-300">{item}</div>)}</div>
                </div>
                <div>
                  <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500"><AlertTriangle className="size-4 text-blue-200" />Recent positioning changes</div>
                  <div className="space-y-2">{selectedTrader.recentPositioningChanges.map((item) => <div key={item} className="rounded-lg bg-white/[0.035] px-3 py-2 text-xs leading-5 text-slate-300">{item}</div>)}</div>
                </div>
                <div className="rounded-xl border border-white/[0.065] bg-black/25 p-4">
                  <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500">Explainability datapoints</div>
                  <div className="space-y-2">{selectedTrader.datapoints.map((item) => <div key={item} className="text-xs leading-5 text-slate-300">{item}</div>)}</div>
                </div>
              </CardContent>
            </Panel>

            <Panel>
              <PanelHeader title="Active Markets" action="Narrative alignment" />
              <CardContent className="space-y-4 p-4">
                <div className="flex flex-wrap gap-2">{selectedTrader.activeMarkets.map((market) => <Badge key={market} className="h-6 rounded-lg border border-white/[0.08] bg-white/[0.035] font-mono text-[10px] text-slate-300">{market}</Badge>)}</div>
                <div className="rounded-xl border border-white/[0.065] bg-black/25 p-4">
                  <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500"><Waves className="size-4 text-blue-200" />Related narratives</div>
                  <div className="space-y-2">{selectedTrader.relatedNarratives.map((narrative) => <div key={narrative} className="text-xs leading-5 text-slate-300">{narrative}</div>)}</div>
                </div>
              </CardContent>
            </Panel>
          </>
        ) : (
          <>
            <Panel>
              <PanelHeader title="Flow Detail" action={selectedAssetFlow.asset} />
              <CardContent className="p-4">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-3xl tracking-[-0.05em] text-white">{selectedAssetFlow.asset}</span>
                      <BiasBadge bias={directionBias(selectedAssetFlow.topTraderBias)} />
                    </div>
                    <div className="mt-2 text-sm text-slate-300">{selectedAssetFlow.interpretation}</div>
                  </div>
                  {selectedAssetFlow.netFlow7d >= 0 ? <ArrowUpRight className="size-5 text-emerald-200" /> : <ArrowDownRight className="size-5 text-red-200" />}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Mark price", value: formatPrice(getFlowMarkPrice(selectedAssetFlow)), availability: selectedAssetFlow.availability?.markPrice },
                    { label: "Open interest", value: formatMarketMoney(getFlowOpenInterestUsd(selectedAssetFlow)), availability: selectedAssetFlow.availability?.openInterest },
                    { label: "24h volume", value: formatMarketMoney(getFlowVolume24h(selectedAssetFlow)), availability: selectedAssetFlow.availability?.volume24h },
                    { label: "Funding", value: formatFunding(getFlowFunding(selectedAssetFlow)), availability: selectedAssetFlow.availability?.funding },
                    { label: "Net flow proxy", value: money(selectedAssetFlow.netFlow7d), availability: selectedAssetFlow.availability?.netFlow },
                    { label: "OI change proxy", value: signedPct(selectedAssetFlow.openInterestChange), availability: selectedAssetFlow.availability?.oiChange },
                    { label: "Long/short ratio", value: selectedAssetFlow.longShortRatio, availability: selectedAssetFlow.availability?.longShortRatio },
                    { label: "Whale concentration", value: selectedAssetFlow.whaleConcentration ?? "Unavailable", availability: selectedAssetFlow.availability?.whaleConcentration },
                    { label: "Abnormal Flow Index", value: `${selectedAssetFlow.abnormalFlowIndex}`, availability: selectedAssetFlow.availability?.abnormalFlowIndex },
                    { label: "Capital Rotation Score", value: `${selectedAssetFlow.capitalRotationScore}`, availability: "derived" as const },
                  ].map((metric) => (
                    <div key={metric.label} className="rounded-xl border border-white/[0.065] bg-white/[0.025] p-3">
                      <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-slate-600">{metric.label}</div>
                      <div className="mt-2 text-xs leading-5 text-slate-200">{metric.value}</div>
                      <AvailabilityLabel value={metric.availability} />
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded-xl border border-blue-300/15 bg-blue-300/[0.045] p-4">
                  <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-blue-100"><BrainCircuit className="size-4" />AI explanation</div>
                  <p className="text-xs leading-6 text-slate-300">{selectedAssetFlow.aiExplanation}</p>
                </div>
              </CardContent>
            </Panel>

            <Panel>
              <PanelHeader title="Tracked Whale Exposure" action={selectedAssetFlow.asset} />
              <CardContent className="space-y-4 p-4">
                {selectedAssetExposure ? (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "Long wallets", value: `${selectedAssetExposure.longWalletCount}` },
                        { label: "Short wallets", value: `${selectedAssetExposure.shortWalletCount}` },
                        { label: "Long notional", value: formatMarketMoney(selectedAssetExposure.longNotional) },
                        { label: "Short notional", value: formatMarketMoney(selectedAssetExposure.shortNotional) },
                        { label: "Net whale bias", value: `${selectedAssetExposure.netNotional >= 0 ? "Long" : "Short"} ${formatMarketMoney(Math.abs(selectedAssetExposure.netNotional))}` },
                        { label: "Long/short ratio", value: selectedAssetExposure.longShortRatio },
                      ].map((metric) => (
                        <div key={metric.label} className="rounded-xl border border-white/[0.065] bg-white/[0.025] p-3">
                          <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-slate-600">{metric.label}</div>
                          <div className="mt-2 text-xs leading-5 text-slate-200">{metric.value}</div>
                        </div>
                      ))}
                    </div>

                    <div className="grid gap-3">
                      {[
                        ["Top long wallet", selectedAssetExposure.topLongWallets[0]],
                        ["Top short wallet", selectedAssetExposure.topShortWallets[0]],
                      ].map(([label, wallet]) => (
                        <div key={label as string} className="rounded-xl border border-white/[0.065] bg-black/25 p-3">
                          <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-slate-600">{label as string}</div>
                          {wallet ? (
                            <div className="mt-2 flex items-center justify-between gap-3 text-xs">
                              <span className="font-mono text-blue-100" title={(wallet as TrackedWalletExposureWallet).wallet}>{truncateWallet((wallet as TrackedWalletExposureWallet).wallet)}</span>
                              <span className="font-mono text-slate-200">{formatMarketMoney((wallet as TrackedWalletExposureWallet).notional)}</span>
                            </div>
                          ) : (
                            <div className="mt-2 text-xs leading-5 text-slate-400">None observed</div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-slate-500">Source: OracleX-discovered Hyperliquid wallets / Method: recentTrades discovery + clearinghouseState enrichment</div>
                  </>
                ) : (
                  <div className="rounded-xl border border-amber-200/15 bg-amber-200/[0.04] p-4">
                    <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-amber-100">No tracked wallet exposure yet for this asset.</div>
                  </div>
                )}
              </CardContent>
            </Panel>

            <Panel>
              <PanelHeader title="Evidence Stack" action="Raw datapoints" />
              <CardContent className="space-y-4 p-4">
                <div>
                  <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500"><Database className="size-4 text-blue-200" />Hyperliquid metrics</div>
                  <div className="space-y-2">{selectedAssetFlow.rawDatapoints.map((item) => <div key={item} className="rounded-lg bg-white/[0.035] px-3 py-2 text-xs text-slate-300">{item}</div>)}</div>
                </div>
                <div className="rounded-xl border border-white/[0.065] bg-black/25 p-4">
                  <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500"><AlertTriangle className="size-4 text-blue-200" />Historical comparison</div>
                  <p className="text-xs leading-5 text-slate-300">{selectedAssetFlow.historicalComparison}</p>
                </div>
              </CardContent>
            </Panel>

            <Panel>
              <PanelHeader title="Related Prediction Markets" action="Context only" />
              <CardContent className="space-y-2 p-4">
                {selectedAssetFlow.relatedMarkets.map((market) => <Badge key={market} className="mr-2 h-6 rounded-lg border border-white/[0.08] bg-white/[0.035] font-mono text-[10px] text-slate-300">{market}</Badge>)}
                <div className="mt-4 rounded-xl border border-white/[0.065] bg-black/25 p-4">
                  <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500"><Waves className="size-4 text-blue-200" />Flow Divergence Index™</div>
                  <p className="text-xs leading-5 text-slate-300">{selectedAssetFlow.asset} has Flow Divergence Index™ {selectedAssetFlow.flowDivergenceIndex}, derived from net flow, OI acceleration, long-short skew, leverage, and prediction-context mismatch.</p>
                </div>
              </CardContent>
            </Panel>
          </>
        )}
      </aside>
    </div>
  );
}
