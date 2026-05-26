"use client";

import { motion } from "framer-motion";
import { Activity, AlertOctagon, AlertTriangle, BellRing, CircleDot, Gauge, Radio, ShieldAlert, Wallet, Waves, Zap } from "lucide-react";

import { Panel, PanelHeader, SeverityBadge } from "@/components/terminal/terminal-shell";
import { FeatureGate } from "@/components/terminal/access-gate";
import { Badge } from "@/components/ui/badge";
import { CardContent } from "@/components/ui/card";

const signals = [
  { time: "14:21:08", title: "Whale movement", category: "wallets", severity: "critical", market: "SOL ETF", confidence: 94, reason: "$1.8M YES sweep from linked institutional wallet cluster" },
  { time: "14:21:36", title: "Liquidity imbalance", category: "liquidity", severity: "high", market: "BTC ATH", confidence: 88, reason: "Depth skew widened beyond 2.4 standard deviations" },
  { time: "14:22:11", title: "Volatility spike", category: "volatility", severity: "medium", market: "Trump Odds", confidence: 76, reason: "Pricing volatility rose without matching news volume" },
  { time: "14:22:47", title: "Market divergence", category: "consensus", severity: "high", market: "SOL ETF", confidence: 91, reason: "OracleX probability exceeds Polymarket by 6.4 points" },
  { time: "14:23:20", title: "Narrative acceleration", category: "narratives", severity: "medium", market: "AI Regulation", confidence: 82, reason: "KOL velocity accelerated after leaked policy thread" },
  { time: "14:24:02", title: "Truth inconsistency", category: "macro", severity: "critical", market: "Fed Cuts", confidence: 89, reason: "Two primary sources conflict on policy timeline" },
];

const categories = ["wallets", "liquidity", "narratives", "consensus", "volatility", "macro"];

const selected = signals[0];

const affected = [
  ["SOL ETF Momentum", 94],
  ["Solana Ecosystem Growth", 83],
  ["Bitcoin Institutional Flow", 61],
  ["Ethereum Rotation", 38],
];

function categoryIcon(category: string) {
  if (category === "wallets") return Wallet;
  if (category === "liquidity") return Waves;
  if (category === "volatility") return Activity;
  if (category === "consensus") return Gauge;
  return Radio;
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
    <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_380px]">
      <div className="grid min-w-0 gap-4">
        <div className="grid gap-4 lg:grid-cols-4">
          {[
            ["Anomalies Detected", "128", "+18 last hour", AlertOctagon],
            ["Active Alerts", "42", "12 high priority", BellRing],
            ["Critical Events", "6", "operator review", ShieldAlert],
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
            <PanelHeader title="Categories" action="Filters" />
            <CardContent className="space-y-2 p-4">
              {categories.map((category) => {
                const activeCount = signals.filter((signal) => signal.category === category).length;
                return (
                  <button key={category} type="button" className="flex h-10 w-full items-center justify-between rounded-lg border border-white/[0.065] bg-white/[0.025] px-3 text-xs text-slate-300 transition hover:border-blue-300/20 hover:bg-blue-300/[0.045]">
                    <span className="capitalize">{category}</span>
                    <span className="font-mono text-blue-200">{activeCount}</span>
                  </button>
                );
              })}
            </CardContent>
          </Panel>

          <Panel>
            <PanelHeader title="Signal Feed" action="Real-time anomaly detection" />
            <CardContent className="space-y-3 p-4">
              {signals.map((signal, index) => {
                const Icon = categoryIcon(signal.category);
                return (
                  <motion.div key={`${signal.time}-${signal.title}`} className="grid gap-3 rounded-xl border border-white/[0.075] bg-black/28 p-4 transition hover:border-blue-300/20 hover:bg-blue-300/[0.035] md:grid-cols-[minmax(0,1fr)_120px]" animate={{ opacity: [0.78, 1, 0.86] }} transition={{ duration: 4.3, repeat: Infinity, delay: index * 0.28 }}>
                    <div className="flex min-w-0 gap-3">
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-blue-300/15 bg-blue-300/[0.06] text-blue-200">
                        <Icon className="size-4" />
                      </span>
                      <div className="min-w-0">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <div className="font-mono text-[10px] text-slate-600">{signal.time}</div>
                          <SeverityBadge severity={signal.severity} />
                          <Badge className="h-6 rounded-lg border border-white/[0.08] bg-white/[0.035] font-mono text-[10px] uppercase text-slate-300">{signal.category}</Badge>
                        </div>
                        <h2 className="text-sm font-semibold">{signal.title}</h2>
                        <p className="mt-2 text-xs leading-5 text-slate-400">{signal.reason}</p>
                      </div>
                    </div>
                    <div className="flex items-end justify-between gap-4 md:block md:text-right">
                      <div>
                        <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-slate-600">Market</div>
                        <div className="mt-1 text-xs text-slate-200">{signal.market}</div>
                      </div>
                      <div className="md:mt-4">
                        <div className="font-mono text-2xl tracking-[-0.05em] text-blue-100">{signal.confidence}</div>
                        <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-slate-600">confidence</div>
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
          <PanelHeader title="Signal Detail" action="Critical" />
          <CardContent className="p-4">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold tracking-[-0.03em]">{selected.title}</h2>
                <div className="mt-2 flex items-center gap-2">
                  <SeverityBadge severity={selected.severity} />
                  <Badge className="h-6 rounded-lg border border-blue-300/15 bg-blue-300/[0.06] font-mono text-[10px] uppercase text-blue-100">{selected.category}</Badge>
                </div>
              </div>
              <AlertTriangle className="size-5 text-red-200" />
            </div>
            <div className="rounded-xl border border-red-300/15 bg-red-300/[0.045] p-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-red-100">Trigger reason</div>
              <p className="mt-2 text-xs leading-6 text-slate-300">{selected.reason}</p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                ["Related markets", "SOL ETF, BTC ATH"],
                ["Affected narratives", "4"],
                ["Confidence score", `${selected.confidence}`],
                ["Operator action", "Review flow"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-white/[0.065] bg-white/[0.025] p-3">
                  <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-slate-600">{label}</div>
                  <div className="mt-2 text-xs text-slate-200">{value}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-xl border border-blue-300/15 bg-blue-300/[0.045] p-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-blue-100">AI explanation</div>
              <p className="mt-2 text-xs leading-6 text-slate-300">
                Linked wallets entered YES exposure faster than market makers adjusted depth. Combined with rising narrative velocity, OracleX classifies the move as a critical directional signal requiring operator review.
              </p>
            </div>
          </CardContent>
        </Panel>

        <Panel>
          <PanelHeader title="Affected Narratives" />
          <CardContent className="space-y-4 p-4">
            {affected.map(([label, value]) => (
              <div key={label as string}>
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="text-slate-400">{label as string}</span>
                  <span className="font-mono text-blue-100">{value as number}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                  <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-200" style={{ width: `${value}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Panel>

        <Panel>
          <PanelHeader title="Operator Queue" />
          <CardContent className="space-y-2 p-4">
            {["Escalate SOL ETF whale movement", "Monitor liquidity recovery", "Compare truth sources", "Publish desk note"].map((item) => (
              <div key={item} className="flex items-center gap-2 rounded-lg bg-white/[0.035] px-3 py-2 text-xs text-slate-300">
                <CircleDot className="size-3 text-blue-200" />
                {item}
              </div>
            ))}
          </CardContent>
        </Panel>
      </aside>
    </div>
  );
}
