"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Activity, AlertOctagon, AlertTriangle, BellRing, Check, CircleDot, Gauge, History, Info, Radio, ShieldAlert, Wallet, Waves, X, Zap } from "lucide-react";

import { FeatureGate } from "@/components/terminal/access-gate";
import { Panel, PanelHeader } from "@/components/terminal/terminal-shell";
import { Badge } from "@/components/ui/badge";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const priorityRank: Record<string, number> = {
  Critical: 4,
  "High Conviction": 3,
  Elevated: 2,
  Informational: 1,
};

const attentionEvents = [
  {
    time: "14:21:08",
    title: "SOL ETF Smart Money Accumulation",
    category: "wallets",
    severity: "Critical",
    market: "SOL ETF",
    activeSignals: 6,
    evidenceStrength: "5/5",
    supportingSignals: 7,
    historicalMatches: 12,
    activeSources: 4,
    horizon: "2-6h",
    evidence: ["$3.8M YES accumulation", "14 linked wallets active", "Entry size 2.7x baseline", "Probability gap +6.4 pts"],
    why: "High-signal wallets are building directional exposure before public pricing has fully adjusted.",
    impact: "Historically preceded 4-8 point probability expansions when liquidity confirmed within the next session.",
    implication: "Operator attention is warranted because the event combines wallet flow, price divergence, and early narrative confirmation.",
    sourceConfirmation: [
      ["Hyperliquid Flows", true],
      ["Smart Money Wallets", true],
      ["Narrative Momentum", true],
      ["Macro Confirmation Missing", false],
    ] as Array<[string, boolean]>,
    assets: ["SOL ETF", "SOL ecosystem", "BTC ETF sympathy"],
    datapoints: ["3 linked profitable clusters active", "Entry size 2.7x baseline", "Polymarket gap widened to 6.4 pts"],
  },
  {
    time: "14:21:36",
    title: "BTC Probability Divergence",
    category: "liquidity",
    severity: "High Conviction",
    market: "BTC ATH",
    activeSignals: 4,
    evidenceStrength: "4/5",
    supportingSignals: 5,
    historicalMatches: 9,
    activeSources: 3,
    horizon: "1-4h",
    evidence: ["Depth skew +18%", "OI +21%", "Spread recovery incomplete", "Cross-venue divergence rising"],
    why: "Directional demand is visible, but thin depth can amplify repricing and reversal risk.",
    impact: "Historically associated with volatility increases before clean trend confirmation.",
    implication: "The opportunity is attractive only if liquidity stabilizes; otherwise the same setup can become a reversal risk.",
    sourceConfirmation: [
      ["Hyperliquid Flows", true],
      ["Smart Money Wallets", true],
      ["Narrative Momentum", false],
      ["Macro Confirmation Missing", true],
    ] as Array<[string, boolean]>,
    assets: ["BTC ATH", "ETF inflows", "Macro risk"],
    datapoints: ["Depth skew above normal range", "Spread recovery incomplete", "Cross-venue divergence rising"],
  },
  {
    time: "14:22:47",
    title: "SOL ETF Pricing Divergence",
    category: "consensus",
    severity: "High Conviction",
    market: "SOL ETF",
    activeSignals: 3,
    evidenceStrength: "4/5",
    supportingSignals: 6,
    historicalMatches: 10,
    activeSources: 4,
    horizon: "2-8h",
    evidence: ["OracleX probability +6.4 pts", "6 of 8 related markets aligned", "Issuer-source agreement improved", "Liquidity still defensive"],
    why: "A persistent gap between source intelligence and public market price is operationally review-worthy.",
    impact: "Historically resolves through liquidity catch-up, fast gap compression, or sharp mean reversion.",
    implication: "The market is misaligned with the current intelligence stack, but thin liquidity makes execution timing important.",
    sourceConfirmation: [
      ["Hyperliquid Flows", true],
      ["Smart Money Wallets", true],
      ["Narrative Momentum", true],
      ["Macro Confirmation Missing", false],
    ] as Array<[string, boolean]>,
    assets: ["SOL ETF", "SOL ecosystem growth", "ETH rotation"],
    datapoints: ["6 of 8 related markets aligned", "Narrative confirmed by wallet flows", "Liquidity still defensive"],
  },
  {
    time: "14:23:20",
    title: "AI Regulation Narrative Expansion",
    category: "narratives",
    severity: "Elevated",
    market: "AI Regulation",
    activeSignals: 8,
    evidenceStrength: "4/5",
    supportingSignals: 8,
    historicalMatches: 7,
    activeSources: 3,
    horizon: "6-24h",
    evidence: ["Narrative participation +38%", "Institutional accounts +22%", "Related markets repriced lower", "Smart money confirmation partial"],
    why: "Narrative participation is expanding from policy accounts into tradeable prediction-market clusters.",
    impact: "Historically followed by narrative acceleration across adjacent policy and technology markets.",
    implication: "Monitor for second-order moves in compute, agent OS, and regulatory deadline markets.",
    sourceConfirmation: [
      ["Hyperliquid Flows", false],
      ["Smart Money Wallets", true],
      ["Narrative Momentum", true],
      ["Macro Confirmation Missing", false],
    ] as Array<[string, boolean]>,
    assets: ["AI Regulation", "Agent OS", "Compute policy"],
    datapoints: ["Institutional participation +22% over 6h", "Related markets repriced lower", "Smart money confirmation partial"],
  },
  {
    time: "14:22:11",
    title: "Election Probability Volatility Event",
    category: "volatility",
    severity: "Elevated",
    market: "Trump Odds",
    activeSignals: 5,
    evidenceStrength: "3/5",
    supportingSignals: 4,
    historicalMatches: 8,
    activeSources: 2,
    horizon: "30m-2h",
    evidence: ["Probability swing +5.1 pts", "Spread widened", "News volume unchanged", "Wallet quality mixed"],
    why: "Unconfirmed volatility can create false consensus if it is not backed by flows or source quality.",
    impact: "Historically produces noisy 2-5 point ranges until either source confirmation or flow exhaustion.",
    implication: "Treat as a risk event before treating it as an opportunity.",
    sourceConfirmation: [
      ["Hyperliquid Flows", false],
      ["Smart Money Wallets", false],
      ["Narrative Momentum", true],
      ["Macro Confirmation Missing", false],
    ] as Array<[string, boolean]>,
    assets: ["Trump Odds", "Election polling", "Candidate markets"],
    datapoints: ["News volume unchanged", "Spread widened", "Wallet quality mixed"],
  },
  {
    time: "14:24:02",
    title: "Fed Repricing Event",
    category: "macro",
    severity: "Critical",
    market: "Fed Cuts",
    activeSignals: 2,
    evidenceStrength: "4/5",
    supportingSignals: 5,
    historicalMatches: 11,
    activeSources: 3,
    horizon: "1-3h",
    evidence: ["Rates volatility elevated", "Two primary sources conflict", "Fed-cut probability compressed", "Positioning becoming defensive"],
    why: "Source conflict is reducing directional confidence while macro markets are actively repricing.",
    impact: "Historically associated with probability compression and risk-on/risk-off rotation.",
    implication: "Macro-linked prediction markets may reprice together instead of resolving independently.",
    sourceConfirmation: [
      ["Hyperliquid Flows", true],
      ["Smart Money Wallets", false],
      ["Narrative Momentum", true],
      ["Macro Confirmation Missing", true],
    ] as Array<[string, boolean]>,
    assets: ["Fed Cuts", "Rates", "Macro risk"],
    datapoints: ["Source hierarchy conflict", "Rates volatility elevated", "Positioning becoming defensive"],
  },
].sort((a, b) => priorityRank[b.severity] - priorityRank[a.severity] || b.supportingSignals - a.supportingSignals || b.historicalMatches - a.historicalMatches);

