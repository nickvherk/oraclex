"use client";

import { motion } from "framer-motion";
import { Activity, AlertTriangle, BrainCircuit, CircleDot, Database, Info, Lock, TrendingDown, TrendingUp, Wallet, Zap } from "lucide-react";

import { FeatureGate, PremiumLockedOverlay } from "@/components/terminal/access-gate";
import { BiasBadge, Panel, PanelHeader } from "@/components/terminal/terminal-shell";
import { Badge } from "@/components/ui/badge";
import { CardContent } from "@/components/ui/card";
import { useCurrentPlan } from "@/lib/access-control";

const markets = [
  { title: "SOL ETF approved before Q4", sector: "Crypto", poly: "64.8%", oracle: "71.2%", change: "+12.0%", bias: "Bullish", volume: "$18.4M" },
  { title: "Fed cuts rates at next meeting", sector: "Macro", poly: "38.1%", oracle: "42.6%", change: "+4.5%", bias: "Neutral", volume: "$9.7M" },
  { title: "Major AI lab releases agent OS", sector: "AI", poly: "55.3%", oracle: "61.9%", change: "+8.1%", bias: "Bullish", volume: "$6.2M" },
  { title: "BTC breaks new ATH this quarter", sector: "Crypto", poly: "58.6%", oracle: "52.4%", change: "-2.4%", bias: "Bearish", volume: "$24.1M" },
];

const agents = [
  ["Smart Money Flow", "88", "$3.8M directional YES accumulation detected across linked wallets", "Bullish"],
  ["Narrative Momentum", "84", "Institutional ETF discussion accelerated after filing-window analysis", "Bullish"],
  ["Resolution Clarity", "81", "Source quality stable with two conflicting issuer statements", "Neutral"],
  ["Liquidity Conditions", "86", "Order book imbalance favors higher probability but depth remains thin", "Bullish"],
];

const probabilityDrivers = [
  "smart money positioning",
  "leverage pressure",
  "narrative acceleration",
  "wallet clustering",
  "liquidity conditions",
  "consensus divergence",
];

function ProbabilityInfo() {
  return (
    <span className="group/probability relative inline-flex">
      <button type="button" aria-label="Explain OracleX probability" className="grid size-5 cursor-help place-items-center rounded-full border border-blue-300/20 bg-blue-300/[0.07] text-blue-100 transition hover:border-blue-300/45 hover:bg-blue-300/[0.13]">
        <Info className="size-3" />
      </button>
      <span className="pointer-events-none absolute right-0 top-7 z-20 w-72 rounded-xl border border-blue-300/20 bg-[#050914]/98 p-3 text-left shadow-[0_18px_60px_rgba(0,0,0,0.45)] opacity-0 ring-1 ring-blue-300/[0.06] transition duration-200 group-hover/probability:opacity-100">
        <span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-blue-100">OracleX probability reflects:</span>
        <span className="mt-2 grid gap-1.5">
          {probabilityDrivers.map((driver) => (
            <span key={driver} className="flex items-center gap-2 text-[11px] leading-4 text-slate-300">
              <CircleDot className="size-2.5 shrink-0 text-blue-200" />
              {driver}
            </span>
          ))}
        </span>
      </span>
    </span>
  );
}

const feed = [
  ["14:03:28", "Whale entered YES on SOL ETF", "+$1.8M"],
  ["14:03:31", "Narrative momentum increased across institutional crypto accounts", "+18.4%"],
  ["14:03:34", "Truth confidence dropped after contradictory issuer statement", "-7.0%"],
  ["14:03:39", "Liquidity imbalance detected on top three venues", "HIGH"],
  ["14:03:42", "Oracle Consensus shifted bullish on SOL ETF approval", "71.2"],
  ["14:03:47", "Resolution Agent flagged clean expiry language", "91"],
  ["14:03:54", "Macro Agent reduced risk discount after ETF flow data", "+4.2"],
  ["14:04:02", "Narrative Watch found emerging APAC policy catalyst", "NEW"],
];

const alerts = [
  ["High conviction divergence", "OracleX is 6.4 pts above Polymarket on SOL ETF.", "critical"],
  ["Whale cluster active", "Three linked wallets are accumulating YES exposure.", "watch"],
  ["Narrative shift", "ETF approval narrative is accelerating faster than price.", "signal"],
];

