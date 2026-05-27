"use client";

import { motion } from "framer-motion";
import { ArrowDownRight, ArrowRight, ArrowUpRight, CircleDot, GitBranch, Lock, ShieldCheck, TrendingUp, Wallet } from "lucide-react";

import { FeatureGate, PremiumLockedOverlay } from "@/components/terminal/access-gate";
import { BiasBadge, Panel, PanelHeader } from "@/components/terminal/terminal-shell";
import { Badge } from "@/components/ui/badge";
import { CardContent } from "@/components/ui/card";
import { useCurrentPlan } from "@/lib/access-control";

const narratives = [
  {
    name: "SOL ETF Approval Window",
    acceleration: "+38% over 6h",
    quality: "Institutional",
    penetration: "High",
    smartMoney: "Confirmed",
    persistence: "Rising",
    spread: "6 related markets",
    correlation: "+0.72",
    impact: "+6.4 pts",
    bias: "Bullish",
    score: 91,
    direction: "up",
    driver: "Institutional ETF allocation narrative accelerated after filing-window discussion among macro-focused and trading-focused accounts.",
    implication: "SOL ETF probability is repricing faster in wallet behavior than in public market price.",
  },
  {
    name: "Bitcoin Institutional Allocation",
    acceleration: "+19% over 6h",
    quality: "High",
    penetration: "Medium",
    smartMoney: "Partial",
    persistence: "Stable",
    spread: "4 related markets",
    correlation: "+0.58",
    impact: "+4.8 pts",
    bias: "Bullish",
    score: 86,
    direction: "up",
    driver: "ETF inflow discussion is spreading through macro desks and allocation-focused accounts.",
    implication: "BTC ATH markets are receiving support, but liquidity confirmation is incomplete.",
  },
  {
    name: "AI Regulation Framework",
    acceleration: "+22% over 6h",
    quality: "Mixed",
    penetration: "Medium",
    smartMoney: "Unconfirmed",
    persistence: "Volatile",
    spread: "5 related markets",
    correlation: "-0.41",
    impact: "-3.1 pts",
    bias: "Bearish",
    score: 73,
    direction: "volatile",
    driver: "Policy leak discussion entered prediction markets through trading-focused policy accounts.",
    implication: "Regulatory probability markets are becoming more volatile, but flow confirmation is still weak.",
  },
  {
    name: "Solana Ecosystem Growth",
    acceleration: "+31% over 6h",
    quality: "High",
    penetration: "High",
    smartMoney: "Confirmed",
    persistence: "Rising",
    spread: "7 related markets",
    correlation: "+0.69",
    impact: "+5.2 pts",
    bias: "Bullish",
    score: 88,
    direction: "up",
    driver: "SOL ecosystem growth narrative is propagating from ETF odds into adjacent infrastructure and app markets.",
    implication: "Cross-market positioning is rotating toward SOL-linked upside exposure.",
  },
  {
    name: "Ethereum Rotation Pressure",
    acceleration: "-11% over 6h",
    quality: "Medium",
    penetration: "Low",
    smartMoney: "Fading",
    persistence: "Decaying",
    spread: "3 related markets",
    correlation: "-0.34",
    impact: "-1.8 pts",
    bias: "Bearish",
    score: 59,
    direction: "down",
    driver: "ETH rotation narrative is losing participation quality as capital shifts toward SOL-linked markets.",
    implication: "ETH upside markets are showing weaker positioning correlation and reduced persistence.",
  },
  {
    name: "Election Polling Reliability",
    acceleration: "+12% over 6h",
    quality: "Mixed",
    penetration: "Medium",
    smartMoney: "Partial",
    persistence: "Stable",
    spread: "8 related markets",
    correlation: "+0.37",
    impact: "+2.2 pts",
    bias: "Neutral",
    score: 68,
    direction: "volatile",
    driver: "Polling reliability discussion is affecting candidate-specific markets without full wallet confirmation.",
    implication: "Pricing remains sensitive to source quality and polling methodology changes.",
  },
];

const feed = [
  ["14:10:08", "SOL ETF narrative acceleration confirmed by wallet positioning in related markets.", "+6.4 pts"],
  ["14:11:22", "Discussion participation from institutional and trading-focused accounts increased +38% over 6h.", "Quality high"],
  ["14:12:04", "Bitcoin allocation narrative spreading through macro-focused ETF flow discussions.", "+4.8 pts"],
  ["14:13:41", "Solana ecosystem growth narrative propagated into infrastructure and app markets.", "7 markets"],
  ["14:14:16", "AI regulation narrative volatility rising, but smart money confirmation remains weak.", "Unconfirmed"],
  ["14:15:39", "Ethereum rotation narrative decaying as positioning correlation weakens.", "Decaying"],
];

