"use client";

import { use, useEffect, useState } from "react";
import { ArrowLeft, Network, ShieldCheck, Wallet } from "lucide-react";
import Link from "next/link";

import { FeatureGate } from "@/components/terminal/access-gate";
import { BiasBadge, Panel, PanelHeader } from "@/components/terminal/terminal-shell";
import { Badge } from "@/components/ui/badge";
import { CardContent } from "@/components/ui/card";
import { money, shortWallet, walletProfilePath, type WalletProfile } from "@/lib/wallet-profile-data";

type WalletProfilePageProps = {
  params: Promise<{ wallet: string }>;
};

type LiveWalletProfile = WalletProfile & {
  sourceStatus?: {
    source: "live" | "derived" | "fallback" | "unavailable";
    label: string;
    liveFields: string[];
    derivedFields: string[];
    fallbackFields: string[];
    unavailableFields: string[];
  };
  recentTrades?: WalletProfile["positions"];
  positionHistory?: { label: string; value: string }[];
};

function unavailableProfile(wallet: string): LiveWalletProfile {
  return {
    wallet,
    tag: "Unavailable",
    category: "Unavailable",
    cohort: "Unavailable",
    roi: null,
    pnl: null,
    winRate: null,
    volume: null,
    openPositions: null,
    conviction: null,
    exposure: "Unavailable",
    interpretation: "Not provided by Falcon endpoint",
    positions: [],
    recentChanges: ["No recent trades returned by Falcon for this wallet."],
    marketExposure: [
      { label: "Realized PnL", value: "Unavailable", tone: "text-slate-300" },
      { label: "Volume", value: "Unavailable", tone: "text-slate-300" },
      { label: "Trade count", value: "Unavailable", tone: "text-slate-300" },
    ],
    relatedWallets: [],
    evidence: ["Wallet-specific Falcon profile has not loaded.", "No local fallback positions, trades, or related wallets are shown."],
    performance: [
      { label: "ROI", value: "Unavailable" },
      { label: "Win rate", value: "Unavailable" },
      { label: "Risk level", value: "Unavailable" },
      { label: "Markets traded", value: "Unavailable" },
    ],
    recentTrades: [],
    positionHistory: [{ label: "Position history", value: "unavailable" }],
    sourceStatus: {
      source: "unavailable",
      label: "Wallet-specific Falcon profile loading or unavailable.",
      liveFields: [],
      derivedFields: [],
      fallbackFields: [],
      unavailableFields: ["active positions", "recent trades", "related wallets"],
    },
  };
}

function percent(value: number | null | undefined, digits = 1) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "Unavailable";
  return `${value.toFixed(digits)}%`;
}

function count(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "Unavailable";
  return String(Math.round(value));
}

function SourceFieldLabels({ sourceStatus }: { sourceStatus: LiveWalletProfile["sourceStatus"] }) {
  const live = sourceStatus?.liveFields ?? [];
  const derived = sourceStatus?.derivedFields ?? [];
  const unavailable = [...(sourceStatus?.unavailableFields ?? []), "active positions", "related wallets"].filter((field, index, fields) => fields.indexOf(field) === index);

  return (
    <div className="mt-3 grid gap-2 text-[10px] md:grid-cols-3">
      <SourceList label="Live from Falcon" items={live} tone="text-emerald-200" />
      <SourceList label="Derived" items={derived} tone="text-blue-100" />
      <SourceList label="Unavailable" items={unavailable} tone="text-amber-100" />
    </div>
  );
}

function SourceList({ label, items, tone }: { label: string; items: string[]; tone: string }) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.025] px-3 py-2">
      <div className={`font-mono uppercase tracking-[0.12em] ${tone}`}>{label}</div>
      <div className="mt-1 text-xs leading-5 text-slate-400">{items.length ? items.join(", ") : "None"}</div>
    </div>
  );
}

function UnavailableMessage({ copy }: { copy: string }) {
  return <div className="rounded-lg border border-white/[0.06] bg-white/[0.025] px-3 py-2 font-mono text-[11px] text-slate-500">{copy}</div>;
}

