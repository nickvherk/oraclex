"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Bot,
  BrainCircuit,
  Building2,
  CheckCircle2,
  CircleDot,
  Database,
  Gauge,
  Globe2,
  LineChart,
  Network,
  RadioTower,
  ScanLine,
  Server,
  ShieldCheck,
  Terminal,
  WalletCards,
  X,
} from "lucide-react";
import { Fragment, useState } from "react";

const navLinks = ["Consensus", "Terminal", "Infrastructure", "Docs"];

const heroMetrics = [
  ["128", "Markets Scanned"],
  ["87.4", "AI Consensus"],
  ["8.4s", "Signal Latency"],
  ["+18%", "Narrative Velocity"],
];

const feedItems = [
  ["14:03:28", "Whale entered YES on SOL ETF", "+$1.8M"],
  ["14:03:31", "Narrative velocity increasing", "+18.4%"],
  ["14:03:34", "Truth confidence dropped to 81%", "-7.0%"],
  ["14:03:39", "AI consensus turned bullish", "87.4"],
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
  ["SOL ETF Approval", "64.8%", "+12.0%", "Bullish consensus"],
  ["Trump Election Odds", "49.7%", "+3.2%", "Narrative rising"],
  ["Bitcoin ATH Probability", "58.6%", "-2.4%", "Momentum cooling"],
  ["AI Narrative Momentum", "81.3%", "+18.4%", "High velocity"],
];

const proofCards = [
  ["Prediction Intelligence", "Probability feeds built from market, wallet, narrative, liquidity, news, and agent signals.", LineChart],
  ["AI Consensus Infrastructure", "Competing agents publish confidence-weighted views into a single Oracle Consensus Score.", BrainCircuit],
  ["Enterprise Intelligence APIs", "Infrastructure-grade APIs for markets, trading systems, desks, and autonomous agents.", Server],
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
    eyebrow: "Live signal ingestion",
    groupLabel: "Signals",
    title: "OracleX ingests live market intelligence",
    description: "OracleX continuously monitors prediction markets, social narratives, wallets, liquidity flows, and breaking news in real time.",
    items: ["prediction markets", "social narratives", "whale wallets", "liquidity flows", "news events"],
    Icon: Database,
  },
  {
    label: "02",
    eyebrow: "Agent consensus layer",
    groupLabel: "Signals",
    title: "AI agents generate consensus",
    description: "Specialized AI agents analyze momentum, volatility, truth confidence, narrative shifts, and market manipulation signals across global events.",
    items: ["momentum analysis", "truth verification", "volatility detection", "narrative tracking", "consensus modeling"],
    Icon: BrainCircuit,
  },
  {
    label: "03",
    eyebrow: "Enterprise output layer",
    groupLabel: "Outputs",
    title: "OracleX publishes intelligence",
    description: "OracleX transforms fragmented signals into probability intelligence, consensus scores, market alerts, and enterprise-grade APIs.",
    items: ["probability intelligence", "market signals", "consensus scores", "intelligence APIs", "forecasting feeds"],
    Icon: RadioTower,
  },
];

const enterpriseTargets = ["Prediction Markets", "Market Makers", "Quant Funds", "AI Trading Systems", "Sportsbooks"];

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

function PrimaryButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-blue-300/45 bg-[#1f6fff] px-5 text-[13px] font-semibold tracking-[0.01em] text-white shadow-[0_16px_42px_rgba(31,111,255,0.18)] transition duration-500 hover:-translate-y-0.5 hover:bg-[#3b82f6] hover:shadow-[0_18px_48px_rgba(31,111,255,0.24)]">
      {children}
      <ArrowRight className="size-4 transition group-hover:translate-x-1" />
    </button>
  );
}

