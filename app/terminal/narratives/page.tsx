"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { ArrowRight, CircleDot, ExternalLink, Lock } from "lucide-react";

import { FeatureGate, PremiumLockedOverlay } from "@/components/terminal/access-gate";
import { Panel, PanelHeader } from "@/components/terminal/terminal-shell";
import { Badge } from "@/components/ui/badge";
import { CardContent } from "@/components/ui/card";
import { useCurrentPlan } from "@/lib/access-control";

type LinkEvidence = {
  source: string;
  headline?: string;
  account?: string;
  timestamp: string;
  url?: string;
  note?: string;
};

type Theme = {
  theme: string;
  evidenceCount: number;
  newsSourceCount: number;
  walletConfirmation: string;
  flowConfirmation: string;
  marketsImpacted: number;
  repricingStatus: "No" | "Partial" | "Yes";
  priority: "High" | "Medium" | "Watch";
  lastUpdated: string;
  summary: string;
  evidenceTimeline: Array<[string, string, string]>;
  newsEvidence: LinkEvidence[];
  socialEvidence: LinkEvidence[];
  walletEvidence: string[];
  flowEvidence: string[];
  markets: Array<{
    name: string;
    currentProbability: string;
    oracleProbability: string;
    divergence: string;
  }>;
  conclusion: {
    matters: string;
    priced: string;
    notPriced: string;
  };
  watchNext: string[];
};

