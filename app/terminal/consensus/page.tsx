"use client";

import { motion } from "framer-motion";
import { AlertTriangle, CircleDot, GitBranch, Radar, ShieldCheck, TrendingDown, TrendingUp } from "lucide-react";

import { FeatureGate } from "@/components/terminal/access-gate";
import { BiasBadge, Panel, PanelHeader } from "@/components/terminal/terminal-shell";
import { Badge } from "@/components/ui/badge";
import { CardContent } from "@/components/ui/card";

const alignmentMetrics = [
  ["Alignment Strength", "74%", "Most systems support higher probability", TrendingUp],
  ["Conflict Severity", "Medium", "Liquidity and macro remain constraints", AlertTriangle],
  ["Market Confidence", "71.2", "Confidence rising, not fully confirmed", ShieldCheck],
  ["Resolution Clarity", "High", "Rules map cleanly to observable outcomes", Radar],
  ["Positioning Agreement", "Strong", "Smart money and narrative now aligned", GitBranch],
];

const sources = [
  {
    name: "Smart Money Flow",
    bias: "Bullish",
    confidence: 88,
    change: "+12",
    reasoning: "High-signal wallets expanded YES exposure while market pricing adjusted slowly.",
    datapoints: ["$3.8M linked wallet accumulation", "3 repeat profitable clusters active", "Entries concentrated inside 42 minutes"],
  },
  {
    name: "Narrative Momentum",
    bias: "Bullish",
    confidence: 84,
    change: "+9",
    reasoning: "Institutional ETF allocation discussion accelerated across trading-focused accounts.",
    datapoints: ["Participation quality increased over 6h", "ETF filing-window language spreading", "Related SOL ecosystem markets repriced"],
  },
  {
    name: "Liquidity Conditions",
    bias: "Neutral",
    confidence: 76,
    change: "-4",
    reasoning: "Directional demand is visible, but book depth is thinner than prior confirmed moves.",
    datapoints: ["YES-side depth improving", "Market maker inventory defensive", "Slippage elevated above baseline"],
  },
  {
    name: "Market Structure",
    bias: "Bullish",
    confidence: 82,
    change: "+5",
    reasoning: "Related markets are repricing in the same direction without a single-venue dislocation.",
    datapoints: ["Cross-market confirmation in 6 of 8 markets", "Polymarket gap remains 6.4 pts", "No obvious isolated venue artifact"],
  },
  {
    name: "Macro Environment",
    bias: "Neutral",
    confidence: 69,
    change: "+2",
    reasoning: "Risk appetite improved, but rates conditions are still suppressing full momentum.",
    datapoints: ["ETF inflow discussion supportive", "Rates volatility still elevated", "BTC sympathy bid only partial"],
  },
  {
    name: "Resolution Clarity",
    bias: "Bullish",
    confidence: 91,
    change: "0",
    reasoning: "Market language has clean adjudication criteria and limited ambiguity at expiry.",
    datapoints: ["Clear approval window", "Observable regulator action", "Low dispute-risk language"],
  },
  {
    name: "Volatility Pressure",
    bias: "Neutral",
    confidence: 73,
    change: "+6",
    reasoning: "Volatility is expanding, but not yet disorderly enough to invalidate directional flow.",
    datapoints: ["Intraday range widening", "No liquidation cascade detected", "Spread normalization incomplete"],
  },
  {
    name: "Positioning Alignment",
    bias: "Bullish",
    confidence: 86,
    change: "+10",
    reasoning: "Wallet clustering, narrative adoption, and related market repricing are now moving together.",
    datapoints: ["Cluster overlap across SOL markets", "Narrative confirmed by flows", "Rotation away from ETH pressure basket"],
  },
];

const conflicts = [
  {
    title: "Narratives bullish, liquidity defensive",
    severity: "medium",
    impact: "The move can extend, but thin depth increases reversal risk if follow-through stalls.",
  },
  {
    title: "Whale positioning diverging from market pricing",
    severity: "high",
    impact: "OracleX probability remains above public market pricing, creating a review-worthy divergence.",
  },
  {
    title: "Macro environment suppressing momentum",
    severity: "medium",
    impact: "Risk conditions support partial repricing, not yet a full conviction breakout.",
  },
  {
    title: "Resolution clarity rising while volatility expands",
    severity: "low",
    impact: "Clean rules improve confidence, but execution risk remains elevated during repricing.",
  },
];

