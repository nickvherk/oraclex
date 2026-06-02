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

const walletGroups = ["Top 20", "Top 50", "Top 100", "Top 250", "Top 500", "Smart Money Only", "Early Signal Wallets", "High Conviction Wallets"] as const;
const categories = ["All", "Sports", "Politics", "Geopolitics", "Crypto", "Macro", "AI"] as const;
const biases = ["All", "YES-heavy", "NO-heavy", "Neutral", "Contrarian"] as const;
const signalTypes = ["All", "Consensus", "Divergence", "Momentum", "Whale Rotation", "Early Positioning"] as const;
const timeframes = ["1H", "24H", "7D", "30D", "All Time"] as const;
const walletTags = ["All Tags", "Specialists", "Whales", "Market Makers", "Early Entrants", "Repeat Winners"] as const;
const marketTypes = ["All Markets", "Binary", "Spread", "Range", "Event Basket"] as const;
const positionSizes = ["Any Size", "$100K+", "$250K+", "$500K+", "$1M+"] as const;
const recentActivity = ["Any Activity", "15m", "1H", "4H", "24H"] as const;
const sortOptions = ["Conviction", "ROI", "Win Rate", "Volume", "Early Signal", "Divergence"] as const;

type WalletGroup = (typeof walletGroups)[number];
type Category = (typeof categories)[number];
type Bias = (typeof biases)[number];
type SignalType = (typeof signalTypes)[number];
type Timeframe = (typeof timeframes)[number];
type WalletTag = (typeof walletTags)[number];
type MarketType = (typeof marketTypes)[number];
type PositionSize = (typeof positionSizes)[number];
type RecentActivity = (typeof recentActivity)[number];
type SortOption = (typeof sortOptions)[number];
type SortKey = "rank" | "roi" | "winRate" | "volume" | "conviction" | "earlySignal" | "divergence";

