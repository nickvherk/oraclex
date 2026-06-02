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

const feedFallback = "Signal update pending interpretation";

const feed = [
  { time: "14:03:28", title: "Whale entered YES on SOL ETF", body: "Linked wallets added exposure while public pricing held flat.", value: "+$1.8M" },
  { time: "14:03:31", title: "Narrative momentum increased", body: "Institutional crypto accounts are amplifying SOL ETF approval discussion.", value: "+18.4%" },
  { time: "14:03:34", title: "Truth confidence softened", body: "Contradictory issuer statement reduced source quality on the latest approval thread.", value: "-7.0%" },
  { time: "14:03:39", title: "Liquidity imbalance detected", body: "YES-side depth is wider than NO-side depth across the top three tracked venues.", value: "HIGH" },
  { time: "14:03:42", title: "Oracle Consensus shifted bullish", body: "Combined wallet, liquidity, and narrative signals now support a higher approval probability.", value: "71.2" },
  { time: "14:03:47", title: "Resolution Agent flagged clean language", body: "Market wording maps directly to an observable ETF approval outcome.", value: "91" },
  { time: "14:03:54", title: "Macro Agent reduced risk discount", body: "ETF flow data lowered the penalty applied to crypto approval markets.", value: "+4.2" },
  { time: "14:04:02", title: "Narrative Intelligence found APAC catalyst", body: "Regional policy coverage is beginning to reinforce the institutional access thesis.", value: "NEW" },
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

const probabilityDriverRows = [
  {
    name: "Market Liquidity",
    impact: 2.1,
    evidence: "YES side depth is 1.8x stronger than NO side depth.",
    strength: "Strong",
    score: 86,
  },
  {
    name: "Narrative Acceleration",
    impact: 3.4,
    evidence: "SOL ETF discussion increased across institutional crypto accounts.",
    strength: "Very Strong",
    score: 94,
  },
  {
    name: "Wallet Positioning",
    impact: 4.0,
    evidence: "Linked wallets accumulated $3.8M YES exposure.",
    strength: "Strong",
    score: 88,
  },
  {
    name: "Truth / Source Quality",
    impact: -1.2,
    evidence: "Issuer commentary remains mixed across primary sources.",
    strength: "Moderate",
    score: 81,
  },
  {
    name: "Resolution Clarity",
    impact: 2.5,
    evidence: "Market wording maps clearly to approval outcome.",
    strength: "Strong",
    score: 91,
  },
];

const oracleProbability = 71.2;
const publicMarketProbability = 64.8;
const probabilityDifference = oracleProbability - publicMarketProbability;

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

        <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.12fr)_minmax(360px,0.88fr)]">
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
            <CardContent className="grid gap-2 p-4">
              {feed.map((item, index) => {
                const title = item.title.trim() || feedFallback;
                const body = item.body.trim() || feedFallback;

                return (
                  <motion.div key={`${item.time}-${title}`} className="relative rounded-xl border border-white/[0.065] bg-black/28" animate={{ opacity: [0.82, 1, 0.88] }} transition={{ duration: 4.5, repeat: Infinity, delay: index * 0.35 }}>
                    <div className={`flex items-start gap-3 p-3 ${isObserver && index >= 3 ? "blur-[2px]" : ""}`}>
                      <CircleDot className="mt-0.5 size-3.5 shrink-0 text-blue-200" />
                      <div className="min-w-0 flex-1">
                        <div className="font-mono text-[10px] text-slate-500">{item.time}</div>
                        <div className="mt-1 text-xs font-medium leading-5 text-slate-100">{title}</div>
                        <div className="mt-0.5 text-[11px] leading-4 text-slate-400">{body}</div>
                      </div>
                      <span className="shrink-0 font-mono text-[10px] text-blue-200">{item.value || "PENDING"}</span>
                    </div>
                    {isObserver && index >= 3 ? <PremiumLockedOverlay copy="Real-time intelligence requires Analyst" compact /> : null}
                  </motion.div>
                );
              })}
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
                  <h2 className="text-sm font-semibold text-white">Upgrade to Analyst for real-time Prediction Market Analytics and advanced filters.</h2>
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
            title="Probability Drivers"
            info={
              <InfoTooltip label="Explain Probability Drivers" align="right">
                Probability Drivers show the factors currently pushing OracleX probability above or below public market pricing. Impacts are expressed as point contributions to the observed probability difference.
              </InfoTooltip>
            }
          />
          <CardContent className="space-y-3 p-4">
            <div className="rounded-xl border border-blue-300/15 bg-blue-300/[0.045] p-3">
              <p className="text-[11px] leading-5 text-slate-300">
                Factors currently pushing OracleX probability above or below public market pricing.
              </p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {[
                  ["OracleX", `${oracleProbability.toFixed(1)}%`, "text-blue-100"],
                  ["Public", `${publicMarketProbability.toFixed(1)}%`, "text-slate-200"],
                  ["Difference", `+${probabilityDifference.toFixed(1)} pts`, "text-emerald-200"],
                ].map(([label, value, tone]) => (
                  <div key={label} className="rounded-lg bg-black/24 p-2">
                    <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-slate-500">{label}</div>
                    <div className={`mt-1 font-mono text-sm tracking-[-0.03em] ${tone}`}>{value}</div>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[11px] leading-5 text-slate-400">
                These drivers explain why OracleX is pricing this market {probabilityDifference.toFixed(1)} points above the public market.
              </p>
            </div>

            {probabilityDriverRows.map((driver) => {
              const isPositive = driver.impact >= 0;
              const impactLabel = `${isPositive ? "+" : ""}${driver.impact.toFixed(1)} pts`;
              const barWidth = `${Math.min(Math.abs(driver.impact) / 4, 1) * 100}%`;

              return (
              <div key={driver.name} className="rounded-xl border border-white/[0.075] bg-black/28 p-3">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs font-semibold leading-5 text-slate-100">{driver.name}</div>
                    <div className="mt-1 text-[11px] leading-5 text-slate-400">{driver.evidence}</div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className={`font-mono text-sm tracking-[-0.03em] ${isPositive ? "text-emerald-200" : "text-red-200"}`}>{impactLabel}</div>
                    <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.12em] text-slate-500">Impact</div>
                  </div>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                  <div className={`h-full rounded-full ${isPositive ? "bg-gradient-to-r from-emerald-400 to-blue-200" : "bg-gradient-to-r from-red-400 to-amber-200"}`} style={{ width: barWidth }} />
                </div>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <span className="text-[11px] leading-4 text-slate-400">{isPositive ? "Raises OracleX probability versus market pricing." : "Limits OracleX probability premium."}</span>
                  <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.12em] text-blue-100">
                    {driver.strength}
                    <span className="ml-1 text-slate-600">S{driver.score}</span>
                  </span>
                </div>
              </div>
              );
            })}
          </CardContent>
        </Panel>
      </aside>
    </div>
  );
}
