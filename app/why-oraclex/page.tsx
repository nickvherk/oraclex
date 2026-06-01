"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  BrainCircuit,
  CircleDot,
  Code2,
  Database,
  Gauge,
  GitBranch,
  Globe2,
  Layers3,
  Network,
  RadioTower,
  ScanLine,
  Server,
  ShieldCheck,
  Terminal,
  WalletCards,
} from "lucide-react";
import Link from "next/link";

const DOCS_URL = "https://oracle-x-2.gitbook.io/oraclex-documentation/";
const X_URL = "https://x.com/oraclexterminal";

const navLinks = [
  { label: "Product", href: "/" },
  { label: "Why OracleX", href: "/why-oraclex" },
  { label: "Terminal", href: "/terminal" },
  { label: "Infrastructure", href: "/#infrastructure" },
  { label: "Docs", href: DOCS_URL, external: true },
];

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.9, ease: "easeOut" },
} as const;

const metrics = [
  ["2.1M", "daily signals"],
  ["12,400+", "tracked wallets"],
  ["418", "narrative clusters"],
  ["8.4s", "signal latency"],
];

const problems = [
  ["Fragmented information", "Market, wallet, narrative, liquidity, and news signals remain split across disconnected systems."],
  ["Narrative lag", "Market narratives often reprice before operators can identify why the shift is happening."],
  ["Hidden smart money positioning", "Large wallets and repeat winners move before the market sees their direction."],
  ["Disconnected derivatives flows", "Leverage, funding, and liquidity rotations rarely resolve into one operational view."],
  ["Low explainability", "Probability movement is visible, but attribution and confidence are often missing."],
  ["Inefficient interpretation", "Teams still spend too much time assembling context before acting on a signal."],
];

const gapDrivers = ["narratives accelerate", "whales reposition", "leverage expands", "liquidity rotates", "confirmation shifts"];

const missingLayer = ["infrastructure", "intelligence systems", "operational tooling"];

const solutionPillars = [
  {
    title: "Prediction Intelligence",
    copy: "A signal fabric that turns market, wallet, liquidity, narrative, and resolution evidence into structured probability context.",
    Icon: GitBranch,
  },
  {
    title: "Narrative Intelligence",
    copy: "Specialized agents evaluate competing evidence, source agreement, conflicts, and market impact across active narratives.",
    Icon: BrainCircuit,
  },
  {
    title: "Enterprise Intelligence APIs",
    copy: "Low-latency feeds, webhooks, and explainable outputs for trading systems, market platforms, research desks, and operators.",
    Icon: Server,
  },
];

const liveSignals = [
  ["14:03:42", "probability_shift", "SOL ETF YES +12.0%", "87.4 conf"],
  ["14:03:47", "smart_money_flow", "$1.8M net YES flow", "HIGH"],
  ["14:03:51", "narrative_acceleration", "ETF cluster +18.4%", "LIVE"],
];

const flowExamples = [
  ["Liquidity rotation", "BTC election hedge flow moving into policy markets", "3 venues"],
  ["Leverage expansion", "Funding pressure rising while YES depth thins", "2.8x"],
  ["Confirmation break", "Public probability flat while agent confidence climbs", "+14.2"],
];

const whyCards = [
  ["Prediction Market Analytics", "Detect repeat winner wallets, directional exposure, entry timing, and conviction changes before the market fully reprices.", WalletCards],
  ["Hyperliquid Flows", "Connect prediction markets with derivatives, liquidity venues, funding pressure, and narrative-adjacent rotations.", Layers3],
  ["Narrative Intelligence", "Track emerging clusters, narrative velocity, source quality, source agreement, conflicts, and market correlation across event domains.", Network],
  ["Real-Time Signals", "Convert raw movement into monitored alerts, ranked opportunities, and machine-readable operational feeds.", RadioTower],
  ["Explainable Intelligence", "Attach source evidence, confidence, and attribution to every market-moving signal instead of publishing opaque scores.", ShieldCheck],
  ["Enterprise APIs", "Deliver prediction intelligence through APIs, webhooks, and feeds designed for institutional systems.", Code2],
];

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-6 inline-flex items-center gap-2 rounded-xl border border-blue-300/15 bg-blue-300/[0.055] px-4 py-2 text-[11px] font-medium uppercase tracking-[0.16em] text-blue-100/90">
      <CircleDot className="size-3 text-blue-300/90" />
      {children}
    </div>
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

