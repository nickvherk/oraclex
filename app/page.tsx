"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Bot,
  BrainCircuit,
  Building2,
  Check,
  CircleDot,
  Database,
  Gauge,
  Globe2,
  Lock,
  Mail,
  RadioTower,
  ScanLine,
  Server,
  ShieldCheck,
  Sparkles,
  Terminal,
  WalletCards,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { PublicHeader } from "@/components/public-header";
import { getMockPlan, loginWithSupabase, Plan, saveMockSession, signUpWithSupabase } from "@/lib/access-control";

const DOCS_URL = "https://oracle-x-2.gitbook.io/oraclex-documentation/";
const X_URL = "https://x.com/oraclexterminal";

const heroMetrics = [
  ["128", "Markets Scanned"],
  ["87.4", "Narrative Score"],
  ["8.4s", "Signal Latency"],
  ["+18%", "Narrative Velocity"],
];

const feedItems = [
  ["14:03:28", "Whale entered YES on SOL ETF", "+$1.8M"],
  ["14:03:31", "Narrative velocity increasing", "+18.4%"],
  ["14:03:34", "Truth confidence dropped to 81%", "-7.0%"],
  ["14:03:39", "Narrative intelligence turned bullish", "87.4"],
  ["14:03:42", "Market probability shifted", "+12.0%"],
  ["14:03:47", "Liquidity imbalance detected", "HIGH"],
];

const agents = [
  ["Narrative Agent", "scanning", "92", "18 active signals"],
  ["Whale Agent", "active", "88", "$1.8M directional flow"],
  ["Truth Agent", "verifying", "81", "7 evidence sources"],
  ["Liquidity Agent", "active", "86", "4 market depth shifts"],
  ["Macro Agent", "learning", "79", "12 macro inputs"],
  ["Resolution Agent", "active", "91", "3 disputed outcomes"],
];

const markets = [
  ["SOL ETF Approval", "64.8%", "+12.0%", "Bullish confirmation"],
  ["Trump Election Odds", "49.7%", "+3.2%", "Narrative rising"],
  ["Bitcoin ATH Probability", "58.6%", "-2.4%", "Momentum cooling"],
  ["AI Narrative Momentum", "81.3%", "+18.4%", "High velocity"],
];

const infrastructure = [
  "prediction markets",
  "AI trading systems",
  "market makers",
  "hedge funds",
  "quant firms",
  "sportsbooks",
];

const infrastructureIcons = [Building2, Bot, Gauge, ShieldCheck, Database, RadioTower];

const pipelineSteps = [
  {
    label: "01",
    eyebrow: "Signal ingestion",
    title: "Market telemetry grid",
    metric: "2.1M",
    metricLabel: "daily signals",
    items: ["1,284 markets monitored", "12,400+ wallets tracked", "418 narrative clusters", "73 liquidity venues"],
    Icon: Database,
  },
  {
    label: "02",
    eyebrow: "Narrative intelligence",
    title: "Agent arbitration layer",
    metric: "8.4s",
    metricLabel: "intelligence latency",
    items: ["Enterprise theme detection", "Evidence-backed reports", "9 active model families", "0.92 signal confidence"],
    Icon: BrainCircuit,
  },
  {
    label: "03",
    eyebrow: "Enterprise output layer",
    title: "Probability distribution feed",
    metric: "24/7",
    metricLabel: "API + webhook refresh",
    items: ["live prediction markets", "cross-market correlations", "operator alerts", "forecasting feeds"],
    Icon: RadioTower,
  },
];

const pipelineMetrics = [
  ["1,284", "Markets monitored"],
  ["12,400+", "Smart money wallets"],
  ["2.1M", "Signals processed daily"],
  ["418", "Narrative clusters"],
  ["8.4s", "Average latency"],
  ["24/7", "Narrative refresh"],
];

const outputAlerts = [
  ["14:03:42", "webhook.probability_shift", "SOL ETF YES +12.0%", "87.4 conf"],
  ["14:03:47", "alert.smart_money_flow", "$1.8M net YES flow", "HIGH"],
  ["14:03:51", "api.narrative.update", "Truth 81 | Narrative 94", "LIVE"],
];

const probabilityDistribution = [
  ["YES", "64.8%", 65],
  ["NO", "31.6%", 32],
  ["TAIL", "3.6%", 4],
];

const standardPlans = [
  {
    plan: "observer" as Plan,
    name: "Observer",
    price: "$8/month",
    amountUsd: 8,
    checkoutLink: "https://nowpayments.io/payment/?iid=6361481558&paymentId=6293619537",
    description: "Entry-level access to OracleX intelligence systems.",
    features: ["Delayed intelligence feed", "Event intelligence previews", "Basic prediction market tracking", "Community access", "Basic confirmation signals"],
  },
  {
    plan: "analyst" as Plan,
    name: "Analyst",
    price: "$24/month",
    amountUsd: 24,
    checkoutLink: "https://nowpayments.io/payment/?iid=4882285706",
    description: "Advanced intelligence access for active prediction traders.",
    features: ["Real-time intelligence feed", "Market Events", "Prediction market analytics", "Advanced filtering", "Smart money signals"],
    popular: true,
  },
  {
    plan: "operator" as Plan,
    name: "Operator",
    price: "$69/month",
    amountUsd: 69,
    checkoutLink: "https://nowpayments.io/payment/?iid=5994950303",
    description: "Full intelligence workspace access for high-conviction operators.",
    features: ["Full terminal access", "Market Events", "Hyperliquid flows", "Whale monitoring", "Signal engine", "Advanced alerts", "Custom watchlists", "Early signal systems", "Priority intelligence feeds"],
  },
  {
    plan: "enterprise" as Plan,
    name: "Enterprise",
    price: "Custom",
    amountUsd: 0,
    description: "Access to the upcoming Narrative Discovery Engine featuring evidence-backed theme detection, news intelligence, wallet confirmation, and market impact analysis.",
    features: ["Upcoming Narrative Discovery Engine", "Evidence-backed theme detection", "News intelligence", "Wallet confirmation", "Market impact analysis", "Intelligence APIs", "Webhook systems", "Enterprise feeds", "Dedicated support", "Custom integrations"],
    enterprise: true,
  },
];

