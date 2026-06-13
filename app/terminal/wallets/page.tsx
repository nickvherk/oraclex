"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, ChevronDown, Lock, Network, Search, SlidersHorizontal, X } from "lucide-react";
import { useRouter } from "next/navigation";

import { BiasBadge, Panel, PanelHeader, SeverityBadge } from "@/components/terminal/terminal-shell";
import { Badge } from "@/components/ui/badge";
import { CardContent } from "@/components/ui/card";
import { FeatureGate, PremiumLockedOverlay } from "@/components/terminal/access-gate";
import { useCurrentPlan } from "@/lib/access-control";
import { walletProfilePath } from "@/lib/wallet-profile-data";

const TRACKED_WALLET_UNIVERSE = 12480;
const SMART_MONEY_WALLETS = 1250;
const ACTIVE_WALLETS = 840;
const LIVE_WALLET_ACCESS_LIMIT = 200;

const walletGroups = ["All Loaded", "Top 20", "Top 50", "Top 100", "Top 250", "Top 500", "Smart Money Only", "Early Signal Wallets", "High Conviction Wallets"] as const;
const categories = ["All", "Sports", "Politics", "Geopolitics", "Crypto", "Macro", "AI"] as const;
const biases = ["All", "YES-heavy", "NO-heavy", "Neutral", "Contrarian"] as const;
const signalTypes = ["All", "Consensus", "Divergence", "Momentum", "Whale Rotation", "Early Positioning"] as const;
const marketTypes = ["All Markets", "Binary", "Spread", "Range", "Event Basket"] as const;
const sortOptions = ["Conviction", "ROI", "Win Rate", "Volume", "Early Signal", "Divergence"] as const;
const rangeKeys = ["overallPnl", "currentValue", "activePositions", "totalWins", "totalLosses", "totalPositions", "winRate"] as const;
const TRADER_PAGE_SIZE = 25;

type WalletGroup = (typeof walletGroups)[number];
type Category = (typeof categories)[number];
type Bias = (typeof biases)[number];
type SignalType = (typeof signalTypes)[number];
type MarketType = (typeof marketTypes)[number];
type SortOption = (typeof sortOptions)[number];
type SortKey = "rank" | "roi" | "winRate" | "volume" | "conviction" | "earlySignal" | "divergence";
type RangeKey = (typeof rangeKeys)[number];
type NumberRange = { min: number; max: number };
type TraderRangeFilters = Record<RangeKey, NumberRange>;
type TraderScreenerFilters = TraderRangeFilters & {
  search: string;
};

type WalletRecord = {
  rank: number;
  wallet: string;
  tag: string;
  category: Exclude<Category, "All">;
  cohort?: string;
  marketCategory?: string;
  walletTags?: string[];
  group: string;
  pnl?: number | null;
  pnlSource?: "live" | "derived" | "unavailable";
  roi: number;
  winRate: number;
  volume: number;
  bias: Exclude<Bias, "All">;
  conviction: number;
  earlySignal: number;
  smartMoneyRating: number;
  divergence: number;
  activeMarkets: number;
  lastPosition: string;
  lastActive: string;
  signalType: Exclude<SignalType, "All">;
  exposure: string;
  specialization: string;
  accuracy: number;
  cluster: string;
  marketType: Exclude<MarketType, "All Markets">;
  positionSize: number;
  entries: string[];
  activeMarketsList: string[];
  interpretation: string;
  totalPositions?: number;
  totalWins?: number;
  totalLosses?: number;
};

type WalletIntelligencePayload = {
  stats: {
    trackedWalletUniverse: number;
    smartMoneyWallets: number;
    activeWallets: number;
  };
  wallets: WalletRecord[];
  consensusInsights: typeof consensusInsights;
  clusters: typeof clusters;
  questionExamples: typeof questionExamples;
  smartMoneyConsensus?: SmartMoneyConsensus[];
  pagination?: {
    limit: number;
    offset: number;
    loadedWallets: number;
    offsetWorking?: boolean;
    hasMore?: boolean;
  };
  sourceStatus?: {
    source: "live" | "derived" | "fallback" | "unavailable";
    label: string;
    liveFields: string[];
    derivedFields: string[];
    fallbackFields: string[];
    unavailableFields: string[];
  };
};

type SmartMoneyConsensus = {
  market: string;
  cohort: string;
  alignedPercent: string;
  side: "YES" | "NO";
  netExposure: string;
  timeframe: string;
  direction: string;
  evidenceStrength: "High" | "Medium";
  alignedWallets: string;
  category: Exclude<Category, "All">;
  group: WalletGroup;
  topWalletTags: string[];
  why: string;
  source?: "live" | "derived" | "fallback" | "unavailable";
};