export default function WalletProfilePage({ params }: WalletProfilePageProps) {
  const { wallet } = use(params);
  const decodedWallet = decodeURIComponent(wallet);
  const [liveProfile, setLiveProfile] = useState<LiveWalletProfile | null>(null);
  const profile: LiveWalletProfile = liveProfile ?? unavailableProfile(decodedWallet);

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/prediction-market-analytics?wallet=${encodeURIComponent(decodedWallet)}`)
      .then((response) => {
        if (!response.ok) throw new Error("Wallet analytics API failed");
        return response.json() as Promise<LiveWalletProfile>;
      })
      .then((payload) => {
        if (!cancelled) setLiveProfile(payload);
      })
      .catch(() => {
        if (!cancelled) setLiveProfile(null);
      });

    return () => {
      cancelled = true;
    };
  }, [decodedWallet]);

  return (
    <FeatureGate feature="walletIntelligence" explanation="Wallet Profiles start at Analyst access. Sign in with a demo account or upgrade your plan.">
      <div className="grid gap-4">
        <section className="rounded-xl border border-white/[0.075] bg-[#070b14]/86 p-4">
          <div className="mb-4 flex flex-col gap-3 border-b border-white/[0.075] pb-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <Link href="/terminal/wallets" className="mb-4 inline-flex min-h-8 items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.025] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-300 transition hover:border-blue-300/22 hover:text-blue-100">
                <ArrowLeft className="size-3.5" />
                Prediction Market Analytics
              </Link>
              <Badge className="mb-3 h-6 rounded-lg border border-blue-300/15 bg-blue-300/[0.07] font-mono text-[10px] uppercase text-blue-100">Wallet profile</Badge>
              <h1 className="break-all text-2xl font-semibold tracking-[-0.03em] text-white">{shortWallet(profile.wallet)}</h1>
              <p className="mt-2 max-w-3xl break-all font-mono text-[11px] leading-5 text-slate-500">{profile.wallet}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge className="h-6 rounded-lg border border-blue-300/15 bg-blue-300/[0.06] font-mono text-[10px] text-blue-100">{profile.tag}</Badge>
                <Badge className="h-6 rounded-lg border border-white/[0.08] bg-white/[0.035] font-mono text-[10px] text-slate-300">{profile.cohort}</Badge>
                <Badge className="h-6 rounded-lg border border-white/[0.08] bg-white/[0.035] font-mono text-[10px] text-slate-300">{profile.category}</Badge>
              </div>
              <SourceFieldLabels sourceStatus={profile.sourceStatus} />
            </div>
            <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-slate-600">Source: {profile.sourceStatus?.label ?? "Wallet-specific Falcon profile unavailable."}</div>
          </div>

          <div className="grid gap-2 md:grid-cols-3 xl:grid-cols-7">
            {[
              ["ROI", percent(profile.roi)],
              ["PnL", money(profile.pnl)],
              ["Win Rate", percent(profile.winRate, 0)],
              ["Volume", money(profile.volume)],
              ["Open Positions", count(profile.openPositions)],
              ["Conviction", count(profile.conviction)],
              ["Exposure", profile.exposure],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-white/[0.065] bg-white/[0.025] px-3 py-2">
                <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-slate-600">{label}</div>
                <div className="mt-1 truncate font-mono text-sm text-white">{value}</div>
              </div>
            ))}
          </div>
        </section>

        <Panel>
          <PanelHeader title="OracleX Wallet Read" action="Evidence-backed interpretation" />
          <CardContent className="p-4">
            <p className="max-w-5xl text-sm leading-6 text-slate-300">{profile.interpretation}</p>
          </CardContent>
        </Panel>

        <Panel>
          <PanelHeader title="Active Positions" action={profile.positions.length ? `${profile.positions.length} live positions` : "Unavailable"} />
          <CardContent className="overflow-x-auto p-0">
            {profile.positions.length ? (
              <table className="w-full min-w-[860px] text-left text-xs">
                <thead className="border-b border-white/[0.075] bg-white/[0.025] font-mono text-[10px] uppercase tracking-[0.12em] text-slate-600">
                  <tr>{["Market", "Side", "Size", "Avg Price", "Current Price", "Unrealized PnL", "Conviction", "Last Updated"].map((header) => <th key={header} className="px-4 py-3 font-medium">{header}</th>)}</tr>
                </thead>
                <tbody>
                  {profile.positions.map((position) => (
                    <tr key={`${position.market}-${position.side}`} className="border-b border-white/[0.055]">
                      <td className="px-4 py-3 font-semibold text-white">{position.market}</td>
                      <td className="px-4 py-3"><BiasBadge bias={position.side === "YES" ? "Bullish" : "Bearish"} /></td>
                      <td className="px-4 py-3 font-mono text-slate-200">{money(position.positionSize)}</td>
                      <td className="px-4 py-3 font-mono text-slate-300">{position.avgPrice}</td>
                      <td className="px-4 py-3 font-mono text-blue-100">{position.currentPrice}</td>
                      <td className={`px-4 py-3 font-mono ${position.unrealizedPnl.startsWith("+") ? "text-emerald-200" : "text-red-200"}`}>{position.unrealizedPnl}</td>
                      <td className="px-4 py-3 text-slate-300">{position.conviction}</td>
                      <td className="px-4 py-3 font-mono text-slate-500">{position.lastUpdated}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <UnavailableMessage copy="No live positions available from Falcon for this wallet." />}
          </CardContent>
        </Panel>

        <div className="grid gap-4 xl:grid-cols-2">
          <Panel>
            <PanelHeader title="Recent Position Changes" action="Latest wallet movement" />
            <CardContent className="space-y-2 p-4">
              {profile.recentChanges.map((change) => <div key={change} className="rounded-lg border border-white/[0.06] bg-white/[0.025] px-3 py-2 font-mono text-[11px] text-slate-300">{change}</div>)}
            </CardContent>
          </Panel>

          <Panel>
            <PanelHeader title="Market Exposure" action="Current risk map" />
            <CardContent className="grid gap-3 p-4 md:grid-cols-3">
              {profile.marketExposure.map((item) => (
                <div key={item.label} className="rounded-xl border border-white/[0.065] bg-white/[0.025] p-3">
                  <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-slate-600">{item.label}</div>
                  <div className={`mt-2 font-mono text-sm ${item.tone ?? "text-slate-200"}`}>{item.value}</div>
                </div>
              ))}
            </CardContent>
          </Panel>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <Panel>
            <PanelHeader title="Recent Trades" action={profile.recentTrades?.length ? `${profile.recentTrades.length} live trades` : "Unavailable"} />
            <CardContent className="space-y-2 p-4">
              {(profile.recentTrades?.length ? profile.recentTrades : []).map((trade) => (
                <div key={`${trade.market}-${trade.lastUpdated}-${trade.positionSize}`} className="rounded-lg border border-white/[0.06] bg-white/[0.025] px-3 py-2 text-xs text-slate-300">
                  <span className="font-semibold text-white">{trade.market}</span>
                  <span className="ml-2 font-mono text-blue-100">{trade.side}</span>
                  <span className="ml-2 font-mono">{money(trade.positionSize)}</span>
                  <span className="ml-2 font-mono text-slate-500">@ {trade.avgPrice}</span>
                  <span className="ml-2 font-mono text-slate-500">{trade.lastUpdated}</span>
                </div>
              ))}
              {!profile.recentTrades?.length ? <UnavailableMessage copy="No recent trades returned by Falcon for this wallet." /> : null}
            </CardContent>
          </Panel>

          <Panel>
            <PanelHeader title="Position History" action={profile.positionHistory?.length ? "PnL series" : "Unavailable"} />
            <CardContent className="grid gap-2 p-4 md:grid-cols-2">
              {(profile.positionHistory?.length ? profile.positionHistory : [{ label: "Position history", value: "unavailable" }]).slice(0, 8).map((item) => (
                <div key={`${item.label}-${item.value}`} className="rounded-lg border border-white/[0.06] bg-white/[0.025] px-3 py-2">
                  <div className="truncate font-mono text-[9px] uppercase tracking-[0.12em] text-slate-600">{item.label}</div>
                  <div className="mt-1 font-mono text-sm text-slate-200">{item.value}</div>
                </div>
              ))}
            </CardContent>
          </Panel>
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(360px,1.1fr)]">
          <Panel>
            <PanelHeader title="Related Wallets" action="Cluster context" />
            <CardContent className="space-y-3 p-4">
              {profile.relatedWallets.length ? profile.relatedWallets.map((related) => (
                <Link key={related.wallet} href={walletProfilePath(related.wallet)} className="block rounded-xl border border-white/[0.065] bg-white/[0.025] p-3 transition hover:border-blue-300/20 hover:bg-blue-300/[0.04]">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 font-mono text-xs text-blue-100"><Network className="size-4" />{shortWallet(related.wallet)}</div>
                      <div className="mt-1 font-mono text-[10px] text-slate-600">{related.tag}</div>
                    </div>
                    <div className="text-xs text-slate-300">{related.relationship}</div>
                  </div>
                </Link>
              )) : <UnavailableMessage copy="Related wallets unavailable." />}
            </CardContent>
          </Panel>

          <Panel>
            <PanelHeader title="Wallet Evidence" action="Why this wallet matters" />
            <CardContent className="space-y-2 p-4">
              {profile.evidence.map((item) => (
                <div key={item} className="flex gap-2 rounded-lg border border-white/[0.06] bg-white/[0.025] px-3 py-2 text-xs text-slate-300">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0 text-blue-200" />
                  <span>{item}</span>
                </div>
              ))}
            </CardContent>
          </Panel>
        </div>

        <Panel>
          <PanelHeader title="Historical Performance" action="Category performance summary" />
          <CardContent className="grid gap-3 p-4 md:grid-cols-4">
            {profile.performance.map((item) => (
              <div key={item.label} className="rounded-xl border border-white/[0.065] bg-white/[0.025] p-3">
                <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.12em] text-slate-600"><Wallet className="size-4 text-blue-200" />{item.label}</div>
                <div className="mt-2 text-sm text-slate-200">{item.value}</div>
              </div>
            ))}
          </CardContent>
        </Panel>
      </div>
    </FeatureGate>
  );
}
