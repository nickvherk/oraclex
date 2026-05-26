"use client";

import { useMemo, useState } from "react";
import { ArrowRight, BrainCircuit, Check, ChevronDown, Copy, Lock, Network, Search, ShieldCheck, SlidersHorizontal, Wallet, X } from "lucide-react";

import { BiasBadge, Panel, PanelHeader, SeverityBadge } from "@/components/terminal/terminal-shell";
import { Badge } from "@/components/ui/badge";
import { CardContent } from "@/components/ui/card";
import { FeatureGate, PremiumLockedOverlay } from "@/components/terminal/access-gate";
import { useCurrentPlan } from "@/lib/access-control";

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

export default function WalletIntelligencePage() {
  return (
    <FeatureGate feature="walletIntelligence" explanation="Wallet Intelligence starts at Observer access. Sign in with a demo account or upgrade your plan.">
      <WalletIntelligenceByPlan />
    </FeatureGate>
  );
}

function WalletIntelligenceByPlan() {
  const { plan } = useCurrentPlan();

  if (plan === "observer") {
    return <ObserverWalletIntelligence />;
  }

  return <FullWalletIntelligencePage />;
}

function ObserverWalletIntelligence() {
  const basicWallets = wallets.slice(0, 5);
  const totalVolume = basicWallets.reduce((sum, wallet) => sum + wallet.volume, 0);

  return (
    <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="grid gap-4">
        <section className="rounded-xl border border-white/[0.075] bg-[#070b14]/86 p-4">
          <Badge className="mb-3 h-6 rounded-lg border border-blue-300/15 bg-blue-300/[0.07] font-mono text-[10px] uppercase text-blue-100">Observer wallet summary</Badge>
          <h1 className="text-2xl font-semibold tracking-[-0.03em] text-white">Basic Wallet Intelligence</h1>
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
                <PremiumLockedOverlay copy="Unlock full Wallet Intelligence with Analyst" />
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

function FullWalletIntelligencePage() {
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
  const [selectedWallet, setSelectedWallet] = useState(wallets[0]);
  const [copied, setCopied] = useState(false);

  const sortKey: SortKey = sort === "ROI" ? "roi" : sort === "Win Rate" ? "winRate" : sort === "Volume" ? "volume" : sort === "Early Signal" ? "earlySignal" : sort === "Divergence" ? "divergence" : "conviction";
  const positionThreshold = positionSize === "$1M+" ? 1000000 : positionSize === "$500K+" ? 500000 : positionSize === "$250K+" ? 250000 : positionSize === "$100K+" ? 100000 : 0;

  const filteredWallets = useMemo(() => {
    const groupLimit = group.startsWith("Top") ? Number(group.replace("Top ", "")) : 500;
    return wallets
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
  }, [bias, category, group, marketType, minActivePositions, minRoi, minVolume, minWinRate, positionThreshold, query, signalType, sortKey, walletTag]);

  const displayedWallets = filteredWallets.length ? filteredWallets : wallets;
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

  function copyWallet() {
    void navigator.clipboard.writeText(selectedWallet.wallet);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  }

  return (
    <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="grid min-w-0 gap-4">
        <section className="rounded-xl border border-white/[0.075] bg-[#070b14]/86 p-4">
          <div className="mb-4 flex flex-col gap-3 border-b border-white/[0.075] pb-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Badge className="mb-3 h-6 rounded-lg border border-blue-300/15 bg-blue-300/[0.07] font-mono text-[10px] uppercase text-blue-100">Wallet intelligence system</Badge>
              <h1 className="text-2xl font-semibold tracking-[-0.03em] text-white">What are the best prediction market wallets doing right now?</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">OracleX tracks a large universe of top Polymarket wallets, category specialists, smart money clusters, and repeat winners to turn wallet behavior into data-backed intelligence.</p>
            </div>
            <div className="grid grid-cols-3 gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-500">
              <span>12,480 wallets</span>
              <span>Category universes</span>
              <span>Explainable</span>
            </div>
          </div>
          <div className="grid gap-2 md:grid-cols-3 xl:grid-cols-6">
            {[
              ["Tracked Wallet Universe", TRACKED_WALLET_UNIVERSE.toLocaleString()],
              ["Active Wallets", ACTIVE_WALLETS.toLocaleString()],
              ["Smart Money Wallets", SMART_MONEY_WALLETS.toLocaleString()],
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
          <PanelHeader title="Wallet Intelligence Filters" action="Advanced hidden by default" />
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
          <PanelHeader title="Smart Money Wallet Table" action={`showing 1-${Math.min(50, displayedWallets.length)} of ${TRACKED_WALLET_UNIVERSE.toLocaleString()} wallets`} />
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full min-w-[1320px] text-left text-xs">
              <thead className="border-b border-white/[0.075] bg-white/[0.025] font-mono text-[10px] uppercase tracking-[0.12em] text-slate-600">
                <tr>
                  {["Wallet", "Category Universe", "ROI", "Win Rate", "Tracked Volume", "Current Bias", "Conviction Score™", "Early Signal Score™", "Active Positions", "Last Position", "Flow Divergence Index™", "Last Active"].map((header) => (
                    <th key={header} className="px-4 py-3 font-medium">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayedWallets.map((wallet) => (
                  <tr key={wallet.wallet} onClick={() => setSelectedWallet(wallet)} className={`cursor-pointer border-b border-white/[0.055] transition hover:bg-blue-300/[0.035] ${selectedWallet.wallet === wallet.wallet ? "bg-blue-300/[0.06]" : ""}`}>
                    <td className="px-4 py-3">
                      <div className="font-mono text-blue-100">{shortWallet(wallet.wallet)}</div>
                      <div className="mt-1 font-mono text-[10px] text-slate-600">{wallet.tag}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      <div>{wallet.category}</div>
                      <div className="mt-1 font-mono text-[10px] text-slate-600">{wallet.group}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-emerald-200">{wallet.roi.toFixed(1)}%</td>
                    <td className="px-4 py-3 font-mono text-slate-200">{wallet.winRate}%</td>
                    <td className="px-4 py-3 font-mono text-slate-200">{money(wallet.volume)}</td>
                    <td className="px-4 py-3"><BiasBadge bias={badgeBias(wallet.bias)} /></td>
                    <td className={`px-4 py-3 font-mono ${metricTone(wallet.conviction)}`}>{wallet.conviction}</td>
                    <td className={`px-4 py-3 font-mono ${metricTone(wallet.earlySignal)}`}>{wallet.earlySignal}</td>
                    <td className="px-4 py-3 font-mono text-slate-300">{wallet.activeMarkets}</td>
                    <td className="max-w-[260px] truncate px-4 py-3 font-mono text-[11px] text-slate-300">{wallet.lastPosition}</td>
                    <td className="px-4 py-3 font-mono text-blue-100">{wallet.divergence}</td>
                    <td className="px-4 py-3 font-mono text-slate-500">{wallet.lastActive}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.075] px-4 py-3 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-500">
              <span>Showing 1-{Math.min(50, displayedWallets.length)} of {TRACKED_WALLET_UNIVERSE.toLocaleString()} tracked wallets</span>
              <span>Selected filter universe: {ACTIVE_WALLETS.toLocaleString()} active wallets</span>
            </div>
          </CardContent>
        </Panel>

        <Panel>
          <PanelHeader title="Smart Money Consensus" action="Data-backed aggregate signals" />
          <CardContent className="grid gap-3 p-4 xl:grid-cols-2">
            {consensusInsights.map((item) => (
              <div key={item.segment} className="rounded-xl border border-white/[0.07] bg-black/25 p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="text-sm font-semibold text-white">{item.segment}</div>
                  <Badge className="h-6 rounded-lg border border-blue-300/15 bg-blue-300/[0.06] font-mono text-[10px] text-blue-100">{item.confidence}% confidence</Badge>
                </div>
                <p className="text-xs leading-5 text-slate-300">{item.insight}</p>
                <div className="mt-3 grid grid-cols-2 gap-2 font-mono text-[10px] md:grid-cols-5">
                  <span className="rounded bg-white/[0.035] p-2 text-slate-400">{item.wallets} wallets</span>
                  <span className="rounded bg-white/[0.035] p-2 text-slate-400">{money(item.volume)}</span>
                  <span className="rounded bg-white/[0.035] p-2 text-slate-400">{item.exposure}</span>
                  <span className="rounded bg-white/[0.035] p-2 text-slate-400">{item.timeframe}</span>
                  <span className="rounded bg-white/[0.035] p-2 text-blue-100">{item.confidence}% conf</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Panel>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(360px,1.1fr)]">
          <Panel>
            <PanelHeader title="Questions OracleX Answers" action="Category-specific" />
            <CardContent className="space-y-2 p-4">
              {questionExamples.map((question) => <div key={question} className="rounded-lg border border-white/[0.06] bg-white/[0.025] px-3 py-2 text-xs text-slate-300">{question}</div>)}
            </CardContent>
          </Panel>

          <Panel>
            <PanelHeader title="Wallet Cluster Detection" action="Premium intelligence" />
            <CardContent className="space-y-3 p-4">
              {clusters.map((cluster) => (
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

      <aside className="grid gap-4 2xl:sticky 2xl:top-5 2xl:self-start">
        <Panel>
          <PanelHeader title="Wallet Detail" action={`Rank ${selectedWallet.rank}`} />
          <CardContent className="p-4">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="font-mono text-sm text-blue-100">{shortWallet(selectedWallet.wallet)}</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge className="h-6 rounded-lg border border-blue-300/15 bg-blue-300/[0.06] font-mono text-[10px] text-blue-100">{selectedWallet.tag}</Badge>
                  <Badge className="h-6 rounded-lg border border-white/[0.08] bg-white/[0.035] font-mono text-[10px] text-slate-300">{selectedWallet.category}</Badge>
                </div>
              </div>
              <button type="button" onClick={copyWallet} className="grid size-9 place-items-center rounded-lg border border-white/[0.08] bg-white/[0.035] text-slate-300">
                {copied ? <Check className="size-4 text-emerald-200" /> : <Copy className="size-4" />}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                ["Tracked volume", money(selectedWallet.volume)],
                ["Win rate", `${selectedWallet.winRate}%`],
                ["ROI", `${selectedWallet.roi.toFixed(1)}%`],
                ["Smart Money Concentration™", `${selectedWallet.smartMoneyRating}`],
                ["Exposure split", selectedWallet.exposure],
                ["Active positions", `${selectedWallet.activeMarkets}`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-white/[0.065] bg-white/[0.025] p-3">
                  <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-slate-600">{label}</div>
                  <div className="mt-2 text-xs leading-5 text-slate-200">{value}</div>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-xl border border-blue-300/15 bg-blue-300/[0.045] p-4">
              <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-blue-100"><BrainCircuit className="size-4" />AI explanation</div>
              <p className="text-xs leading-6 text-slate-300">{selectedWallet.interpretation}</p>
            </div>
          </CardContent>
        </Panel>

        <Panel>
          <PanelHeader title="Evidence Stack" action={selectedWallet.group} />
          <CardContent className="space-y-4 p-4">
            <div>
              <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500"><Wallet className="size-4 text-blue-200" />Recent entries</div>
              <div className="space-y-2">{selectedWallet.entries.map((item) => <div key={item} className="rounded-lg bg-white/[0.035] px-3 py-2 text-xs text-slate-300">{item}</div>)}</div>
            </div>
            <div>
              <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500"><ShieldCheck className="size-4 text-blue-200" />Active markets</div>
              <div className="flex flex-wrap gap-2">{selectedWallet.activeMarketsList.map((item) => <Badge key={item} className="h-6 rounded-lg border border-white/[0.08] bg-white/[0.035] font-mono text-[10px] text-slate-300">{item}</Badge>)}</div>
            </div>
          </CardContent>
        </Panel>
      </aside>
    </div>
  );
}
