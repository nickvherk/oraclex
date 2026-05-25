"use client";

import { motion } from "framer-motion";
import { AlertTriangle, BrainCircuit, CircleDot, GitBranch, Radar, ShieldCheck, TrendingDown, TrendingUp, Zap } from "lucide-react";

import { BiasBadge, Panel, PanelHeader } from "@/components/terminal/terminal-shell";
import { Badge } from "@/components/ui/badge";
import { CardContent } from "@/components/ui/card";

const agents = [
  { name: "Narrative Agent", vote: "Bullish", confidence: 94, signal: "Narrative velocity expanding across institutional crypto media", change: "+8", reliability: 91 },
  { name: "Whale Agent", vote: "Bullish", confidence: 88, signal: "$3.8M directional YES accumulation detected", change: "+12", reliability: 87 },
  { name: "Truth Agent", vote: "Neutral", confidence: 81, signal: "Conflicting issuer statement holding back final conviction", change: "-7", reliability: 93 },
  { name: "Liquidity Agent", vote: "Bullish", confidence: 86, signal: "Order book imbalance favors higher probability", change: "+5", reliability: 85 },
  { name: "Macro Agent", vote: "Neutral", confidence: 74, signal: "Risk appetite improving but rates remain restrictive", change: "+2", reliability: 78 },
  { name: "Resolution Agent", vote: "Neutral", confidence: 91, signal: "Market language maps cleanly to adjudication rules", change: "0", reliability: 96 },
];

const timeline = [
  ["09:20", "Consensus opened neutral", "52.4"],
  ["10:45", "Whale Agent pushed bullish after linked wallet flow", "61.8"],
  ["12:05", "Narrative Agent raised conviction on KOL cluster", "68.9"],
  ["13:18", "Truth Agent reduced certainty after mixed statement", "64.1"],
  ["14:03", "Consensus shifted bullish after liquidity confirmation", "71.2"],
];

const alerts = [
  ["Consensus shifted bullish", "Four of six agents now support higher SOL ETF probability.", "high"],
  ["Divergence detected", "OracleX sits 6.4 pts above Polymarket market price.", "medium"],
  ["Truth confidence falling", "Issuer language remains inconsistent across sources.", "high"],
  ["Macro conflict detected", "Rates environment conflicts with risk-on wallet flow.", "medium"],
];

const matrix = [
  ["Narrative", "Whale", 88],
  ["Narrative", "Truth", 62],
  ["Narrative", "Liquidity", 84],
  ["Whale", "Truth", 59],
  ["Whale", "Macro", 66],
  ["Truth", "Resolution", 78],
  ["Liquidity", "Macro", 71],
  ["Macro", "Resolution", 64],
  ["Narrative", "Macro", 69],
];

function agreementTone(value: number) {
  if (value >= 80) return "border-emerald-300/20 bg-emerald-300/[0.09] text-emerald-100";
  if (value >= 68) return "border-blue-300/25 bg-blue-300/[0.09] text-blue-100";
  return "border-amber-300/20 bg-amber-300/[0.08] text-amber-100";
}

export default function ConsensusPage() {
  return (
    <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_380px]">
      <div className="grid min-w-0 gap-4">
        <div className="grid gap-4 lg:grid-cols-4">
          {[
            ["Consensus Score", "87.4", "+12.0 pts", BrainCircuit],
            ["Agent Agreement", "74%", "healthy dispersion", GitBranch],
            ["Reliability Mean", "88.3", "6-agent blend", ShieldCheck],
            ["Active Conflicts", "2", "truth + macro", AlertTriangle],
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

        <Panel>
          <PanelHeader title="Agent Voting Grid" action="AI consensus system" />
          <CardContent className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
            {agents.map((agent) => (
              <div key={agent.name} className="rounded-xl border border-white/[0.075] bg-black/28 p-4">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-semibold text-white">{agent.name}</h2>
                    <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-slate-600">Reliability {agent.reliability}</div>
                  </div>
                  <BiasBadge bias={agent.vote} />
                </div>
                <div className="mb-3 flex items-end justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-600">Confidence</span>
                  <span className="font-mono text-2xl tracking-[-0.05em] text-blue-100">{agent.confidence}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                  <div className="h-full rounded-full bg-[#1f6fff]" style={{ width: `${agent.confidence}%` }} />
                </div>
                <p className="mt-3 text-xs leading-5 text-slate-400">{agent.signal}</p>
                <div className={`mt-3 flex items-center gap-1 font-mono text-[10px] ${agent.change.startsWith("-") ? "text-red-200" : "text-emerald-200"}`}>
                  {agent.change.startsWith("-") ? <TrendingDown className="size-3" /> : <TrendingUp className="size-3" />}
                  Recent change {agent.change}
                </div>
              </div>
            ))}
          </CardContent>
        </Panel>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <Panel>
            <PanelHeader title="Consensus Timeline" action="Historical shifts" />
            <CardContent className="space-y-3 p-4">
              {timeline.map(([time, event, score], index) => (
                <div key={time} className="relative flex gap-3 rounded-xl border border-white/[0.065] bg-black/28 p-3">
                  <div className="flex flex-col items-center">
                    <CircleDot className="size-4 text-blue-200" />
                    {index < timeline.length - 1 ? <div className="mt-2 h-10 w-px bg-white/[0.08]" /> : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-mono text-[10px] text-slate-600">{time}</div>
                    <div className="mt-1 text-xs leading-5 text-slate-300">{event}</div>
                  </div>
                  <span className="font-mono text-sm text-blue-100">{score}</span>
                </div>
              ))}
            </CardContent>
          </Panel>

          <Panel>
            <PanelHeader title="Consensus Matrix" action="Agreement / disagreement" />
            <CardContent className="grid grid-cols-2 gap-3 p-4 md:grid-cols-3">
              {matrix.map(([a, b, value]) => (
                <div key={`${a}-${b}`} className={`rounded-xl border p-3 ${agreementTone(value as number)}`}>
                  <div className="text-xs font-semibold">{a} x {b}</div>
                  <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] opacity-75">agreement</div>
                  <div className="mt-3 font-mono text-2xl tracking-[-0.05em]">{value}</div>
                </div>
              ))}
            </CardContent>
          </Panel>
        </div>
      </div>

      <aside className="grid gap-4 2xl:sticky 2xl:top-5 2xl:self-start">
        <Panel>
          <PanelHeader title="Consensus Alerts" action="Live conflicts" />
          <CardContent className="space-y-3 p-4">
            {alerts.map(([title, detail, severity]) => (
              <div key={title} className="rounded-xl border border-white/[0.075] bg-black/28 p-3">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    {severity === "high" ? <AlertTriangle className="size-4 text-amber-200" /> : <Zap className="size-4 text-blue-200" />}
                    {title}
                  </div>
                  <Badge className="h-6 rounded-lg border border-blue-300/15 bg-blue-300/[0.06] font-mono text-[10px] uppercase text-blue-100">{severity}</Badge>
                </div>
                <p className="text-xs leading-5 text-slate-400">{detail}</p>
              </div>
            ))}
          </CardContent>
        </Panel>

        <Panel>
          <PanelHeader title="Consensus Explanation" />
          <CardContent className="p-4">
            <div className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-blue-100">
              <Radar className="size-4" />
              Oracle reasoning
            </div>
            <p className="text-xs leading-6 text-slate-300">
              The system is bullish but not unanimous. Narrative, whale, and liquidity agents agree that market pricing lags real-time flow. Truth and macro agents constrain final confidence because source quality and rate-risk conditions remain mixed.
            </p>
          </CardContent>
        </Panel>
      </aside>
    </div>
  );
}