const themes: Theme[] = [
  {
    theme: "SOL ETF Approval Momentum",
    evidenceCount: 12,
    newsSourceCount: 5,
    walletConfirmation: "$3.8M YES accumulation",
    flowConfirmation: "SOL OI +11%",
    marketsImpacted: 4,
    repricingStatus: "Partial",
    priority: "High",
    lastUpdated: "14:21",
    summary: "OracleX sees SOL ETF approval momentum as the leading emerging theme because news coverage, wallet accumulation, SOL positioning, and related market repricing are moving together while public probability has only partially adjusted.",
    evidenceTimeline: [
      ["09:14", "Bloomberg ETF update", "ETF approval discussion entered monitored news flow."],
      ["10:02", "SEC filing commentary", "Issuer and regulatory commentary increased around the approval window."],
      ["10:38", "Wallet accumulation detected", "Linked wallets began adding YES exposure."],
      ["11:12", "SOL positioning increased", "Hyperliquid SOL positioning and open interest moved higher."],
      ["12:03", "Probability divergence widened", "OracleX probability moved 6.4 points above public pricing."],
    ],
    newsEvidence: [
      { source: "Bloomberg", headline: "ETF update detected in monitored news feed", timestamp: "09:14", note: "Direct URL unavailable in demo dataset." },
      { source: "Reuters", headline: "Regulatory commentary detected in monitored news feed", timestamp: "10:02", note: "Direct URL unavailable in demo dataset." },
      { source: "CoinDesk", headline: "SOL ETF discussion detected in crypto policy coverage", timestamp: "10:18", note: "Direct URL unavailable in demo dataset." },
      { source: "Blockworks", headline: "Institutional crypto access coverage detected", timestamp: "10:44", note: "Direct URL unavailable in demo dataset." },
    ],
    socialEvidence: [
      { source: "X", account: "@EricBalchunas", timestamp: "09:37", url: "https://x.com/EricBalchunas", note: "Profile link only; post URL unavailable in demo dataset." },
      { source: "X", account: "@NateGeraci", timestamp: "09:51", url: "https://x.com/NateGeraci", note: "Profile link only; post URL unavailable in demo dataset." },
      { source: "X", account: "@tier10k", timestamp: "10:06", url: "https://x.com/tier10k", note: "Profile link only; post URL unavailable in demo dataset." },
    ],
    walletEvidence: ["14 linked wallets active", "$3.8M YES accumulation", "72% directional alignment", "3 repeat profitable wallet clusters"],
    flowEvidence: ["Hyperliquid SOL positioning increased", "Open Interest +11%", "Funding stable", "No liquidation cascade detected"],
    markets: [
      { name: "SOL ETF Approval", currentProbability: "64.8%", oracleProbability: "71.2%", divergence: "+6.4 pts" },
      { name: "BTC ATH", currentProbability: "58.6%", oracleProbability: "61.1%", divergence: "+2.5 pts" },
      { name: "ETH Rotation", currentProbability: "41.0%", oracleProbability: "38.9%", divergence: "-2.1 pts" },
      { name: "ETF Flow Continuation", currentProbability: "52.3%", oracleProbability: "55.7%", divergence: "+3.4 pts" },
    ],
    conclusion: {
      matters: "The theme matters because wallet activity, news flow, SOL positioning, and probability divergence are all confirming the same direction.",
      priced: "Public markets have partially priced the ETF momentum through higher SOL ETF probability and related market movement.",
      notPriced: "OracleX still sees unpriced confirmation from linked wallet accumulation and stable flow conditions.",
    },
    watchNext: ["continued wallet accumulation", "issuer filing activity", "related markets repricing", "liquidity confirmation", "theme decay"],
  },
  {
    theme: "Stablecoin Regulation",
    evidenceCount: 9,
    newsSourceCount: 4,
    walletConfirmation: "$940K policy basket exposure",
    flowConfirmation: "Rates hedge OI +6%",
    marketsImpacted: 3,
    repricingStatus: "No",
    priority: "High",
    lastUpdated: "14:16",
    summary: "Stablecoin regulation is appearing in monitored policy, issuer, and market feeds before prediction markets have fully adjusted.",
    evidenceTimeline: [
      ["09:32", "Policy headline detected", "Stablecoin bill discussion entered monitored news flow."],
      ["10:11", "Issuer commentary increased", "Issuer and exchange commentary clustered around compliance timing."],
      ["10:57", "Wallet basket exposure appeared", "Linked wallets added exposure in related policy markets."],
      ["12:20", "Market probability unchanged", "Public probabilities remained flat despite source acceleration."],
    ],
    newsEvidence: [
      { source: "Policy news feed", headline: "Stablecoin bill discussion detected", timestamp: "09:32", note: "Source type available; direct URL unavailable." },
      { source: "Issuer monitoring", headline: "Compliance timing commentary increased", timestamp: "10:11", note: "Source type available; direct URL unavailable." },
    ],
    socialEvidence: [
      { source: "X", account: "@tier10k", timestamp: "10:24", url: "https://x.com/tier10k", note: "Profile link only; post URL unavailable in demo dataset." },
    ],
    walletEvidence: ["7 linked wallets active", "$940K policy basket exposure", "63% directional alignment"],
    flowEvidence: ["Rates hedge OI +6%", "Funding neutral", "No liquidation cascade detected"],
    markets: [
      { name: "Stablecoin Bill Passage", currentProbability: "46.2%", oracleProbability: "51.8%", divergence: "+5.6 pts" },
      { name: "Crypto Market Structure Bill", currentProbability: "39.5%", oracleProbability: "42.0%", divergence: "+2.5 pts" },
      { name: "Fed Cuts", currentProbability: "38.1%", oracleProbability: "36.7%", divergence: "-1.4 pts" },
    ],
    conclusion: {
      matters: "The theme matters because policy-source activity is increasing before public market pricing has moved.",
      priced: "The market has not materially priced the current policy-source acceleration.",
      notPriced: "Wallet basket exposure and issuer commentary are not yet reflected in related probabilities.",
    },
    watchNext: ["committee calendar updates", "issuer statements", "policy-market wallet flow", "related market repricing"],
  },
  {
    theme: "Trump Election Positioning",
    evidenceCount: 8,
    newsSourceCount: 3,
    walletConfirmation: "$970K YES accumulation",
    flowConfirmation: "Election basket OI +9%",
    marketsImpacted: 4,
    repricingStatus: "Partial",
    priority: "Medium",
    lastUpdated: "14:09",
    summary: "Election-positioning evidence is rising across wallets, social commentary, and candidate-market pricing, but confirmation remains mixed.",
    evidenceTimeline: [
      ["09:48", "Polling commentary increased", "Polling reliability discussion clustered across monitored accounts."],
      ["10:36", "Wallet accumulation detected", "Linked wallets added candidate-market exposure."],
      ["11:44", "Election basket flow confirmed", "Open interest increased across election-linked markets."],
      ["13:05", "Public probability moved partially", "Candidate markets repriced without full source agreement."],
    ],
    newsEvidence: [
      { source: "Election news feed", headline: "Polling commentary cluster detected", timestamp: "09:48", note: "Source type available; direct URL unavailable." },
    ],
    socialEvidence: [
      { source: "X", account: "@NateSilver538", timestamp: "09:58", url: "https://x.com/NateSilver538", note: "Profile link only; post URL unavailable in demo dataset." },
    ],
    walletEvidence: ["8 linked wallets active", "$970K YES accumulation", "64% directional alignment"],
    flowEvidence: ["Election basket positioning increased", "Open Interest +9%", "Funding stable"],
    markets: [
      { name: "Trump Election", currentProbability: "51.7%", oracleProbability: "53.9%", divergence: "+2.2 pts" },
      { name: "Candidate Markets", currentProbability: "44.0%", oracleProbability: "45.5%", divergence: "+1.5 pts" },
      { name: "Election Volatility", currentProbability: "33.4%", oracleProbability: "36.1%", divergence: "+2.7 pts" },
    ],
    conclusion: {
      matters: "The theme matters because wallet exposure and election-basket flows are moving before all source categories agree.",
      priced: "Candidate markets have partially repriced the move.",
      notPriced: "Source conflict and uneven wallet quality leave part of the theme unresolved.",
    },
    watchNext: ["continued wallet accumulation", "polling-source confirmation", "candidate-market liquidity", "theme fade risk"],
  },
  {
    theme: "AI Regulation",
    evidenceCount: 7,
    newsSourceCount: 4,
    walletConfirmation: "$420K NO exposure",
    flowConfirmation: "AI basket OI +3%",
    marketsImpacted: 3,
    repricingStatus: "No",
    priority: "Medium",
    lastUpdated: "14:04",
    summary: "AI regulation evidence is emerging in policy and social monitoring, but wallet and flow confirmation remain early.",
    evidenceTimeline: [
      ["09:27", "Policy leak discussion detected", "AI regulation mentions increased in monitored policy accounts."],
      ["10:19", "KOL discussion expanded", "Influential accounts began discussing timing and bill structure."],
      ["11:02", "Wallet exposure appeared", "Linked wallets opened small NO exposure."],
      ["12:31", "Market pricing still flat", "Related AI policy markets did not fully reprice."],
    ],
    newsEvidence: [
      { source: "Policy news feed", headline: "AI regulation discussion detected", timestamp: "09:27", note: "Source type available; direct URL unavailable." },
      { source: "News/event monitoring", headline: "Bill-timing commentary increased", timestamp: "10:19", note: "Source type available; direct URL unavailable." },
    ],
    socialEvidence: [
      { source: "X", account: "@sama", timestamp: "10:22", url: "https://x.com/sama", note: "Profile link only; post URL unavailable in demo dataset." },
    ],
    walletEvidence: ["4 linked wallets active", "$420K NO exposure", "54% directional alignment"],
    flowEvidence: ["AI basket positioning flat", "Open Interest +3%", "Funding neutral"],
    markets: [
      { name: "AI Regulation", currentProbability: "48.3%", oracleProbability: "45.2%", divergence: "-3.1 pts" },
      { name: "Agent OS Release", currentProbability: "55.3%", oracleProbability: "54.0%", divergence: "-1.3 pts" },
      { name: "Compute Policy", currentProbability: "42.8%", oracleProbability: "40.9%", divergence: "-1.9 pts" },
    ],
    conclusion: {
      matters: "The theme matters because policy-source activity is rising before markets have repriced the regulatory risk.",
      priced: "Public markets have not meaningfully priced the early policy evidence.",
      notPriced: "The risk discount implied by policy monitoring and early wallet exposure remains underpriced.",
    },
    watchNext: ["bill text confirmation", "KOL follow-through", "wallet size expansion", "AI market repricing"],
  },
  {
    theme: "Middle East Escalation",
    evidenceCount: 6,
    newsSourceCount: 5,
    walletConfirmation: "defensive exposure detected",
    flowConfirmation: "oil/risk basket OI +8%",
    marketsImpacted: 3,
    repricingStatus: "Partial",
    priority: "Watch",
    lastUpdated: "13:58",
    summary: "Escalation monitoring shows news-source activity and defensive positioning, but prediction-market confirmation is still uneven.",
    evidenceTimeline: [
      ["08:55", "Regional headline cluster", "Multiple monitored news feeds flagged escalation language."],
      ["09:40", "Defensive wallet exposure appeared", "Linked wallets added risk-off exposure."],
      ["10:50", "Oil/risk flow increased", "Open interest rose in macro-linked risk baskets."],
      ["12:18", "Related markets partially repriced", "Geopolitical markets moved but liquidity stayed thin."],
    ],
    newsEvidence: [
      { source: "Reuters", headline: "Regional escalation headline detected", timestamp: "08:55", note: "Direct URL unavailable in demo dataset." },
      { source: "News/event monitoring", headline: "Diplomatic-source conflict detected", timestamp: "09:13", note: "Source type available; direct URL unavailable." },
    ],
    socialEvidence: [
      { source: "X", account: "@ELINTNews", timestamp: "09:18", url: "https://x.com/ELINTNews", note: "Profile link only; post URL unavailable in demo dataset." },
    ],
    walletEvidence: ["defensive exposure detected", "5 linked wallets active", "risk-off basket concentration increased"],
    flowEvidence: ["oil/risk basket OI +8%", "Funding slightly elevated", "No liquidation cascade detected"],
    markets: [
      { name: "Middle East Escalation", currentProbability: "30.4%", oracleProbability: "33.6%", divergence: "+3.2 pts" },
      { name: "Oil Shock", currentProbability: "24.7%", oracleProbability: "26.1%", divergence: "+1.4 pts" },
      { name: "Fed Cuts", currentProbability: "38.1%", oracleProbability: "36.4%", divergence: "-1.7 pts" },
    ],
    conclusion: {
      matters: "The theme matters because news-source activity and defensive positioning can move macro-sensitive prediction markets quickly.",
      priced: "Some geopolitical markets have partially repriced headline risk.",
      notPriced: "Liquidity stress and cross-market macro impact are not fully reflected.",
    },
    watchNext: ["primary-source confirmation", "risk-off wallet follow-through", "oil/risk flow expansion", "liquidity stress"],
  },
  {
    theme: "Corporate BTC Treasury Adoption",
    evidenceCount: 5,
    newsSourceCount: 2,
    walletConfirmation: "$760K YES accumulation",
    flowConfirmation: "BTC OI +6%",
    marketsImpacted: 3,
    repricingStatus: "No",
    priority: "Watch",
    lastUpdated: "13:44",
    summary: "Corporate BTC treasury adoption is early-stage: wallet and flow data are improving, but source coverage and market repricing remain limited.",
    evidenceTimeline: [
      ["09:06", "Treasury-account discussion detected", "Balance-sheet adoption discussion appeared in monitored accounts."],
      ["10:29", "Wallet accumulation appeared", "Linked wallets added YES exposure."],
      ["11:36", "BTC positioning increased", "BTC open interest increased with stable funding."],
      ["12:42", "Market still not repriced", "Related probability markets remained near baseline."],
    ],
    newsEvidence: [
      { source: "Corporate filings monitor", headline: "Treasury-adoption language detected", timestamp: "09:06", note: "Source type available; direct URL unavailable." },
    ],
    socialEvidence: [
      { source: "X", account: "@BitcoinMagazine", timestamp: "09:22", url: "https://x.com/BitcoinMagazine", note: "Profile link only; post URL unavailable in demo dataset." },
    ],
    walletEvidence: ["6 linked wallets active", "$760K YES accumulation", "69% directional alignment"],
    flowEvidence: ["BTC positioning increased", "Open Interest +6%", "Funding stable"],
    markets: [
      { name: "Corporate BTC Treasury", currentProbability: "21.7%", oracleProbability: "23.6%", divergence: "+1.9 pts" },
      { name: "BTC ATH", currentProbability: "58.6%", oracleProbability: "59.8%", divergence: "+1.2 pts" },
      { name: "ETF Inflow Continuation", currentProbability: "52.3%", oracleProbability: "53.1%", divergence: "+0.8 pts" },
    ],
    conclusion: {
      matters: "The theme matters because wallet and BTC flow evidence can precede public market repricing in adoption-linked markets.",
      priced: "The market has not priced the early treasury-adoption evidence.",
      notPriced: "Wallet accumulation and BTC positioning are not yet reflected in the main related markets.",
    },
    watchNext: ["filing confirmation", "wallet size expansion", "BTC OI continuation", "related markets repricing"],
  },
];

