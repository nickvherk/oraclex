"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowDownRight, ArrowUpRight, BrainCircuit, ChevronDown, Database, Search, ShieldAlert, SlidersHorizontal, Waves, X, Zap } from "lucide-react";

import { BiasBadge, Panel, PanelHeader, SeverityBadge } from "@/components/terminal/terminal-shell";
import { FeatureGate } from "@/components/terminal/access-gate";
import { Badge } from "@/components/ui/badge";
import { CardContent } from "@/components/ui/card";

const assets = ["All", "BTC", "ETH", "SOL", "HYPE"] as const;
const timeframes = ["1H", "4H", "24H", "7D", "30D"] as const;
const traderGroups = ["Top 20", "Top 50", "Top 100", "Smart Money", "Whales"] as const;
const flowTypes = ["All Flows", "Inflows", "Outflows", "OI Build-Up", "Leverage Build-Up", "Asset Rotation"] as const;
const directions = ["Any Direction", "Long", "Short", "Mixed"] as const;
const leverageRanges = ["Any Leverage", "0-2x", "2-5x", "5x+"] as const;
const abnormalityScores = ["Any Score", "70+", "80+", "90+"] as const;
const traderFilters = ["All Traders", "Smart Money Only", "Whale Only", "Profitable Traders Only"] as const;

type Asset = (typeof assets)[number];
type Timeframe = (typeof timeframes)[number];
type TraderGroup = (typeof traderGroups)[number];
type FlowType = (typeof flowTypes)[number];
type DirectionFilter = (typeof directions)[number];
type LeverageRange = (typeof leverageRanges)[number];
type AbnormalityScore = (typeof abnormalityScores)[number];
type TraderFilter = (typeof traderFilters)[number];
type SortKey = "netFlow7d" | "flowVsAvg" | "openInterestChange" | "avgLeverage" | "whaleScore" | "abnormalFlowIndex";

type AssetFlow = {
  asset: Exclude<Asset, "All">;
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
  primaryAsset: Exclude<Asset, "All">;
  specialization: string;
  exposureShare: number;
  roi30dBase: number;
  historicalRoi: number;
  historicalAccuracy: number;
  winRate: number;
  leverageDelta: number;
  activity: string;
};

type TopTraderIntelligence = {
  wallet: string;
  primaryAsset: Exclude<Asset, "All">;
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
  historicalRoi: number;
  historicalAccuracy: number;
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
  updatedAt?: unknown;
  assets?: unknown;
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
];