function Nav() {
  return (
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-white/[0.075] bg-black/62 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="cursor-pointer flex items-center gap-2.5 text-sm font-semibold tracking-[-0.01em] text-white">
          <span className="grid size-8 place-items-center rounded-xl border border-blue-300/25 bg-blue-300/[0.055] text-blue-200">
            <Network className="size-4" />
          </span>
          OracleX
        </Link>
        <div className="hidden items-center gap-8 text-xs font-medium text-slate-400 md:flex">
          {navLinks.map((link) =>
            link.external ? (
              <a key={link.label} href={link.href} target="_blank" rel="noreferrer" className="cursor-pointer transition duration-300 hover:text-blue-100">
                {link.label}
              </a>
            ) : (
              <Link key={link.label} href={link.href} className={link.href === "/why-oraclex" ? "cursor-pointer text-blue-100 transition duration-300" : "cursor-pointer transition duration-300 hover:text-blue-100"}>
                {link.label}
              </Link>
            ),
          )}
        </div>
        <Link href="/terminal" className="premium-interactive hidden rounded-xl border border-blue-300/28 bg-blue-300/[0.055] px-4 py-2.5 text-xs font-semibold text-blue-100 sm:inline-flex">
          Enter Terminal
        </Link>
      </div>
    </nav>
  );
}