const enterpriseAccess = ["Upcoming Narrative Discovery Engine", "Evidence-backed theme detection", "News intelligence", "Wallet confirmation", "Market impact analysis", "Intelligence APIs", "Smart money infrastructure", "Signal systems", "Webhooks", "Custom integrations", "Dedicated support"];

type HomepagePricingPlan = Extract<Plan, "observer" | "analyst" | "operator">;

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.9, ease: "easeOut" },
} as const;

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-6 inline-flex items-center gap-2 rounded-xl border border-blue-300/15 bg-blue-300/[0.055] px-4 py-2 text-[11px] font-medium uppercase tracking-[0.16em] text-blue-100/90">
      <CircleDot className="size-3 text-blue-300/90" />
      {children}
    </div>
  );
}

function PrimaryButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="premium-interactive group inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-blue-300/45 bg-[#1f6fff] px-5 text-[13px] font-semibold tracking-[0.01em] text-white shadow-[0_16px_42px_rgba(31,111,255,0.18)]">
      {children}
      <ArrowRight className="premium-arrow size-4" />
    </button>
  );
}

function SecondaryButton({ children }: { children: React.ReactNode }) {
  return (
    <a href={DOCS_URL} target="_blank" rel="noreferrer" className="premium-interactive inline-flex h-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.035] px-5 text-[13px] font-semibold tracking-[0.01em] text-slate-100">
      {children}
    </a>
  );
}

function TerminalChrome({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.085] bg-[#040812]/95 shadow-[0_32px_90px_rgba(0,0,0,0.34)] ring-1 ring-blue-300/[0.025]">
      <div className="flex items-center justify-between border-b border-white/[0.075] bg-white/[0.018] px-5 py-3.5">
        <div className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.18em] text-slate-300/90">
          <Terminal className="size-4 text-blue-300/90" />
          {title}
        </div>
        <div className="flex gap-1.5">
          <span className="size-1.5 rounded-full bg-blue-300/90" />
          <span className="size-1.5 rounded-full bg-slate-500/80" />
          <span className="size-1.5 rounded-full bg-white/35" />
        </div>
      </div>
      {children}
    </div>
  );
}