const categories = ["wallets", "liquidity", "narratives", "consensus", "volatility", "macro"];
const categoryDetails: Record<string, { label: string; explanation: string }> = {
  wallets: {
    label: "Smart Money Events",
    explanation: "Wallet clusters, whale positioning, and market-moving account behavior.",
  },
  liquidity: {
    label: "Liquidity Anomalies",
    explanation: "Depth shifts, open interest changes, execution anomalies, and order-book stress.",
  },
  narratives: {
    label: "Narrative Expansions",
    explanation: "Attention spikes moving from discussion into tradeable prediction-market effects.",
  },
  consensus: {
    label: "Pricing Divergences",
    explanation: "Disagreement between OracleX intelligence, public pricing, and related markets.",
  },
  volatility: {
    label: "Risk Events",
    explanation: "Unusual probability swings, unstable spreads, and unconfirmed volatility.",
  },
  macro: {
    label: "Macro Repricing",
    explanation: "Rates, CPI, policy, and macro catalysts affecting probability surfaces.",
  },
};
const selected = attentionEvents[0];

function categoryIcon(category: string) {
  if (category === "wallets") return Wallet;
  if (category === "liquidity") return Waves;
  if (category === "volatility") return Activity;
  if (category === "consensus") return Gauge;
  return Radio;
}