const themeTimeline = [
  ["14:21", "ETF discussion accelerating", "SOL ETF Approval Momentum added 3 new evidence items."],
  ["14:09", "Wallet accumulation detected", "Election positioning wallets added candidate-market exposure."],
  ["14:04", "Related markets repricing", "AI Regulation markets remained flat despite policy-source activity."],
  ["13:58", "Flow confirmation emerged", "Middle East risk basket OI rose while funding stayed controlled."],
  ["13:44", "Theme still unpriced", "Corporate BTC Treasury Adoption retained NO repricing status."],
  ["13:28", "Liquidity conflict appeared", "SOL ETF depth improved, but book depth remained thinner than prior confirmed moves."],
];

const refreshModel = [
  ["News feeds", "live/hourly"],
  ["X monitoring", "live/hourly"],
  ["Wallet monitoring", "live"],
  ["Hyperliquid flows", "live"],
  ["Prediction market pricing", "live"],
  ["Theme ranking", "daily"],
];

function priorityTone(priority: string) {
  if (priority === "High") return "border-red-300/25 bg-red-300/[0.09] text-red-100";
  if (priority === "Medium") return "border-amber-300/25 bg-amber-300/[0.09] text-amber-100";
  return "border-blue-300/22 bg-blue-300/[0.08] text-blue-100";
}

