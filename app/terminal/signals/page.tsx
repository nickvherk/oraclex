"use client";

import { motion } from "framer-motion";
import { Activity, AlertOctagon, AlertTriangle, BellRing, CircleDot, Gauge, History, Radio, ShieldAlert, Wallet, Waves, Zap } from "lucide-react";

import { FeatureGate } from "@/components/terminal/access-gate";
import { Panel, PanelHeader } from "@/components/terminal/terminal-shell";
import { Badge } from "@/components/ui/badge";
import { CardContent } from "@/components/ui/card";

const severityRank: Record<string, number> = {
  Critical: 4,
  "High Conviction": 3,
  Elevated: 2,
  Informational: 1,
};

const lifecycleSteps = ["Detected", "Confirmed", "Accelerating", "Peaking", "Decaying", "Resolved"];

const signals = [
  {
    time: "14:21:08",
    title: "Smart money cluster expanded SOL ETF YES exposure",
    category: "wallets",
    severity: "Critical",
    market: "SOL ETF",
    confidence: 94,
    abnormality: 91,
    relevance: 96,
    lifecycle: "Accelerating",
    horizon: "2-6h",
    historical: "Historically preceded 6-12 point probability shifts.",
    changed: "$1.8M YES sweep from linked institutional wallet cluster.",
    why: "High-signal wallets moved before public market pricing fully adjusted.",
    impact: "Expected probability impact: +6 to +12 pts if liquidity confirms.",
    assets: ["SOL ETF", "SOL ecosystem", "BTC ETF sympathy"],
    datapoints: ["3 linked profitable clusters active", "Entry size 2.7x baseline", "Polymarket gap widened to 6.4 pts"],
  },
  {
    time: "14:21:36",
    title: "Liquidity support lagging directional demand",
    category: "liquidity",
    severity: "High Conviction",
    market: "BTC ATH",
    confidence: 88,
    abnormality: 84,
    relevance: 86,
    lifecycle: "Confirmed",
    horizon: "1-4h",
    historical: "Historically preceded large volatility expansions.",
    changed: "Depth skew widened while market makers kept defensive inventory.",
    why: "Directional demand is visible, but thin depth can amplify reversals.",
    impact: "Expected probability impact: elevated volatility before clean trend confirmation.",
    assets: ["BTC ATH", "ETF inflows", "Macro risk"],
    datapoints: ["Depth skew above normal range", "Spread recovery incomplete", "Cross-venue divergence rising"],
  },
  {
    time: "14:22:11",
    title: "Election odds volatility expanded without confirmed catalyst",
    category: "volatility",
    severity: "Elevated",
    market: "Trump Odds",
    confidence: 76,
    abnormality: 78,
    relevance: 73,
    lifecycle: "Detected",
    horizon: "30m-2h",
    historical: "Often marks repricing attempts that require source confirmation.",
    changed: "Pricing volatility rose without matching source quality or volume.",
    why: "Unconfirmed volatility can create false consensus if it is not supported by flows.",
    impact: "Expected probability impact: noisy 2-5 point range until confirmation.",
    assets: ["Trump Odds", "Election polling", "Candidate markets"],
    datapoints: ["News volume unchanged", "Spread widened", "Wallet quality mixed"],
  },
  {
    time: "14:22:47",
    title: "OracleX probability diverged from public market pricing",
    category: "consensus",
    severity: "High Conviction",
    market: "SOL ETF",
    confidence: 91,
    abnormality: 89,
    relevance: 94,
    lifecycle: "Confirmed",
    horizon: "2-8h",
    historical: "Similar gaps resolved through either liquidity catch-up or sharp mean reversion.",
    changed: "OracleX probability exceeds Polymarket by 6.4 points after source agreement improved.",
    why: "A persistent gap between source intelligence and market price is operationally review-worthy.",
    impact: "Expected probability impact: gap compression or conflict escalation.",
    assets: ["SOL ETF", "SOL ecosystem growth", "ETH rotation"],
    datapoints: ["6 of 8 related markets aligned", "Narrative confirmed by wallet flows", "Liquidity still defensive"],
  },
  {
    time: "14:23:20",
    title: "Institutional AI regulation narrative entering prediction markets",
    category: "narratives",
    severity: "Elevated",
    market: "AI Regulation",
    confidence: 82,
    abnormality: 80,
    relevance: 81,
    lifecycle: "Accelerating",
    horizon: "6-24h",
    historical: "Policy narratives typically propagate into adjacent market clusters before resolving.",
    changed: "Trading-focused policy accounts increased participation after leaked framework discussion.",
    why: "Narrative quality improved enough to affect regulatory probability markets.",
    impact: "Expected probability impact: broader volatility across AI policy markets.",
    assets: ["AI Regulation", "Agent OS", "Compute policy"],
    datapoints: ["Institutional participation +22% over 6h", "Related markets repriced lower", "Smart money confirmation partial"],
  },
  {
    time: "14:24:02",
    title: "Fed cuts source conflict reduced directional confidence",
    category: "macro",
    severity: "Critical",
    market: "Fed Cuts",
    confidence: 89,
    abnormality: 87,
    relevance: 92,
    lifecycle: "Peaking",
    horizon: "1-3h",
    historical: "Primary-source conflict often precedes abrupt probability compression.",
    changed: "Two primary sources now conflict on policy timeline interpretation.",
    why: "Resolution confidence is falling despite active market repricing.",
    impact: "Expected probability impact: compression until source hierarchy is clarified.",
    assets: ["Fed Cuts", "Rates", "Macro risk"],
    datapoints: ["Source hierarchy conflict", "Rates volatility elevated", "Positioning becoming defensive"],
  },
].sort((a, b) => severityRank[b.severity] - severityRank[a.severity] || b.confidence - a.confidence || b.abnormality - a.abnormality || b.relevance - a.relevance);