function severityTone(severity: string) {
  if (severity === "Critical") return "border-red-300/25 bg-red-300/[0.1] text-red-100";
  if (severity === "High Conviction") return "border-amber-300/25 bg-amber-300/[0.09] text-amber-100";
  if (severity === "Elevated") return "border-blue-300/20 bg-blue-300/[0.08] text-blue-100";
  return "border-slate-300/15 bg-slate-300/[0.06] text-slate-300";
}

function SourceBreakdown({ sources }: { sources: Array<[string, boolean]> }) {
  return (
    <div className="grid gap-1.5 sm:grid-cols-2">
      {sources.map(([source, confirmed]) => (
        <div key={source} className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 text-xs ${confirmed ? "border-emerald-300/15 bg-emerald-300/[0.045] text-emerald-100" : "border-white/[0.065] bg-white/[0.025] text-slate-500"}`}>
          {confirmed ? <Check className="size-3.5 shrink-0" /> : <X className="size-3.5 shrink-0" />}
          <span className="min-w-0">{source}</span>
        </div>
      ))}
    </div>
  );
}

export default function SignalsPage() {
  return (
    <FeatureGate feature="signalMonitor" explanation="Signal Monitor, whale monitoring, advanced alerts, and early signal systems require Operator access or higher.">
      <SignalsWorkspace />
    </FeatureGate>
  );
}

function SignalsWorkspace() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const categoryCounts = categories.map((category) => ({
    category,
    count: attentionEvents.filter((event) => event.category === category).reduce((total, event) => total + event.activeSignals, 0),
  }));
  const filteredEvents = selectedCategory ? attentionEvents.filter((event) => event.category === selectedCategory) : attentionEvents;
  const selectedCategoryLabel = selectedCategory ? categoryDetails[selectedCategory].label : null;
  const highRiskEvents = attentionEvents.filter((event) => event.severity === "Critical").length;
  const divergenceEvents = attentionEvents.filter((event) => event.category === "consensus" || event.title.includes("Divergence")).length;

  return (
    <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_390px]">
      <div className="grid min-w-0 gap-4">
        <section className="rounded-xl border border-blue-300/15 bg-blue-300/[0.045] p-4">
          <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-blue-100">Attention Center</div>
          <h1 className="text-2xl font-semibold tracking-[-0.03em] text-white">The most important market developments currently affecting prediction market probabilities.</h1>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-400">Prioritized opportunities, risks, anomalies, divergences, and smart money events with evidence, impact, and source confirmation.</p>
        </section>

        <div className="grid gap-4 lg:grid-cols-4">
          {[
            ["Active Opportunities", `${attentionEvents.filter((event) => event.severity !== "Elevated").length}`, "actionable setups", AlertOctagon],
            ["High Risk Events", `${highRiskEvents}`, "requires review", ShieldAlert],
            ["Divergence Events", `${divergenceEvents}`, "pricing mismatch", BellRing],
            ["Average Impact Horizon", "2-8h", "expected window", Zap],
          ].map(([label, value, detail, Icon], index) => (
            <motion.div key={label as string} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }}>
              <Panel>
                <CardContent className="p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500">{label as string}</span>
                    <Icon className="size-4 text-blue-200" />
                  </div>
                  <div className="font-mono text-3xl tracking-[-0.05em]">{value as string}</div>
                  <div className="mt-2 text-xs text-blue-200">{detail as string}</div>
                </CardContent>
              </Panel>
            </motion.div>
          ))}
        </div>

        <div className="grid gap-4 xl:grid-cols-[260px_minmax(0,1fr)]">
          <Panel>
            <CardHeader className="border-b border-white/[0.075] px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <CardTitle className="font-mono text-[11px] uppercase tracking-[0.16em] text-slate-300">Attention Categories</CardTitle>
                    <span className="group/category-info relative inline-flex">
                      <Info className="size-3.5 cursor-help text-slate-500 transition group-hover/category-info:text-blue-100" />
                      <span className="pointer-events-none absolute left-0 top-6 z-30 w-64 rounded-xl border border-blue-300/20 bg-[#050914]/98 p-3 text-xs leading-5 text-slate-300 opacity-0 shadow-[0_18px_60px_rgba(0,0,0,0.45)] ring-1 ring-blue-300/[0.06] transition group-hover/category-info:opacity-100">
                        Attention categories group events by the reason they deserve operator review.
                      </span>
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-slate-500">Active event groups currently influencing monitored markets.</p>
                </div>
                <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-blue-200">Live</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 p-4">
              {categoryCounts.map(({ category, count }) => {
                const active = selectedCategory === category;
                const detail = categoryDetails[category];

                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory((current) => (current === category ? null : category))}
                    className={`group/category relative flex min-h-[58px] w-full cursor-pointer items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left text-xs transition ${active ? "border-blue-300/35 bg-blue-300/[0.09] text-blue-50 shadow-[0_0_24px_rgba(59,130,246,0.12)]" : "border-white/[0.065] bg-white/[0.025] text-slate-300 hover:border-blue-300/20 hover:bg-blue-300/[0.045]"}`}
                    aria-pressed={active}
                  >
                    <span className="min-w-0">
                      <span className="block font-medium leading-4">{detail.label}</span>
                      <span className={`mt-1 block font-mono text-[10px] uppercase tracking-[0.12em] ${active ? "text-blue-100" : "text-slate-600"}`}>Filter feed</span>
                    </span>
                    <span className="shrink-0 text-right font-mono text-blue-200">
                      <span className="block text-sm">{count}</span>
                      <span className="block text-[9px] uppercase tracking-[0.12em]">Active</span>
                    </span>
                    <span className="pointer-events-none absolute left-full top-1/2 z-30 ml-2 hidden w-64 -translate-y-1/2 rounded-xl border border-blue-300/20 bg-[#050914]/98 p-3 text-xs leading-5 text-slate-300 opacity-0 shadow-[0_18px_60px_rgba(0,0,0,0.45)] ring-1 ring-blue-300/[0.06] transition group-hover/category:block group-hover/category:opacity-100 xl:block">
                      {detail.explanation}
                    </span>
                  </button>
                );
              })}
            </CardContent>
          </Panel>

          <Panel>
            <PanelHeader title="Attention Feed" action={selectedCategoryLabel ?? "Priority sorted"} />
            <CardContent className="space-y-3 p-4">
              {filteredEvents.map((event, index) => {
                const Icon = categoryIcon(event.category);
                return (
                  <motion.div key={`${event.time}-${event.title}`} className="rounded-xl border border-white/[0.075] bg-black/28 p-4 transition hover:border-blue-300/20 hover:bg-blue-300/[0.035]" animate={{ opacity: [0.86, 1, 0.92] }} transition={{ duration: 4.3, repeat: Infinity, delay: index * 0.22 }}>
                    <div className="flex min-w-0 gap-3">
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-blue-300/15 bg-blue-300/[0.06] text-blue-200">
                        <Icon className="size-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <div className="font-mono text-[10px] text-slate-600">{event.time}</div>
                          <Badge className={`min-h-6 rounded-lg border px-2 py-1 font-mono text-[10px] uppercase leading-4 ${severityTone(event.severity)}`}>{event.severity}</Badge>
                          <Badge className="min-h-6 rounded-lg border border-white/[0.08] bg-white/[0.035] px-2 py-1 font-mono text-[10px] uppercase leading-4 text-slate-300">{event.market}</Badge>
                        </div>
                        <h2 className="text-sm font-semibold text-white">{event.title}</h2>
                        <div className="mt-3 grid gap-2 md:grid-cols-2">
                          <div className="rounded-lg border border-white/[0.065] bg-white/[0.025] p-3">
                            <div className="mb-2 font-mono text-[9px] uppercase tracking-[0.12em] text-slate-600">Evidence</div>
                            <div className="flex flex-wrap gap-1.5">
                              {event.evidence.map((item) => (
                                <span key={item} className="rounded-md border border-blue-300/12 bg-blue-300/[0.045] px-2 py-1 text-[11px] leading-4 text-blue-100">{item}</span>
                              ))}
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              ["Evidence Strength", event.evidenceStrength],
                              ["Supporting Signals", `${event.supportingSignals}`],
                              ["Historical Matches", `${event.historicalMatches}`],
                            ].map(([label, value]) => (
                              <div key={label} className="rounded-lg bg-white/[0.035] p-2 text-xs">
                                <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-slate-600">{label}</div>
                                <div className="mt-1 font-mono text-slate-200">{value}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <p className="mt-3 text-xs leading-5 text-slate-300"><span className="text-blue-100">Why it matters:</span> {event.why}</p>
                        <p className="mt-1 text-xs leading-5 text-slate-400"><span className="text-slate-300">Potential impact:</span> {event.impact}</p>
                        <p className="mt-1 text-xs leading-5 text-slate-500"><span className="text-slate-300">Implication:</span> {event.implication}</p>
                        <div className="mt-3">
                          <div className="mb-2 font-mono text-[9px] uppercase tracking-[0.12em] text-slate-600">Source Confirmation</div>
                          <SourceBreakdown sources={event.sourceConfirmation} />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </CardContent>
          </Panel>
        </div>
      </div>

      <aside className="grid gap-4 2xl:sticky 2xl:top-5 2xl:self-start">
        <Panel>
          <PanelHeader title="Attention Detail" action={selected.severity} />
          <CardContent className="p-4">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold tracking-[-0.03em]">{selected.title}</h2>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge className={`h-6 rounded-lg border px-2 font-mono text-[10px] uppercase ${severityTone(selected.severity)}`}>{selected.severity}</Badge>
                  <Badge className="h-6 rounded-lg border border-blue-300/15 bg-blue-300/[0.06] font-mono text-[10px] uppercase text-blue-100">{categoryDetails[selected.category].label}</Badge>
                </div>
              </div>
              <AlertTriangle className="size-5 text-red-200" />
            </div>
            <div className="rounded-xl border border-red-300/15 bg-red-300/[0.045] p-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-red-100">Potential impact</div>
              <p className="mt-2 text-xs leading-6 text-slate-300">{selected.impact}</p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                ["Evidence strength", selected.evidenceStrength],
                ["Supporting signals", `${selected.supportingSignals}`],
                ["Historical matches", `${selected.historicalMatches}`],
                ["Active sources", `${selected.activeSources}`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-white/[0.065] bg-white/[0.025] p-3">
                  <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-slate-600">{label}</div>
                  <div className="mt-2 text-xs text-slate-200">{value}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-xl border border-blue-300/15 bg-blue-300/[0.045] p-4">
              <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-blue-100">
                <History className="size-4" />
                OracleX implication
              </div>
              <p className="text-xs leading-6 text-slate-300">{selected.implication}</p>
            </div>
          </CardContent>
        </Panel>

        <Panel>
          <PanelHeader title="Supporting Evidence" />
          <CardContent className="space-y-2 p-4">
            {selected.datapoints.map((item) => (
              <div key={item} className="flex items-start gap-2 rounded-lg bg-white/[0.035] px-3 py-2 text-xs text-slate-300">
                <CircleDot className="mt-0.5 size-3 text-blue-200" />
                {item}
              </div>
            ))}
          </CardContent>
        </Panel>

        <Panel>
          <PanelHeader title="Affected Markets" />
          <CardContent className="space-y-2 p-4">
            {selected.assets.map((asset) => (
              <div key={asset} className="flex items-center justify-between rounded-lg bg-white/[0.035] px-3 py-2 text-xs">
                <span className="text-slate-300">{asset}</span>
                <span className="font-mono text-blue-200">ACTIVE</span>
              </div>
            ))}
          </CardContent>
        </Panel>
      </aside>
    </div>
  );
}
