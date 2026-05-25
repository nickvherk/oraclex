"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, ArrowDownRight, ArrowUpRight, BrainCircuit, ChevronDown, Database, Search, ShieldAlert, SlidersHorizontal, Waves, X, Zap } from "lucide-react";

import { BiasBadge, Panel, PanelHeader, SeverityBadge } from "@/components/terminal/terminal-shell";
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
};

type TraderFlow = {
  trader: string;
  asset: Exclude<Asset, "All">;
  direction: "Long" | "Short" | "Mixed";
  positionSize: number;
  flow7d: number;
  leverage: number;
  unrealizedPnl: number;
  historicalAccuracy: number;
  currentBias: string;
  lastActivity: string;
};

const assetFlows: AssetFlow[] = [
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

const traderFlows: TraderFlow[] = [
  { trader: "0x7c81...03ef", asset: "HYPE", direction: "Long", positionSize: 6400000, flow7d: 4200000, leverage: 4.6, unrealizedPnl: 18.4, historicalAccuracy: 73, currentBias: "Adding into inflow acceleration", lastActivity: "6m ago" },
  { trader: "0x48f3...7704", asset: "SOL", direction: "Long", positionSize: 5100000, flow7d: 3100000, leverage: 3.8, unrealizedPnl: 12.1, historicalAccuracy: 71, currentBias: "ETF confirmation long", lastActivity: "14m ago" },
  { trader: "0x91d0...5117", asset: "ETH", direction: "Short", positionSize: 3800000, flow7d: -1900000, leverage: 3.1, unrealizedPnl: 7.6, historicalAccuracy: 68, currentBias: "Defensive ETH hedge", lastActivity: "21m ago" },
  { trader: "0xad90...3af4", asset: "BTC", direction: "Mixed", positionSize: 7600000, flow7d: 1400000, leverage: 5.7, unrealizedPnl: -2.8, historicalAccuracy: 66, currentBias: "Leverage risk, no clean bias", lastActivity: "28m ago" },
  { trader: "0xb3bb...7a83", asset: "HYPE", direction: "Long", positionSize: 2900000, flow7d: 1600000, leverage: 5.2, unrealizedPnl: 9.9, historicalAccuracy: 69, currentBias: "Whale concentration follow-through", lastActivity: "44m ago" },
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

function directionBias(direction: AssetFlow["topTraderBias"] | TraderFlow["direction"]) {
  if (direction === "Long" || direction === "Long-heavy") return "Bullish";
  if (direction === "Short" || direction === "Short-heavy") return "Bearish";
  return "Neutral";
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
  const [selectedFlow, setSelectedFlow] = useState(assetFlows[0]);

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
  }, [asset, direction, flowType, leverageRange, minAbnormality, minInflow, minOiChange, minTraderCount, query, sortKey, traderFilter]);

  const tableRows = filteredFlows.length ? filteredFlows : assetFlows;
  const filteredTraderRows = traderFlows.filter((trader) => asset === "All" || trader.asset === asset);

  const largestInflow = assetFlows.reduce((best, flow) => (flow.netFlow7d > best.netFlow7d ? flow : best), assetFlows[0]);
  const largestOutflow = assetFlows.reduce((best, flow) => (flow.netFlow7d < best.netFlow7d ? flow : best), assetFlows[0]);
  const topBias = assetFlows.reduce((best, flow) => (flow.smartMoneyConcentration > best.smartMoneyConcentration ? flow : best), assetFlows[0]);
  const oiAcceleration = assetFlows.reduce((best, flow) => (flow.openInterestChange > best.openInterestChange ? flow : best), assetFlows[0]);
  const abnormalFlow = assetFlows.reduce((best, flow) => (flow.abnormalFlowIndex > best.abnormalFlowIndex ? flow : best), assetFlows[0]);

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
              <Badge className="mb-3 h-6 rounded-lg border border-blue-300/15 bg-blue-300/[0.07] font-mono text-[10px] uppercase text-blue-100">Hyperliquid flow intelligence</Badge>
              <h1 className="text-2xl font-semibold tracking-[-0.03em] text-white">Where is smart money flowing right now?</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">OracleX tracks inflows, outflows, top trader positioning, OI acceleration, leverage build-up, abnormal flow, and asset rotation across Hyperliquid.</p>
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
                  <tr key={flow.asset} onClick={() => setSelectedFlow(flow)} className={`cursor-pointer border-b border-white/[0.055] transition hover:bg-blue-300/[0.035] ${selectedFlow.asset === flow.asset ? "bg-blue-300/[0.06]" : ""}`}>
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
          <PanelHeader title="Top Trader Flow Table" action={`${group} positioning`} />
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full min-w-[1040px] text-left text-xs">
              <thead className="border-b border-white/[0.075] bg-white/[0.025] font-mono text-[10px] uppercase tracking-[0.12em] text-slate-600">
                <tr>{["Trader", "Asset", "Direction", "Position Size", "7D Flow", "Leverage", "Unrealized PnL", "Historical Accuracy", "Current Bias", "Last Activity"].map((header) => <th key={header} className="px-4 py-3 font-medium">{header}</th>)}</tr>
              </thead>
              <tbody>
                {filteredTraderRows.map((trader) => (
                  <tr key={`${trader.trader}-${trader.asset}`} className="border-b border-white/[0.055]">
                    <td className="px-4 py-3 font-mono text-blue-100">{trader.trader}</td>
                    <td className="px-4 py-3 font-mono text-white">{trader.asset}</td>
                    <td className="px-4 py-3"><BiasBadge bias={directionBias(trader.direction)} /></td>
                    <td className="px-4 py-3 font-mono text-slate-200">{money(trader.positionSize)}</td>
                    <td className={`px-4 py-3 font-mono ${trader.flow7d >= 0 ? "text-emerald-200" : "text-red-200"}`}>{money(trader.flow7d)}</td>
                    <td className="px-4 py-3 font-mono text-slate-200">{trader.leverage.toFixed(1)}x</td>
                    <td className={`px-4 py-3 font-mono ${trader.unrealizedPnl >= 0 ? "text-emerald-200" : "text-red-200"}`}>{signedPct(trader.unrealizedPnl)}</td>
                    <td className="px-4 py-3 font-mono text-blue-100">{trader.historicalAccuracy}%</td>
                    <td className="max-w-[260px] px-4 py-3 text-slate-300">{trader.currentBias}</td>
                    <td className="px-4 py-3 font-mono text-slate-500">{trader.lastActivity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Panel>

        <Panel>
          <PanelHeader title="Flow Intelligence Cards" action="Raw data -> interpretation" />
          <CardContent className="grid gap-3 p-4 xl:grid-cols-2">
            {intelligenceCards.map((signal) => (
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
            {relatedPredictionContext.map((item) => (
              <div key={item.market} className="rounded-xl border border-white/[0.065] bg-white/[0.025] p-3">
                <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-blue-100">{item.market}</div>
                <p className="mt-2 text-xs leading-5 text-slate-400">{item.context}</p>
              </div>
            ))}
          </CardContent>
        </Panel>
      </div>

      <aside className="grid gap-4 2xl:sticky 2xl:top-5 2xl:self-start">
        <Panel>
          <PanelHeader title="Flow Detail" action={selectedFlow.asset} />
          <CardContent className="p-4">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-3xl tracking-[-0.05em] text-white">{selectedFlow.asset}</span>
                  <BiasBadge bias={directionBias(selectedFlow.topTraderBias)} />
                </div>
                <div className="mt-2 text-sm text-slate-300">{selectedFlow.interpretation}</div>
              </div>
              {selectedFlow.netFlow7d >= 0 ? <ArrowUpRight className="size-5 text-emerald-200" /> : <ArrowDownRight className="size-5 text-red-200" />}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                ["7D net flow", money(selectedFlow.netFlow7d)],
                ["Flow vs average", `${signedPct(selectedFlow.flowVsAvg)} vs 30D`],
                ["OI change", signedPct(selectedFlow.openInterestChange)],
                ["Top trader bias", selectedFlow.topTraderBias],
                ["Long/short ratio", selectedFlow.longShortRatio],
                ["Whale concentration", selectedFlow.whaleConcentration],
                ["Abnormal Flow Index™", `${selectedFlow.abnormalFlowIndex}`],
                ["Capital Rotation Score™", `${selectedFlow.capitalRotationScore}`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-white/[0.065] bg-white/[0.025] p-3">
                  <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-slate-600">{label}</div>
                  <div className="mt-2 text-xs leading-5 text-slate-200">{value}</div>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-xl border border-blue-300/15 bg-blue-300/[0.045] p-4">
              <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-blue-100"><BrainCircuit className="size-4" />AI explanation</div>
              <p className="text-xs leading-6 text-slate-300">{selectedFlow.aiExplanation}</p>
            </div>
          </CardContent>
        </Panel>

        <Panel>
          <PanelHeader title="Evidence Stack" action="Raw datapoints" />
          <CardContent className="space-y-4 p-4">
            <div>
              <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500"><Database className="size-4 text-blue-200" />Hyperliquid metrics</div>
              <div className="space-y-2">{selectedFlow.rawDatapoints.map((item) => <div key={item} className="rounded-lg bg-white/[0.035] px-3 py-2 text-xs text-slate-300">{item}</div>)}</div>
            </div>
            <div className="rounded-xl border border-white/[0.065] bg-black/25 p-4">
              <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500"><AlertTriangle className="size-4 text-blue-200" />Historical comparison</div>
              <p className="text-xs leading-5 text-slate-300">{selectedFlow.historicalComparison}</p>
            </div>
          </CardContent>
        </Panel>

        <Panel>
          <PanelHeader title="Related Prediction Markets" action="Context only" />
          <CardContent className="space-y-2 p-4">
            {selectedFlow.relatedMarkets.map((market) => <Badge key={market} className="mr-2 h-6 rounded-lg border border-white/[0.08] bg-white/[0.035] font-mono text-[10px] text-slate-300">{market}</Badge>)}
            <div className="mt-4 rounded-xl border border-white/[0.065] bg-black/25 p-4">
              <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500"><Waves className="size-4 text-blue-200" />Flow Divergence Index™</div>
              <p className="text-xs leading-5 text-slate-300">{selectedFlow.asset} has Flow Divergence Index™ {selectedFlow.flowDivergenceIndex}, derived from net flow, OI acceleration, long-short skew, leverage, and prediction-context mismatch.</p>
            </div>
          </CardContent>
        </Panel>
      </aside>
    </div>
  );
}