type WalletRecord = {
  rank: number;
  wallet: string;
  tag: string;
  category: Exclude<Category, "All">;
  group: string;
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
  return Math.round(wallet.volume * (wallet.roi / 100));
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

function isWalletIntelligencePayload(value: unknown): value is WalletIntelligencePayload {
  if (!value || typeof value !== "object" || !("wallets" in value)) return false;
  const payload = value as Partial<WalletIntelligencePayload>;
  return Array.isArray(payload.wallets) && payload.wallets.every((wallet) => wallet && typeof wallet === "object" && typeof (wallet as WalletRecord).wallet === "string");
}

function useWalletIntelligenceData() {
  const [data, setData] = useState<WalletIntelligencePayload | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/wallet-intelligence")
      .then((response) => {
        if (!response.ok) throw new Error("Prediction market analytics API failed");
        return response.json() as Promise<unknown>;
      })
      .then((payload) => {
        if (!cancelled && isWalletIntelligencePayload(payload)) {
          setData(payload);
        }
      })
      .catch(() => {
        if (!cancelled) setData(null);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    stats: data?.stats ?? {
      trackedWalletUniverse: TRACKED_WALLET_UNIVERSE,
      smartMoneyWallets: SMART_MONEY_WALLETS,
      activeWallets: ACTIVE_WALLETS,
    },
    wallets: data?.wallets ?? wallets,
    consensusInsights: data?.consensusInsights ?? consensusInsights,
    clusters: data?.clusters ?? clusters,
    questionExamples: data?.questionExamples ?? questionExamples,
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
            {["Advanced filters", "Wallet clusters", "Early signal scores", "Full wallet universe", "Smart money consensus"].map((feature) => (
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
  const [group, setGroup] = useState<WalletGroup>("Top 50");
  const [category, setCategory] = useState<Category>("All");
  const [bias, setBias] = useState<Bias>("All");
  const [signalType, setSignalType] = useState<SignalType>("All");
  const [timeframe, setTimeframe] = useState<Timeframe>("7D");
  const [walletTag, setWalletTag] = useState<WalletTag>("All Tags");
  const [marketType, setMarketType] = useState<MarketType>("All Markets");
  const [positionSize, setPositionSize] = useState<PositionSize>("Any Size");
  const [activity, setActivity] = useState<RecentActivity>("Any Activity");
  const [sort, setSort] = useState<SortOption>("Conviction");
  const [minRoi, setMinRoi] = useState(15);
  const [minVolume, setMinVolume] = useState(5);
  const [minWinRate, setMinWinRate] = useState(60);
  const [minActivePositions, setMinActivePositions] = useState(1);
  const [query, setQuery] = useState("");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const pageWallets = walletData.wallets.length ? walletData.wallets : wallets;

  const sortKey: SortKey = sort === "ROI" ? "roi" : sort === "Win Rate" ? "winRate" : sort === "Volume" ? "volume" : sort === "Early Signal" ? "earlySignal" : sort === "Divergence" ? "divergence" : "conviction";
  const positionThreshold = positionSize === "$1M+" ? 1000000 : positionSize === "$500K+" ? 500000 : positionSize === "$250K+" ? 250000 : positionSize === "$100K+" ? 100000 : 0;

  const filteredWallets = useMemo(() => {
    const groupLimit = group.startsWith("Top") ? Number(group.replace("Top ", "")) : 500;
    return pageWallets
      .filter((wallet) => wallet.rank <= groupLimit)
      .filter((wallet) => category === "All" || wallet.category === category)
      .filter((wallet) => bias === "All" || wallet.bias === bias)
      .filter((wallet) => signalType === "All" || wallet.signalType === signalType)
      .filter((wallet) => marketType === "All Markets" || wallet.marketType === marketType)
      .filter((wallet) => wallet.positionSize >= positionThreshold)
      .filter((wallet) => wallet.roi >= minRoi)
      .filter((wallet) => wallet.volume >= minVolume * 1000000)
      .filter((wallet) => wallet.winRate >= minWinRate)
      .filter((wallet) => wallet.activeMarkets >= minActivePositions)
      .filter((wallet) => group !== "Smart Money Only" || wallet.smartMoneyRating >= 85)
      .filter((wallet) => group !== "High Conviction Wallets" || wallet.conviction >= 85)
      .filter((wallet) => group !== "Early Signal Wallets" || wallet.earlySignal >= 82)
      .filter((wallet) => walletTag === "All Tags" || wallet.specialization.toLowerCase().includes(walletTag.split(" ")[0].toLowerCase()) || wallet.tag.toLowerCase().includes(walletTag.split(" ")[0].toLowerCase()))
      .filter((wallet) => !query || [wallet.wallet, wallet.tag, wallet.category, wallet.group, wallet.specialization, wallet.lastPosition].join(" ").toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => b[sortKey] - a[sortKey]);
  }, [bias, category, group, marketType, minActivePositions, minRoi, minVolume, minWinRate, pageWallets, positionThreshold, query, signalType, sortKey, walletTag]);

  const displayedWallets = filteredWallets.length ? filteredWallets : pageWallets;
  const summaryVolume = displayedWallets.reduce((sum, wallet) => sum + wallet.volume, 0);
  const yes = displayedWallets.filter((wallet) => wallet.bias === "YES-heavy").length;
  const no = displayedWallets.filter((wallet) => wallet.bias === "NO-heavy").length;
  const currentBias = yes > no ? "YES-heavy" : no > yes ? "NO-heavy" : "Neutral";
  const divergenceAlerts = displayedWallets.filter((wallet) => wallet.divergence >= 65).length;

  const activeChips = [
    group,
    category !== "All" ? category : null,
    bias !== "All" ? bias : null,
    signalType !== "All" ? signalType : null,
    `${timeframe} window`,
    minRoi > 0 ? `ROI >= ${minRoi}%` : null,
    minVolume > 0 ? `Volume >= $${minVolume}M` : null,
    minWinRate > 40 ? `Win >= ${minWinRate}%` : null,
  ].filter(Boolean);

  function clearFilters() {
    setGroup("Top 50");
    setCategory("All");
    setBias("All");
    setSignalType("All");
    setTimeframe("7D");
    setWalletTag("All Tags");
    setMarketType("All Markets");
    setPositionSize("Any Size");
    setActivity("Any Activity");
    setSort("Conviction");
    setMinRoi(15);
    setMinVolume(5);
    setMinWinRate(60);
    setMinActivePositions(1);
    setQuery("");
  }

  function openWalletProfile(wallet: string) {
    router.push(walletProfilePath(wallet));
  }

  function viewConsensusWallets(item: SmartMoneyConsensus) {
    const leadWallet = consensusLeadWallet(pageWallets, item);
    if (leadWallet) openWalletProfile(leadWallet.wallet);
  }

  return (
    <div className="grid gap-4">
      <div className="grid min-w-0 gap-4">
        <section className="rounded-xl border border-white/[0.075] bg-[#070b14]/86 p-4">
          <div className="mb-4 flex flex-col gap-3 border-b border-white/[0.075] pb-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Badge className="mb-3 h-6 rounded-lg border border-blue-300/15 bg-blue-300/[0.07] font-mono text-[10px] uppercase text-blue-100">Prediction market analytics system</Badge>
              <h1 className="text-2xl font-semibold tracking-[-0.03em] text-white">What are the best prediction market wallets doing right now?</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">OracleX tracks top Polymarket traders, open positions, recent changes, wallet alignment, and market exposure to surface actionable smart-money behavior.</p>
              <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-600">Source: Polymarket wallet analytics placeholder</div>
            </div>
            <div className="grid grid-cols-3 gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-500">
              <span>{walletData.stats.trackedWalletUniverse.toLocaleString()} wallets</span>
              <span>Category universes</span>
              <span>Explainable</span>
            </div>
          </div>
          <div className="grid gap-2 md:grid-cols-3 xl:grid-cols-6">
            {[
              ["Tracked Wallet Universe", walletData.stats.trackedWalletUniverse.toLocaleString()],
              ["Active Wallets", walletData.stats.activeWallets.toLocaleString()],
              ["Smart Money Wallets", walletData.stats.smartMoneyWallets.toLocaleString()],
              ["Tracked Volume", money(summaryVolume)],
              ["Current Smart Money Bias", currentBias],
              ["Divergence Alerts", `${divergenceAlerts}`],
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
            <div className="grid gap-3 lg:grid-cols-[minmax(220px,1fr)_160px_150px_160px_auto]">
              <label className="flex h-10 min-w-0 items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.025] px-3">
                <Search className="size-4 text-slate-500" />
                <input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600" placeholder="Search wallets, tags, categories, positions" />
              </label>
              <SelectControl label="Wallet Group" value={group} options={walletGroups} onChange={setGroup} />
              <SelectControl label="Category" value={category} options={categories} onChange={setCategory} />
              <SelectControl label="Timeframe" value={timeframe} options={timeframes} onChange={setTimeframe} />
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
              <div className="grid gap-4 border-t border-white/[0.07] pt-4 xl:grid-cols-4">
                <SelectControl label="Bias" value={bias} options={biases} onChange={setBias} />
                <SelectControl label="Signal Type" value={signalType} options={signalTypes} onChange={setSignalType} />
                <SelectControl label="Wallet Tags" value={walletTag} options={walletTags} onChange={setWalletTag} />
                <SelectControl label="Market Type" value={marketType} options={marketTypes} onChange={setMarketType} />
                <SelectControl label="Position Size" value={positionSize} options={positionSizes} onChange={setPositionSize} />
                <SelectControl label="Recent Activity" value={activity} options={recentActivity} onChange={setActivity} />
                <SelectControl label="Sort" value={sort} options={sortOptions} onChange={setSort} />
                {[
                  ["Min ROI", minRoi, setMinRoi, "%", 0, 50],
                  ["Min Volume", minVolume, setMinVolume, "M", 0, 25],
                  ["Min Win Rate", minWinRate, setMinWinRate, "%", 40, 80],
                  ["Min Active Positions", minActivePositions, setMinActivePositions, "", 0, 25],
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
          <PanelHeader title="Trader Intelligence" action={`showing 1-${Math.min(50, displayedWallets.length)} of ${walletData.stats.trackedWalletUniverse.toLocaleString()} wallets`} />
          <div className="border-b border-white/[0.075] px-4 py-3 text-xs text-slate-400">
            Click any wallet row or wallet address to open a full Wallet Profile with positions, evidence, related wallets, and historical performance.
          </div>
          <CardContent className="overflow-x-auto p-0">
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
                    </td>
                    <td className="px-4 py-3 font-mono text-emerald-200">{money(totalPnl(wallet))}</td>
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
              </tbody>
            </table>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.075] px-4 py-3 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-500">
              <span>Showing 1-{Math.min(50, displayedWallets.length)} of {walletData.stats.trackedWalletUniverse.toLocaleString()} tracked wallets</span>
              <span>Selected filter universe: {walletData.stats.activeWallets.toLocaleString()} active wallets</span>
              <span>Source: Polymarket wallet analytics placeholder</span>
            </div>
          </CardContent>
        </Panel>

        <Panel>
          <PanelHeader title="Smart Money Consensus" action="Actionable wallet cohorts" />
          <CardContent className="grid gap-3 p-4 xl:grid-cols-2">
            {smartMoneyConsensus.map((item) => (
              <div key={item.market} className="rounded-xl border border-white/[0.07] bg-black/25 p-4 transition hover:border-blue-300/20">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="text-sm font-semibold text-white">{item.cohort} — {item.market}</div>
                    <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-600">Source: Polymarket wallet analytics placeholder</div>
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
