"use client";

import { motion } from "framer-motion";
import { Activity, AlertTriangle, BrainCircuit, CircleDot, Database, Info, Lock, TrendingDown, TrendingUp, Wallet, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";

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

const intelligenceDrivers = [
  ["ETF Approval Narrative", "88", "Issuer filing activity and ETF-window discussion are pushing SOL approval markets above public pricing.", "Bullish"],
  ["Institutional Crypto Access", "84", "Institutional access narratives are spreading through crypto policy and allocation accounts tied to SOL exposure.", "Bullish"],
  ["Filing Resolution Clarity", "81", "The market rules map cleanly to observable approval outcomes, though issuer commentary is still mixed.", "Neutral"],
  ["SOL Liquidity Support", "86", "YES-side demand and order-book imbalance support higher probability, but depth remains thin.", "Bullish"],
];

const overviewMetrics: { label: string; value: string; detail: string; Icon: LucideIcon; info: string; align?: "left" | "right" }[] = [
  {
    label: "Oracle Consensus",
    value: "87.4",
    detail: "12-point intelligence premium",
    Icon: TrendingUp,
    info: "Oracle Consensus measures how strongly OracleX believes current market pricing is supported by smart money positioning, narrative strength, liquidity conditions, and resolution clarity. 50 = neutral, 70+ = strong conviction, 85+ = high-conviction intelligence alignment.",
    align: "left",
  },
  {
    label: "Markets Scanned",
    value: "1,284",
    detail: "42 sectors",
    Icon: Database,
    info: "Number of prediction markets and related market sectors currently monitored by OracleX for pricing divergence, narratives, liquidity conditions, and smart money activity.",
    align: "left",
  },
  {
    label: "Whale Flow",
    value: "$3.8M",
    detail: "YES bias",
    Icon: Wallet,
    info: "Directional capital movement from linked high-value wallets and smart money clusters. Positive YES bias indicates whale activity is supporting higher probability pricing.",
    align: "right",
  },
  {
    label: "Signal Latency",
    value: "8.4s",
    detail: "p95 stable",
    Icon: Activity,
    info: "Estimated delay between detected market activity and OracleX signal generation. Lower latency means faster intelligence updates.",
    align: "right",
  },
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

function InfoTooltip({ label, children, align = "right", width = "w-80" }: { label: string; children: React.ReactNode; align?: "left" | "right"; width?: string }) {
  return (
    <span className="group/tooltip relative z-30 inline-flex">
      <button type="button" aria-label={label} className="grid size-5 cursor-help place-items-center rounded-full border border-blue-300/20 bg-blue-300/[0.07] text-blue-100 transition hover:border-blue-300/45 hover:bg-blue-300/[0.13]">
        <Info className="size-3" />
      </button>
      <span className={`pointer-events-none absolute top-7 z-[100] ${align === "left" ? "left-0" : "right-0"} ${width} max-w-[calc(100vw-2rem)] rounded-xl border border-blue-300/20 bg-[#050914]/98 p-3 text-left text-[11px] leading-5 text-slate-300 opacity-0 shadow-[0_18px_60px_rgba(0,0,0,0.6)] ring-1 ring-blue-300/[0.06] transition duration-200 group-hover/tooltip:opacity-100`}>
        {children}
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
  ["14:04:02", "Narrative Intelligence found emerging APAC policy catalyst", "NEW"],
];

const alerts = [
  {
    title: "High conviction divergence",
    type: "critical",
    impact: "OracleX probability is +6.4 pts above public market pricing.",
    source: "Pricing + smart money + narrative confirmation.",
    why: "Public pricing may be lagging intelligence signals.",
  },
  {
    title: "Whale cluster active",
    type: "watch",
    impact: "Linked wallets are accumulating YES exposure.",
    source: "Wallet flow monitoring.",
    why: "Coordinated wallet activity can precede probability repricing.",
  },
  {
    title: "Narrative shift",
    type: "signal",
    impact: "ETF approval narrative is accelerating faster than price.",
    source: "Narrative monitoring.",
    why: "Narrative acceleration can pull market probability higher.",
  },
];

const breakdown = [
  ["Market depth", 86, "Strong", "Order book support and liquidity quality"],
  ["Narrative velocity", 94, "Very Strong", "Speed of narrative growth across relevant sources"],
  ["Wallet concentration", 88, "Strong", "Degree of smart money clustering"],
  ["Truth confidence", 81, "Strong", "Reliability of source and claim evidence"],
  ["Resolution clarity", 91, "Very Strong", "How clearly the market can be resolved"],
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
  const visibleDrivers = isObserver ? intelligenceDrivers.slice(0, 2) : intelligenceDrivers;

  return (
    <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_380px]">
      <div className="grid min-w-0 gap-4">
        <div className="relative z-30 grid gap-4 overflow-visible lg:grid-cols-4">
          {overviewMetrics.map(({ label, value, detail, Icon, info, align }, index) => (
            <motion.div key={label} className="relative overflow-visible hover:z-50" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }}>
              <Panel className="overflow-visible">
                <CardContent className="p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500">{label}</span>
                      <InfoTooltip label={`Explain ${label}`} align={align}>{info}</InfoTooltip>
                    </span>
                    <Icon className="size-4 shrink-0 text-blue-200" />
                  </div>
                  <div className="font-mono text-3xl tracking-[-0.05em] text-white">{value}</div>
                  <div className="mt-2 text-xs text-blue-200">{detail}</div>
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
            <PanelHeader title="Intelligence Drivers" action={isObserver ? "Basic signals" : "Why bullish"} />
            <CardContent className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-4">
              {visibleDrivers.map(([name, confidence, signal, bias]) => (
                <div key={name} className="relative rounded-xl border border-white/[0.075] bg-white/[0.025] p-4">
                  <div className="mb-4 flex min-h-[4.25rem] flex-col items-start justify-between gap-2">
                    <div className="text-sm font-semibold leading-5 text-white">{name}</div>
                    <BiasBadge bias={bias} />
                  </div>
                  <div className="mb-3 flex items-end justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-600">Driver strength</span>
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
                  <h2 className="text-sm font-semibold text-white">Upgrade to Analyst for real-time Prediction Market Analytics, Narrative Intelligence, and advanced filters.</h2>
                </div>
              ) : null}
            </CardContent>
          </Panel>

          <Panel className="overflow-visible">
            <PanelHeader
              title="Market Alerts"
              action="Priority"
              info={
                <InfoTooltip label="Explain Market Alerts" align="right">
                  Market Alerts highlight the highest-priority developments currently affecting the selected prediction market, including pricing divergence, smart money movement, narrative shifts, liquidity changes, and resolution risk.
                </InfoTooltip>
              }
            />
            <CardContent className="space-y-3 p-4">
              {alerts.map((alert) => (
                <div key={alert.title} className="rounded-xl border border-white/[0.075] bg-black/28 p-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    {alert.type === "critical" ? <AlertTriangle className="size-4 text-red-200" /> : <Zap className="size-4 text-blue-200" />}
                    {alert.title}
                  </div>
                  <div className="mt-3 grid gap-2 text-xs leading-5">
                    {[
                      ["Impact", alert.impact],
                      ["Source", alert.source],
                      ["Why it matters", alert.why],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-blue-100">{label}: </span>
                        <span className="text-slate-400">{value}</span>
                      </div>
                    ))}
                  </div>
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

        <Panel className="overflow-visible">
          <PanelHeader
            title="Signal Breakdown"
            info={
              <InfoTooltip label="Explain Signal Breakdown" align="right">
                Signal Breakdown shows the core factors driving OracleX&apos;s probability view for the selected market. Higher values indicate stronger support from that signal category.
              </InfoTooltip>
            }
          />
          <CardContent className="space-y-4 p-4">
            {breakdown.map(([label, value, interpretation, description]) => (
              <div key={label as string}>
                <div className="mb-2 flex items-start justify-between gap-3 text-xs">
                  <span>
                    <span className="block text-slate-300">{label as string}</span>
                    <span className="mt-1 block text-[11px] leading-4 text-slate-500">{description as string}</span>
                  </span>
                  <span className="shrink-0 text-right font-mono text-blue-100">
                    {value as number}
                    <span className="ml-1 text-[10px] uppercase tracking-[0.1em] text-slate-400">{interpretation as string}</span>
                  </span>
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