const categories = ["wallets", "liquidity", "narratives", "consensus", "volatility", "macro"];
const selected = signals[0];

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

function Lifecycle({ current }: { current: string }) {
  const activeIndex = lifecycleSteps.indexOf(current);
  return (
    <div className="grid grid-cols-3 gap-1.5 xl:grid-cols-6">
      {lifecycleSteps.map((step, index) => (
        <div key={step} className={`rounded-lg border px-2 py-1.5 text-center font-mono text-[9px] uppercase ${index <= activeIndex ? "border-blue-300/25 bg-blue-300/[0.08] text-blue-100" : "border-white/[0.065] bg-white/[0.025] text-slate-600"}`}>
          {step}
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
  return (
    <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_390px]">
      <div className="grid min-w-0 gap-4">
        <section className="rounded-xl border border-blue-300/15 bg-blue-300/[0.045] p-4">
          <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-blue-100">Real-time Signal Prioritization System</div>
          <h1 className="text-2xl font-semibold tracking-[-0.03em] text-white">Signals are ranked by severity, confidence, smart money impact, abnormality, and market relevance.</h1>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-400">The monitor explains what changed, why it matters, and what market impact is historically associated with similar signals.</p>
        </section>

        <div className="grid gap-4 lg:grid-cols-4">
          {[
            ["Prioritized Signals", `${signals.length}`, "sorted by actionability", AlertOctagon],
            ["High+ Severity", "4", "operator review", ShieldAlert],
            ["Average Horizon", "2-8h", "expected impact window", BellRing],
            ["Signal Latency", "8.4s", "p95 stable", Zap],
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

        <div className="grid gap-4 xl:grid-cols-[240px_minmax(0,1fr)]">
          <Panel>
            <PanelHeader title="Priority Filters" action="Live" />
            <CardContent className="space-y-2 p-4">
              {categories.map((category) => {
                const activeCount = signals.filter((signal) => signal.category === category).length;
                return (
                  <button key={category} type="button" className="flex h-10 w-full cursor-pointer items-center justify-between rounded-lg border border-white/[0.065] bg-white/[0.025] px-3 text-xs text-slate-300 transition hover:border-blue-300/20 hover:bg-blue-300/[0.045]">
                    <span className="capitalize">{category}</span>
                    <span className="font-mono text-blue-200">{activeCount}</span>
                  </button>
                );
              })}
            </CardContent>
          </Panel>

          <Panel>
            <PanelHeader title="Signal Feed" action="Priority sorted" />
            <CardContent className="space-y-3 p-4">
              {signals.map((signal, index) => {
                const Icon = categoryIcon(signal.category);
                return (
                  <motion.div key={`${signal.time}-${signal.title}`} className="rounded-xl border border-white/[0.075] bg-black/28 p-4 transition hover:border-blue-300/20 hover:bg-blue-300/[0.035]" animate={{ opacity: [0.82, 1, 0.9] }} transition={{ duration: 4.3, repeat: Infinity, delay: index * 0.22 }}>
                    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_190px]">
                      <div className="flex min-w-0 gap-3">
                        <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-blue-300/15 bg-blue-300/[0.06] text-blue-200">
                          <Icon className="size-4" />
                        </span>
                        <div className="min-w-0">
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <div className="font-mono text-[10px] text-slate-600">{signal.time}</div>
                            <Badge className={`h-6 rounded-lg border px-2 font-mono text-[10px] uppercase ${severityTone(signal.severity)}`}>{signal.severity}</Badge>
                            <Badge className="h-6 rounded-lg border border-white/[0.08] bg-white/[0.035] font-mono text-[10px] uppercase text-slate-300">{signal.lifecycle}</Badge>
                          </div>
                          <h2 className="text-sm font-semibold text-white">{signal.title}</h2>
                          <p className="mt-2 text-xs leading-5 text-slate-300"><span className="text-blue-100">Why it matters:</span> {signal.why}</p>
                          <p className="mt-1 text-xs leading-5 text-slate-400"><span className="text-slate-300">What changed:</span> {signal.changed}</p>
                          <div className="mt-3">
                            <Lifecycle current={signal.lifecycle} />
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 xl:grid-cols-1">
                        {[
                          ["Market", signal.market],
                          ["Horizon", signal.horizon],
                          ["Confidence", `${signal.confidence}`],
                        ].map(([label, value]) => (
                          <div key={label} className="rounded-lg bg-white/[0.035] p-2 text-xs">
                            <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-slate-600">{label}</div>
                            <div className="mt-1 text-slate-200">{value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mt-3 rounded-lg border border-blue-300/12 bg-blue-300/[0.035] px-3 py-2 text-xs leading-5 text-blue-100">{signal.historical}</div>
                  </motion.div>
                );
              })}
            </CardContent>
          </Panel>
        </div>
      </div>

      <aside className="grid gap-4 2xl:sticky 2xl:top-5 2xl:self-start">
        <Panel>
          <PanelHeader title="Signal Detail" action={selected.severity} />
          <CardContent className="p-4">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold tracking-[-0.03em]">{selected.title}</h2>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge className={`h-6 rounded-lg border px-2 font-mono text-[10px] uppercase ${severityTone(selected.severity)}`}>{selected.severity}</Badge>
                  <Badge className="h-6 rounded-lg border border-blue-300/15 bg-blue-300/[0.06] font-mono text-[10px] uppercase text-blue-100">{selected.category}</Badge>
                </div>
              </div>
              <AlertTriangle className="size-5 text-red-200" />
            </div>
            <div className="rounded-xl border border-red-300/15 bg-red-300/[0.045] p-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-red-100">Expected market impact</div>
              <p className="mt-2 text-xs leading-6 text-slate-300">{selected.impact}</p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                ["Historical confidence", `${selected.confidence}`],
                ["Propagation risk", "High"],
                ["Expected horizon", selected.horizon],
                ["Confidence trend", "Rising"],
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
                Historical context
              </div>
              <p className="text-xs leading-6 text-slate-300">{selected.historical}</p>
            </div>
          </CardContent>
        </Panel>

        <Panel>
          <PanelHeader title="Supporting Datapoints" />
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
          <PanelHeader title="Affected Narratives" />
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