// TODO: Future integration: connect PolymarketAnalytics API / wallet positions API.
const wallets: WalletRecord[] = [
  {
    rank: 3,
    wallet: "0x7c81a4b6f23d91e44a8c6f210bb2a981b49d03ef",
    tag: "GEO-EARLY-03",
    category: "Geopolitics",
    group: "Top 50 Geopolitics Wallets",
    roi: 38.4,
    winRate: 72,
    volume: 18400000,
    bias: "YES-heavy",
    conviction: 91,
    earlySignal: 88,
    smartMoneyRating: 94,
    divergence: 71,
    activeMarkets: 11,
    lastPosition: "+$620K YES ceasefire at 41c",
    lastActive: "4m ago",
    signalType: "Early Positioning",
    exposure: "72% YES / 16% NO / 12% cash",
    specialization: "Geopolitical de-escalation and event-window markets",
    accuracy: 74,
    cluster: "Ceasefire accumulation cluster A",
    marketType: "Binary",
    positionSize: 620000,
    entries: ["+$620K YES Ukraine ceasefire at 41c", "+$180K YES sanctions extension at 58c", "-$90K reduced NO maritime escalation"],
    activeMarketsList: ["Ukraine ceasefire before September", "EU sanctions extension", "Middle East summit announcement"],
    interpretation: "Rank 3 geopolitics wallet is 72% YES exposed across ceasefire outcomes, with $18.4M tracked volume, 91 Conviction Score, and 71 Flow Divergence Index.",
  },
  {
    rank: 8,
    wallet: "0x91d022c45aa4ef70d657dba303318c8344f5a117",
    tag: "SPORTS-MM-08",
    category: "Sports",
    group: "Top 20 Sports Wallets",
    roi: 24.7,
    winRate: 68,
    volume: 12600000,
    bias: "NO-heavy",
    conviction: 84,
    earlySignal: 76,
    smartMoneyRating: 86,
    divergence: 82,
    activeMarkets: 18,
    lastPosition: "+$340K NO Lakers spread at 52c",
    lastActive: "8m ago",
    signalType: "Divergence",
    exposure: "27% YES / 61% NO / 12% cash",
    specialization: "US sports spreads, totals, and public-favorite fades",
    accuracy: 69,
    cluster: "Sports public divergence cluster",
    marketType: "Spread",
    positionSize: 340000,
    entries: ["+$340K NO Lakers spread at 52c", "+$210K YES under 214.5 at 47c", "+$125K NO Yankees F5 at 55c"],
    activeMarketsList: ["Lakers spread market", "Knicks moneyline", "Yankees first five innings"],
    interpretation: "Top sports wallet is 61% NO exposed against public-favorite game lines, backed by $12.6M tracked volume, 18 active markets, and an 82 Flow Divergence Index.",
  },
  {
    rank: 12,
    wallet: "0x48f3cb240ff2ac88d01e8e75c635911c03fc7704",
    tag: "CRYPTO-INST-12",
    category: "Crypto",
    group: "Top 100 Crypto Wallets",
    roi: 31.2,
    winRate: 70,
    volume: 22100000,
    bias: "YES-heavy",
    conviction: 89,
    earlySignal: 82,
    smartMoneyRating: 91,
    divergence: 66,
    activeMarkets: 14,
    lastPosition: "+$1.1M YES BTC ATH at 57c",
    lastActive: "12m ago",
    signalType: "Momentum",
    exposure: "69% YES / 20% NO / 11% cash",
    specialization: "Crypto adoption, ETF, and ATH probability markets",
    accuracy: 71,
    cluster: "Institutional crypto adoption cluster",
    marketType: "Event Basket",
    positionSize: 1100000,
    entries: ["+$1.1M YES BTC ATH at 57c", "+$540K YES SOL ETF at 62c", "+$220K NO ETH volume at 43c"],
    activeMarketsList: ["BTC new ATH this quarter", "SOL ETF approval", "ETH relative volume"],
    interpretation: "Top crypto wallet is 69% YES exposed to adoption outcomes, with $22.1M tracked volume and 82 Early Signal Score before broad odds repricing.",
  },
  {
    rank: 18,
    wallet: "0x13b9af0d65a45e1f862d40bdf6c1b3ab7401d4f2",
    tag: "MACRO-HEDGE-18",
    category: "Macro",
    group: "Top Macro Wallets",
    roi: 19.6,
    winRate: 64,
    volume: 9800000,
    bias: "Neutral",
    conviction: 63,
    earlySignal: 71,
    smartMoneyRating: 70,
    divergence: 39,
    activeMarkets: 9,
    lastPosition: "+$240K YES Fed cut at 38c",
    lastActive: "19m ago",
    signalType: "Consensus",
    exposure: "39% YES / 34% NO / 27% cash",
    specialization: "Rates, inflation prints, and Treasury event risk",
    accuracy: 65,
    cluster: "Macro hedge basket",
    marketType: "Range",
    positionSize: 240000,
    entries: ["+$240K YES Fed cut at 38c", "+$190K NO CPI below 2.6 at 61c", "+$80K YES auction tail"],
    activeMarketsList: ["Fed cuts rates next meeting", "CPI below 2.6", "Treasury auction tail"],
    interpretation: "Top macro wallet is balanced at 39% YES and 34% NO, so OracleX treats it as regime context rather than a directional signal.",
  },
  {
    rank: 21,
    wallet: "0x6a502df4b0aece8316322778f3d11a88762b8120",
    tag: "AI-RELEASE-21",
    category: "AI",
    group: "Top AI Wallets",
    roi: 44.1,
    winRate: 75,
    volume: 7400000,
    bias: "YES-heavy",
    conviction: 93,
    earlySignal: 90,
    smartMoneyRating: 95,
    divergence: 78,
    activeMarkets: 8,
    lastPosition: "+$420K YES agent OS at 54c",
    lastActive: "23m ago",
    signalType: "Whale Rotation",
    exposure: "76% YES / 13% NO / 11% cash",
    specialization: "AI release cycles and frontier lab event markets",
    accuracy: 76,
    cluster: "AI release-cycle accumulation",
    marketType: "Binary",
    positionSize: 420000,
    entries: ["+$420K YES agent OS at 54c", "+$160K YES model release at 49c", "+$70K NO EU AI delay at 36c"],
    activeMarketsList: ["Major AI lab releases agent OS", "Frontier model release", "EU AI act delay"],
    interpretation: "AI release specialist is 76% YES exposed, with 44.1% ROI, 75% win rate, and 90 Early Signal Score across release-cycle markets.",
  },
  {
    rank: 31,
    wallet: "0xe1f55a8a92f96431c5b79d11d2a71d89c0396bc0",
    tag: "POL-POLL-31",
    category: "Politics",
    group: "Top Politics Wallets",
    roi: 16.8,
    winRate: 61,
    volume: 15600000,
    bias: "NO-heavy",
    conviction: 77,
    earlySignal: 69,
    smartMoneyRating: 75,
    divergence: 54,
    activeMarkets: 16,
    lastPosition: "+$510K NO approval above 45c",
    lastActive: "31m ago",
    signalType: "Consensus",
    exposure: "28% YES / 58% NO / 14% cash",
    specialization: "Polling dislocations and event-calendar politics",
    accuracy: 62,
    cluster: "Approval fade cluster",
    marketType: "Binary",
    positionSize: 510000,
    entries: ["+$510K NO approval above 45c", "+$130K YES debate held before July", "+$95K NO polling surge"],
    activeMarketsList: ["Incumbent approval above 45%", "Debate before July", "Third-party polling surge"],
    interpretation: "Politics desk is 58% NO exposed to approval recovery, backed by $15.6M tracked volume and 16 active markets.",
  },
  {
    rank: 44,
    wallet: "0xb3bb81402066ea311cf5eb862f9c642982fe7a83",
    tag: "GEO-LINK-44",
    category: "Geopolitics",
    group: "Top 50 Geopolitics Wallets",
    roi: 27.5,
    winRate: 67,
    volume: 6100000,
    bias: "YES-heavy",
    conviction: 81,
    earlySignal: 86,
    smartMoneyRating: 83,
    divergence: 68,
    activeMarkets: 7,
    lastPosition: "+$260K YES ceasefire extension at 46c",
    lastActive: "42m ago",
    signalType: "Early Positioning",
    exposure: "63% YES / 22% NO / 15% cash",
    specialization: "Secondary geopolitics wallets linked to larger clusters",
    accuracy: 68,
    cluster: "Ceasefire accumulation cluster A",
    marketType: "Binary",
    positionSize: 260000,
    entries: ["+$260K YES extension at 46c", "+$140K NO oil disruption at 51c", "+$90K YES summit at 33c"],
    activeMarketsList: ["Middle East ceasefire extension", "Oil disruption", "Summit announcement"],
    interpretation: "Linked geopolitics wallet confirms the de-escalation cluster with 63% YES exposure, 86 Early Signal Score, and 68 Flow Divergence Index.",
  },
  {
    rank: 87,
    wallet: "0x2bf1904d1728eb3e2c66351d4374fbd73e096d51",
    tag: "SPORTS-LATE-87",
    category: "Sports",
    group: "Top 100 Sports Wallets",
    roi: 21.1,
    winRate: 66,
    volume: 8900000,
    bias: "YES-heavy",
    conviction: 79,
    earlySignal: 73,
    smartMoneyRating: 82,
    divergence: 61,
    activeMarkets: 22,
    lastPosition: "+$280K YES Celtics 1H at 49c",
    lastActive: "55m ago",
    signalType: "Momentum",
    exposure: "64% YES / 21% NO / 15% cash",
    specialization: "Late injury news and NBA first-half markets",
    accuracy: 67,
    cluster: "NBA injury-news basket",
    marketType: "Spread",
    positionSize: 280000,
    entries: ["+$280K YES Celtics 1H at 49c", "+$170K YES under 221.5", "-$60K closed NO player prop"],
    activeMarketsList: ["Celtics first half", "NBA total", "player availability basket"],
    interpretation: "Top 100 sports wallet is 64% YES exposed on NBA markets after injury news, with $8.9M tracked volume and 22 active markets.",
  },
  {
    rank: 142,
    wallet: "0xad904d3c8938dfce6a9170ee41e5b7d5a9d13af4",
    tag: "CRYPTO-SOL-142",
    category: "Crypto",
    group: "Top 500 Crypto Wallets",
    roi: 29.8,
    winRate: 69,
    volume: 13400000,
    bias: "YES-heavy",
    conviction: 86,
    earlySignal: 84,
    smartMoneyRating: 88,
    divergence: 64,
    activeMarkets: 12,
    lastPosition: "+$480K YES SOL ETF at 60c",
    lastActive: "1h ago",
    signalType: "Early Positioning",
    exposure: "67% YES / 18% NO / 15% cash",
    specialization: "SOL ecosystem catalysts and ETF market structure",
    accuracy: 70,
    cluster: "SOL ETF accumulation cluster",
    marketType: "Event Basket",
    positionSize: 480000,
    entries: ["+$480K YES SOL ETF at 60c", "+$190K YES SOL ecosystem TVL", "+$95K NO ETH relative strength"],
    activeMarketsList: ["SOL ETF approval", "SOL ecosystem TVL", "ETH/SOL rotation"],
    interpretation: "Top 500 crypto wallet is 67% YES exposed to SOL ecosystem outcomes, with 84 Early Signal Score and $13.4M tracked volume.",
  },
];

const consensusInsights = [
  { segment: "Top 20 Sports Wallets", wallets: 20, volume: 38200000, exposure: "64% YES / 36% NO", timeframe: "24H", confidence: 82, insight: "64% YES exposure across tonight's NBA markets after +$6.8M net adds in the last 24H." },
  { segment: "Top 50 Geopolitics Wallets", wallets: 50, volume: 54700000, exposure: "71% peace / 29% escalation", timeframe: "7D", confidence: 88, insight: "71% positioned toward ceasefire or peace outcomes across four linked markets." },
  { segment: "Top 100 Crypto Wallets", wallets: 100, volume: 91600000, exposure: "58% YES / 42% NO", timeframe: "24H", confidence: 84, insight: "58% accumulating YES exposure on SOL ecosystem markets before odds move." },
  { segment: "Top Macro Wallets", wallets: 76, volume: 33700000, exposure: "53% cuts / 47% no cuts", timeframe: "7D", confidence: 73, insight: "Macro specialists remain near balanced, with only a 6-point tilt toward rate-cut outcomes." },
];