export default function WhyOracleXPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#02040a] text-white selection:bg-blue-300 selection:text-black">
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_18%_12%,rgba(31,111,255,0.18),transparent_28%),radial-gradient(circle_at_86%_6%,rgba(96,165,250,0.08),transparent_26%),linear-gradient(180deg,#02040a_0%,#040814_46%,#02040a_100%)]" />
      <div className="pointer-events-none fixed inset-0 z-0 data-streams opacity-[0.035]" />
      <Nav />

      <section className="relative z-10 mx-auto grid max-w-7xl gap-14 px-4 pb-20 pt-32 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8 lg:pb-28 lg:pt-40">
        <motion.div {...fadeUp}>
          <Label>Why OracleX</Label>
          <h1 className="max-w-5xl text-5xl font-semibold leading-[0.98] tracking-[-0.035em] text-white sm:text-7xl lg:text-[5.9rem]">
            Prediction markets solved liquidity.
            <br />
            OracleX solves intelligence.
          </h1>
          <p className="mt-8 max-w-2xl text-xl leading-8 tracking-[-0.015em] text-slate-300/95">Prediction markets generate probabilities. OracleX generates operational intelligence.</p>
          <div className="mt-11 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
            {metrics.map(([value, label], index) => (
              <motion.div key={label} className="rounded-2xl border border-white/[0.075] bg-white/[0.026] p-3.5" animate={{ opacity: [0.74, 1, 0.84] }} transition={{ duration: 5, repeat: Infinity, delay: index * 0.45, ease: "easeInOut" }}>
                <div className="font-mono text-2xl tracking-[-0.05em] text-white">{value}</div>
                <div className="mt-2 font-mono text-[9px] uppercase leading-4 tracking-[0.14em] text-slate-500">{label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div {...fadeUp} className="relative lg:pt-8">
          <div className="absolute -inset-8 -z-10 bg-blue-500/[0.14] blur-3xl" />
          <TerminalChrome title="oraclex/intelligence-layer">
            <div className="space-y-4 p-4 sm:p-5">
              <div className="rounded-2xl border border-blue-300/[0.12] bg-black/75 p-5">
                <div className="mb-5 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  <span>Market interpretation</span>
                  <span className="text-blue-200">LIVE</span>
                </div>
                <div className="relative h-64 overflow-hidden rounded-2xl border border-blue-300/[0.12] bg-black/90">
                  <div className="data-streams absolute inset-0 opacity-25" />
                  <svg className="absolute inset-0 h-full w-full" viewBox="0 0 520 220" preserveAspectRatio="none">
                    <motion.path d="M0 164 C80 132 118 142 178 96 C244 44 300 130 372 76 C424 36 462 50 520 32" fill="none" stroke="#2d7ff9" strokeWidth="2.5" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: [0, 1, 1] }} transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut" }} />
                    <motion.path d="M0 184 C86 174 120 158 184 160 C252 166 292 108 362 116 C430 124 468 84 520 90" fill="none" stroke="#93c5fd" strokeWidth="1.25" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: [0, 1, 1] }} transition={{ duration: 8.8, repeat: Infinity, delay: 0.7, ease: "easeInOut" }} />
                  </svg>
                  <div className="absolute left-5 top-5">
                    <div className="font-mono text-6xl font-medium tracking-[-0.05em] text-white">87.4</div>
                    <div className="mt-2 font-mono text-[11px] uppercase tracking-[0.12em] text-blue-200/90">narrative confidence</div>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 grid grid-cols-3 gap-2.5">
                    {["Whales 88", "Narrative 94", "Liquidity 86"].map((item) => (
                      <div key={item} className="rounded-xl border border-white/[0.08] bg-black/60 px-3 py-2.5 font-mono text-[11px] text-slate-300 backdrop-blur">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {["explain", "route", "publish"].map((item) => (
                  <div key={item} className="rounded-xl border border-white/[0.075] bg-white/[0.026] p-4 font-mono text-[10px] uppercase tracking-[0.14em] text-slate-400">
                    intelligence.{item}
                  </div>
                ))}
              </div>
            </div>
          </TerminalChrome>
        </motion.div>
      </section>

      <section className="relative z-10 border-y border-white/[0.075] bg-[#03060d] px-4 py-24 sm:px-6 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <motion.div {...fadeUp} className="mb-12 max-w-3xl">
            <Label>The Problem</Label>
            <h2 className="text-4xl font-medium leading-[1] tracking-[-0.035em] text-white sm:text-6xl">Probability alone is not enough infrastructure.</h2>
            <p className="mt-7 text-[17px] leading-8 text-slate-300/90">Prediction markets expose prices, but operational teams still need the context behind market movement.</p>
          </motion.div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {problems.map(([title, copy], index) => (
              <motion.div key={title} {...fadeUp} transition={{ ...fadeUp.transition, delay: index * 0.04 }} className="rounded-2xl border border-white/[0.075] bg-white/[0.026] p-6 transition duration-500 hover:-translate-y-1 hover:border-blue-300/22 hover:bg-blue-300/[0.035]">
                <ScanLine className="mb-8 size-5 text-blue-200" />
                <h3 className="text-xl font-medium tracking-[-0.02em] text-white">{title}</h3>
                <p className="mt-4 text-sm leading-6 text-slate-400/95">{copy}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto grid max-w-7xl gap-10 px-4 py-24 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:py-32">
        <motion.div {...fadeUp}>
          <Label>The Gap</Label>
          <h2 className="text-4xl font-medium leading-[1] tracking-[-0.035em] text-white sm:text-6xl">Markets move before the market explains itself.</h2>
          <p className="mt-7 max-w-xl text-[17px] leading-8 text-slate-300/90">The informational edge is no longer only the probability. It is the ability to see why narrative confirmation is changing, where conviction is forming, and which flows are driving the move.</p>
        </motion.div>
        <motion.div {...fadeUp} className="grid gap-4">
          <div className="rounded-2xl border border-white/[0.085] bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(0,0,0,0.24))] p-5">
            <div className="mb-5 font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">Markets move because</div>
            <div className="grid gap-3 sm:grid-cols-2">
              {gapDrivers.map((item, index) => (
                <motion.div key={item} className="flex items-center justify-between rounded-xl border border-white/[0.075] bg-black/38 px-4 py-3.5" animate={{ opacity: [0.72, 1, 0.82] }} transition={{ duration: 4.8, repeat: Infinity, delay: index * 0.32, ease: "easeInOut" }}>
                  <span className="text-sm font-medium text-slate-200">{item}</span>
                  <Gauge className="size-4 text-blue-200" />
                </motion.div>
              ))}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {missingLayer.map((item) => (
              <div key={item} className="rounded-2xl border border-blue-300/14 bg-blue-300/[0.045] p-5">
                <Database className="mb-8 size-5 text-blue-200" />
                <div className="font-mono text-[11px] uppercase leading-5 tracking-[0.14em] text-slate-300">{item}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="relative z-10 border-y border-white/[0.075] bg-[linear-gradient(180deg,rgba(31,111,255,0.035),rgba(255,255,255,0.012))] px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <motion.div {...fadeUp} className="mb-12 max-w-4xl">
            <Label>The OracleX Solution</Label>
            <h2 className="text-4xl font-medium leading-[1] tracking-[-0.035em] text-white sm:text-6xl">An infrastructure layer for interpreting prediction markets.</h2>
          </motion.div>
          <div className="grid gap-4 lg:grid-cols-3">
            {solutionPillars.map(({ title, copy, Icon }, index) => (
              <motion.div key={title} {...fadeUp} transition={{ ...fadeUp.transition, delay: index * 0.08 }} className="rounded-2xl border border-white/[0.075] bg-black/32 p-7 transition duration-500 hover:-translate-y-1 hover:border-blue-300/20 hover:bg-blue-300/[0.035]">
                <Icon className="mb-10 size-6 text-blue-200" />
                <h3 className="text-2xl font-medium tracking-[-0.025em] text-white">{title}</h3>
                <p className="mt-5 text-sm leading-6 text-slate-400/95">{copy}</p>
              </motion.div>
            ))}
          </div>
          <div className="mt-8 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <motion.div {...fadeUp}>
              <TerminalChrome title="oraclex/live-signals">
                <div className="space-y-2.5 p-4 sm:p-5">
                  {liveSignals.map(([time, event, payload, status], index) => (
                    <motion.div key={event} className="flex items-center justify-between gap-4 rounded-xl border border-white/[0.075] bg-black/46 px-3.5 py-3 text-xs" animate={{ opacity: [0.68, 1, 0.82] }} transition={{ duration: 4.8, repeat: Infinity, delay: index * 0.42, ease: "easeInOut" }}>
                      <div className="min-w-0">
                        <div className="font-mono text-[10px] text-slate-500">{time} / {event}</div>
                        <div className="mt-1 truncate text-slate-200">{payload}</div>
                      </div>
                      <span className="shrink-0 font-mono text-[11px] text-blue-200">{status}</span>
                    </motion.div>
                  ))}
                </div>
              </TerminalChrome>
            </motion.div>
            <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.08 }}>
              <TerminalChrome title="oraclex/api-output">
                <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[0.9fr_1.1fr]">
                  <div className="space-y-3">
                    {flowExamples.map(([title, copy, metric]) => (
                      <div key={title} className="rounded-xl border border-white/[0.075] bg-white/[0.026] p-4">
                        <div className="flex items-center justify-between gap-4">
                          <h3 className="text-sm font-medium text-white">{title}</h3>
                          <span className="font-mono text-[11px] text-blue-200">{metric}</span>
                        </div>
                        <p className="mt-2 text-xs leading-5 text-slate-400">{copy}</p>
                      </div>
                    ))}
                  </div>
                  <pre className="overflow-hidden rounded-xl border border-white/[0.07] bg-black/58 p-4 font-mono text-[10px] leading-5 text-slate-300">
{`{
  "market": "sol_etf_approval",
  "signal": "smart_money_flow",
  "probability": 0.648,
  "consensus": 87.4,
  "drivers": ["wallets", "liquidity", "narrative"],
  "latency_ms": 8400
}`}
                  </pre>
                </div>
              </TerminalChrome>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <motion.div {...fadeUp} className="mb-12 max-w-3xl">
          <Label>Why OracleX</Label>
          <h2 className="text-4xl font-medium leading-[1] tracking-[-0.035em] text-white sm:text-6xl">Information advantage comes from connected intelligence.</h2>
        </motion.div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {whyCards.map(([title, copy, Icon], index) => (
            <motion.div key={title as string} {...fadeUp} transition={{ ...fadeUp.transition, delay: index * 0.05 }} className="rounded-2xl border border-white/[0.075] bg-white/[0.026] p-6 transition duration-500 hover:-translate-y-1 hover:border-blue-300/22 hover:bg-blue-300/[0.035]">
              <Icon className="mb-8 size-5 text-blue-200" />
              <h3 className="text-xl font-medium tracking-[-0.02em] text-white">{title as string}</h3>
              <p className="mt-4 text-sm leading-6 text-slate-400/95">{copy as string}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="relative z-10 px-4 pb-24 sm:px-6 lg:px-8 lg:pb-32">
        <motion.div {...fadeUp} className="mx-auto max-w-5xl rounded-2xl border border-blue-300/20 bg-blue-300/[0.045] p-8 text-center shadow-[0_34px_90px_rgba(0,0,0,0.26)] sm:p-16">
          <Label>Future Vision</Label>
          <h2 className="text-4xl font-medium leading-[1] tracking-[-0.035em] text-white sm:text-6xl">The operating system for prediction intelligence.</h2>
          <p className="mx-auto mt-7 max-w-2xl text-[17px] leading-8 text-slate-300/90">OracleX is building the infrastructure layer for future markets.</p>
          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/terminal" className="premium-interactive group inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-blue-300/45 bg-[#1f6fff] px-5 text-[13px] font-semibold tracking-[0.01em] text-white shadow-[0_16px_42px_rgba(31,111,255,0.18)]">
              Enter Terminal
              <ArrowRight className="premium-arrow size-4" />
            </Link>
            <a href={DOCS_URL} target="_blank" rel="noreferrer" className="premium-interactive inline-flex h-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.035] px-5 text-[13px] font-semibold tracking-[0.01em] text-slate-100">
              Read Docs
            </a>
          </div>
        </motion.div>
      </section>

      <footer className="relative z-10 border-t border-white/[0.075] px-4 py-9 sm:px-6 lg:px-8">
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
    </main>
  );
}