const heatmap = [
  ["SOL ETF", "confirmed", 91],
  ["SOL Growth", "propagating", 88],
  ["BTC Allocation", "confirmed", 86],
  ["AI Rules", "volatile", 73],
  ["Election Polling", "volatile", 68],
  ["ETH Rotation", "decaying", 59],
  ["Rate Cuts", "volatile", 66],
  ["ETF Flows", "confirmed", 84],
  ["China Stimulus", "propagating", 72],
  ["Sportsbook Risk", "decaying", 55],
  ["Compute Policy", "volatile", 70],
  ["Liquidity Rotation", "propagating", 79],
];

const selected = narratives[0];

function heatTone(type: string) {
  if (type === "confirmed") return "border-emerald-300/20 bg-emerald-300/[0.09] text-emerald-100";
  if (type === "propagating") return "border-blue-300/25 bg-blue-300/[0.1] text-blue-100";
  if (type === "decaying") return "border-red-300/20 bg-red-300/[0.08] text-red-100";
  return "border-amber-300/20 bg-amber-300/[0.08] text-amber-100";
}

export default function NarrativesPage() {
  return (
    <FeatureGate feature="narrativeWatch" explanation="Narrative Watch starts at Observer access. Sign in with a demo account or upgrade your plan.">
      <NarrativeWatchByPlan />
    </FeatureGate>
  );
}

function NarrativeWatchByPlan() {
  const { plan } = useCurrentPlan();

  if (plan === "observer") {
    return <ObserverNarrativeWatch />;
  }

  return <FullNarrativesPage />;
}