const smartMoneyConsensus: SmartMoneyConsensus[] = [
  {
    market: "Lakers Win Tonight",
    cohort: "Top 20 Sports Wallets",
    alignedPercent: "60%",
    side: "YES",
    netExposure: "$6.8M net adds",
    timeframe: "24h",
    direction: "Lakers YES",
    evidenceStrength: "High",
    alignedWallets: "12 wallets aligned",
    category: "Sports",
    group: "Top 20",
    topWalletTags: ["SPORTS-MM-08", "SPORTS-LATE-87", "NBA-INJURY-14"],
    why: "60% of tracked top sports wallets are positioned on Lakers YES for tonight's game, with $6.8M net exposure added over the last 24h.",
  },
  {
    market: "SOL ETF Approval",
    cohort: "Top 50 Crypto Wallets",
    alignedPercent: "64%",
    side: "YES",
    netExposure: "$3.8M net adds",
    timeframe: "6h",
    direction: "SOL ETF YES",
    evidenceStrength: "High",
    alignedWallets: "14 wallets aligned",
    category: "Crypto",
    group: "Top 50",
    topWalletTags: ["CRYPTO-INST-12", "CRYPTO-SOL-142", "SOL-ETF-09"],
    why: "Top crypto wallets are adding YES exposure faster than public market probability has adjusted, led by SOL ETF specialists and crypto adoption wallets.",
  },
  {
    market: "Fed Cuts Next Meeting",
    cohort: "Top 100 Macro Wallets",
    alignedPercent: "53%",
    side: "YES",
    netExposure: "$2.1M net adds",
    timeframe: "7d",
    direction: "Fed cuts YES",
    evidenceStrength: "Medium",
    alignedWallets: "31 wallets aligned",
    category: "Macro",
    group: "Top 100",
    topWalletTags: ["MACRO-HEDGE-18", "RATES-CUT-44", "CPI-DESK-12"],
    why: "Macro specialists are only modestly tilted toward cuts, so OracleX treats this as a directional lean rather than a high-conviction consensus.",
  },
];

const clusters = [
  { title: "Top 50 geopolitics wallets pricing peace", wallets: 50, volume: 54700000, confidence: 88, impact: "High", divergence: "71 Flow Divergence Index™", severity: "critical", detail: "Ceasefire-linked wallets added $8.4M net YES exposure over 7D while public odds moved only +3.1 points." },
  { title: "Top 20 sports wallets active before games", wallets: 20, volume: 38200000, confidence: 82, impact: "Medium", divergence: "64% YES exposure", severity: "high", detail: "Sports specialists increased NBA YES exposure by $6.8M over 24H with 840 active wallets in the selected universe." },
  { title: "Top 100 crypto wallets accumulating SOL YES", wallets: 100, volume: 91600000, confidence: 84, impact: "Medium", divergence: "58% YES exposure", severity: "high", detail: "Crypto wallets added $11.2M SOL ecosystem YES exposure, with 84 Early Signal Score before broad market repricing." },
];

const questionExamples = [
  "What are top sports wallets doing before tonight's games?",
  "Are top geopolitics wallets pricing peace or escalation?",
  "Are top crypto wallets accumulating YES exposure before odds move?",
];

function money(value: number) {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  return `$${(value / 1000).toFixed(0)}K`;
}

function shortWallet(wallet: string) {
  return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
}

function badgeBias(bias: WalletRecord["bias"]) {
  if (bias === "YES-heavy") return "Bullish";
  if (bias === "NO-heavy" || bias === "Contrarian") return "Bearish";
  return "Neutral";
}

function metricTone(value: number) {
  if (value >= 85) return "text-blue-100";
  if (value >= 70) return "text-emerald-200";
  return "text-slate-300";
}

function totalPnl(wallet: WalletRecord) {
  if (typeof wallet.pnl === "number" && Number.isFinite(wallet.pnl)) {
    return { value: money(wallet.pnl), label: wallet.pnlSource === "live" ? "Live from Falcon" : "Derived estimate" };
  }

  if (Number.isFinite(wallet.volume) && Number.isFinite(wallet.roi)) {
    return { value: money(Math.round(wallet.volume * (wallet.roi / 100))), label: "Derived estimate" };
  }

  return { value: "PnL unavailable", label: "Unavailable" };
}

function finiteNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value);
}

function isFiniteNumber(value: number | null): value is number {
  return value !== null && Number.isFinite(value);
}

function traderOverallPnl(wallet: WalletRecord) {
  if (typeof wallet.pnl === "number" && Number.isFinite(wallet.pnl)) return wallet.pnl;
  if (Number.isFinite(wallet.volume) && Number.isFinite(wallet.roi)) return Math.round(wallet.volume * (wallet.roi / 100));
  return null;
}

function traderCurrentValue(wallet: WalletRecord) {
  return finiteNumber(wallet.volume) ? wallet.volume : null;
}

function traderActivePositions(wallet: WalletRecord) {
  return finiteNumber(wallet.activeMarkets) ? wallet.activeMarkets : null;
}

function traderTotalPositions(wallet: WalletRecord) {
  if (typeof wallet.totalPositions === "number" && Number.isFinite(wallet.totalPositions)) return wallet.totalPositions;
  return traderActivePositions(wallet);
}

function traderTotalWins(wallet: WalletRecord) {
  if (typeof wallet.totalWins === "number" && Number.isFinite(wallet.totalWins)) return wallet.totalWins;
  const totalPositions = traderTotalPositions(wallet);
  if (totalPositions === null || !finiteNumber(wallet.winRate)) return null;
  return Math.round(totalPositions * (wallet.winRate / 100));
}

function traderTotalLosses(wallet: WalletRecord) {
  if (typeof wallet.totalLosses === "number" && Number.isFinite(wallet.totalLosses)) return wallet.totalLosses;
  const totalPositions = traderTotalPositions(wallet);
  const totalWins = traderTotalWins(wallet);
  if (totalPositions === null || totalWins === null) return null;
  return Math.max(0, totalPositions - totalWins);
}

function traderMetricValue(wallet: WalletRecord, key: RangeKey) {
  if (key === "overallPnl") return traderOverallPnl(wallet);
  if (key === "currentValue") return traderCurrentValue(wallet);
  if (key === "activePositions") return traderActivePositions(wallet);
  if (key === "totalWins") return traderTotalWins(wallet);
  if (key === "totalLosses") return traderTotalLosses(wallet);
  if (key === "totalPositions") return traderTotalPositions(wallet);
  return finiteNumber(wallet.winRate) ? wallet.winRate : null;
}

function normalizeFilterText(value: string) {
  return value.trim().toLowerCase();
}

function walletTagValues(wallet: WalletRecord) {
  return [
    wallet.category,
    wallet.cohort,
    wallet.tag,
    wallet.marketCategory,
    ...(Array.isArray(wallet.walletTags) ? wallet.walletTags : []),
  ].filter((value): value is string => typeof value === "string" && value.trim().length > 0);
}

function walletSearchText(wallet: WalletRecord) {
  return [
    wallet.wallet,
    wallet.group,
    wallet.specialization,
    wallet.lastPosition,
    ...walletTagValues(wallet),
  ].join(" ").toLowerCase();
}

function niceFloor(value: number, step: number) {
  return Math.floor(value / step) * step;
}

function niceCeil(value: number, step: number) {
  return Math.ceil(value / step) * step;
}

function createRangeBounds(pageWallets: WalletRecord[]): TraderRangeFilters {
  const walletsForBounds = pageWallets.length ? pageWallets : wallets;
  const boundsFor = (key: RangeKey, step: number, fallbackMax: number): NumberRange => {
    const values = walletsForBounds.map((wallet) => traderMetricValue(wallet, key)).filter(isFiniteNumber);
    if (!values.length) return { min: 0, max: fallbackMax };
    const min = Math.min(0, niceFloor(Math.min(...values), step));
    const max = Math.max(fallbackMax, niceCeil(Math.max(...values), step));
    return { min, max: max === min ? min + step : max };
  };

  return {
    overallPnl: boundsFor("overallPnl", 100000, 1000000),
    currentValue: boundsFor("currentValue", 1000000, 25000000),
    activePositions: boundsFor("activePositions", 1, 25),
    totalWins: boundsFor("totalWins", 1, 20),
    totalLosses: boundsFor("totalLosses", 1, 10),
    totalPositions: boundsFor("totalPositions", 1, 25),
    winRate: { min: 0, max: 100 },
  };
}