function SecondaryButton({ children }: { children: React.ReactNode }) {
  return (
    <a href="#" className="inline-flex h-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.035] px-5 text-[13px] font-semibold tracking-[0.01em] text-slate-100 transition duration-500 hover:-translate-y-0.5 hover:border-blue-200/30 hover:bg-blue-300/[0.07]">
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
      <TerminalChrome title="oraclex/live-consensus">
        <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[1fr_0.86fr]">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-slate-500">Oracle Consensus Score™</span>
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

function AccessModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <motion.div className="fixed inset-0 z-[80] flex items-center justify-center px-4 py-8" initial={false} animate={open ? "open" : "closed"} variants={{ open: { pointerEvents: "auto" }, closed: { pointerEvents: "none" } }}>
      <motion.button type="button" aria-label="Close access request" className="absolute inset-0 bg-black/72 backdrop-blur-xl" onClick={onClose} variants={{ open: { opacity: 1 }, closed: { opacity: 0 } }} transition={{ duration: 0.28, ease: "easeOut" }} />
      <motion.div role="dialog" aria-modal="true" aria-labelledby="access-modal-title" className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-blue-200/15 bg-[#050914]/95 shadow-[0_40px_120px_rgba(0,0,0,0.68)] ring-1 ring-blue-300/[0.08]" variants={{ open: { opacity: 1, y: 0, scale: 1 }, closed: { opacity: 0, y: 20, scale: 0.97 } }} transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_22%_0%,rgba(31,111,255,0.22),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.06),transparent_44%)]" />
        <div className="relative border-b border-white/[0.075] px-6 py-5 sm:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-2xl border border-blue-300/20 bg-blue-300/[0.075] text-blue-200">
                <Terminal className="size-5" />
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-blue-100/80">private terminal</span>
            </div>
            <button type="button" onClick={onClose} className="grid size-9 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.035] text-slate-400 transition hover:border-blue-300/20 hover:text-white" aria-label="Close modal">
              <X className="size-4" />
            </button>
          </div>
        </div>
        <div className="relative px-6 py-7 sm:px-8 sm:py-8">
          {submitted ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="py-7 text-center">
              <CheckCircle2 className="mx-auto size-12 text-blue-200" />
              <h2 className="mt-5 text-3xl font-medium tracking-[-0.03em] text-white">Access request received.</h2>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-400">OracleX will review your signal profile and follow up with next steps.</p>
            </motion.div>
          ) : (
            <>
              <h2 id="access-modal-title" className="text-4xl font-medium leading-[1] tracking-[-0.035em] text-white">Request OracleX Access</h2>
              <p className="mt-4 text-sm leading-6 text-slate-400">Early access for traders, analysts, prediction markets, quant firms, and infrastructure partners.</p>
              <form onSubmit={handleSubmit} className="mt-7 space-y-4">
                {[
                  ["Email", "email", "email"],
                  ["Company or Project (optional)", "text", "company"],
                  ["X handle (optional)", "text", "x-handle"],
                ].map(([label, type, id]) => (
                  <label key={id} htmlFor={id} className="block">
                    <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">{label}</span>
                    <input id={id} type={type} required={id === "email"} className="h-12 w-full rounded-xl border border-white/[0.08] bg-black/35 px-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-300/40 focus:bg-blue-300/[0.045] focus:ring-4 focus:ring-blue-300/[0.06]" />
                  </label>
                ))}
                <button type="submit" className="mt-2 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-blue-300/45 bg-[#1f6fff] px-5 text-[13px] font-semibold text-white shadow-[0_18px_48px_rgba(31,111,255,0.22)] transition duration-500 hover:bg-[#3b82f6]">
                  Request Access
                  <ArrowRight className="size-4" />
                </button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
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
        <p className="max-w-sm border-l border-blue-300/20 pl-4 font-mono text-[11px] uppercase leading-6 tracking-[0.16em] text-blue-100/75">Real-time intelligence infrastructure for future markets.</p>
      </motion.div>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-5">
        {pipelineSteps.map(({ label, eyebrow, groupLabel, title, description, items, Icon }, index) => (
          <Fragment key={title}>
            <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: index * 0.09 }} className="group relative overflow-hidden rounded-2xl border border-white/[0.085] bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(0,0,0,0.2))] p-7 ring-1 ring-blue-300/[0.03] transition duration-500 hover:-translate-y-1 hover:border-blue-300/22 hover:bg-blue-300/[0.025] sm:p-8">
              <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-blue-200/35 to-transparent opacity-70" />
              <div className="mb-9 flex items-center justify-between">
                <div>
                  <span className="font-mono text-[11px] text-blue-200/90">{label}</span>
                  <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">{eyebrow}</div>
                </div>
                <span className="relative z-10 grid size-14 place-items-center rounded-2xl border border-blue-300/22 bg-blue-300/[0.07] text-blue-200 shadow-[0_0_34px_rgba(31,111,255,0.12)]">
                  <Icon className="size-5" />
                </span>
              </div>
              <h3 className="max-w-[17rem] text-2xl font-medium leading-tight tracking-[-0.025em] text-white">{title}</h3>
              <p className="mt-4 text-sm leading-6 text-slate-400/95">{description}</p>
              <div className="mt-7 font-mono text-[10px] uppercase tracking-[0.18em] text-blue-100/60">{groupLabel}</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {items.map((item) => (
                  <span key={item} className="rounded-xl border border-white/[0.08] bg-black/28 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.08em] text-slate-400 transition duration-300 group-hover:border-blue-300/18 group-hover:text-slate-300">
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>
            {index < pipelineSteps.length - 1 ? (
              <div className="pointer-events-none hidden items-start justify-center pt-[4.65rem] lg:flex">
                <span className="grid size-7 place-items-center rounded-full border border-blue-200/20 bg-[#061226]/95 text-blue-200/70 shadow-[0_0_28px_rgba(31,111,255,0.12)] ring-1 ring-white/[0.04]">
                  <ArrowRight className="size-3.5" />
                </span>
              </div>
            ) : null}
          </Fragment>
        ))}
      </div>
    </section>
  );
}

function EnterpriseStrip() {
  return (
    <section className="border-y border-white/[0.075] bg-blue-300/[0.022] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-blue-100/70">B2B infrastructure for future markets.</p>
          <p className="mt-2 text-sm leading-6 text-slate-300/85">Built for prediction markets, quant firms, market makers, and AI trading systems.</p>
        </div>
        <div className="flex flex-wrap gap-2.5 lg:justify-end">
          {enterpriseTargets.map((target) => (
            <span key={target} className="rounded-xl border border-white/[0.07] bg-black/28 px-3.5 py-2 text-xs font-medium text-slate-300">
              {target}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function ConsensusEngine() {
  return (
    <section id="consensus" className="mx-auto max-w-7xl px-4 py-28 sm:px-6 lg:px-8 lg:py-32">
      <motion.div {...fadeUp} className="mb-12 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
        <div className="max-w-2xl">
          <Label>AI Consensus Engine</Label>
          <h2 className="text-4xl font-medium leading-[1] tracking-[-0.035em] text-white sm:text-6xl">AI agents competing to predict the future.</h2>
        </div>
        <div className="min-w-72 rounded-2xl border border-blue-300/20 bg-blue-300/[0.055] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.22)]">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-blue-100/80">Oracle Consensus Score™</div>
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

function WhyOracleX() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-28 sm:px-6 lg:px-8 lg:py-32">
      <motion.div {...fadeUp} className="mb-12 max-w-3xl">
        <Label>Why OracleX</Label>
        <h2 className="text-4xl font-medium leading-[1] tracking-[-0.035em] text-white sm:text-6xl">Prediction markets solved liquidity. OracleX solves intelligence.</h2>
      </motion.div>
      <div className="grid gap-4 lg:grid-cols-3">
        {proofCards.map(([title, copy, Icon], index) => (
          <motion.div key={title as string} {...fadeUp} transition={{ ...fadeUp.transition, delay: index * 0.08 }} className="rounded-2xl border border-white/[0.075] bg-white/[0.026] p-7 transition duration-500 hover:-translate-y-1 hover:border-blue-300/20 hover:bg-blue-300/[0.035]">
            <Icon className="mb-10 size-6 text-blue-200" />
            <h3 className="text-xl font-medium tracking-[-0.02em] text-white">{title as string}</h3>
            <p className="mt-4 text-sm leading-6 text-slate-400/95">{copy as string}</p>
          </motion.div>
        ))}
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
          <p className="mt-7 max-w-xl text-[17px] leading-8 text-slate-300/90">OracleX delivers real-time prediction intelligence APIs and consensus infrastructure for next-generation market platforms.</p>
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

export default function Home() {
  const [accessOpen, setAccessOpen] = useState(false);

  return (
    <main className="min-h-screen overflow-hidden bg-[#02040a] text-white selection:bg-blue-300 selection:text-black">
      <AccessModal open={accessOpen} onClose={() => setAccessOpen(false)} />
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_18%_12%,rgba(31,111,255,0.18),transparent_28%),radial-gradient(circle_at_86%_6%,rgba(96,165,250,0.08),transparent_26%),linear-gradient(180deg,#02040a_0%,#040814_46%,#02040a_100%)]" />
      <div className="pointer-events-none fixed inset-0 z-0 data-streams opacity-[0.035]" />

      <nav className="fixed left-0 right-0 top-0 z-50 border-b border-white/[0.075] bg-black/62 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <a href="#" className="flex items-center gap-2.5 text-sm font-semibold tracking-[-0.01em] text-white">
            <span className="grid size-8 place-items-center rounded-xl border border-blue-300/25 bg-blue-300/[0.055] text-blue-200">
              <Network className="size-4" />
            </span>
            OracleX
          </a>
          <div className="hidden items-center gap-8 text-xs font-medium text-slate-400 md:flex">
            {navLinks.map((link) => (
              <a key={link} href={link === "Docs" ? "#" : `#${link.toLowerCase()}`} className="transition duration-300 hover:text-blue-100">
                {link}
              </a>
            ))}
          </div>
          <button type="button" onClick={() => setAccessOpen(true)} className="hidden rounded-xl border border-blue-300/28 bg-blue-300/[0.055] px-4 py-2.5 text-xs font-semibold text-blue-100 transition duration-300 hover:bg-blue-300/[0.1] sm:inline-flex">
            Enter Terminal
          </button>
        </div>
      </nav>

      <section className="relative z-10 mx-auto grid max-w-7xl gap-14 px-4 pb-20 pt-32 sm:px-6 lg:grid-cols-[0.86fr_1.14fr] lg:px-8 lg:pb-28 lg:pt-40">
        <motion.div {...fadeUp}>
          <Label>Chainlink for prediction intelligence</Label>
          <h1 className="max-w-4xl text-6xl font-semibold leading-[0.94] tracking-[-0.035em] text-white sm:text-8xl lg:text-[6.5rem]">Prediction markets need intelligence.</h1>
          <p className="mt-8 max-w-xl text-[17px] leading-8 text-slate-300/90">OracleX is the intelligence infrastructure layer powering next-generation prediction markets on Solana.</p>
          <p className="mt-6 max-w-xl text-sm font-medium leading-6 tracking-[0.01em] text-blue-100/90">Prediction markets solved liquidity. OracleX solves intelligence.</p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <PrimaryButton onClick={() => setAccessOpen(true)}>Enter Terminal</PrimaryButton>
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
        <LiveFeed />
        <EnterpriseStrip />
        <IntelligencePipeline />
        <ConsensusEngine />
        <IntelligenceTerminal />
        <WhyOracleX />
        <Infrastructure />

        <section className="px-4 py-28 sm:px-6 lg:px-8 lg:py-32">
          <motion.div {...fadeUp} className="mx-auto max-w-5xl rounded-2xl border border-blue-300/20 bg-blue-300/[0.045] p-8 text-center shadow-[0_34px_90px_rgba(0,0,0,0.26)] sm:p-16">
            <Label>OracleX Protocol</Label>
            <h2 className="text-4xl font-medium leading-[1] tracking-[-0.035em] text-white sm:text-6xl">The future of prediction markets runs on intelligence.</h2>
            <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
              <PrimaryButton onClick={() => setAccessOpen(true)}>Enter Terminal</PrimaryButton>
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
              {["X/Twitter", "GitHub", "Docs", "Telegram", "Privacy", "Terms"].map((item) => (
                <a key={item} href="#" className="transition duration-300 hover:text-blue-100">
                  {item}
                </a>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