function repricingTone(status: string) {
  if (status === "No") return "border-emerald-300/25 bg-emerald-300/[0.09] text-emerald-100";
  if (status === "Partial") return "border-amber-300/25 bg-amber-300/[0.09] text-amber-100";
  return "border-slate-300/15 bg-slate-300/[0.06] text-slate-300";
}

function EvidenceLink({ item }: { item: LinkEvidence }) {
  const label = item.headline ?? item.account ?? item.source;

  return (
    <div className="rounded-lg border border-white/[0.065] bg-white/[0.025] p-3">
      <div className="mb-1 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-slate-600">{item.source} / {item.timestamp}</div>
          <div className="mt-1 text-xs leading-5 text-slate-200">{label}</div>
        </div>
        {item.url ? (
          <a href={item.url} target="_blank" rel="noreferrer" className="grid size-7 shrink-0 place-items-center rounded-lg border border-blue-300/20 bg-blue-300/[0.07] text-blue-100 transition hover:border-blue-300/40 hover:bg-blue-300/[0.12]" aria-label={`Open ${label}`}>
            <ExternalLink className="size-3.5" />
          </a>
        ) : null}
      </div>
      <div className="text-[11px] leading-5 text-slate-500">{item.note ?? "Verified link available."}</div>
    </div>
  );
}