function createDefaultScreenerFilters(pageWallets: WalletRecord[]): TraderScreenerFilters {
  return {
    search: "",
    ...createRangeBounds(pageWallets),
  };
}

function sameRange(a: NumberRange, b: NumberRange) {
  return a.min === b.min && a.max === b.max;
}

function rangeIsActive(key: RangeKey, filters: TraderScreenerFilters, defaults: TraderScreenerFilters) {
  return !sameRange(filters[key], defaults[key]);
}

function activeFilterCount(filters: TraderScreenerFilters, defaults: TraderScreenerFilters) {
  return [
    filters.search.trim() ? "search" : null,
    ...rangeKeys.map((key) => (rangeIsActive(key, filters, defaults) ? key : null)),
  ].filter(Boolean).length;
}

function formatRangeValue(value: number, mode: "money" | "count" | "percent") {
  if (mode === "money") return money(value);
  if (mode === "percent") return `${value}%`;
  return value.toLocaleString();
}

function consensusLeadWallet(pageWallets: WalletRecord[], item: SmartMoneyConsensus) {
  const categoryWallets = pageWallets.filter((wallet) => wallet.category === item.category).sort((a, b) => a.rank - b.rank);
  const taggedWallet = categoryWallets.find((wallet) => item.topWalletTags.includes(wallet.tag));
  if (taggedWallet) return taggedWallet;
  if (item.market === "SOL ETF Approval") return categoryWallets.find((wallet) => wallet.tag === "CRYPTO-INST-12") ?? categoryWallets[0];
  if (item.market === "Fed Cuts Next Meeting") return categoryWallets.find((wallet) => wallet.tag === "MACRO-HEDGE-18") ?? categoryWallets[0];
  if (item.market === "Lakers Win Tonight") return categoryWallets.find((wallet) => wallet.tag === "SPORTS-MM-08") ?? categoryWallets[0];
  return categoryWallets[0] ?? pageWallets[0];
}