const breakdown = [
  ["Market depth", 86],
  ["Narrative velocity", 94],
  ["Wallet concentration", 88],
  ["Truth confidence", 81],
  ["Resolution clarity", 91],
];

export default function TerminalPage() {
  return (
    <FeatureGate feature="terminal" explanation="Sign in with an OracleX demo account to access the terminal workspace.">
      <TerminalDashboard />
    </FeatureGate>
  );
}

function TerminalDashboard() {
  const selected = markets[0];
  const { plan } = useCurrentPlan();
  const isObserver = plan === "observer";
  const visibleAgents = isObserver ? agents.slice(0, 2) : agents;

  return (
    <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_380px]">
      <div className="grid min-w-0 gap-4">
        <div className="grid gap-4 lg:grid-cols-4">
          {[
            ["Oracle Consensus", "87.4", "+12.0 pts", TrendingUp],
            ["Markets Scanned", "1,284", "42 sectors", Database],
            ["Whale Flow", "$3.8M", "YES bias", Wallet],
            ["Signal Latency", "8.4s", "p95 stable", Activity],
          ].map(([label, value, detail, Icon], index) => (
            <motion.div key={label as string} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }}>
              <Panel>
                <CardContent className="p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500">{label as string}</span>
                    <Icon className="size-4 text-blue-200" />
                  </div>
                  <div className="font-mono text-3xl tracking-[-0.05em] text-white">{value as string}</div>
                  <div className="mt-2 text-xs text-blue-200">{detail as string}</div>
                </CardContent>
              </Panel>
            </motion.div>
          ))}
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.12fr)_minmax(360px,0.88fr)]">
          <Panel>
            <PanelHeader title="Prediction Markets" action={isObserver ? "Observer preview" : "Live pricing"} />
            <CardContent className="grid gap-3 p-4">
              {markets.map((market, index) => {
                const locked = isObserver && index >= 2;

                return (
                  <div key={market.title} className="relative overflow-hidden rounded-xl border border-white/[0.075] bg-black/30 p-4 transition hover:border-blue-300/20 hover:bg-blue-300/[0.035]">
                    <div className={locked ? "blur-[2px]" : ""}>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="mb-2 flex items-center gap-2">
                            <Badge className="h-5 rounded-md border border-blue-300/15 bg-blue-300/[0.06] font-mono text-[10px] text-blue-100">{market.sector}</Badge>
                            <BiasBadge bias={market.bias} />
                          </div>
                          <h2 className="text-sm font-semibold tracking-[-0.01em] text-white">{market.title}</h2>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="font-mono text-2xl tracking-[-0.05em] text-white">{market.oracle}</div>
                            <ProbabilityInfo />
                          </div>
                          <div className={`mt-1 flex items-center justify-end gap-1 font-mono text-[11px] ${market.change.startsWith("+") ? "text-emerald-200" : "text-red-200"}`}>
                            {market.change.startsWith("+") ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                            {market.change}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                        {[
                          ["Polymarket", market.poly],
                          ["OracleX", market.oracle],
                          ["Volume", market.volume],
                        ].map(([label, value]) => (
                          <div key={label} className="rounded-lg bg-white/[0.035] p-2">
                            <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-slate-600">{label}</div>
                            <div className={`mt-1 font-mono ${label === "OracleX" ? "text-blue-200" : "text-slate-200"}`}>{value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    {locked ? <PremiumLockedOverlay copy="Unlock full market intelligence with Analyst" /> : null}
                  </div>
                );
              })}
            </CardContent>
          </Panel>

          <Panel>
            <PanelHeader title="Live Intelligence Feed" action={isObserver ? "15 min delayed" : "Streaming"} />
            <CardContent className="max-h-[524px] space-y-2 overflow-hidden p-4">
              {feed.map(([time, text, value], index) => (
                <motion.div key={`${time}-${text}`} className="relative overflow-hidden rounded-xl border border-white/[0.065] bg-black/28" animate={{ opacity: [0.72, 1, 0.84] }} transition={{ duration: 4.5, repeat: Infinity, delay: index * 0.35 }}>
                  <div className={`flex items-start gap-3 p-3 ${isObserver && index >= 3 ? "blur-[2px]" : ""}`}>
                    <CircleDot className="mt-0.5 size-3.5 shrink-0 text-blue-200" />
                    <div className="min-w-0 flex-1">
                      <div className="font-mono text-[10px] text-slate-600">{time}</div>
                      <div className="mt-1 text-xs leading-5 text-slate-300">{text}</div>
                    </div>
                    <span className="font-mono text-[10px] text-blue-200">{value}</span>
                  </div>
                  {isObserver && index >= 3 ? <PremiumLockedOverlay copy="Real-time intelligence requires Analyst" compact /> : null}
                </motion.div>
              ))}
            </CardContent>
          </Panel>
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <Panel>
            <PanelHeader title="Consensus Summary" action={isObserver ? "Basic signals" : "4 live agents"} />
            <CardContent className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-4">
              {visibleAgents.map(([name, confidence, signal, bias]) => (
                <div key={name} className="rounded-xl border border-white/[0.075] bg-white/[0.025] p-4">
                  <div className="mb-4 flex min-w-0 items-start justify-between gap-3">
                    <div className="min-w-0 text-sm font-semibold leading-5 text-white">{name}</div>
                    <BiasBadge bias={bias} />
                  </div>
                  <div className="mb-3 flex items-end justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-600">Confidence</span>
                    <span className="font-mono text-2xl tracking-[-0.05em] text-blue-100">{confidence}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                    <div className="h-full rounded-full bg-[#1f6fff]" style={{ width: `${confidence}%` }} />
                  </div>
                  <p className="mt-3 text-xs leading-5 text-slate-400">{signal}</p>
                </div>
              ))}
              {isObserver ? (
                <div className="rounded-xl border border-blue-300/18 bg-blue-300/[0.055] p-4 xl:col-span-2">
                  <div className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-blue-100">
                    <Lock className="size-4" />
                    Analyst upgrade
                  </div>
                  <h2 className="text-sm font-semibold text-white">Upgrade to Analyst for real-time wallet intelligence, consensus engine, and advanced filters.</h2>
                </div>
              ) : null}
            </CardContent>
          </Panel>

          <Panel>
            <PanelHeader title="Market Alerts" action="Priority" />
            <CardContent className="space-y-3 p-4">
              {alerts.map(([title, detail, type]) => (
                <div key={title} className="rounded-xl border border-white/[0.075] bg-black/28 p-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    {type === "critical" ? <AlertTriangle className="size-4 text-red-200" /> : <Zap className="size-4 text-blue-200" />}
                    {title}
                  </div>
                  <p className="mt-2 text-xs leading-5 text-slate-400">{detail}</p>
                </div>
              ))}
            </CardContent>
          </Panel>
        </div>
      </div>

      <aside className="grid gap-4 2xl:sticky 2xl:top-5 2xl:self-start">
        <Panel>
          <PanelHeader title="Selected Market" action="SOL-ETF" />
          <CardContent className="p-4">
            <div className="mb-5">
              <Badge className="mb-3 h-6 rounded-lg border border-blue-300/15 bg-blue-300/[0.07] font-mono text-[10px] text-blue-100">{selected.sector}</Badge>
              <h2 className="text-xl font-semibold leading-tight tracking-[-0.03em] text-white">{selected.title}</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                ["Polymarket probability", selected.poly],
                ["OracleX probability", selected.oracle],
                ["AI consensus score", "87.4"],
                ["Narrative momentum", "+18.4%"],
                ["Truth confidence", "81"],
                ["Whale flow", "+$3.8M"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-white/[0.065] bg-white/[0.025] p-3">
                  <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-slate-600">{label}</div>
                  <div className="mt-2 flex items-center gap-2 font-mono text-lg tracking-[-0.04em] text-white">
                    {value}
                    {label === "OracleX probability" ? <ProbabilityInfo /> : null}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-xl border border-blue-300/15 bg-blue-300/[0.045] p-4">
              <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-blue-100">
                <BrainCircuit className="size-4" />
                AI-generated thesis
              </div>
              <p className="text-xs leading-6 text-slate-300">
                OracleX assigns a premium to approval odds because whale accumulation, narrative acceleration, and clean resolution language are moving faster than public market pricing. Truth confidence remains the primary constraint after mixed issuer commentary.
              </p>
            </div>
          </CardContent>
        </Panel>

        <Panel>
          <PanelHeader title="Signal Breakdown" />
          <CardContent className="space-y-4 p-4">
            {breakdown.map(([label, value]) => (
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
      </aside>
    </div>
  );
}