const timeline = [
  ["09:20", "Neutral alignment", "Consensus opened balanced while wallet flow was still fragmented.", "52.4"],
  ["10:45", "Positioning confirmation", "Smart money clusters expanded exposure ahead of broad market adjustment.", "61.8"],
  ["12:05", "Narrative acceleration", "Institutional ETF allocation discussion began propagating into related markets.", "68.9"],
  ["13:18", "Liquidity conflict emerging", "Book depth became defensive despite continued bullish positioning.", "64.1"],
  ["14:03", "Consensus strengthening", "Market structure, flows, and resolution clarity aligned enough to lift confidence.", "71.2"],
];

const selected = sources[0];

function severityTone(severity: string) {
  if (severity === "high") return "border-red-300/22 bg-red-300/[0.08] text-red-100";
  if (severity === "medium") return "border-amber-300/22 bg-amber-300/[0.08] text-amber-100";
  return "border-blue-300/20 bg-blue-300/[0.07] text-blue-100";
}

export default function ConsensusPage() {
  return (
    <FeatureGate feature="consensusEngine" explanation="The full Consensus Engine requires Analyst access or higher. Observer accounts can still view basic consensus signals in the Live Feed.">
      <ConsensusWorkspace />
    </FeatureGate>
  );
}

function ConsensusWorkspace() {
  return (
    <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_390px]">
      <div className="grid min-w-0 gap-4">
        <section className="rounded-xl border border-blue-300/15 bg-blue-300/[0.045] p-4">
          <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-blue-100">Intelligence Alignment Score</div>
          <h1 className="text-2xl font-semibold tracking-[-0.03em] text-white">Multi-source agreement is bullish with material liquidity conflict.</h1>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-400">OracleX evaluates whether independent market systems agree or disagree before treating a probability move as actionable intelligence.</p>
        </section>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {alignmentMetrics.map(([label, value, detail, Icon], index) => (
            <motion.div key={label as string} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
              <Panel>
                <CardContent className="p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500">{label as string}</span>
                    <Icon className="size-4 shrink-0 text-blue-200" />
                  </div>
                  <div className="font-mono text-2xl tracking-[-0.05em] text-white">{value as string}</div>
                  <div className="mt-2 text-xs leading-5 text-blue-200">{detail as string}</div>
                </CardContent>
              </Panel>
            </motion.div>
          ))}
        </div>

        <Panel>
          <PanelHeader title="Intelligence Source Analysis" action="Systems agreement" />
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full min-w-[920px] text-left text-xs">
              <thead className="border-b border-white/[0.075] text-[10px] uppercase tracking-[0.14em] text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Source</th>
                  <th className="px-4 py-3 font-medium">Bias</th>
                  <th className="px-4 py-3 font-medium">Confidence</th>
                  <th className="px-4 py-3 font-medium">Recent Change</th>
                  <th className="px-4 py-3 font-medium">Key Reasoning</th>
                  <th className="px-4 py-3 font-medium">Supporting Datapoints</th>
                </tr>
              </thead>
              <tbody>
                {sources.map((source) => (
                  <tr key={source.name} className="border-b border-white/[0.055] transition hover:bg-blue-300/[0.035]">
                    <td className="px-4 py-4 font-semibold text-white">{source.name}</td>
                    <td className="px-4 py-4"><BiasBadge bias={source.bias} /></td>
                    <td className="px-4 py-4">
                      <div className="font-mono text-lg tracking-[-0.04em] text-blue-100">{source.confidence}</div>
                    </td>
                    <td className={`px-4 py-4 font-mono ${source.change.startsWith("-") ? "text-red-200" : source.change === "0" ? "text-slate-400" : "text-emerald-200"}`}>
                      <span className="inline-flex items-center gap-1">
                        {source.change.startsWith("-") ? <TrendingDown className="size-3" /> : <TrendingUp className="size-3" />}
                        {source.change}
                      </span>
                    </td>
                    <td className="max-w-sm px-4 py-4 leading-5 text-slate-300">{source.reasoning}</td>
                    <td className="px-4 py-4">
                      <div className="grid gap-1.5">
                        {source.datapoints.slice(0, 2).map((point) => (
                          <span key={point} className="text-slate-400">{point}</span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Panel>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <Panel>
            <PanelHeader title="Conflict Analysis" action="Where agreement breaks" />
            <CardContent className="space-y-3 p-4">
              {conflicts.map((conflict) => (
                <div key={conflict.title} className={`rounded-xl border p-4 ${severityTone(conflict.severity)}`}>
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <h2 className="text-sm font-semibold leading-5">{conflict.title}</h2>
                    <Badge className="h-6 shrink-0 rounded-lg border border-current/20 bg-black/20 font-mono text-[10px] uppercase">{conflict.severity}</Badge>
                  </div>
                  <p className="text-xs leading-5 opacity-85">{conflict.impact}</p>
                </div>
              ))}
            </CardContent>
          </Panel>

          <Panel>
            <PanelHeader title="Consensus Timeline" action="State changes" />
            <CardContent className="space-y-3 p-4">
              {timeline.map(([time, state, detail, score], index) => (
                <div key={`${time}-${state}`} className="relative flex gap-3 rounded-xl border border-white/[0.065] bg-black/28 p-3">
                  <div className="flex flex-col items-center">
                    <CircleDot className="size-4 text-blue-200" />
                    {index < timeline.length - 1 ? <div className="mt-2 h-11 w-px bg-white/[0.08]" /> : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-mono text-[10px] text-slate-600">{time}</div>
                    <div className="mt-1 text-xs font-semibold text-slate-200">{state}</div>
                    <div className="mt-1 text-xs leading-5 text-slate-400">{detail}</div>
                  </div>
                  <span className="font-mono text-sm text-blue-100">{score}</span>
                </div>
              ))}
            </CardContent>
          </Panel>
        </div>
      </div>

      <aside className="grid gap-4 2xl:sticky 2xl:top-5 2xl:self-start">
        <Panel>
          <PanelHeader title="Why Consensus Matters" action="Operational view" />
          <CardContent className="space-y-4 p-4">
            <div>
              <h2 className="text-xl font-semibold tracking-[-0.03em] text-white">Consensus improves when independent systems confirm the same probability direction.</h2>
              <p className="mt-3 text-xs leading-6 text-slate-300">The current setup supports higher SOL ETF probability, but liquidity conflict means the move should be treated as actionable review, not unconditional conviction.</p>
            </div>
            {[
              ["Expected impact", "Potential 6-12 point repricing if liquidity confirms positioning."],
              ["Historical similarity", "Comparable to prior ETF-window markets where wallet flow led price by 2-6 hours."],
              ["Confidence trend", "Strengthening, with macro and depth still capping conviction."],
              ["Conflicting systems", "Liquidity Conditions, Macro Environment"],
              ["Prediction implication", "Bullish bias remains valid while conflict severity stays below high."],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-white/[0.065] bg-white/[0.025] p-3">
                <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-slate-600">{label}</div>
                <div className="mt-2 text-xs leading-5 text-slate-200">{value}</div>
              </div>
            ))}
          </CardContent>
        </Panel>

        <Panel>
          <PanelHeader title="Selected Source" action={selected.name} />
          <CardContent className="p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-white">{selected.name}</h2>
              <BiasBadge bias={selected.bias} />
            </div>
            <p className="text-xs leading-6 text-slate-300">{selected.reasoning}</p>
            <div className="mt-4 space-y-2">
              {selected.datapoints.map((point) => (
                <div key={point} className="flex items-start gap-2 rounded-lg bg-white/[0.035] px-3 py-2 text-xs text-slate-300">
                  <CircleDot className="mt-0.5 size-3 text-blue-200" />
                  {point}
                </div>
              ))}
            </div>
          </CardContent>
        </Panel>
      </aside>
    </div>
  );
}