export default function NarrativesPage() {
  return (
    <FeatureGate
      feature="narrativeIntelligence"
      title="Narrative Intelligence coming soon"
      badgeLabel="Enterprise preview"
      ctaLabel="Request Enterprise Access"
      explanation="Narrative Intelligence is currently available to Enterprise users while the next-generation discovery engine is being finalized."
    >
      <NarrativeIntelligenceByPlan />
    </FeatureGate>
  );
}

function NarrativeIntelligenceByPlan() {
  const { plan } = useCurrentPlan();

  if (plan === "observer") {
    return <ObserverThemesPage />;
  }

  return <FullThemesPage />;
}

function ObserverThemesPage() {
  return (
    <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="grid gap-4">
        <section className="rounded-xl border border-white/[0.075] bg-[#070b14]/86 p-4">
          <Badge className="mb-3 h-6 rounded-lg border border-blue-300/15 bg-blue-300/[0.07] font-mono text-[10px] uppercase text-blue-100">Observer theme discovery</Badge>
          <h1 className="text-2xl font-semibold tracking-[-0.03em] text-white">Emerging Themes Discovery Preview</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">Observer access shows evidence-backed emerging themes and market impact. Full report evidence, source detail, wallet confirmation, and flow confirmation require Analyst access.</p>
        </section>

        <Panel>
          <PanelHeader title="Emerging Themes" action="Evidence first" />
          <CardContent className="grid gap-3 p-4 md:grid-cols-3">
            {themes.slice(0, 3).map((theme) => (
              <div key={theme.theme} className="rounded-xl border border-white/[0.075] bg-black/28 p-4">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <h2 className="text-sm font-semibold leading-5 text-white">{theme.theme}</h2>
                  <Badge className={`h-6 shrink-0 rounded-lg border px-2 font-mono text-[10px] uppercase ${priorityTone(theme.priority)}`}>{theme.priority}</Badge>
                </div>
                <p className="text-xs leading-5 text-slate-400">{theme.summary}</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {[
                    ["Evidence", `${theme.evidenceCount}`],
                    ["Repricing", theme.repricingStatus],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-lg bg-white/[0.035] p-2">
                      <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-slate-600">{label}</div>
                      <div className="mt-1 font-mono text-xs text-slate-200">{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Panel>

        <Panel>
          <PanelHeader title="Theme Reports" action="Analyst" />
          <CardContent className="grid gap-3 p-4 md:grid-cols-3">
            {["News evidence", "Wallet evidence", "Flow evidence"].map((feature) => (
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
                <PremiumLockedOverlay copy="Unlock full Theme Research with Analyst" />
              </div>
            ))}
          </CardContent>
        </Panel>
      </div>

      <aside className="grid gap-4 2xl:sticky 2xl:top-5 2xl:self-start">
        <Panel>
          <PanelHeader title="Research Access" action="Analyst" />
          <CardContent className="p-4">
            <div className="mb-4 grid size-11 place-items-center rounded-xl border border-blue-300/18 bg-blue-300/[0.07] text-blue-100">
              <Lock className="size-5" />
            </div>
            <h2 className="text-lg font-semibold tracking-[-0.02em] text-white">Unlock evidence-backed theme reports</h2>
            <p className="mt-2 text-xs leading-6 text-slate-400">Analyst access unlocks source categories, wallet evidence, Hyperliquid flow evidence, impacted markets, and repricing analysis.</p>
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

function FullThemesPage() {
  const [selectedTheme, setSelectedTheme] = useState<Theme>(themes[0]);

  return (
    <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_420px]">
      <div className="grid min-w-0 gap-4">
        <section className="rounded-xl border border-blue-300/15 bg-blue-300/[0.045] p-4">
          <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-blue-100">Emerging Themes Discovery Engine</div>
          <h1 className="text-2xl font-semibold tracking-[-0.03em] text-white">What themes are emerging right now before prediction markets fully price them?</h1>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-400">Evidence first: OracleX starts with news, social, wallet, flow, and market-pricing evidence, then maps that evidence to themes and probability impact.</p>
        </section>

        <Panel>
          <PanelHeader title="Emerging Themes" action="Evidence -> theme -> market impact" />
          <CardContent className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
            {themes.map((theme, index) => (
              <motion.button
                key={theme.theme}
                type="button"
                onClick={() => setSelectedTheme(theme)}
                className={`cursor-pointer rounded-xl border p-4 text-left transition ${selectedTheme.theme === theme.theme ? "border-blue-300/35 bg-blue-300/[0.08]" : "border-white/[0.075] bg-black/28 hover:border-blue-300/20 hover:bg-blue-300/[0.035]"}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <h2 className="text-sm font-semibold leading-5 text-white">{theme.theme}</h2>
                  <Badge className={`h-6 shrink-0 rounded-lg border px-2 font-mono text-[10px] uppercase ${priorityTone(theme.priority)}`}>{theme.priority}</Badge>
                </div>
                <p className="text-xs leading-5 text-slate-400">{theme.summary}</p>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {[
                    ["Evidence", `${theme.evidenceCount}`],
                    ["Markets", `${theme.marketsImpacted}`],
                    ["Repriced", theme.repricingStatus],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-lg bg-white/[0.035] p-2">
                      <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-slate-600">{label}</div>
                      <div className="mt-1 font-mono text-xs text-slate-200">{value}</div>
                    </div>
                  ))}
                </div>
              </motion.button>
            ))}
          </CardContent>
        </Panel>

        <Panel>
          <PanelHeader title="Theme Discovery Table" action="Last updated 14:21" />
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full min-w-[1120px] text-left text-xs">
              <thead className="border-b border-white/[0.075] text-[10px] uppercase tracking-[0.14em] text-slate-600">
                <tr>
                  {["Theme", "Evidence Count", "News Sources", "Wallet Confirmation", "Flow Confirmation", "Markets Impacted", "Repricing Status", "Priority", "View Report"].map((header) => (
                    <th key={header} className="px-4 py-3 font-medium">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {themes.map((theme) => (
                  <tr key={theme.theme} className={`border-b border-white/[0.055] transition hover:bg-blue-300/[0.035] ${selectedTheme.theme === theme.theme ? "bg-blue-300/[0.035]" : ""}`}>
                    <td className="max-w-xs px-4 py-4">
                      <div className="font-semibold text-white">{theme.theme}</div>
                      <div className="mt-1 text-slate-500">Last updated {theme.lastUpdated}</div>
                    </td>
                    <td className="px-4 py-4 font-mono text-blue-100">{theme.evidenceCount}</td>
                    <td className="px-4 py-4 font-mono text-slate-200">{theme.newsSourceCount}</td>
                    <td className="px-4 py-4 text-slate-300">{theme.walletConfirmation}</td>
                    <td className="px-4 py-4 text-slate-300">{theme.flowConfirmation}</td>
                    <td className="px-4 py-4 font-mono text-slate-200">{theme.marketsImpacted}</td>
                    <td className="px-4 py-4">
                      <Badge className={`h-6 rounded-lg border px-2 font-mono text-[10px] uppercase ${repricingTone(theme.repricingStatus)}`}>{theme.repricingStatus}</Badge>
                    </td>
                    <td className="px-4 py-4">
                      <Badge className={`h-6 rounded-lg border px-2 font-mono text-[10px] uppercase ${priorityTone(theme.priority)}`}>{theme.priority}</Badge>
                    </td>
                    <td className="px-4 py-4">
                      <button type="button" onClick={() => setSelectedTheme(theme)} className="inline-flex min-h-9 cursor-pointer items-center justify-center rounded-lg border border-blue-300/25 bg-blue-300/[0.08] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-blue-100 transition hover:border-blue-300/45 hover:bg-blue-300/[0.13]">
                        View Report
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Panel>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <Panel>
            <PanelHeader title="Theme Timeline" action="Live evidence feed" />
            <CardContent className="space-y-2 p-4">
              {themeTimeline.map(([time, event, detail], index) => (
                <motion.div key={`${time}-${event}`} className="flex items-start gap-3 rounded-xl border border-white/[0.065] bg-black/28 p-3" animate={{ opacity: [0.78, 1, 0.86] }} transition={{ duration: 4.2, repeat: Infinity, delay: index * 0.22 }}>
                  <CircleDot className="mt-0.5 size-3.5 text-blue-200" />
                  <div className="min-w-0 flex-1">
                    <div className="font-mono text-[10px] text-slate-600">{time}</div>
                    <div className="mt-1 text-xs font-semibold text-slate-200">{event}</div>
                    <div className="mt-1 text-xs leading-5 text-slate-400">{detail}</div>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Panel>

          <Panel>
            <PanelHeader title="Theme Ranking" action="No arbitrary scores" />
            <CardContent className="space-y-3 p-4">
              {themes.map((theme, index) => (
                <div key={theme.theme} className="rounded-xl border border-white/[0.065] bg-black/28 p-3">
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div>
                      <div className="font-mono text-[10px] text-slate-600">Rank {index + 1}</div>
                      <div className="mt-1 text-sm font-semibold text-white">{theme.theme}</div>
                    </div>
                    <Badge className={`h-6 rounded-lg border px-2 font-mono text-[10px] uppercase ${priorityTone(theme.priority)}`}>{theme.priority}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] leading-4 text-slate-400 md:grid-cols-4">
                    <div>Evidence: {theme.evidenceCount}</div>
                    <div>Smart money: {theme.walletConfirmation}</div>
                    <div>Impact: {theme.marketsImpacted} markets</div>
                    <div>Repricing: {theme.repricingStatus}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Panel>
        </div>

        <Panel>
          <PanelHeader title="Data Sources" action="Prepared architecture" />
          <CardContent className="grid gap-3 p-4 md:grid-cols-3 xl:grid-cols-6">
            {refreshModel.map(([source, cadence]) => (
              <div key={source} className="rounded-xl border border-white/[0.065] bg-black/25 p-3">
                <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-slate-600">{source}</div>
                <div className="mt-2 font-mono text-xs text-blue-100">{cadence}</div>
              </div>
            ))}
          </CardContent>
        </Panel>
      </div>

      <aside className="grid gap-4 2xl:sticky 2xl:top-5 2xl:self-start">
        <Panel>
          <PanelHeader title="Theme Report" action={`Last updated ${selectedTheme.lastUpdated}`} />
          <CardContent className="p-4">
            <div className="mb-3 flex items-start justify-between gap-3">
              <h2 className="text-xl font-semibold tracking-[-0.03em] text-white">{selectedTheme.theme}</h2>
              <Badge className={`h-6 shrink-0 rounded-lg border px-2 font-mono text-[10px] uppercase ${priorityTone(selectedTheme.priority)}`}>{selectedTheme.priority}</Badge>
            </div>
            <div className="rounded-xl border border-blue-300/15 bg-blue-300/[0.045] p-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-blue-100">Executive Summary</div>
              <p className="mt-2 text-xs leading-6 text-slate-300">{selectedTheme.summary}</p>
            </div>
          </CardContent>
        </Panel>

        <Panel>
          <PanelHeader title="Evidence Timeline" />
          <CardContent className="space-y-2 p-4">
            {selectedTheme.evidenceTimeline.map(([time, event, detail]) => (
              <div key={`${time}-${event}`} className="flex gap-3 rounded-xl border border-white/[0.065] bg-white/[0.025] p-3">
                <CircleDot className="mt-0.5 size-3.5 shrink-0 text-blue-200" />
                <div>
                  <div className="font-mono text-[10px] text-slate-600">{time}</div>
                  <div className="mt-1 text-xs font-semibold text-slate-200">{event}</div>
                  <div className="mt-1 text-xs leading-5 text-slate-400">{detail}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Panel>

        <Panel>
          <PanelHeader title="News Evidence" />
          <CardContent className="space-y-2 p-4">
            {selectedTheme.newsEvidence.map((item) => (
              <EvidenceLink key={`${item.source}-${item.timestamp}-${item.headline}`} item={item} />
            ))}
          </CardContent>
        </Panel>

        <Panel>
          <PanelHeader title="Social Evidence" />
          <CardContent className="space-y-2 p-4">
            {selectedTheme.socialEvidence.map((item) => (
              <EvidenceLink key={`${item.source}-${item.timestamp}-${item.account}`} item={item} />
            ))}
          </CardContent>
        </Panel>

        <Panel>
          <PanelHeader title="Wallet And Flow Evidence" />
          <CardContent className="grid gap-3 p-4">
            {[
              ["Wallet Evidence", selectedTheme.walletEvidence],
              ["Flow Evidence", selectedTheme.flowEvidence],
            ].map(([label, items]) => (
              <div key={label as string} className="rounded-xl border border-white/[0.065] bg-white/[0.025] p-3">
                <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-blue-100">{label as string}</div>
                <div className="grid gap-1.5">
                  {(items as string[]).map((item) => (
                    <div key={item} className="text-xs leading-5 text-slate-300">{item}</div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Panel>

        <Panel>
          <PanelHeader title="Markets Impacted" />
          <CardContent className="space-y-2 p-4">
            {selectedTheme.markets.map((market) => (
              <div key={market.name} className="rounded-xl border border-white/[0.065] bg-white/[0.025] p-3">
                <div className="text-xs font-semibold text-white">{market.name}</div>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {[
                    ["Current", market.currentProbability],
                    ["OracleX", market.oracleProbability],
                    ["Divergence", market.divergence],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-lg bg-black/24 p-2">
                      <div className="font-mono text-[8px] uppercase tracking-[0.12em] text-slate-600">{label}</div>
                      <div className="mt-1 font-mono text-[11px] text-slate-200">{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Panel>

        <Panel>
          <PanelHeader title="OracleX Conclusion" />
          <CardContent className="space-y-2 p-4">
            {[
              ["Why this matters", selectedTheme.conclusion.matters],
              ["Already priced", selectedTheme.conclusion.priced],
              ["Not yet priced", selectedTheme.conclusion.notPriced],
            ].map(([label, detail]) => (
              <div key={label} className="rounded-xl border border-blue-300/12 bg-blue-300/[0.04] p-3">
                <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-blue-100">{label}</div>
                <p className="mt-2 text-xs leading-5 text-slate-300">{detail}</p>
              </div>
            ))}
            <div className="rounded-xl border border-white/[0.065] bg-white/[0.025] p-3">
              <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-blue-100">What To Watch Next</div>
              <div className="grid gap-1.5">
                {selectedTheme.watchNext.map((item) => (
                  <div key={item} className="text-xs leading-5 text-slate-300">{item}</div>
                ))}
              </div>
            </div>
          </CardContent>
        </Panel>
      </aside>
    </div>
  );
}