const topTraderProfiles: TopTraderProfile[] = [
  { wallet: "0x7c81...03ef", primaryAsset: "SOL", specialization: "SOL narrative acceleration", exposureShare: 0.021, roi30dBase: 31.4, historicalRoi: 184, historicalAccuracy: 74, winRate: 68, leverageDelta: 1.1, activity: "4m ago" },
  { wallet: "0x48f3...7704", primaryAsset: "BTC", specialization: "BTC macro leverage cycles", exposureShare: 0.018, roi30dBase: 18.7, historicalRoi: 142, historicalAccuracy: 69, winRate: 64, leverageDelta: 0.8, activity: "7m ago" },
  { wallet: "0x91d0...5117", primaryAsset: "ETH", specialization: "ETH defensive rotation", exposureShare: 0.016, roi30dBase: 12.9, historicalRoi: 116, historicalAccuracy: 71, winRate: 62, leverageDelta: 0.5, activity: "11m ago" },
  { wallet: "0xad90...3af4", primaryAsset: "HYPE", specialization: "HYPE ecosystem accumulation", exposureShare: 0.019, roi30dBase: 27.8, historicalRoi: 169, historicalAccuracy: 73, winRate: 67, leverageDelta: 1.3, activity: "16m ago" },
  { wallet: "0xb3bb...7a83", primaryAsset: "SOL", specialization: "L1 rotation baskets", exposureShare: 0.014, roi30dBase: 22.2, historicalRoi: 137, historicalAccuracy: 66, winRate: 61, leverageDelta: 0.6, activity: "22m ago" },
  { wallet: "0x5fd2...c881", primaryAsset: "BTC", specialization: "Perp basis compression", exposureShare: 0.012, roi30dBase: 9.6, historicalRoi: 88, historicalAccuracy: 63, winRate: 59, leverageDelta: -0.2, activity: "29m ago" },
  { wallet: "0xc04a...e129", primaryAsset: "ETH", specialization: "Relative-value hedging", exposureShare: 0.011, roi30dBase: 14.8, historicalRoi: 102, historicalAccuracy: 65, winRate: 60, leverageDelta: 0.4, activity: "37m ago" },
  { wallet: "0x6a19...42db", primaryAsset: "HYPE", specialization: "On-chain trading infra beta", exposureShare: 0.013, roi30dBase: 25.1, historicalRoi: 158, historicalAccuracy: 70, winRate: 65, leverageDelta: 0.9, activity: "43m ago" },
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

function signedPct(value: number) {
  return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
}

function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function directionBias(direction: AssetFlow["topTraderBias"] | "Long" | "Short" | "Mixed") {
  if (direction === "Long" || direction === "Long-heavy") return "Bullish";
  if (direction === "Short" || direction === "Short-heavy") return "Bearish";
  return "Neutral";
}

function isAssetFlow(value: unknown): value is AssetFlow {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const flow = value as Partial<AssetFlow>;
  return (
    (flow.asset === "BTC" || flow.asset === "ETH" || flow.asset === "SOL" || flow.asset === "HYPE") &&
    typeof flow.netFlow7d === "number" &&
    typeof flow.flowVsAvg === "number" &&
    (flow.topTraderBias === "Long-heavy" || flow.topTraderBias === "Short-heavy" || flow.topTraderBias === "Mixed") &&
    typeof flow.openInterestChange === "number" &&
    typeof flow.longShortRatio === "string" &&
    typeof flow.avgLeverage === "number" &&
    typeof flow.abnormalFlowIndex === "number" &&
    typeof flow.capitalRotationScore === "number" &&
    typeof flow.flowDivergenceIndex === "number" &&
    typeof flow.aiExplanation === "string" &&
    Array.isArray(flow.relatedMarkets) &&
    Array.isArray(flow.rawDatapoints)
  );
}

function formatTimestamp(value: string | null) {
  if (!value) return "Awaiting first tick";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Awaiting first tick";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
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
  return topTraderProfiles.map((profile) => {
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
      historicalRoi: profile.historicalRoi,
      historicalAccuracy: profile.historicalAccuracy,
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
  return flows
    .map((flow) => {
      const clusterTraders = traders.filter((trader) => trader.primaryAsset === flow.asset);
      const totalExposure = clusterTraders.reduce((sum, trader) => sum + Math.abs(trader.netExposure), 0);
      const averageLeverage = clusterTraders.length ? clusterTraders.reduce((sum, trader) => sum + trader.avgLeverage, 0) / clusterTraders.length : flow.avgLeverage;
      const bullishCount = clusterTraders.filter((trader) => trader.currentBias === "Bullish").length;
      const bearishCount = clusterTraders.filter((trader) => trader.currentBias === "Bearish").length;
      const confidence = clampNumber(Math.round((flow.abnormalFlowIndex + flow.smartMoneyConcentration + Math.abs(flow.openInterestChange)) / 3), 0, 100);
      const title =
        flow.asset === "SOL"
          ? "High-conviction SOL cluster detected"
          : flow.asset === "BTC"
            ? "BTC leverage expansion cluster forming"
            : flow.asset === "ETH"
              ? "Defensive ETH rotation underway"
              : "Coordinated HYPE accumulation detected";

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

export default function CrossMarketFlowsPage() {
  return (
    <FeatureGate feature="crossMarketFlows" explanation="Hyperliquid Flows are part of the Operator terminal and Enterprise workspace.">
      <CrossMarketFlowsWorkspace />
    </FeatureGate>
  );
}

function CrossMarketFlowsWorkspace() {
  const [liveAssetFlows, setLiveAssetFlows] = useState<AssetFlow[] | null>(null);
  const [liveDataError, setLiveDataError] = useState<string | null>(null);
  const [liveUpdatedAt, setLiveUpdatedAt] = useState<string | null>(null);
  const [isLoadingLiveData, setIsLoadingLiveData] = useState(true);
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
  const [minTraderCount, setMinTraderCount] = useState(20);
  const [query, setQuery] = useState("");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("abnormalFlowIndex");
  const [selectedFlow, setSelectedFlow] = useState(mockAssetFlows[0]);
  const [selectedTarget, setSelectedTarget] = useState<SelectionTarget>({ type: "asset", asset: mockAssetFlows[0].asset });
  const assetFlows = liveAssetFlows ?? mockAssetFlows;
  const usingLiveData = liveAssetFlows !== null;

  useEffect(() => {
    let cancelled = false;

    async function loadHyperliquidFlows() {
      if (!cancelled) setIsLoadingLiveData(true);

      try {
        const response = await fetch("/api/hyperliquid-flows", { cache: "no-store" });

        const payload = (await response.json()) as HyperliquidFlowsPayload;

        if (!response.ok) {
          throw new Error(typeof payload.error === "string" ? payload.error : `Hyperliquid flow API returned ${response.status}`);
        }

        const nextFlows = Array.isArray(payload.assets) ? payload.assets.filter(isAssetFlow) : [];

        if (payload.source !== "hyperliquid" || nextFlows.length === 0) {
          throw new Error("Hyperliquid flow API returned no live assets");
        }

        if (!cancelled) {
          setLiveAssetFlows(nextFlows);
          setLiveDataError(null);
          setLiveUpdatedAt(typeof payload.updatedAt === "string" ? payload.updatedAt : new Date().toISOString());
          setSelectedFlow((current) => nextFlows.find((flow) => flow.asset === current.asset) ?? nextFlows[0]);
          setSelectedTarget((current) => (current.type === "asset" && nextFlows.some((flow) => flow.asset === current.asset) ? current : { type: "asset", asset: nextFlows[0].asset }));
        }
      } catch (error) {
        if (!cancelled) {
          setLiveAssetFlows(null);
          setLiveDataError(error instanceof Error ? error.message : "Unable to load Hyperliquid flows");
          setLiveUpdatedAt(null);
          setSelectedFlow((current) => mockAssetFlows.find((flow) => flow.asset === current.asset) ?? mockAssetFlows[0]);
          setSelectedTarget((current) => (current.type === "asset" && mockAssetFlows.some((flow) => flow.asset === current.asset) ? current : { type: "asset", asset: mockAssetFlows[0].asset }));
        }
      } finally {
        if (!cancelled) setIsLoadingLiveData(false);
      }
    }

    void loadHyperliquidFlows();
    const interval = window.setInterval(() => void loadHyperliquidFlows(), 30000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  const minAbnormality = abnormalityScore === "90+" ? 90 : abnormalityScore === "80+" ? 80 : abnormalityScore === "70+" ? 70 : 0;
  const filteredFlows = useMemo(() => {
    return assetFlows
      .filter((flow) => asset === "All" || flow.asset === asset)
      .filter((flow) => flowType === "All Flows" || flow.flowType === flowType)
      .filter((flow) => direction === "Any Direction" || flow.topTraderBias.startsWith(direction) || (direction === "Mixed" && flow.topTraderBias === "Mixed"))
      .filter((flow) => Math.abs(flow.netFlow7d) >= minInflow * 1000000)
      .filter((flow) => flow.openInterestChange >= minOiChange)
      .filter((flow) => flow.traderCount >= minTraderCount)
      .filter((flow) => flow.abnormalFlowIndex >= minAbnormality)
      .filter((flow) => leverageRange === "Any Leverage" || (leverageRange === "0-2x" && flow.avgLeverage <= 2) || (leverageRange === "2-5x" && flow.avgLeverage > 2 && flow.avgLeverage <= 5) || (leverageRange === "5x+" && flow.avgLeverage > 5))
      .filter((flow) => traderFilter !== "Whale Only" || flow.whaleConcentration === "High")
      .filter((flow) => traderFilter !== "Smart Money Only" || flow.smartMoneyConcentration >= 75)
      .filter((flow) => traderFilter !== "Profitable Traders Only" || flow.capitalRotationScore >= 70)
      .filter((flow) => !query || [flow.asset, flow.interpretation, flow.relatedMarkets.join(" "), flow.aiExplanation].join(" ").toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => b[sortKey] - a[sortKey]);
  }, [asset, assetFlows, direction, flowType, leverageRange, minAbnormality, minInflow, minOiChange, minTraderCount, query, sortKey, traderFilter]);

  const tableRows = filteredFlows.length ? filteredFlows : assetFlows;
  const topTraderRows = useMemo(() => deriveTopTraderIntelligence(assetFlows, liveUpdatedAt), [assetFlows, liveUpdatedAt]);
  const filteredTopTraderRows = topTraderRows.filter((trader) => asset === "All" || trader.primaryAsset === asset);
  const selectedTrader = selectedTarget.type === "trader" ? topTraderRows.find((trader) => trader.wallet === selectedTarget.trader) ?? topTraderRows[0] : null;
  const selectedAssetFlow = selectedTarget.type === "asset" ? assetFlows.find((flow) => flow.asset === selectedTarget.asset) ?? selectedFlow : selectedFlow;

  const largestInflow = assetFlows.reduce((best, flow) => (flow.netFlow7d > best.netFlow7d ? flow : best), assetFlows[0]);
  const largestOutflow = assetFlows.reduce((best, flow) => (flow.netFlow7d < best.netFlow7d ? flow : best), assetFlows[0]);
  const topBias = assetFlows.reduce((best, flow) => (flow.smartMoneyConcentration > best.smartMoneyConcentration ? flow : best), assetFlows[0]);
  const oiAcceleration = assetFlows.reduce((best, flow) => (flow.openInterestChange > best.openInterestChange ? flow : best), assetFlows[0]);
  const abnormalFlow = assetFlows.reduce((best, flow) => (flow.abnormalFlowIndex > best.abnormalFlowIndex ? flow : best), assetFlows[0]);
  const netSmartMoneyExposure = topTraderRows.reduce((sum, trader) => sum + trader.netExposure, 0);
  const avgTraderLeverage = topTraderRows.reduce((sum, trader) => sum + trader.avgLeverage, 0) / topTraderRows.length;
  const highConvictionCount = topTraderRows.filter((trader) => trader.convictionScore >= 72).length;
  const topAssetConcentration = assetFlows.reduce((best, flow) => {
    const exposure = topTraderRows.filter((trader) => trader.primaryAsset === flow.asset).reduce((sum, trader) => sum + Math.abs(trader.netExposure), 0);
    return exposure > best.exposure ? { asset: flow.asset, exposure } : best;
  }, { asset: assetFlows[0].asset, exposure: 0 });
  const traderDivergenceScore = Math.round(topTraderRows.reduce((sum, trader) => sum + trader.divergenceIndex, 0) / topTraderRows.length);
  const traderNetLongPct = Math.round((topTraderRows.filter((trader) => trader.netExposure > 0).length / topTraderRows.length) * 100);
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
    minInflow > 0 ? `Min inflow $${minInflow}M` : null,
    minOiChange > 0 ? `OI >= ${minOiChange}%` : null,
    abnormalityScore !== "Any Score" ? `Abnormality ${abnormalityScore}` : null,
  ].filter(Boolean);

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
    setMinTraderCount(20);
    setQuery("");
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
                    Live Hyperliquid Data
                  </Badge>
                ) : null}
                {isLoadingLiveData ? <Badge className="h-6 rounded-lg border border-white/[0.08] bg-white/[0.035] font-mono text-[10px] uppercase text-slate-300">Syncing live feed</Badge> : null}
              </div>
              <h1 className="text-2xl font-semibold tracking-[-0.03em] text-white">Where is smart money flowing right now?</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">OracleX tracks inflows, outflows, top trader positioning, OI acceleration, leverage build-up, abnormal flow, and asset rotation across Hyperliquid.</p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-600">Last updated {formatTimestamp(liveUpdatedAt)}</p>
              {!usingLiveData && liveDataError ? <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-amber-200">API fallback active: {liveDataError}</p> : null}
            </div>
            <div className="grid grid-cols-3 gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-500">
              <span>Hyperliquid</span>
              <span>Top traders</span>
              <span>Flow metrics</span>
            </div>
          </div>
          <div className="grid gap-2 md:grid-cols-3 xl:grid-cols-6">
            {[
              ["Total Smart Money Inflow 7D", money(assetFlows.filter((flow) => flow.netFlow7d > 0).reduce((sum, flow) => sum + flow.netFlow7d, 0))],
              ["Largest Inflow Asset", `${largestInflow.asset} ${signedPct(largestInflow.flowVsAvg)} vs avg`],
              ["Largest Outflow Asset", `${largestOutflow.asset} ${signedPct(largestOutflow.flowVsAvg)} vs avg`],
              ["Top Trader Net Bias", `${topBias.asset} ${topBias.longShortRatio}`],
              ["Open Interest Acceleration", `${oiAcceleration.asset} ${signedPct(oiAcceleration.openInterestChange)}`],
              ["Abnormal Flow Index™", `${abnormalFlow.asset} ${abnormalFlow.abnormalFlowIndex}`],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-white/[0.065] bg-white/[0.025] px-3 py-2">
                <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-slate-600">{label}</div>
                <div className="mt-1 truncate font-mono text-sm text-white">{value}</div>
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
              <SelectControl label="Asset" value={asset} options={assets} onChange={setAsset} />
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
                  ["Min trader count", minTraderCount, setMinTraderCount, "", 0, 100],
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
          <PanelHeader title="Asset Flow Table" action={`${tableRows.length} assets ranked by flow intelligence`} />
          <CardContent className="overflow-x-auto p-0">
            {isLoadingLiveData && !usingLiveData ? <div className="border-b border-white/[0.06] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500">Loading normalized Hyperliquid response...</div> : null}
            <table className="w-full min-w-[1320px] text-left text-xs">
              <thead className="border-b border-white/[0.075] bg-white/[0.025] font-mono text-[10px] uppercase tracking-[0.12em] text-slate-600">
                <tr>
                  {[
                    ["Asset", "abnormalFlowIndex"],
                    ["7D Net Flow", "netFlow7d"],
                    ["Flow vs 30D Avg", "flowVsAvg"],
                    ["Top Trader Bias", "abnormalFlowIndex"],
                    ["Open Interest Change", "openInterestChange"],
                    ["Long/Short Ratio", "abnormalFlowIndex"],
                    ["Avg Leverage", "avgLeverage"],
                    ["Whale Concentration", "whaleScore"],
                    ["Abnormal Flow Index™", "abnormalFlowIndex"],
                    ["OracleX Interpretation", "abnormalFlowIndex"],
                  ].map(([header, key]) => (
                    <th key={header} className="px-4 py-3 font-medium">
                      <button type="button" onClick={() => setSortKey(key as SortKey)} className={sortKey === key ? "text-blue-100" : ""}>{header}</button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
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
                    <td className={`px-4 py-3 font-mono ${flow.netFlow7d >= 0 ? "text-emerald-200" : "text-red-200"}`}>{money(flow.netFlow7d)}</td>
                    <td className={`px-4 py-3 font-mono ${flow.flowVsAvg >= 0 ? "text-emerald-200" : "text-red-200"}`}>{signedPct(flow.flowVsAvg)} vs 30D avg</td>
                    <td className="px-4 py-3"><BiasBadge bias={directionBias(flow.topTraderBias)} /><div className="mt-1 text-slate-500">{flow.topTraderBias}</div></td>
                    <td className="px-4 py-3 font-mono text-blue-100">{signedPct(flow.openInterestChange)}</td>
                    <td className="px-4 py-3 font-mono text-slate-200">{flow.longShortRatio}</td>
                    <td className="px-4 py-3 font-mono text-slate-200">{flow.avgLeverage.toFixed(1)}x</td>
                    <td className="px-4 py-3 text-slate-300">{flow.whaleConcentration}</td>
                    <td className="px-4 py-3 font-mono text-blue-100">{flow.abnormalFlowIndex}</td>
                    <td className="max-w-[260px] px-4 py-3 text-slate-300">{flow.interpretation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Panel>

        <Panel>
          <PanelHeader title="Top Trader Intelligence" action="Smart money positioning layer" />
          <CardContent className="space-y-4 p-4">
            <div className="flex flex-col gap-2 border-b border-white/[0.07] pb-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-blue-100">TOP TRADER INTELLIGENCE</div>
                <p className="mt-2 text-sm leading-6 text-slate-400">Track positioning, leverage, conviction, and behavior of top Hyperliquid traders.</p>
              </div>
              <Badge className="h-6 rounded-lg border border-blue-300/18 bg-blue-300/[0.07] font-mono text-[10px] uppercase text-blue-100">clearinghouseState-ready</Badge>
            </div>

            <div className="grid gap-2 md:grid-cols-3 xl:grid-cols-6">
              {[
                ["Top trader net bias", `${traderNetLongPct}% net long, ${topBias.asset} ${topBias.longShortRatio}`],
                ["Average leverage", `${avgTraderLeverage.toFixed(1)}x across tracked wallets`],
                ["High conviction clusters", `${highConvictionCount} high-conviction traders active`],
                ["Net smart money exposure", money(netSmartMoneyExposure)],
                ["Top asset concentration", `${topAssetConcentration.asset} ${money(topAssetConcentration.exposure)}`],
                ["Trader divergence score", `${traderDivergenceScore} Divergence Index™`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-white/[0.065] bg-white/[0.025] px-3 py-2">
                  <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-slate-600">{label}</div>
                  <div className="mt-1 text-xs leading-5 text-white">{value}</div>
                </div>
              ))}
            </div>

            <div className="overflow-x-auto rounded-xl border border-white/[0.07]">
              <table className="w-full min-w-[1560px] text-left text-xs">
                <thead className="border-b border-white/[0.075] bg-white/[0.025] font-mono text-[10px] uppercase tracking-[0.12em] text-slate-600">
                  <tr>{["Trader", "Primary Asset", "Direction", "Net Exposure", "Avg Leverage", "7D PnL", "30D ROI", "Win Rate", "Conviction Score™", "Early Signal Score™", "Current Bias", "Last Activity"].map((header) => <th key={header} className="px-4 py-3 font-medium">{header}</th>)}</tr>
                </thead>
                <tbody>
                  {filteredTopTraderRows.map((trader) => (
                    <tr
                      key={trader.wallet}
                      onClick={() => setSelectedTarget({ type: "trader", trader: trader.wallet })}
                      className={`cursor-pointer border-b border-white/[0.055] transition hover:bg-blue-300/[0.035] ${selectedTarget.type === "trader" && selectedTarget.trader === trader.wallet ? "bg-blue-300/[0.06]" : ""}`}
                    >
                      <td className="px-4 py-3 font-mono text-blue-100">{trader.wallet}</td>
                      <td className="px-4 py-3 font-mono text-white">{trader.primaryAsset}</td>
                      <td className="px-4 py-3 text-slate-200">{trader.direction}</td>
                      <td className={`px-4 py-3 font-mono ${trader.netExposure >= 0 ? "text-emerald-200" : "text-red-200"}`}>{money(trader.netExposure)}</td>
                      <td className="px-4 py-3 font-mono text-slate-200">{trader.avgLeverage.toFixed(1)}x</td>
                      <td className={`px-4 py-3 font-mono ${trader.pnl7d >= 0 ? "text-emerald-200" : "text-red-200"}`}>{money(trader.pnl7d)}</td>
                      <td className={`px-4 py-3 font-mono ${trader.roi30d >= 0 ? "text-emerald-200" : "text-red-200"}`}>{signedPct(trader.roi30d)}</td>
                      <td className="px-4 py-3 font-mono text-blue-100">{trader.winRate}%</td>
                      <td className="px-4 py-3 font-mono text-blue-100">{trader.convictionScore}</td>
                      <td className="px-4 py-3 font-mono text-blue-100">{trader.earlySignalScore}</td>
                      <td className="px-4 py-3"><BiasBadge bias={trader.currentBias} /></td>
                      <td className="px-4 py-3 font-mono text-slate-500">{trader.lastActivity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid gap-3 xl:grid-cols-2">
              {filteredTopTraderRows.slice(0, 4).map((trader) => (
                <div key={`${trader.wallet}-datapoints`} className="rounded-xl border border-white/[0.065] bg-black/25 p-3">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-blue-100">{trader.wallet} explainability</div>
                    <Badge className="h-6 rounded-lg border border-white/[0.08] bg-white/[0.035] font-mono text-[10px] text-slate-300">{trader.primaryAsset}</Badge>
                  </div>
                  <div className="space-y-2">{trader.datapoints.slice(0, 2).map((datapoint) => <div key={datapoint} className="rounded-lg bg-white/[0.035] px-3 py-2 text-xs leading-5 text-slate-300">{datapoint}</div>)}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Panel>

        <Panel>
          <PanelHeader title="Trader Cluster Detection" action="Premium intelligence" />
          <CardContent className="grid gap-3 p-4 xl:grid-cols-2">
            {traderClusters.map((cluster) => (
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
                    ["Historical ROI", signedPct(selectedTrader.historicalRoi)],
                    ["Historical accuracy", `${selectedTrader.historicalAccuracy}%`],
                    ["Avg leverage", `${selectedTrader.avgLeverage.toFixed(1)}x`],
                    ["Open exposure", money(selectedTrader.openExposure)],
                    ["Current conviction", `${selectedTrader.convictionScore}`],
                    ["Early Signal Score™", `${selectedTrader.earlySignalScore}`],
                    ["Smart Money Rating™", `${selectedTrader.smartMoneyRating}`],
                    ["Flow Influence Score™", `${selectedTrader.flowInfluenceScore}`],
                    ["Narrative Alignment™", `${selectedTrader.narrativeAlignment}`],
                    ["Divergence Index™", `${selectedTrader.divergenceIndex}`],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-white/[0.065] bg-white/[0.025] p-3">
                      <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-slate-600">{label}</div>
                      <div className="mt-2 text-xs leading-5 text-slate-200">{value}</div>
                    </div>
                  ))}
                </div>

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
                    ["7D net flow", money(selectedAssetFlow.netFlow7d)],
                    ["Flow vs average", `${signedPct(selectedAssetFlow.flowVsAvg)} vs 30D`],
                    ["OI change", signedPct(selectedAssetFlow.openInterestChange)],
                    ["Top trader bias", selectedAssetFlow.topTraderBias],
                    ["Long/short ratio", selectedAssetFlow.longShortRatio],
                    ["Whale concentration", selectedAssetFlow.whaleConcentration],
                    ["Abnormal Flow Index™", `${selectedAssetFlow.abnormalFlowIndex}`],
                    ["Capital Rotation Score™", `${selectedAssetFlow.capitalRotationScore}`],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-white/[0.065] bg-white/[0.025] p-3">
                      <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-slate-600">{label}</div>
                      <div className="mt-2 text-xs leading-5 text-slate-200">{value}</div>
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