function HeroTerminal() {
  return (
    <motion.div {...fadeUp} className="relative lg:pt-8">
      <div className="absolute -inset-8 -z-10 bg-blue-500/[0.14] blur-3xl" />
      <TerminalChrome title="oraclex/narrative-intelligence">
        <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[1fr_0.86fr]">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-slate-500">OracleX Narrative Score™</span>
              <span className="font-mono text-[11px] text-blue-200">LIVE</span>
            </div>
            <div className="relative h-64 overflow-hidden rounded-2xl border border-blue-300/[0.12] bg-black/90">
              <div className="data-streams absolute inset-0 opacity-25" />
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-200/30 to-transparent" />
              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 520 220" preserveAspectRatio="none">
                <motion.path d="M0 158 C70 112 112 130 172 84 C240 30 300 134 368 66 C420 18 462 42 520 28" fill="none" stroke="#2d7ff9" strokeWidth="2.5" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: [0, 1, 1] }} transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut" }} />
                <motion.path d="M0 182 C80 170 112 154 178 160 C246 166 292 96 356 108 C432 122 468 74 520 86" fill="none" stroke="#93c5fd" strokeWidth="1.25" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: [0, 1, 1] }} transition={{ duration: 8.8, repeat: Infinity, delay: 0.7, ease: "easeInOut" }} />
              </svg>
              <div className="absolute left-5 top-5">
                <div className="font-mono text-6xl font-medium tracking-[-0.05em] text-white">87.4</div>
                <div className="mt-2 font-mono text-[11px] uppercase tracking-[0.12em] text-blue-200/90">+12.0 probability shift</div>
              </div>
              <div className="absolute bottom-4 left-4 right-4 grid grid-cols-3 gap-2.5">
                {["Truth 81", "Narrative 94", "Whales 88"].map((item) => (
                  <div key={item} className="rounded-xl border border-white/[0.08] bg-black/60 px-3 py-2.5 font-mono text-[11px] text-slate-300 backdrop-blur">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-3.5">
            {feedItems.slice(0, 4).map(([time, item, value], index) => (
              <motion.div key={item} className="flex items-center justify-between rounded-xl border border-white/[0.075] bg-white/[0.025] px-3.5 py-3.5 text-xs" animate={{ opacity: [0.62, 1, 0.78] }} transition={{ duration: 4.6, repeat: Infinity, delay: index * 0.55, ease: "easeInOut" }}>
                <div>
                  <div className="font-mono text-[10px] text-slate-500">{time}</div>
                  <div className="mt-1 text-slate-200">{item}</div>
                </div>
                <span className="font-mono text-[11px] text-blue-200">{value}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </TerminalChrome>
    </motion.div>
  );
}

function LiveFeed() {
  return (
    <section className="border-y border-white/[0.075] bg-blue-300/[0.025] py-5">
      <div className="ticker-track flex w-max gap-4">
        {[...feedItems, ...feedItems].map(([time, item, value], index) => (
          <div key={`${item}-${index}`} className="flex min-w-[330px] items-center justify-between rounded-xl border border-white/[0.075] bg-black/40 px-4 py-3.5 text-xs">
            <span className="font-mono text-[10px] text-slate-500">{time}</span>
            <span className="mx-3 text-slate-200">{item}</span>
            <span className="font-mono text-[11px] text-blue-200">{value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function IntelligencePipeline() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-28">
      <motion.div {...fadeUp} className="mb-14 flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
        <div className="max-w-3xl">
          <Label>Intelligence Pipeline</Label>
          <h2 className="text-4xl font-medium leading-[1] tracking-[-0.035em] text-white sm:text-6xl">Fragmented signals become prediction intelligence.</h2>
        </div>
        <div className="grid w-full max-w-xl grid-cols-2 gap-3 sm:grid-cols-3">
          {pipelineMetrics.slice(0, 3).map(([value, label]) => (
            <div key={label} className="rounded-2xl border border-blue-300/14 bg-blue-300/[0.045] p-4">
              <div className="font-mono text-2xl tracking-[-0.05em] text-white">{value}</div>
              <div className="mt-2 font-mono text-[9px] uppercase leading-4 tracking-[0.14em] text-slate-500">{label}</div>
            </div>
          ))}
        </div>
      </motion.div>
      <div className="grid gap-5 lg:grid-cols-[0.94fr_1.06fr]">
        <motion.div {...fadeUp} className="relative overflow-hidden rounded-2xl border border-white/[0.085] bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(0,0,0,0.24))] p-5 ring-1 ring-blue-300/[0.03] sm:p-6">
          <div className="data-streams absolute inset-0 opacity-[0.045]" />
          <div className="relative grid gap-4">
            {pipelineSteps.map(({ label, eyebrow, title, metric, metricLabel, items, Icon }, index) => (
              <motion.div key={title} className="group relative overflow-hidden rounded-2xl border border-white/[0.075] bg-black/38 p-5 transition duration-500 hover:border-blue-300/22 hover:bg-blue-300/[0.035]" animate={{ opacity: [0.78, 1, 0.86] }} transition={{ duration: 5.4, repeat: Infinity, delay: index * 0.5, ease: "easeInOut" }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="grid size-11 place-items-center rounded-2xl border border-blue-300/20 bg-blue-300/[0.07] text-blue-200 shadow-[0_0_34px_rgba(31,111,255,0.1)]">
                      <Icon className="size-5" />
                    </span>
                    <div>
                      <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">
                        {label} / {eyebrow}
                      </div>
                      <h3 className="mt-2 text-xl font-medium tracking-[-0.02em] text-white">{title}</h3>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-3xl tracking-[-0.06em] text-white">{metric}</div>
                    <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.12em] text-blue-100/65">{metricLabel}</div>
                  </div>
                </div>
                <div className="mt-5 grid gap-2 sm:grid-cols-2">
                  {items.map((item) => (
                    <div key={item} className="rounded-xl border border-white/[0.075] bg-white/[0.025] px-3 py-2.5 font-mono text-[10px] uppercase tracking-[0.08em] text-slate-400">
                      {item}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.08 }}>
          <TerminalChrome title="oraclex/output-layer">
            <div className="space-y-4 p-4 sm:p-5">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {pipelineMetrics.slice(3).map(([value, label]) => (
                  <div key={label} className="rounded-xl border border-white/[0.075] bg-white/[0.028] p-4">
                    <div className="font-mono text-2xl tracking-[-0.05em] text-white">{value}</div>
                    <div className="mt-2 font-mono text-[9px] uppercase leading-4 tracking-[0.14em] text-slate-500">{label}</div>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border border-blue-300/[0.12] bg-black/72 p-4">
                <div className="mb-4 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  <span>Probability distribution</span>
                  <span className="text-blue-200">SOL ETF</span>
                </div>
                <div className="space-y-3">
                  {probabilityDistribution.map(([label, value, width]) => (
                    <div key={label}>
                      <div className="mb-1.5 flex items-center justify-between font-mono text-[11px] text-slate-300">
                        <span>{label}</span>
                        <span className="text-blue-200">{value}</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                        <motion.div className="h-full bg-blue-300" animate={{ width: [`${Number(width) - 8}%`, `${width}%`, `${Number(width) - 3}%`] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-white/[0.075] bg-white/[0.026] p-4">
                <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">API response</div>
                <pre className="overflow-hidden rounded-xl border border-white/[0.07] bg-black/58 p-4 font-mono text-[10px] leading-5 text-slate-300">
{`{
  "market": "sol_etf_approval",
  "probability": 0.648,
  "consensus": 87.4,
  "latency_ms": 8400
}`}
                </pre>
              </div>
              <div className="space-y-2.5">
                {outputAlerts.map(([time, event, payload, status], index) => (
                  <motion.div key={event} className="flex items-center justify-between gap-4 rounded-xl border border-white/[0.075] bg-black/46 px-3.5 py-3 text-xs" animate={{ opacity: [0.68, 1, 0.82] }} transition={{ duration: 4.8, repeat: Infinity, delay: index * 0.42, ease: "easeInOut" }}>
                    <div className="min-w-0">
                      <div className="font-mono text-[10px] text-slate-500">{time} / {event}</div>
                      <div className="mt-1 truncate text-slate-200">{payload}</div>
                    </div>
                    <span className="shrink-0 font-mono text-[11px] text-blue-200">{status}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </TerminalChrome>
        </motion.div>
      </div>
    </section>
  );
}

function NarrativeIntelligenceSection() {
  return (
    <section id="narrative-intelligence" className="mx-auto max-w-7xl px-4 py-28 sm:px-6 lg:px-8 lg:py-32">
      <motion.div {...fadeUp} className="mb-12 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
        <div className="max-w-2xl">
          <Label>Enterprise Narrative Discovery</Label>
          <h2 className="text-4xl font-medium leading-[1] tracking-[-0.035em] text-white sm:text-6xl">AI agents competing to predict the future.</h2>
        </div>
        <div className="min-w-72 rounded-2xl border border-blue-300/20 bg-blue-300/[0.055] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.22)]">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-blue-100/80">OracleX Narrative Score™</div>
          <div className="mt-3 font-mono text-6xl font-medium tracking-[-0.06em] text-white">87.4</div>
        </div>
      </motion.div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {agents.map(([name, status, confidence, signal], index) => (
          <motion.div key={name} {...fadeUp} transition={{ ...fadeUp.transition, delay: index * 0.05 }} className="group rounded-2xl border border-white/[0.075] bg-white/[0.026] p-5 transition duration-500 hover:-translate-y-1 hover:border-blue-300/25 hover:bg-blue-300/[0.038]">
            <div className="mb-7 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-xl border border-blue-300/20 bg-blue-300/[0.055] text-blue-200">
                  <Bot className="size-5" />
                </div>
                <div>
                  <h3 className="text-[15px] font-medium tracking-[-0.01em] text-white">{name}</h3>
                  <div className="mt-1.5 flex items-center gap-2 text-xs text-slate-500">
                    <span className="pulse-dot size-1.5 rounded-full bg-blue-300 shadow-[0_0_14px_rgba(147,197,253,0.55)]" />
                    {status}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-2xl tracking-[-0.04em] text-white">{confidence}</div>
                <div className="font-mono text-[10px] uppercase text-slate-500">conf</div>
              </div>
            </div>
            <div className="mb-3 flex items-center justify-between text-xs">
              <span className="text-slate-500">active signals</span>
              <span className="font-mono text-[11px] text-blue-200/90">{signal}</span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-white/10">
              <motion.div className="h-full bg-blue-300" animate={{ width: [`${Number(confidence) - 18}%`, `${confidence}%`, `${Number(confidence) - 10}%`] }} transition={{ duration: 6, repeat: Infinity, delay: index * 0.35, ease: "easeInOut" }} />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function IntelligenceTerminal() {
  return (
    <section id="terminal" className="border-y border-white/[0.075] bg-[#03060d] px-4 py-28 sm:px-6 lg:px-8 lg:py-32">
      <div className="mx-auto max-w-7xl">
        <motion.div {...fadeUp} className="mb-12 max-w-2xl">
          <Label>Intelligence Terminal</Label>
          <h2 className="text-4xl font-medium leading-[1] tracking-[-0.035em] text-white sm:text-6xl">One interface for market probability.</h2>
        </motion.div>
        <motion.div {...fadeUp}>
          <TerminalChrome title="oraclex/market-intelligence">
            <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[1fr_360px]">
              <div className="grid gap-4 md:grid-cols-2">
                {markets.map(([name, probability, change, note], index) => (
                  <motion.div key={name} className="rounded-2xl border border-white/[0.075] bg-white/[0.028] p-5 transition-colors duration-500 hover:border-blue-300/20 hover:bg-blue-300/[0.035]" whileHover={{ y: -3 }} transition={{ duration: 0.45 }}>
                    <div className="mb-9 flex items-center justify-between gap-4">
                      <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-slate-500">{name}</span>
                      <span className={change.startsWith("+") ? "font-mono text-xs text-blue-300" : "font-mono text-xs text-red-300"}>{change}</span>
                    </div>
                    <div className="font-mono text-5xl font-medium tracking-[-0.06em] text-white">{probability}</div>
                    <div className="mt-5 h-1 overflow-hidden rounded-full bg-white/10">
                      <motion.div className="h-full bg-blue-300" animate={{ width: [probability, `${52 + index * 8}%`, probability] }} transition={{ duration: 6.5, repeat: Infinity, delay: index * 0.35, ease: "easeInOut" }} />
                    </div>
                    <div className="mt-5 font-mono text-[11px] text-slate-500">{note}</div>
                  </motion.div>
                ))}
              </div>
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/[0.075] bg-black/70 p-4">
                  <div className="mb-4 flex items-center justify-between font-mono text-[11px] text-slate-500">
                    <span>Narrative momentum</span>
                    <span className="text-blue-200">ACCELERATING</span>
                  </div>
                  <div className="relative h-40 overflow-hidden rounded-xl border border-blue-300/[0.12]">
                    <div className="data-streams absolute inset-0 opacity-24" />
                    {[38, 55, 44, 72, 88, 76, 94].map((height, index) => (
                      <div key={`${height}-${index}`} className="absolute bottom-0 w-[9%] bg-blue-300/70" style={{ height: `${height}%`, left: `${index * 14}%`, animation: `barPulse ${3.4 + index * 0.24}s ease-in-out infinite` }} />
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/[0.075] bg-white/[0.028] p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="font-mono text-[11px] text-slate-500">Whale tracking</span>
                    <WalletCards className="size-4 text-blue-200" />
                  </div>
                  <div className="font-mono text-3xl tracking-[-0.05em] text-white">$1.8M</div>
                  <div className="mt-1 font-mono text-[11px] text-blue-200">net YES flow detected</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {["Truth 81%", "Latency 8.4s"].map((item) => (
                    <div key={item} className="rounded-xl border border-white/[0.075] bg-white/[0.028] p-3.5 font-mono text-[11px] text-slate-300">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TerminalChrome>
        </motion.div>
      </div>
    </section>
  );
}

function Infrastructure() {
  return (
    <section id="infrastructure" className="border-y border-white/[0.075] bg-[linear-gradient(180deg,rgba(31,111,255,0.035),rgba(255,255,255,0.012))] px-4 py-28 sm:px-6 lg:px-8 lg:py-32">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
        <motion.div {...fadeUp}>
          <Label>B2B Infrastructure</Label>
          <h2 className="text-4xl font-medium leading-[1] tracking-[-0.035em] text-white sm:text-6xl">Enterprise & B2B Intelligence Infrastructure</h2>
          <p className="mt-7 max-w-xl text-[17px] leading-8 text-slate-300/90">OracleX delivers real-time prediction intelligence APIs and upcoming enterprise narrative discovery infrastructure for next-generation market platforms.</p>
        </motion.div>
        <motion.div {...fadeUp} className="grid gap-4 sm:grid-cols-2">
          {infrastructure.map((item, index) => {
            const Icon = infrastructureIcons[index];

            return (
              <div key={item} className="flex items-center justify-between rounded-2xl border border-white/[0.075] bg-black/30 p-[18px] transition duration-500 hover:-translate-y-0.5 hover:border-blue-300/20 hover:bg-blue-300/[0.035]">
                <div className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-xl bg-blue-300/[0.06] text-blue-200">
                    <Icon className="size-4" />
                  </span>
                  <span className="text-sm font-medium capitalize tracking-[-0.01em] text-white">{item}</span>
                </div>
                <ScanLine className="size-4 text-slate-500" />
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

function EnterpriseAccessModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <motion.div className="fixed inset-0 z-[90] flex items-center justify-center px-4 py-8" initial={false} animate={open ? "open" : "closed"} variants={{ open: { pointerEvents: "auto" }, closed: { pointerEvents: "none" } }}>
      <motion.button type="button" aria-label="Close enterprise access request" className="absolute inset-0 bg-black/76 backdrop-blur-xl" onClick={onClose} variants={{ open: { opacity: 1 }, closed: { opacity: 0 } }} transition={{ duration: 0.28, ease: "easeOut" }} />
      <motion.div
        className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-blue-200/15 bg-[#050914]/95 shadow-[0_40px_120px_rgba(0,0,0,0.72)] ring-1 ring-blue-300/[0.08]"
        variants={{ open: { opacity: 1, y: 0, scale: 1 }, closed: { opacity: 0, y: 22, scale: 0.97 } }}
        transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="enterprise-access-title"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(31,111,255,0.24),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.06),transparent_42%)]" />
        <div className="relative border-b border-white/[0.075] px-6 py-5 sm:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-2xl border border-blue-300/20 bg-blue-300/[0.075] text-blue-200">
                <Server className="size-5" />
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-blue-100/80">ENTERPRISE ACCESS</span>
            </div>
            <button type="button" onClick={onClose} className="premium-interactive grid size-9 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.035] text-slate-400 hover:text-white" aria-label="Close modal">
              <X className="size-4" />
            </button>
          </div>
        </div>

        <div className="relative px-6 py-7 sm:px-8 sm:py-8">
          <div className="mb-7">
            <h2 id="enterprise-access-title" className="text-3xl font-semibold tracking-[-0.035em] text-white">
              Request OracleX infrastructure access
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">Tell us how your team plans to use OracleX prediction intelligence infrastructure.</p>
          </div>

          <form className="space-y-4" onSubmit={(event) => event.preventDefault()}>
            {[
              ["email", "Email", "email", "name@company.com"],
              ["company", "Company", "text", "Company"],
              ["role", "Role", "text", "Founder, PM, quant, infrastructure lead"],
            ].map(([id, label, type, placeholder]) => (
              <label key={id} className="block">
                <span className="mb-2 block text-xs font-medium text-slate-300">{label}</span>
                <input id={id} name={id} type={type} required className="h-12 w-full rounded-xl border border-white/[0.08] bg-black/35 px-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-300/40 focus:bg-blue-300/[0.045] focus:ring-4 focus:ring-blue-300/[0.06]" placeholder={placeholder} />
              </label>
            ))}
            <label className="block">
              <span className="mb-2 block text-xs font-medium text-slate-300">Message</span>
              <textarea name="message" required rows={4} className="w-full resize-none rounded-xl border border-white/[0.08] bg-black/35 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-300/40 focus:bg-blue-300/[0.045] focus:ring-4 focus:ring-blue-300/[0.06]" placeholder="Markets, feeds, latency needs, integrations, or deployment context" />
            </label>
            <button type="submit" className="premium-interactive mt-2 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-blue-300/45 bg-[#1f6fff] px-5 text-[13px] font-semibold text-white shadow-[0_18px_48px_rgba(31,111,255,0.22)]">
              Request Access
              <ArrowRight className="premium-arrow size-4" />
            </button>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}

function PricingSection({ onEnterAccessLevel }: { onEnterAccessLevel: (plan: HomepagePricingPlan) => void }) {
  const [accessMode, setAccessMode] = useState<"standard" | "enterprise">("standard");
  const [isEnterpriseAccessOpen, setIsEnterpriseAccessOpen] = useState(false);

  return (
    <section id="pricing" className="relative border-y border-white/[0.075] bg-[linear-gradient(180deg,rgba(3,6,13,0.72),rgba(31,111,255,0.045),rgba(3,6,13,0.82))] px-4 py-28 sm:px-6 lg:px-8 lg:py-32">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-200/35 to-transparent" />
      <div className="mx-auto max-w-7xl">
        <motion.div {...fadeUp} className="mb-12 flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <Label>OracleX Terminal</Label>
            <h2 className="text-4xl font-medium leading-[1] tracking-[-0.035em] text-white sm:text-6xl">Intelligence Access</h2>
            <p className="mt-6 max-w-2xl text-[17px] leading-8 text-slate-300/90">Choose the level of OracleX prediction intelligence access that fits your workflow.</p>
          </div>
          <div className="relative grid w-full max-w-sm grid-cols-2 rounded-2xl border border-white/[0.08] bg-black/42 p-1.5 shadow-[0_24px_70px_rgba(0,0,0,0.28)] ring-1 ring-blue-300/[0.04]">
            <motion.span className="absolute bottom-1.5 left-1.5 top-1.5 w-[calc(50%-0.375rem)] rounded-xl border border-blue-300/24 bg-blue-300/[0.12] shadow-[0_12px_38px_rgba(31,111,255,0.16)]" animate={{ x: accessMode === "standard" ? 0 : "100%" }} transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }} />
            {(["standard", "enterprise"] as const).map((mode) => (
              <button key={mode} type="button" onClick={() => setAccessMode(mode)} className={`premium-interactive relative z-10 h-11 rounded-xl border border-transparent text-sm font-semibold ${accessMode === mode ? "text-white" : "text-slate-500 hover:text-slate-300"}`}>
                {mode === "standard" ? "Standard" : "Enterprise"}
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div layout className="min-h-[540px]">
          {accessMode === "standard" ? (
            <motion.div key="standard-pricing" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.42, ease: "easeOut" }} className="grid gap-4 lg:grid-cols-4">
              {standardPlans.map((plan, index) => (
                <motion.div
                  key={plan.name}
                  {...fadeUp}
                  transition={{ ...fadeUp.transition, delay: index * 0.06 }}
                  className={`group relative flex min-h-[520px] flex-col overflow-hidden rounded-3xl border p-6 transition duration-500 hover:-translate-y-1 sm:p-7 ${
                    plan.popular
                      ? "border-blue-200/32 bg-[linear-gradient(180deg,rgba(31,111,255,0.22),rgba(255,255,255,0.055)_34%,rgba(0,0,0,0.2))] shadow-[0_34px_100px_rgba(31,111,255,0.18)]"
                      : plan.enterprise
                        ? "border-blue-300/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(31,111,255,0.04)_48%,rgba(0,0,0,0.2))]"
                        : "border-white/[0.085] bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.026)_42%,rgba(0,0,0,0.18))]"
                  } hover:border-blue-300/32`}
                >
                  <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-blue-200/45 to-transparent opacity-70" />
                  {plan.popular ? (
                    <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-xl border border-blue-200/25 bg-blue-300/[0.11] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-blue-100">
                      <Sparkles className="size-3.5" />
                      Popular
                    </div>
                  ) : (
                    <div className="mb-5 h-8" />
                  )}
                  <h3 className="text-2xl font-medium tracking-[-0.025em] text-white">{plan.name}</h3>
                  <div className="mt-5 font-mono text-4xl font-medium tracking-[-0.06em] text-white">{plan.price}</div>
                  <p className="mt-5 min-h-16 text-sm leading-6 text-slate-400/95">{plan.description}</p>
                  <div className="mt-7 h-px bg-white/[0.075]" />
                  <div className="mt-7 flex flex-1 flex-col gap-3.5">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-3 text-sm leading-5 text-slate-300">
                        <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border border-blue-300/18 bg-blue-300/[0.07] text-blue-200">
                          <Check className="size-3.5" />
                        </span>
                        {feature}
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={() => (plan.enterprise ? setIsEnterpriseAccessOpen(true) : onEnterAccessLevel(plan.plan as HomepagePricingPlan))} className={`premium-interactive mt-8 inline-flex h-12 items-center justify-center rounded-xl border px-5 text-[13px] font-semibold ${plan.popular ? "border-blue-300/45 bg-[#1f6fff] text-white shadow-[0_18px_48px_rgba(31,111,255,0.22)]" : "border-white/[0.09] bg-white/[0.04] text-slate-100"}`}>
                    {plan.enterprise ? "Request Access" : "Enter Access Level"}
                  </button>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div key="enterprise-pricing" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.42, ease: "easeOut" }} className="grid gap-5 lg:grid-cols-[0.92fr_1.08fr] lg:items-stretch">
              <div className="relative overflow-hidden rounded-3xl border border-blue-200/18 bg-[linear-gradient(180deg,rgba(31,111,255,0.15),rgba(255,255,255,0.045)_42%,rgba(0,0,0,0.24))] p-8 shadow-[0_34px_100px_rgba(0,0,0,0.28)] sm:p-10">
                <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-blue-200/45 to-transparent" />
                <Label>B2B Infrastructure</Label>
                <h3 className="max-w-2xl text-4xl font-medium leading-[1] tracking-[-0.035em] text-white sm:text-6xl">Enterprise Intelligence Infrastructure</h3>
                <p className="mt-7 max-w-2xl text-[17px] leading-8 text-slate-300/90">OracleX provides institutional-grade prediction intelligence infrastructure for market platforms, quant firms, sportsbooks, and AI trading systems.</p>
                <button type="button" onClick={() => setIsEnterpriseAccessOpen(true)} className="premium-interactive mt-10 inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-blue-300/45 bg-[#1f6fff] px-5 text-[13px] font-semibold text-white shadow-[0_18px_48px_rgba(31,111,255,0.22)]">
                  Request Enterprise Access
                  <ArrowRight className="premium-arrow size-4" />
                </button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {enterpriseAccess.map((item, index) => (
                  <motion.div key={item} className="group flex min-h-36 flex-col justify-between rounded-2xl border border-white/[0.085] bg-white/[0.035] p-6 transition duration-500 hover:-translate-y-1 hover:border-blue-300/24 hover:bg-blue-300/[0.045]" whileHover={{ y: -4 }} transition={{ duration: 0.4 }}>
                    <div className="flex items-center justify-between">
                      <span className="grid size-11 place-items-center rounded-2xl border border-blue-300/18 bg-blue-300/[0.07] text-blue-200">
                        {index % 3 === 0 ? <Server className="size-5" /> : index % 3 === 1 ? <BrainCircuit className="size-5" /> : <RadioTower className="size-5" />}
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-600">0{index + 1}</span>
                    </div>
                    <h4 className="mt-8 text-xl font-medium tracking-[-0.02em] text-white">{item}</h4>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
      <EnterpriseAccessModal open={isEnterpriseAccessOpen} onClose={() => setIsEnterpriseAccessOpen(false)} />
    </section>
  );
}

function EnterTerminalModal({ open, onClose, openedFromPricing }: { open: boolean; onClose: () => void; openedFromPricing: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSignup = authMode === "signup";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    if (isSignup && password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsSubmitting(false);
      return;
    }

    try {
      const session = isSignup ? await signUpWithSupabase(email, password) : await loginWithSupabase(email, password);

      if (session) {
        router.push(openedFromPricing ? "/terminal/settings" : isSignup ? "/terminal/settings?activation=created" : "/terminal");
        return;
      }

      setError("Account created. Check your email to confirm the account before logging in.");
      return;
    } catch (supabaseError) {
      if (!isSignup) {
        const plan = getMockPlan(email, password);

        if (plan) {
          saveMockSession(email, plan);
          router.push(openedFromPricing ? "/terminal/settings" : "/terminal");
          return;
        }
      }

      setError(supabaseError instanceof Error ? supabaseError.message : "Authentication failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <motion.div className="fixed inset-0 z-[80] flex items-center justify-center px-4 py-8" initial={false} animate={open ? "open" : "closed"} variants={{ open: { pointerEvents: "auto" }, closed: { pointerEvents: "none" } }}>
      <motion.button type="button" aria-label="Close terminal login" className="absolute inset-0 bg-black/72 backdrop-blur-xl" onClick={onClose} variants={{ open: { opacity: 1 }, closed: { opacity: 0 } }} transition={{ duration: 0.28, ease: "easeOut" }} />
      <motion.div
        className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-blue-200/15 bg-[#050914]/95 shadow-[0_40px_120px_rgba(0,0,0,0.68)] ring-1 ring-blue-300/[0.08]"
        variants={{ open: { opacity: 1, y: 0, scale: 1 }, closed: { opacity: 0, y: 20, scale: 0.97 } }}
        transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="terminal-login-title"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_22%_0%,rgba(31,111,255,0.22),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.06),transparent_44%)]" />
        <div className="relative border-b border-white/[0.075] px-6 py-5 sm:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-2xl border border-blue-300/20 bg-blue-300/[0.075] text-blue-200">
                <Terminal className="size-5" />
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-blue-100/80">PRIVATE TERMINAL</span>
            </div>
            <button type="button" onClick={onClose} className="premium-interactive grid size-9 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.035] text-slate-400 hover:text-white" aria-label="Close modal">
              <X className="size-4" />
            </button>
          </div>
        </div>

        <div className="relative px-6 py-7 sm:px-8 sm:py-8">
          <div className="mb-7">
            <div className="mb-4 inline-flex items-center gap-2 rounded-xl border border-blue-300/15 bg-blue-300/[0.055] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-blue-100">
              <Terminal className="size-3.5" />
              PRIVATE TERMINAL
            </div>
            <h2 id="terminal-login-title" className="text-3xl font-semibold tracking-[-0.035em] text-white">
              {isSignup ? "Create OracleX Account" : "OracleX Terminal Login"}
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              {openedFromPricing
                ? "Create an account first. After login, you can activate this plan from your billing settings."
                : isSignup
                  ? "Create a Supabase Auth account, then choose a plan to activate terminal access."
                  : "Use Supabase Auth, or a demo account while local plan testing remains enabled."}
            </p>
          </div>

          <div className="mb-5 grid grid-cols-2 rounded-2xl border border-white/[0.08] bg-black/42 p-1.5">
            {[
              ["login", "Login"],
              ["signup", "Create Account"],
            ].map(([mode, label]) => (
              <button
                key={mode}
                type="button"
                onClick={() => {
                  setAuthMode(mode as "login" | "signup");
                  setConfirmPassword("");
                  setError("");
                }}
                className={`premium-interactive h-11 rounded-xl border text-sm font-semibold ${authMode === mode ? "border-blue-300/24 bg-blue-300/[0.12] text-white shadow-[0_12px_38px_rgba(31,111,255,0.14)]" : "border-transparent text-slate-500 hover:text-slate-300"}`}
                aria-pressed={authMode === mode}
              >
                {label}
              </button>
            ))}
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-300">
                <Mail className="size-3.5 text-blue-200" />
                Email
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError("");
                }}
                placeholder="Email"
                autoComplete={isSignup ? "email" : "username"}
                aria-invalid={error ? "true" : undefined}
                className="h-12 w-full rounded-xl border border-white/[0.08] bg-black/35 px-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-300/40 focus:bg-blue-300/[0.045] focus:ring-4 focus:ring-blue-300/[0.06]"
              />
            </label>
            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-300">
                <Lock className="size-3.5 text-blue-200" />
                Password
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError("");
                }}
                placeholder="Password"
                autoComplete={isSignup ? "new-password" : "current-password"}
                aria-invalid={error ? "true" : undefined}
                className="h-12 w-full rounded-xl border border-white/[0.08] bg-black/35 px-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-300/40 focus:bg-blue-300/[0.045] focus:ring-4 focus:ring-blue-300/[0.06]"
              />
            </label>
            {isSignup ? (
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-300">
                  <Lock className="size-3.5 text-blue-200" />
                  Confirm Password
                </span>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(event) => {
                    setConfirmPassword(event.target.value);
                    setError("");
                  }}
                  placeholder="Confirm password"
                  autoComplete="new-password"
                  aria-invalid={error ? "true" : undefined}
                  className="h-12 w-full rounded-xl border border-white/[0.08] bg-black/35 px-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-300/40 focus:bg-blue-300/[0.045] focus:ring-4 focus:ring-blue-300/[0.06]"
                />
              </label>
            ) : null}
            {error ? (
              <div className="rounded-xl border border-red-300/20 bg-red-300/[0.06] px-4 py-3 text-sm text-red-100" role="alert">
                {error}
              </div>
            ) : null}
            <button type="submit" disabled={isSubmitting} className="premium-interactive mt-2 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-blue-300/45 bg-[#1f6fff] px-5 text-[13px] font-semibold text-white shadow-[0_18px_48px_rgba(31,111,255,0.22)] disabled:cursor-not-allowed disabled:opacity-70">
              {isSubmitting ? "Authenticating..." : isSignup ? "Create Account" : "Login"}
              <ArrowRight className="premium-arrow size-4" />
            </button>
          </form>
          <div className="mt-5 rounded-xl border border-white/[0.07] bg-white/[0.025] p-4 font-mono text-[10px] leading-5 text-slate-400">
            test-observer@gmail.com / Test<br />
            test-analyst@gmail.com / Test<br />
            test-operator@gmail.com / Test<br />
            test-enterprise@gmail.com / Test
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Home() {
  const [isTerminalLoginOpen, setIsTerminalLoginOpen] = useState(false);
  const [terminalLoginSource, setTerminalLoginSource] = useState<"terminal" | "pricing">("terminal");
  const router = useRouter();
  const openTerminalLogin = () => {
    router.push("/login?redirect=/terminal");
  };
  const openPricingLogin = (plan: HomepagePricingPlan) => {
    localStorage.setItem("intendedPlan", plan);
    setTerminalLoginSource("pricing");
    setIsTerminalLoginOpen(true);
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#02040a] text-white selection:bg-blue-300 selection:text-black">
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_18%_12%,rgba(31,111,255,0.18),transparent_28%),radial-gradient(circle_at_86%_6%,rgba(96,165,250,0.08),transparent_26%),linear-gradient(180deg,#02040a_0%,#040814_46%,#02040a_100%)]" />
      <div className="pointer-events-none fixed inset-0 z-0 data-streams opacity-[0.035]" />

      <PublicHeader />

      <section className="relative z-10 mx-auto grid max-w-7xl gap-14 px-4 pb-20 pt-32 sm:px-6 lg:grid-cols-[0.86fr_1.14fr] lg:px-8 lg:pb-28 lg:pt-40">
        <motion.div {...fadeUp}>
          <Label>Chainlink for prediction intelligence</Label>
          <h1 className="max-w-4xl text-6xl font-semibold leading-[0.94] tracking-[-0.035em] text-white sm:text-8xl lg:text-[6.5rem]">Prediction markets need intelligence.</h1>
          <p className="mt-8 max-w-xl text-[17px] leading-8 text-slate-300/90">OracleX is the intelligence infrastructure layer powering next-generation prediction markets on Solana.</p>
          <p className="mt-6 max-w-xl text-sm font-medium leading-6 tracking-[0.01em] text-blue-100/90">Live signals, prediction market analytics, enterprise APIs, and upcoming evidence-backed theme discovery for operational market teams.</p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <PrimaryButton onClick={openTerminalLogin}>Enter Terminal</PrimaryButton>
            <SecondaryButton>Read Docs</SecondaryButton>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:max-w-2xl">
            {heroMetrics.map(([value, label], index) => (
              <motion.div key={label} className="rounded-2xl border border-white/[0.075] bg-white/[0.026] p-3.5" animate={{ opacity: [0.74, 1, 0.84] }} transition={{ duration: 5, repeat: Infinity, delay: index * 0.45, ease: "easeInOut" }}>
                <div className="font-mono text-2xl tracking-[-0.05em] text-white">{value}</div>
                <div className="mt-2 font-mono text-[9px] uppercase tracking-[0.14em] text-slate-500">{label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
        <HeroTerminal />
      </section>

      <div className="relative z-10">
        <IntelligenceTerminal />
        <NarrativeIntelligenceSection />
        <IntelligencePipeline />
        <PricingSection onEnterAccessLevel={openPricingLogin} />
        <LiveFeed />
        <Infrastructure />

        <section className="px-4 py-28 sm:px-6 lg:px-8 lg:py-32">
          <motion.div {...fadeUp} className="mx-auto max-w-5xl rounded-2xl border border-blue-300/20 bg-blue-300/[0.045] p-8 text-center shadow-[0_34px_90px_rgba(0,0,0,0.26)] sm:p-16">
            <Label>OracleX Protocol</Label>
            <h2 className="text-4xl font-medium leading-[1] tracking-[-0.035em] text-white sm:text-6xl">The future of prediction markets runs on intelligence.</h2>
            <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
              <PrimaryButton onClick={openTerminalLogin}>Enter Terminal</PrimaryButton>
              <SecondaryButton>Read Docs</SecondaryButton>
            </div>
          </motion.div>
        </section>

        <footer className="border-t border-white/[0.075] px-4 py-9 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Globe2 className="size-4 text-blue-200" />
              OracleX
            </div>
            <div className="flex flex-wrap gap-5 text-xs font-medium text-slate-500">
              {[
                ["X", X_URL],
                ["GitHub", "#"],
                ["Docs", DOCS_URL],
                ["Telegram", "#"],
                ["Privacy", "#"],
                ["Terms", "#"],
              ].map(([item, href]) => (
                <a key={item} href={href} target={item === "X" || item === "Docs" ? "_blank" : undefined} rel={item === "X" || item === "Docs" ? "noreferrer" : undefined} className="premium-interactive rounded-lg border border-transparent px-2 py-1 transition duration-300 hover:text-blue-100">
                  {item}
                </a>
              ))}
            </div>
          </div>
        </footer>
      </div>
      <EnterTerminalModal open={isTerminalLoginOpen} onClose={() => setIsTerminalLoginOpen(false)} openedFromPricing={terminalLoginSource === "pricing"} />
    </main>
  );
}