function ObserverNarrativeWatch() {
  return (
    <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="grid gap-4">
        <section className="rounded-xl border border-white/[0.075] bg-[#070b14]/86 p-4">
          <Badge className="mb-3 h-6 rounded-lg border border-blue-300/15 bg-blue-300/[0.07] font-mono text-[10px] uppercase text-blue-100">Observer narrative feed</Badge>
          <h1 className="text-2xl font-semibold tracking-[-0.03em] text-white">Limited Narrative Watch</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">Observer access includes top-level narrative impact. Full market penetration, smart money confirmation, heatmaps, and propagation analysis require Analyst access.</p>
        </section>

        <Panel>
          <PanelHeader title="Limited Narrative Feed" action="Market impact" />
          <CardContent className="space-y-2 p-4">
            {feed.slice(0, 3).map(([time, text, value]) => (
              <div key={time} className="flex items-start gap-3 rounded-xl border border-white/[0.065] bg-black/28 p-3">
                <CircleDot className="mt-0.5 size-3.5 text-blue-200" />
                <div className="min-w-0 flex-1">
                  <div className="font-mono text-[10px] text-slate-600">{time}</div>
                  <div className="mt-1 text-xs leading-5 text-slate-300">{text}</div>
                </div>
                <span className="font-mono text-[10px] text-blue-200">{value}</span>
              </div>
            ))}
          </CardContent>
        </Panel>

        <Panel>
          <PanelHeader title="Top Narratives" action="Limited" />
          <CardContent className="grid gap-3 p-4 md:grid-cols-3">
            {narratives.slice(0, 3).map((narrative) => (
              <div key={narrative.name} className="rounded-xl border border-white/[0.075] bg-black/28 p-4">
                <div className="mb-3 flex min-w-0 items-start justify-between gap-3">
                  <h2 className="min-w-0 text-sm font-semibold leading-5 text-white">{narrative.name}</h2>
                  <BiasBadge bias={narrative.bias} />
                </div>
                <p className="mb-3 text-xs leading-5 text-slate-400">{narrative.implication}</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    ["Impact", narrative.impact],
                    ["Quality", narrative.quality],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-lg bg-white/[0.035] p-2">
                      <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-slate-600">{label}</div>
                      <div className="mt-1 font-mono text-slate-200">{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Panel>

        <Panel>
          <PanelHeader title="Detailed Narrative Analytics" action="Analyst" />
          <CardContent className="grid gap-3 p-4 md:grid-cols-3">
            {["Market impact heatmap", "Smart money confirmation", "Cross-market propagation"].map((feature) => (
              <div key={feature} className="relative min-h-40 overflow-hidden rounded-xl border border-white/[0.075] bg-black/28 p-4">
                <div className="blur-[2px]">
                  <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-600">{feature}</div>
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <span className="h-12 rounded-lg bg-emerald-300/[0.09]" />
                    <span className="h-12 rounded-lg bg-blue-300/[0.1]" />
                    <span className="h-12 rounded-lg bg-amber-300/[0.08]" />
                  </div>
                  <div className="mt-4 h-2 w-2/3 rounded-full bg-white/10" />
                </div>
                <PremiumLockedOverlay copy="Unlock full Narrative Watch with Analyst" />
              </div>
            ))}
          </CardContent>
        </Panel>
      </div>

      <aside className="grid gap-4 2xl:sticky 2xl:top-5 2xl:self-start">
        <Panel>
          <PanelHeader title="Full Narrative Analytics" action="Analyst" />
          <CardContent className="p-4">
            <div className="mb-4 grid size-11 place-items-center rounded-xl border border-blue-300/18 bg-blue-300/[0.07] text-blue-100">
              <Lock className="size-5" />
            </div>
            <h2 className="text-lg font-semibold tracking-[-0.02em] text-white">Unlock market behavior impact</h2>
            <p className="mt-2 text-xs leading-6 text-slate-400">Analyst access unlocks narrative quality, market penetration, smart money confirmation, propagation, and historical impact.</p>
            <button type="button" onClick={() => window.location.assign("/terminal/settings")} className="mt-5 inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-blue-300/45 bg-[#1f6fff] px-4 py-2 text-xs font-semibold text-white hover:bg-[#3b82f6]">
              Upgrade Access
              <ArrowRight className="size-4" />
            </button>
          </CardContent>
        </Panel>
      </aside>
    </div>
  );
}

function FullNarrativesPage() {
  return (
    <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_390px]">
      <div className="grid min-w-0 gap-4">
        <section className="rounded-xl border border-blue-300/15 bg-blue-300/[0.045] p-4">
          <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-blue-100">Narrative Impact on Market Behavior</div>
          <h1 className="text-2xl font-semibold tracking-[-0.03em] text-white">Narratives matter only when they change positioning, probabilities, or cross-market behavior.</h1>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-400">OracleX evaluates narrative acceleration, participant quality, smart money confirmation, persistence, spread, and positioning correlation.</p>
        </section>

        <div className="grid gap-4 lg:grid-cols-4">
          {[
            ["Narrative Acceleration", "+38%", "institutional/trading accounts over 6h", TrendingUp],
            ["Participation Quality", "High", "macro and desk-focused accounts", ShieldCheck],
            ["Smart Money Confirmation", "Confirmed", "$3.8M aligned flow", Wallet],
            ["Cross-Market Spread", "6", "related markets repricing", GitBranch],
          ].map(([label, value, detail, Icon], index) => (
            <motion.div key={label as string} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }}>
              <Panel>
                <CardContent className="p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500">{label as string}</span>
                    <Icon className="size-4 text-blue-200" />
                  </div>
                  <div className="font-mono text-2xl tracking-[-0.05em]">{value as string}</div>
                  <div className="mt-2 text-xs leading-5 text-blue-200">{detail as string}</div>
                </CardContent>
              </Panel>
            </motion.div>
          ))}
        </div>

        <Panel>
          <PanelHeader title="Narrative Market Impact" action="Table-first intelligence" />
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full min-w-[980px] text-left text-xs">
              <thead className="border-b border-white/[0.075] text-[10px] uppercase tracking-[0.14em] text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Narrative</th>
                  <th className="px-4 py-3 font-medium">Bias</th>
                  <th className="px-4 py-3 font-medium">Acceleration</th>
                  <th className="px-4 py-3 font-medium">Quality</th>
                  <th className="px-4 py-3 font-medium">Market Penetration</th>
                  <th className="px-4 py-3 font-medium">Smart Money</th>
                  <th className="px-4 py-3 font-medium">Impact</th>
                  <th className="px-4 py-3 font-medium">Positioning Correlation</th>
                </tr>
              </thead>
              <tbody>
                {narratives.map((narrative) => (
                  <tr key={narrative.name} className="border-b border-white/[0.055] transition hover:bg-blue-300/[0.035]">
                    <td className="max-w-xs px-4 py-4">
                      <div className="font-semibold text-white">{narrative.name}</div>
                      <div className="mt-1 text-slate-400">{narrative.implication}</div>
                    </td>
                    <td className="px-4 py-4"><BiasBadge bias={narrative.bias} /></td>
                    <td className="px-4 py-4 font-mono text-blue-100">{narrative.acceleration}</td>
                    <td className="px-4 py-4 text-slate-200">{narrative.quality}</td>
                    <td className="px-4 py-4 text-slate-200">{narrative.penetration}</td>
                    <td className="px-4 py-4 text-slate-200">{narrative.smartMoney}</td>
                    <td className="px-4 py-4 font-mono text-blue-100">{narrative.impact}</td>
                    <td className="px-4 py-4 font-mono text-slate-200">{narrative.correlation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Panel>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <Panel>
            <PanelHeader title="Narrative Feed" action="Impact updates" />
            <CardContent className="space-y-2 p-4">
              {feed.map(([time, text, value], index) => (
                <motion.div key={time} className="flex items-start gap-3 rounded-xl border border-white/[0.065] bg-black/28 p-3" animate={{ opacity: [0.72, 1, 0.84] }} transition={{ duration: 4.2, repeat: Infinity, delay: index * 0.3 }}>
                  <CircleDot className="mt-0.5 size-3.5 text-blue-200" />
                  <div className="min-w-0 flex-1">
                    <div className="font-mono text-[10px] text-slate-600">{time}</div>
                    <div className="mt-1 text-xs leading-5 text-slate-300">{text}</div>
                  </div>
                  <span className="font-mono text-[10px] text-blue-200">{value}</span>
                </motion.div>
              ))}
            </CardContent>
          </Panel>

          <Panel>
            <PanelHeader title="Narrative Heatmap" action="Strategic market impact" />
            <CardContent className="grid grid-cols-2 gap-3 p-4 md:grid-cols-3 xl:grid-cols-4">
              {heatmap.map(([name, type, score]) => (
                <div key={name} className={`min-h-24 rounded-xl border p-3 ${heatTone(type as string)}`}>
                  <div className="text-sm font-semibold">{name}</div>
                  <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] opacity-75">{type}</div>
                  <div className="mt-3 font-mono text-2xl tracking-[-0.05em]">{score}</div>
                </div>
              ))}
            </CardContent>
          </Panel>
        </div>
      </div>

      <aside className="grid gap-4 2xl:sticky 2xl:top-5 2xl:self-start">
        <Panel>
          <PanelHeader title="Narrative Detail" action="SOL ETF" />
          <CardContent className="p-4">
            <div className="mb-3 flex items-start justify-between gap-3">
              <h2 className="text-xl font-semibold tracking-[-0.03em]">{selected.name}</h2>
              {selected.direction === "down" ? <ArrowDownRight className="size-5 shrink-0 text-red-200" /> : <ArrowUpRight className="size-5 shrink-0 text-emerald-200" />}
            </div>
            <p className="text-xs leading-6 text-slate-300">{selected.driver}</p>
            <div className="mt-4 rounded-xl border border-blue-300/15 bg-blue-300/[0.045] p-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-blue-100">Prediction market implication</div>
              <p className="mt-2 text-xs leading-6 text-slate-300">{selected.implication}</p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                ["Who is driving it", "Macro/trading accounts"],
                ["Flows confirm it", selected.smartMoney],
                ["Derivatives correlation", selected.correlation],
                ["Historical impact", "6-12 pt repricing window"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-white/[0.065] bg-white/[0.025] p-3">
                  <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-slate-600">{label}</div>
                  <div className="mt-2 text-xs leading-5 text-slate-200">{value}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Panel>

        <Panel>
          <PanelHeader title="Market Impact Analysis" />
          <CardContent className="space-y-4 p-4">
            {[
              ["SOL ETF approval", 94],
              ["Solana ecosystem growth", 87],
              ["BTC ETF inflow sympathy", 64],
              ["ETH rotation pressure", 58],
            ].map(([label, value]) => (
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
          <PanelHeader title="Narrative Quality Drivers" />
          <CardContent className="space-y-2 p-4">
            {["Institutional account participation", "Smart money flow confirmation", "Related market repricing", "Persistence across 6h window"].map((driver) => (
              <div key={driver} className="flex items-center justify-between rounded-lg bg-white/[0.035] px-3 py-2 text-xs">
                <span className="text-slate-300">{driver}</span>
                <span className="font-mono text-blue-200">HIGH</span>
              </div>
            ))}
          </CardContent>
        </Panel>
      </aside>
    </div>
  );
}