function consensusPositionPreview(wallet: WalletRecord, item: SmartMoneyConsensus | null) {
  if (!item) return wallet.lastPosition;
  if (item.market === "Lakers Win Tonight") return wallet.tag === "SPORTS-MM-08" ? "+$340K YES Lakers win tonight at 61c" : "+$280K YES Lakers injury-news basket at 49c";
  if (item.market === "SOL ETF Approval") return wallet.tag === "CRYPTO-INST-12" ? "+$540K YES SOL ETF at 62c" : "+$480K YES SOL ETF at 60c";
  if (item.market === "Fed Cuts Next Meeting") return "+$240K YES Fed cuts next meeting at 38c";
  return wallet.lastPosition;
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

function RangeFilterControl({
  label,
  value,
  bounds,
  mode,
  onChange,
}: {
  label: string;
  value: NumberRange;
  bounds: NumberRange;
  mode: "money" | "count" | "percent";
  onChange: (next: NumberRange) => void;
}) {
  const step = mode === "money" ? 100000 : 1;
  const minValue = Math.max(bounds.min, Math.min(value.min, value.max));
  const maxValue = Math.min(bounds.max, Math.max(value.min, value.max));

  function commit(nextMin: number, nextMax: number) {
    const safeMin = Math.max(bounds.min, Math.min(nextMin, bounds.max));
    const safeMax = Math.max(bounds.min, Math.min(nextMax, bounds.max));
    onChange({ min: Math.min(safeMin, safeMax), max: Math.max(safeMin, safeMax) });
  }

  return (
    <div className="rounded-lg border border-white/[0.065] bg-black/25 p-3">
      <div className="mb-3 flex items-center justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-500">
        <span>{label}</span>
        <span className="text-blue-100">{formatRangeValue(minValue, mode)} - {formatRangeValue(maxValue, mode)}</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <label>
          <span className="mb-1 block font-mono text-[9px] uppercase tracking-[0.14em] text-slate-600">Min</span>
          <input
            type="number"
            value={minValue}
            min={bounds.min}
            max={bounds.max}
            step={step}
            onChange={(event) => commit(Number(event.target.value), maxValue)}
            className="h-9 w-full rounded-lg border border-white/[0.08] bg-[#050812] px-2 font-mono text-[11px] text-slate-200 outline-none focus:border-blue-300/30"
          />
        </label>
        <label>
          <span className="mb-1 block font-mono text-[9px] uppercase tracking-[0.14em] text-slate-600">Max</span>
          <input
            type="number"
            value={maxValue}
            min={bounds.min}
            max={bounds.max}
            step={step}
            onChange={(event) => commit(minValue, Number(event.target.value))}
            className="h-9 w-full rounded-lg border border-white/[0.08] bg-[#050812] px-2 font-mono text-[11px] text-slate-200 outline-none focus:border-blue-300/30"
          />
        </label>
      </div>
      <div className="mt-3 grid gap-2">
        <input className="w-full accent-blue-300" type="range" min={bounds.min} max={bounds.max} step={step} value={minValue} onChange={(event) => commit(Number(event.target.value), maxValue)} />
        <input className="w-full accent-blue-300" type="range" min={bounds.min} max={bounds.max} step={step} value={maxValue} onChange={(event) => commit(minValue, Number(event.target.value))} />
      </div>
    </div>
  );
}

function isWalletIntelligencePayload(value: unknown): value is WalletIntelligencePayload {
  if (!value || typeof value !== "object" || !("wallets" in value)) return false;
  const payload = value as Partial<WalletIntelligencePayload>;
  return Array.isArray(payload.wallets) && payload.wallets.every((wallet) => wallet && typeof wallet === "object" && typeof (wallet as WalletRecord).wallet === "string");
}

function useWalletIntelligenceData() {
  const [data, setData] = useState<WalletIntelligencePayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    setIsLoading(true);
    setError(null);

    fetch("/api/prediction-market-analytics?limit=200&offset=0")
      .then((response) => {
        if (!response.ok) throw new Error(`Prediction market analytics API failed with ${response.status}`);
        return response.json() as Promise<unknown>;
      })
      .then((payload) => {
        if (cancelled) return;
        if (!isWalletIntelligencePayload(payload)) {
          throw new Error("Prediction market analytics API returned an unexpected payload shape.");
        }
        setData(payload);
      })
      .catch((fetchError) => {
        if (process.env.NODE_ENV === "development") console.error("[prediction-market-analytics-fetch]", fetchError);
        if (!cancelled) {
          setData(null);
          setError(fetchError instanceof Error ? fetchError.message : "Unknown prediction market analytics API error.");
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (isLoading) {
    return {
      isLoading,
      error,
      isDemoFallback: false,
      stats: {
        trackedWalletUniverse: TRACKED_WALLET_UNIVERSE,
        smartMoneyWallets: SMART_MONEY_WALLETS,
        activeWallets: ACTIVE_WALLETS,
      },
      wallets: [] as WalletRecord[],
      consensusInsights,
      clusters,
      questionExamples,
      smartMoneyConsensus,
      pagination: {
        limit: 200,
        offset: 0,
        loadedWallets: 0,
        offsetWorking: false,
        hasMore: false,
      },
      sourceStatus: {
        source: "unavailable" as const,
        label: "Loading live Falcon data.",
        liveFields: [],
        derivedFields: [],
        fallbackFields: [],
        unavailableFields: [],
      },
    };
  }

  const isDemoFallback = !data || data.sourceStatus?.source === "fallback";

  return {
    isLoading,
    error,
    isDemoFallback,
    stats: data?.stats ?? {
      trackedWalletUniverse: TRACKED_WALLET_UNIVERSE,
      smartMoneyWallets: SMART_MONEY_WALLETS,
      activeWallets: ACTIVE_WALLETS,
    },
    wallets: data?.wallets ?? wallets,
    consensusInsights: data?.consensusInsights ?? consensusInsights,
    clusters: data?.clusters ?? clusters,
    questionExamples: data?.questionExamples ?? questionExamples,
    smartMoneyConsensus: data?.smartMoneyConsensus ?? smartMoneyConsensus,
    pagination: data?.pagination ?? {
      limit: 200,
      offset: 0,
      loadedWallets: data?.wallets.length ?? wallets.length,
      offsetWorking: false,
      hasMore: false,
    },
    sourceStatus: data?.sourceStatus ?? {
      source: "fallback" as const,
      label: "Demo fallback data. Live Falcon data unavailable.",
      liveFields: [],
      derivedFields: [],
      fallbackFields: ["top traders", "rankings", "wallet addresses", "PnL", "ROI", "win rate", "volume", "positions", "consensus"],
      unavailableFields: [],
    },
  };
}

export default function WalletIntelligencePage() {
  return (
    <FeatureGate feature="walletIntelligence" explanation="Prediction Market Analytics starts at Observer access. Sign in with a demo account or upgrade your plan.">
      <WalletIntelligenceByPlan />
    </FeatureGate>
  );
}

function WalletIntelligenceByPlan() {
  const { plan } = useCurrentPlan();
  const walletData = useWalletIntelligenceData();

  if (plan === "observer") {
    return <ObserverWalletIntelligence walletData={walletData} />;
  }

  return <FullWalletIntelligencePage walletData={walletData} />;
}

function ObserverWalletIntelligence({ walletData }: { walletData: ReturnType<typeof useWalletIntelligenceData> }) {
  const basicWallets = walletData.wallets.slice(0, 5);
  const totalVolume = basicWallets.reduce((sum, wallet) => sum + wallet.volume, 0);

  return (
    <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="grid gap-4">
        <section className="rounded-xl border border-white/[0.075] bg-[#070b14]/86 p-4">
          <Badge className="mb-3 h-6 rounded-lg border border-blue-300/15 bg-blue-300/[0.07] font-mono text-[10px] uppercase text-blue-100">Observer wallet summary</Badge>
          <h1 className="text-2xl font-semibold tracking-[-0.03em] text-white">Basic Prediction Market Analytics</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">Observer access includes a limited view of top wallet behavior, active volume, and basic smart money bias. Advanced filters and full wallet analytics require Analyst access.</p>
          <div className="mt-4 grid gap-2 md:grid-cols-3">
            {[
              ["Visible wallet rows", `${basicWallets.length}`],
              ["Tracked sample volume", money(totalVolume)],
              ["Current bias", "YES-heavy"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-white/[0.065] bg-white/[0.025] px-3 py-2">
                <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-slate-600">{label}</div>
                <div className="mt-1 font-mono text-sm text-white">{value}</div>
              </div>
            ))}
          </div>
        </section>

        <Panel>
          <PanelHeader title="Basic Wallet Rows" action="5 row preview" />
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full min-w-[760px] text-left text-xs">
              <thead className="border-b border-white/[0.075] bg-white/[0.025] font-mono text-[10px] uppercase tracking-[0.12em] text-slate-600">
                <tr>{["Wallet", "Category", "Volume", "Win Rate", "ROI", "Bias", "Last Active"].map((header) => <th key={header} className="px-4 py-3 font-medium">{header}</th>)}</tr>
              </thead>
              <tbody>
                {basicWallets.map((wallet) => (
                  <tr key={wallet.wallet} className="border-b border-white/[0.055]">
                    <td className="px-4 py-3 font-mono text-blue-100">{shortWallet(wallet.wallet)}</td>
                    <td className="px-4 py-3 text-slate-300">{wallet.category}</td>
                    <td className="px-4 py-3 font-mono text-slate-200">{money(wallet.volume)}</td>
                    <td className="px-4 py-3 font-mono text-slate-200">{wallet.winRate}%</td>
                    <td className="px-4 py-3 font-mono text-emerald-200">{wallet.roi.toFixed(1)}%</td>
                    <td className="px-4 py-3"><BiasBadge bias={badgeBias(wallet.bias)} /></td>
                    <td className="px-4 py-3 font-mono text-slate-500">{wallet.lastActive}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Panel>

        <Panel>
          <PanelHeader title="Detailed Wallet Insights" action="Analyst" />
          <CardContent className="grid gap-3 p-4 md:grid-cols-2">
            {["Advanced filters", "Wallet clusters", "Early signal scores", "Expanded wallet universe coming soon", "Smart money consensus"].map((feature) => (
              <div key={feature} className="relative min-h-40 overflow-hidden rounded-xl border border-white/[0.075] bg-black/28 p-4">
                <div className="blur-[2px]">
                  <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-600">{feature}</div>
                  <div className="mt-3 h-2 w-2/3 rounded-full bg-blue-300/20" />
                  <div className="mt-2 h-2 w-1/2 rounded-full bg-white/10" />
                  <div className="mt-5 font-mono text-2xl text-white">--</div>
                </div>
                <PremiumLockedOverlay copy="Unlock full Prediction Market Analytics with Analyst" />
              </div>
            ))}
          </CardContent>
        </Panel>
      </div>

      <aside className="grid gap-4 2xl:sticky 2xl:top-5 2xl:self-start">
        <Panel>
          <PanelHeader title="Advanced Wallet Filters" action="Analyst" />
          <CardContent className="p-4">
            <div className="mb-4 grid size-11 place-items-center rounded-xl border border-blue-300/18 bg-blue-300/[0.07] text-blue-100">
              <Lock className="size-5" />
            </div>
            <h2 className="text-lg font-semibold tracking-[-0.02em] text-white">Unlock full wallet analytics</h2>
            <p className="mt-2 text-xs leading-6 text-slate-400">Analyst access unlocks advanced filters, smart money signals, wallet clusters, evidence stacks, and full table controls.</p>
            <button type="button" onClick={() => window.location.assign("/terminal/settings")} className="mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-blue-300/45 bg-[#1f6fff] px-4 py-2 text-xs font-semibold text-white hover:bg-[#3b82f6]">
              Upgrade Access
              <ArrowRight className="size-4" />
            </button>
          </CardContent>
        </Panel>
      </aside>
    </div>
  );
}

function FullWalletIntelligencePage({ walletData }: { walletData: ReturnType<typeof useWalletIntelligenceData> }) {
  const router = useRouter();
  const [group, setGroup] = useState<WalletGroup>("All Loaded");
  const [sort, setSort] = useState<SortOption>("Conviction");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageWallets = walletData.isLoading ? [] : walletData.wallets.length ? walletData.wallets : wallets;
  const defaultScreenerFilters = useMemo(() => createDefaultScreenerFilters(pageWallets), [pageWallets]);
  const [draftFilters, setDraftFilters] = useState<TraderScreenerFilters>(() => createDefaultScreenerFilters(pageWallets));
  const [appliedFilters, setAppliedFilters] = useState<TraderScreenerFilters>(() => createDefaultScreenerFilters(pageWallets));

  useEffect(() => {
    const nextDefaults = createDefaultScreenerFilters(pageWallets);
    setDraftFilters(nextDefaults);
    setAppliedFilters(nextDefaults);
    setCurrentPage(1);
  }, [pageWallets]);

  const sortKey: SortKey = sort === "ROI" ? "roi" : sort === "Win Rate" ? "winRate" : sort === "Volume" ? "volume" : sort === "Early Signal" ? "earlySignal" : sort === "Divergence" ? "divergence" : "conviction";

  const filteredWallets = useMemo(() => {
    const groupLimit = group.startsWith("Top") ? Number(group.replace("Top ", "")) : Number.POSITIVE_INFINITY;
    const search = appliedFilters.search.trim().toLowerCase();
    return pageWallets
      .filter((wallet) => wallet.rank <= groupLimit)
      .filter((wallet) => rangeKeys.every((key) => {
        const metric = traderMetricValue(wallet, key);
        const range = appliedFilters[key];
        if (metric === null) return !rangeIsActive(key, appliedFilters, defaultScreenerFilters);
        return metric >= range.min && metric <= range.max;
      }))
      .filter((wallet) => group !== "Smart Money Only" || wallet.smartMoneyRating >= 85)
      .filter((wallet) => group !== "High Conviction Wallets" || wallet.conviction >= 85)
      .filter((wallet) => group !== "Early Signal Wallets" || wallet.earlySignal >= 82)
      .filter((wallet) => !search || walletSearchText(wallet).includes(search))
      .sort((a, b) => b[sortKey] - a[sortKey]);
  }, [appliedFilters, defaultScreenerFilters, group, pageWallets, sortKey]);

  const trackedWalletUniverse = Math.max(walletData.stats.trackedWalletUniverse, TRACKED_WALLET_UNIVERSE);
  const loadedWalletCount = pageWallets.length;
  const liveWalletCount = Math.min(loadedWalletCount, LIVE_WALLET_ACCESS_LIMIT);
  const lockedWalletCount = Math.max(0, trackedWalletUniverse - liveWalletCount);
  const hasActiveLiveFilters = group !== "All Loaded" || activeFilterCount(appliedFilters, defaultScreenerFilters) > 0;
  const livePreviewLabel = `${liveWalletCount.toLocaleString()} live wallets available now · ${lockedWalletCount.toLocaleString()} coming soon`;
  const tableTotalCount = hasActiveLiveFilters ? filteredWallets.length : trackedWalletUniverse;
  const pageCount = Math.max(1, Math.ceil(tableTotalCount / TRADER_PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, pageCount);
  const pageStartIndex = tableTotalCount ? (safeCurrentPage - 1) * TRADER_PAGE_SIZE : 0;
  const pageEndIndex = Math.min(pageStartIndex + TRADER_PAGE_SIZE, tableTotalCount);
  const isLockedUniversePage = !walletData.isLoading && !hasActiveLiveFilters && pageStartIndex >= liveWalletCount;
  const displayedWallets = isLockedUniversePage ? [] : filteredWallets.slice(pageStartIndex, Math.min(pageStartIndex + TRADER_PAGE_SIZE, liveWalletCount));
  const visibleStart = tableTotalCount ? pageStartIndex + 1 : 0;
  const visibleEnd = pageEndIndex;
  const loadedSourceLabel = walletData.isDemoFallback ? "demo fallback data" : walletData.sourceStatus.source === "live" ? "Falcon" : walletData.sourceStatus.source;
  const loadedWalletLabel = walletData.isLoading
    ? "Loading live Falcon wallets"
    : walletData.sourceStatus.source === "live"
      ? `${liveWalletCount.toLocaleString()} live wallets loaded from Falcon`
      : `${loadedWalletCount.toLocaleString()} wallets loaded from ${loadedSourceLabel}`;
  const summaryVolume = filteredWallets.reduce((sum, wallet) => sum + wallet.volume, 0);
  const yes = filteredWallets.filter((wallet) => wallet.bias === "YES-heavy").length;
  const no = filteredWallets.filter((wallet) => wallet.bias === "NO-heavy").length;
  const currentBias = yes > no ? "YES-heavy" : no > yes ? "NO-heavy" : "Neutral";
  const divergenceAlerts = filteredWallets.filter((wallet) => wallet.divergence >= 65).length;

  useEffect(() => {
    setCurrentPage(1);
  }, [appliedFilters, group, sort]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, pageCount));
  }, [pageCount]);

  const activeChips = [
    group,
    appliedFilters.search ? `Search: ${appliedFilters.search}` : null,
    !sameRange(appliedFilters.overallPnl, defaultScreenerFilters.overallPnl) ? `PnL ${formatRangeValue(appliedFilters.overallPnl.min, "money")} - ${formatRangeValue(appliedFilters.overallPnl.max, "money")}` : null,
    !sameRange(appliedFilters.currentValue, defaultScreenerFilters.currentValue) ? `Value ${formatRangeValue(appliedFilters.currentValue.min, "money")} - ${formatRangeValue(appliedFilters.currentValue.max, "money")}` : null,
    !sameRange(appliedFilters.activePositions, defaultScreenerFilters.activePositions) ? `Active ${appliedFilters.activePositions.min}-${appliedFilters.activePositions.max}` : null,
    !sameRange(appliedFilters.totalWins, defaultScreenerFilters.totalWins) ? `Wins ${appliedFilters.totalWins.min}-${appliedFilters.totalWins.max}` : null,
    !sameRange(appliedFilters.totalLosses, defaultScreenerFilters.totalLosses) ? `Losses ${appliedFilters.totalLosses.min}-${appliedFilters.totalLosses.max}` : null,
    !sameRange(appliedFilters.totalPositions, defaultScreenerFilters.totalPositions) ? `Positions ${appliedFilters.totalPositions.min}-${appliedFilters.totalPositions.max}` : null,
    !sameRange(appliedFilters.winRate, defaultScreenerFilters.winRate) ? `Win ${appliedFilters.winRate.min}-${appliedFilters.winRate.max}%` : null,
  ].filter(Boolean);

  function updateDraftRange(key: RangeKey, next: NumberRange) {
    setDraftFilters((current) => ({ ...current, [key]: next }));
  }

  function applyFilters() {
    setAppliedFilters(draftFilters);
    setCurrentPage(1);
  }

  function clearFilters() {
    const nextDefaults = createDefaultScreenerFilters(pageWallets);
    setGroup("All Loaded");
    setSort("Conviction");
    setDraftFilters(nextDefaults);
    setAppliedFilters(nextDefaults);
    setCurrentPage(1);
  }

  function requestExpandedWalletAccess() {
    window.alert("Expanded wallet universe access is coming soon. Your request has been noted.");
  }

  function openWalletProfile(wallet: string) {
    if (walletData.isDemoFallback) {
      window.alert("This is demo fallback data and may not have live Polymarket profile enrichment.");
      return;
    }
    router.push(walletProfilePath(wallet));
  }

  function viewConsensusWallets(item: SmartMoneyConsensus) {
    const leadWallet = consensusLeadWallet(pageWallets, item);
    if (leadWallet) openWalletProfile(leadWallet.wallet);
  }

  return (
    <div className="grid gap-4">
      <div className="grid min-w-0 gap-4">
        {walletData.isLoading ? (
          <section className="rounded-xl border border-blue-300/15 bg-blue-300/[0.055] p-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-blue-100">Loading live Falcon data</div>
            <p className="mt-2 text-sm leading-6 text-slate-300">OracleX is loading live Prediction Market Analytics. Demo fallback wallets are hidden until the live request finishes.</p>
          </section>
        ) : null}
        {walletData.error ? (
          <section className="rounded-xl border border-amber-300/20 bg-amber-300/[0.06] p-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-amber-100">Live Falcon data unavailable</div>
            <p className="mt-2 text-sm leading-6 text-slate-300">Demo fallback data is shown and wallet profiles may not have live Polymarket enrichment.</p>
            {process.env.NODE_ENV === "development" ? <p className="mt-2 font-mono text-[11px] text-amber-100">{walletData.error}</p> : null}
          </section>
        ) : null}
        {walletData.isDemoFallback && !walletData.error ? (
          <section className="rounded-xl border border-amber-300/20 bg-amber-300/[0.06] p-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-amber-100">Demo fallback data</div>
            <p className="mt-2 text-sm leading-6 text-slate-300">Live Falcon data did not return usable wallets. Demo fallback rows are shown for layout continuity and may not have live Polymarket profile enrichment.</p>
          </section>
        ) : null}
        <section className="rounded-xl border border-white/[0.075] bg-[#070b14]/86 p-4">
          <div className="mb-4 flex flex-col gap-3 border-b border-white/[0.075] pb-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Badge className="mb-3 h-6 rounded-lg border border-blue-300/15 bg-blue-300/[0.07] font-mono text-[10px] uppercase text-blue-100">Prediction market analytics system</Badge>
              <h1 className="text-2xl font-semibold tracking-[-0.03em] text-white">What are the best prediction market wallets doing right now?</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">OracleX tracks top Polymarket traders, open positions, recent changes, wallet alignment, and market exposure to surface actionable smart-money behavior.</p>
              <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-600">Source: {walletData.sourceStatus.label}</div>
              <div className="mt-2 text-xs leading-5 text-slate-500">Live access currently covers the top 200 Falcon wallets. Expanded wallet universe coming soon.</div>
            </div>
            <div className="grid grid-cols-3 gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-500">
              <span>Tracked universe: {trackedWalletUniverse.toLocaleString()}</span>
              <span>{liveWalletCount.toLocaleString()} live wallets</span>
              <span>{lockedWalletCount.toLocaleString()} locked</span>
            </div>
          </div>
          <div className="grid gap-2 md:grid-cols-3 xl:grid-cols-6">
            {[
              ["Tracked Wallet Universe", trackedWalletUniverse.toLocaleString()],
              ["Loaded Wallets", `${liveWalletCount.toLocaleString()} live`],
              ["Locked Wallets", lockedWalletCount.toLocaleString()],
              ["Filtered Results", filteredWallets.length.toLocaleString()],
              ["Tracked Volume", money(summaryVolume)],
              ["Current Smart Money Bias", currentBias],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-white/[0.065] bg-white/[0.025] px-3 py-2">
                <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-slate-600">{label}</div>
                <div className="mt-1 truncate font-mono text-sm text-white">{value}</div>
              </div>
            ))}
          </div>
        </section>

        <Panel>
          <PanelHeader title="Prediction Market Analytics Filters" action="Advanced hidden by default" />
          <CardContent className="space-y-4 p-4">
            <div className="grid gap-3 lg:grid-cols-[180px_180px_auto]">
              <SelectControl label="Wallet Group" value={group} options={walletGroups} onChange={setGroup} />
              <SelectControl label="Sort" value={sort} options={sortOptions} onChange={setSort} />
              <button type="button" onClick={() => setAdvancedOpen((next) => !next)} className="mt-auto inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-blue-300/18 bg-blue-300/[0.075] px-3 font-mono text-[11px] uppercase tracking-[0.12em] text-blue-100">
                <SlidersHorizontal className="size-4" />
                Advanced Filters
                <ChevronDown className={`size-4 transition ${advancedOpen ? "rotate-180" : ""}`} />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {activeChips.map((chip) => (
                <span key={chip as string} className="inline-flex h-7 items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.035] px-2 font-mono text-[10px] text-slate-300">{chip}</span>
              ))}
              <button type="button" onClick={clearFilters} className="inline-flex h-7 items-center gap-1 rounded-lg border border-white/[0.08] px-2 font-mono text-[10px] text-slate-500 hover:text-slate-200">
                <X className="size-3" />
                Clear filters
              </button>
            </div>

            {advancedOpen ? (
              <div className="grid gap-4 border-t border-white/[0.07] pt-4">
                <div className="grid gap-4">
                  <label>
                    <span className="mb-1 block font-mono text-[9px] uppercase tracking-[0.14em] text-slate-600">Search</span>
                    <span className="flex h-10 min-w-0 items-center gap-2 rounded-lg border border-white/[0.08] bg-[#050812] px-3">
                      <Search className="size-4 text-slate-500" />
                      <input
                        value={draftFilters.search}
                        onChange={(event) => setDraftFilters((current) => ({ ...current, search: event.target.value }))}
                        className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
                        placeholder="Search by trader name or ID..."
                      />
                    </span>
                  </label>
                </div>
                <div className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-3">
                  <RangeFilterControl label="Overall PnL" value={draftFilters.overallPnl} bounds={defaultScreenerFilters.overallPnl} mode="money" onChange={(next) => updateDraftRange("overallPnl", next)} />
                  <RangeFilterControl label="Current Value" value={draftFilters.currentValue} bounds={defaultScreenerFilters.currentValue} mode="money" onChange={(next) => updateDraftRange("currentValue", next)} />
                  <RangeFilterControl label="Active Positions" value={draftFilters.activePositions} bounds={defaultScreenerFilters.activePositions} mode="count" onChange={(next) => updateDraftRange("activePositions", next)} />
                  <RangeFilterControl label="Total Wins" value={draftFilters.totalWins} bounds={defaultScreenerFilters.totalWins} mode="count" onChange={(next) => updateDraftRange("totalWins", next)} />
                  <RangeFilterControl label="Total Losses" value={draftFilters.totalLosses} bounds={defaultScreenerFilters.totalLosses} mode="count" onChange={(next) => updateDraftRange("totalLosses", next)} />
                  <RangeFilterControl label="Total Positions" value={draftFilters.totalPositions} bounds={defaultScreenerFilters.totalPositions} mode="count" onChange={(next) => updateDraftRange("totalPositions", next)} />
                  <RangeFilterControl label="Win Rate (%)" value={draftFilters.winRate} bounds={defaultScreenerFilters.winRate} mode="percent" onChange={(next) => updateDraftRange("winRate", next)} />
                </div>
                <div className="flex flex-wrap items-center justify-end gap-2 border-t border-white/[0.07] pt-4">
                  <button type="button" onClick={applyFilters} className="inline-flex h-10 items-center justify-center rounded-lg border border-blue-300/35 bg-blue-300/[0.12] px-4 font-mono text-[11px] uppercase tracking-[0.12em] text-blue-100 hover:bg-blue-300/[0.18]">
                    Apply Filters
                  </button>
                  <button type="button" onClick={clearFilters} className="inline-flex h-10 items-center justify-center rounded-lg border border-white/[0.08] px-4 font-mono text-[11px] uppercase tracking-[0.12em] text-slate-400 hover:text-slate-200">
                    Clear Filters
                  </button>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Panel>

        <Panel>
          <PanelHeader title="Trader Intelligence" action={`showing ${visibleStart}-${visibleEnd} of ${tableTotalCount.toLocaleString()} ${hasActiveLiveFilters ? "live-wallet matches" : "tracked wallets"}`} />
          <div className="border-b border-white/[0.075] px-4 py-3 text-xs text-slate-400">
            <div>Click any live wallet row or wallet address to open a full Wallet Profile with positions, evidence, related wallets, and historical performance.</div>
            <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-600">{livePreviewLabel}</div>
          </div>
          <CardContent className="relative overflow-x-auto p-0">
            <table className="w-full min-w-[1420px] text-left text-xs">
              <thead className="border-b border-white/[0.075] bg-white/[0.025] font-mono text-[10px] uppercase tracking-[0.12em] text-slate-600">
                <tr>
                  {["Wallet", "Total PnL", "ROI", "Win Rate", "Active Positions", "Largest Position", "Recent Position Change", "Market Category", "Conviction Score", "Last Activity"].map((header) => (
                    <th key={header} className="px-4 py-3 font-medium">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayedWallets.map((wallet) => (
                  <tr key={wallet.wallet} onClick={() => openWalletProfile(wallet.wallet)} className="cursor-pointer border-b border-white/[0.055] transition hover:bg-blue-300/[0.035]">
                    <td className="px-4 py-3">
                      <button type="button" onClick={(event) => { event.stopPropagation(); openWalletProfile(wallet.wallet); }} className="font-mono text-blue-100 underline-offset-4 hover:underline">
                        {shortWallet(wallet.wallet)}
                      </button>
                      <div className="mt-1 font-mono text-[10px] text-slate-600">{wallet.tag}</div>
                      {walletData.isDemoFallback ? <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.12em] text-amber-100">Demo fallback data</div> : null}
                    </td>
                    <td className="px-4 py-3 font-mono">
                      <div className={totalPnl(wallet).label === "Unavailable" ? "text-slate-500" : "text-emerald-200"}>{totalPnl(wallet).value}</div>
                      <div className="mt-1 text-[9px] uppercase tracking-[0.12em] text-slate-600">{totalPnl(wallet).label}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-emerald-200">{wallet.roi.toFixed(1)}%</td>
                    <td className="px-4 py-3 font-mono text-slate-200">{wallet.winRate}%</td>
                    <td className="px-4 py-3 font-mono text-slate-300">{wallet.activeMarkets}</td>
                    <td className="px-4 py-3 font-mono text-slate-200">{money(wallet.positionSize)}</td>
                    <td className="max-w-[300px] truncate px-4 py-3 font-mono text-[11px] text-slate-300">{consensusPositionPreview(wallet, null)}</td>
                    <td className="px-4 py-3 text-slate-300">
                      <div>{wallet.category}</div>
                      <div className="mt-1 font-mono text-[10px] text-slate-600">{wallet.group}</div>
                    </td>
                    <td className={`px-4 py-3 font-mono ${metricTone(wallet.conviction)}`}>{wallet.conviction}</td>
                    <td className="px-4 py-3 font-mono text-slate-500">{wallet.lastActive}</td>
                  </tr>
                ))}
                {isLockedUniversePage ? Array.from({ length: TRADER_PAGE_SIZE }, (_, index) => (
                  <tr key={`locked-wallet-${safeCurrentPage}-${index}`} className="border-b border-white/[0.055]">
                    <td className="px-4 py-3">
                      <div className="h-3 w-28 rounded bg-slate-500/20 blur-[1px]" />
                      <div className="mt-2 h-2 w-20 rounded bg-slate-600/15 blur-[1px]" />
                    </td>
                    <td className="px-4 py-3"><div className="h-3 w-16 rounded bg-emerald-300/15 blur-[1px]" /></td>
                    <td className="px-4 py-3"><div className="h-3 w-12 rounded bg-emerald-300/15 blur-[1px]" /></td>
                    <td className="px-4 py-3"><div className="h-3 w-12 rounded bg-slate-500/20 blur-[1px]" /></td>
                    <td className="px-4 py-3"><div className="h-3 w-10 rounded bg-slate-500/20 blur-[1px]" /></td>
                    <td className="px-4 py-3"><div className="h-3 w-16 rounded bg-slate-500/20 blur-[1px]" /></td>
                    <td className="px-4 py-3"><div className="h-3 w-52 rounded bg-slate-500/20 blur-[1px]" /></td>
                    <td className="px-4 py-3"><div className="h-3 w-20 rounded bg-slate-500/20 blur-[1px]" /></td>
                    <td className="px-4 py-3"><div className="h-3 w-8 rounded bg-blue-300/15 blur-[1px]" /></td>
                    <td className="px-4 py-3"><div className="h-3 w-14 rounded bg-slate-600/15 blur-[1px]" /></td>
                  </tr>
                )) : null}
	                {!displayedWallets.length && !isLockedUniversePage ? (
	                  <tr>
	                    <td colSpan={10} className="px-4 py-8 text-center">
	                      <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-slate-500">{walletData.isLoading ? "Loading live Falcon wallets." : "No matching wallets found in the 200 live-wallet preview."}</div>
	                      {!walletData.isLoading ? <div className="mt-2 text-xs text-slate-500">Expanded wallet universe coming soon.</div> : null}
	                      {!walletData.isLoading ? (
	                        <button type="button" onClick={clearFilters} className="mt-4 inline-flex h-9 items-center justify-center rounded-lg border border-blue-300/30 bg-blue-300/[0.08] px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-blue-100 hover:bg-blue-300/[0.13]">
	                          Clear filters
	                        </button>
	                      ) : null}
	                    </td>
	                  </tr>
	                ) : null}
              </tbody>
            </table>
            {isLockedUniversePage ? (
              <div className="absolute inset-x-0 top-[86px] bottom-[53px] grid place-items-center bg-[#050812]/62 backdrop-blur-[2px]">
                <div className="mx-4 max-w-xl rounded-xl border border-blue-300/20 bg-[#070b14]/95 p-6 text-center shadow-[0_22px_80px_rgba(0,0,0,0.42)]">
                  <div className="mx-auto grid size-11 place-items-center rounded-xl border border-blue-300/20 bg-blue-300/[0.08] text-blue-100">
                    <Lock className="size-5" />
                  </div>
                  <Badge className="mt-4 h-6 rounded-lg border border-blue-300/20 bg-blue-300/[0.08] font-mono text-[10px] uppercase text-blue-100">Coming Soon</Badge>
                  <h3 className="mt-3 text-lg font-semibold tracking-[-0.02em] text-white">Expanded wallet universe coming soon</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">OracleX currently provides live access to the top 200 Falcon leaderboard wallets. The remaining tracked wallet universe will unlock once expanded pagination is available.</p>
                  <button type="button" onClick={requestExpandedWalletAccess} className="mt-5 inline-flex h-10 items-center justify-center rounded-lg border border-blue-300/35 bg-blue-300/[0.12] px-4 font-mono text-[11px] uppercase tracking-[0.12em] text-blue-100 hover:bg-blue-300/[0.18]">
                    Request Expanded Wallet Access
                  </button>
                </div>
              </div>
            ) : null}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.075] px-4 py-3 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-500">
              <span>Showing {visibleStart}-{visibleEnd} of {tableTotalCount.toLocaleString()} {hasActiveLiveFilters ? "live-wallet matches" : "tracked wallets"}</span>
              <span>{livePreviewLabel}</span>
              <span>Filtered results: {filteredWallets.length.toLocaleString()}</span>
              <span>Tracked universe: {trackedWalletUniverse.toLocaleString()}</span>
              <span>Loaded for this view: {liveWalletCount.toLocaleString()} live</span>
              <span>Live from Falcon: wallet, rank, ROI, win rate, volume, active markets, h-score</span>
              <span>Mapped: current value to volume, active positions to active markets</span>
              <span>Derived: total wins, losses, positions when Falcon omits trade counts</span>
              <span>Source: {walletData.sourceStatus.source}</span>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.075] px-4 py-3">
              <button
                type="button"
                disabled={safeCurrentPage <= 1}
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                className="inline-flex h-9 items-center justify-center rounded-lg border border-white/[0.08] px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-400 transition hover:text-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-slate-500">Page {safeCurrentPage} of {pageCount}</span>
              <button
                type="button"
                disabled={safeCurrentPage >= pageCount}
                onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))}
                className="inline-flex h-9 items-center justify-center rounded-lg border border-white/[0.08] px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-400 transition hover:text-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </CardContent>
        </Panel>

        <Panel>
          <PanelHeader title="Smart Money Consensus" action="Actionable wallet cohorts" />
          <CardContent className="grid gap-3 p-4 xl:grid-cols-2">
            {walletData.smartMoneyConsensus.map((item) => (
              <div key={item.market} className="rounded-xl border border-white/[0.07] bg-black/25 p-4 transition hover:border-blue-300/20">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="text-sm font-semibold text-white">{item.cohort} — {item.market}</div>
                    <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-600">Source: {item.source ?? walletData.sourceStatus.source}</div>
                  </div>
                  <Badge className="h-6 rounded-lg border border-blue-300/15 bg-blue-300/[0.06] font-mono text-[10px] text-blue-100">{item.evidenceStrength} evidence</Badge>
                </div>
                <p className="text-xs leading-5 text-slate-300">{item.why}</p>
                <div className="mt-3 grid grid-cols-2 gap-2 font-mono text-[10px] md:grid-cols-5">
                  <span className="rounded bg-white/[0.035] p-2 text-blue-100">{item.alignedPercent} {item.side}</span>
                  <span className="rounded bg-white/[0.035] p-2 text-slate-400">{item.netExposure}</span>
                  <span className="rounded bg-white/[0.035] p-2 text-slate-400">{item.timeframe}</span>
                  <span className="rounded bg-white/[0.035] p-2 text-slate-400">{item.alignedWallets}</span>
                  <span className="rounded bg-white/[0.035] p-2 text-blue-100">{item.direction}</span>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-1.5">
                    {item.topWalletTags.map((tag) => <Badge key={tag} className="h-6 rounded-lg border border-white/[0.08] bg-white/[0.035] font-mono text-[10px] text-slate-300">{tag}</Badge>)}
                  </div>
                  <button type="button" onClick={() => viewConsensusWallets(item)} className="inline-flex min-h-8 items-center justify-center gap-2 rounded-lg border border-blue-300/30 bg-blue-300/[0.08] px-3 py-1.5 text-xs font-semibold text-blue-100 hover:bg-blue-300/[0.13]">
                    View Wallets
                    <ArrowRight className="size-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </CardContent>
        </Panel>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(360px,1.1fr)]">
          <Panel>
            <PanelHeader title="Questions OracleX Answers" action="Category-specific" />
            <CardContent className="space-y-2 p-4">
              {walletData.questionExamples.map((question) => <div key={question} className="rounded-lg border border-white/[0.06] bg-white/[0.025] px-3 py-2 text-xs text-slate-300">{question}</div>)}
            </CardContent>
          </Panel>

          <Panel>
            <PanelHeader title="Wallet Cluster Detection" action="Premium intelligence" />
            <CardContent className="space-y-3 p-4">
              {walletData.clusters.map((cluster) => (
                <div key={cluster.title} className="rounded-xl border border-white/[0.07] bg-black/25 p-4">
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-white"><Network className="size-4 text-blue-200" />{cluster.title}</div>
                    <SeverityBadge severity={cluster.severity} />
                  </div>
                  <p className="text-xs leading-5 text-slate-400">{cluster.detail}</p>
                  <div className="mt-3 grid grid-cols-2 gap-2 font-mono text-[10px] text-slate-400 md:grid-cols-5">
                    <span>{cluster.wallets} wallets</span>
                    <span>{money(cluster.volume)}</span>
                    <span>{cluster.confidence}% conf</span>
                    <span>{cluster.impact} impact</span>
                    <span>{cluster.divergence}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Panel>
        </div>
      </div>
    </div>
  );
}
