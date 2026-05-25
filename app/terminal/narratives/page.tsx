"use client";

import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, CircleDot, Flame, Globe2, Users, Wallet } from "lucide-react";

import { BiasBadge, Panel, PanelHeader } from "@/components/terminal/terminal-shell";
import { Badge } from "@/components/ui/badge";
import { CardContent } from "@/components/ui/card";

const narratives = [
  { name: "SOL ETF Momentum", velocity: "+38%", ratio: "72/28", confidence: 92, kol: "48", wallet: "$3.8M", impact: "+6.4 pts", direction: "up", score: 94, bias: "Bullish" },
  { name: "Trump Election Odds", velocity: "+14%", ratio: "58/42", confidence: 84, kol: "121", wallet: "$1.1M", impact: "+2.9 pts", direction: "up", score: 82, bias: "Bullish" },
  { name: "AI Regulation", velocity: "+22%", ratio: "44/56", confidence: 79, kol: "67", wallet: "$820K", impact: "-3.1 pts", direction: "volatile", score: 77, bias: "Bearish" },
  { name: "Bitcoin Institutional Flow", velocity: "+19%", ratio: "63/37", confidence: 88, kol: "86", wallet: "$7.4M", impact: "+4.8 pts", direction: "up", score: 89, bias: "Bullish" },
  { name: "Solana Ecosystem Growth", velocity: "+31%", ratio: "69/31", confidence: 86, kol: "39", wallet: "$2.4M", impact: "+5.2 pts", direction: "up", score: 91, bias: "Bullish" },
  { name: "Ethereum Rotation", velocity: "-11%", ratio: "41/59", confidence: 73, kol: "54", wallet: "$640K", impact: "-1.8 pts", direction: "down", score: 62, bias: "Bearish" },
];

const feed = [
  ["14:10:08", "Narrative velocity accelerating around SOL ETF approval language", "+38%"],
  ["14:11:22", "KOL cluster detected across institutional crypto accounts", "48 accounts"],
  ["14:12:04", "Institutional discussion increasing for Bitcoin allocation flows", "+19%"],
  ["14:13:41", "Market sentiment shifted bullish on Solana ecosystem growth", "69/31"],
  ["14:14:16", "AI Regulation narrative volatility rising after policy leak", "HIGH"],
  ["14:15:39", "Ethereum Rotation narrative fading across prediction markets", "-11%"],
];

const heatmap = [
  ["SOL ETF", "strongest", 94],
  ["SOL Growth", "fastest", 91],
  ["BTC Flow", "strongest", 89],
  ["Trump Odds", "fastest", 82],
  ["AI Rules", "volatile", 77],
  ["ETH Rotation", "fading", 62],
  ["Rate Cuts", "volatile", 69],
  ["Sportsbooks", "fading", 55],
  ["Memecoin Liquidity", "volatile", 73],
  ["China Stimulus", "fastest", 78],
  ["ETF Flows", "strongest", 86],
  ["Election Polling", "volatile", 71],
];

const selected = narratives[0];

function heatTone(type: string) {
  if (type === "strongest") return "border-emerald-300/20 bg-emerald-300/[0.09] text-emerald-100";
  if (type === "fastest") return "border-blue-300/25 bg-blue-300/[0.1] text-blue-100";
  if (type === "fading") return "border-red-300/20 bg-red-300/[0.08] text-red-100";
  return "border-amber-300/20 bg-amber-300/[0.08] text-amber-100";
}

export default function NarrativesPage() {
  return (
    <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_380px]">
      <div className="grid min-w-0 gap-4">
        <div className="grid gap-4 lg:grid-cols-4">
          {[
            ["Active Narratives", "42", "6 accelerating", Globe2],
            ["KOL Participation", "415", "+24 last hour", Users],
            ["Wallet Activity", "$16.2M", "narrative-linked", Wallet],
            ["Market Impact", "+21.7 pts", "aggregate move", Flame],
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
          <PanelHeader title="Narrative Overview" action="Kaito-style market intelligence" />
          <CardContent className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
            {narratives.map((narrative) => (
              <div key={narrative.name} className="rounded-xl border border-white/[0.075] bg-black/28 p-4 transition hover:border-blue-300/20 hover:bg-blue-300/[0.035]">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-semibold text-white">{narrative.name}</h2>
                    <div className="mt-2 flex items-center gap-2">
                      <BiasBadge bias={narrative.bias} />
                      <Badge className="h-6 rounded-lg border border-blue-300/15 bg-blue-300/[0.06] font-mono text-[10px] text-blue-100">Score {narrative.score}</Badge>
                    </div>
                  </div>
                  {narrative.direction === "down" ? <ArrowDownRight className="size-5 text-red-200" /> : <ArrowUpRight className="size-5 text-emerald-200" />}
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    ["Velocity", narrative.velocity],
                    ["Bull/Bear", narrative.ratio],
                    ["AI Conf.", `${narrative.confidence}`],
                    ["KOL", narrative.kol],
                    ["Wallets", narrative.wallet],
                    ["Impact", narrative.impact],
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

        <div className="grid gap-4 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <Panel>
            <PanelHeader title="Narrative Feed" action="Live updates" />
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
            <PanelHeader title="Narrative Heatmap" action="Strength / growth / decay" />
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
            <h2 className="text-xl font-semibold tracking-[-0.03em]">{selected.name}</h2>
            <p className="mt-3 text-xs leading-6 text-slate-300">
              SOL ETF discussion is accelerating because market participants are linking issuer filings, regulatory calendar windows, and rising Solana institutional flow. OracleX detects narrative strength moving ahead of Polymarket pricing.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                ["Related markets", "8"],
                ["Top accounts", "48"],
                ["Velocity history", "+38%"],
                ["Confidence trend", "Rising"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-white/[0.065] bg-white/[0.025] p-3">
                  <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-slate-600">{label}</div>
                  <div className="mt-2 font-mono text-lg tracking-[-0.04em]">{value}</div>
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
          <PanelHeader title="Influencing Accounts" />
          <CardContent className="space-y-2 p-4">
            {["@ETFDesk", "@SolanaFloor", "@MacroScope", "@BlockworksResearch"].map((account) => (
              <div key={account} className="flex items-center justify-between rounded-lg bg-white/[0.035] px-3 py-2 text-xs">
                <span className="text-slate-300">{account}</span>
                <span className="font-mono text-blue-200">HIGH</span>
              </div>
            ))}
          </CardContent>
        </Panel>
      </aside>
    </div>
  );
}
