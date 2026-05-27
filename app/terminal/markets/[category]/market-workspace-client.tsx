"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, ArrowDownRight, ArrowUpRight, BrainCircuit, CircleDot, Database, Lock, Radio, RefreshCw, TrendingUp, Wallet, Waves } from "lucide-react";

import { PremiumLockedOverlay } from "@/components/terminal/access-gate";
import { BiasBadge, Panel, PanelHeader } from "@/components/terminal/terminal-shell";
import { Badge } from "@/components/ui/badge";
import { CardContent } from "@/components/ui/card";
import { MarketWorkspaceData, MarketWorkspaceMarket, SignalSeverity } from "@/lib/market-workspaces-data";
import { useCurrentPlan } from "@/lib/access-control";

type HyperliquidAsset = {
  asset: string;
  netFlow7d: number;
  flowVsAvg: number;
  topTraderBias: string;
  openInterestChange: number;
  longShortRatio: string;
  abnormalFlowIndex: number;
  capitalRotationScore: number;
  hyperliquid?: {
    volume24h?: number;
    dailyPriceChange?: number;
    fundingRate?: number | null;
    flowBias?: string;
  };
};

type HyperliquidPayload = {
  source?: string;
  updatedAt?: string;
  assets?: HyperliquidAsset[];
};

const severityTone: Record<SignalSeverity, string> = {
  Informational: "border-slate-300/15 bg-slate-300/[0.06] text-slate-300",
  Elevated: "border-blue-300/20 bg-blue-300/[0.08] text-blue-100",
  "High Conviction": "border-amber-300/25 bg-amber-300/[0.09] text-amber-100",
  Critical: "border-red-300/25 bg-red-300/[0.1] text-red-100",
};

const metricIcons = [Database, BrainCircuit, Wallet, TrendingUp];

function signed(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}`;
}

function probability(value: number) {
  return `${value.toFixed(1)}%`;
}

function divergence(market: Pick<MarketWorkspaceMarket, "oracleProbability" | "probability">) {
  return market.oracleProbability - market.probability;
}

function formatUsd(value: number) {
  const abs = Math.abs(value);
  if (abs >= 1000000000) return `$${(value / 1000000000).toFixed(1)}B`;
  if (abs >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (abs >= 1000) return `$${(value / 1000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

function SeverityPill({ severity }: { severity: SignalSeverity }) {
  return <Badge className={`h-6 whitespace-nowrap rounded-lg border px-2 font-mono text-[10px] uppercase ${severityTone[severity]}`}>{severity}</Badge>;
}

function ObserverLockCard() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-blue-300/16 bg-blue-300/[0.045] p-4">
      <div className="blur-[2px]">
        <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500">Deeper intelligence</div>
        <div className="mt-3 h-3 w-2/3 rounded bg-white/[0.08]" />
        <div className="mt-2 h-3 w-5/6 rounded bg-white/[0.06]" />
        <div className="mt-2 h-3 w-1/2 rounded bg-white/[0.06]" />
      </div>
      <PremiumLockedOverlay copy="Upgrade to Analyst for full market intelligence" cta="Upgrade to Analyst" compact />
    </div>
  );
}

export function MarketWorkspaceClient({ workspace }: { workspace: MarketWorkspaceData }) {
  const { plan } = useCurrentPlan();
  const isObserver = plan === "observer";
  const visibleMarkets = isObserver ? workspace.markets.slice(0, 2) : workspace.markets;
  const [selectedId, setSelectedId] = useState(workspace.markets[0].id);
  const selected = visibleMarkets.find((market) => market.id === selectedId) ?? visibleMarkets[0] ?? workspace.markets[0];
  const [flows, setFlows] = useState<HyperliquidPayload | null>(null);

  useEffect(() => {
    if (workspace.slug !== "crypto") return;

    let active = true;
    fetch("/api/hyperliquid-flows")
      .then((response) => response.json())
      .then((payload: HyperliquidPayload) => {
        if (active) setFlows(payload);
      })
      .catch(() => {
        if (active) setFlows({ source: "unavailable", assets: [] });
      });

    return () => {
      active = false;
    };
  }, [workspace.slug]);

  const metrics = useMemo(
    () => [
      ["Active Markets", workspace.metrics.activeMarkets, "category markets scanned"],
      ["OracleX Signal Score", workspace.metrics.signalScore, "weighted category confidence"],
      ["Smart Money Activity", workspace.metrics.smartMoneyActivity, "tracked wallet delta"],
      ["Narrative Momentum", workspace.metrics.narrativeMomentum, "6h propagation velocity"],
    ],
    [workspace.metrics],
  );

  const liveFlowSummary = flows?.assets?.slice(0, 4) ?? [];

  return (
    <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_390px]">
      <div className="grid min-w-0 gap-4">
        <section className="rounded-xl border border-blue-300/15 bg-blue-300/[0.045] p-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="mb-3 inline-flex items-center gap-2 rounded-lg border border-emerald-300/20 bg-emerald-300/[0.06] px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-emerald-200">
                <span className="size-1.5 rounded-full bg-emerald-300" />
                {workspace.badge}
              </div>
              <h1 className="text-2xl font-semibold tracking-[-0.03em] text-white">{workspace.title}</h1>
              <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-400">{workspace.description}</p>
            </div>
            {isObserver ? (
              <div className="flex items-center gap-2 rounded-xl border border-blue-300/15 bg-blue-300/[0.055] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-blue-100">
                <Lock className="size-3.5" />
                Observer preview
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.035] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-300">
                <RefreshCw className="size-3.5 text-blue-200" />
                Monitoring
              </div>
            )}
          </div>
        </section>

        <div className="grid gap-4 lg:grid-cols-4">
          {metrics.map(([label, value, detail], index) => {
            const Icon = metricIcons[index] ?? Activity;
            return (
              <Panel key={label}>
                <CardContent className="p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500">{label}</span>
                    <Icon className="size-4 text-blue-200" />
                  </div>
                  <div className="font-mono text-3xl tracking-[-0.05em] text-white">{value}</div>
                  <div className="mt-2 text-xs text-blue-200">{detail}</div>
                </CardContent>
              </Panel>
            );
          })}
        </div>

        {workspace.slug === "crypto" ? (
          <Panel>
            <PanelHeader title="Hyperliquid Flow Confirmation" action={flows?.source === "hyperliquid" ? "Live venue data" : "Using workspace baseline"} />
            <CardContent className="grid gap-3 p-4 md:grid-cols-4">
              {(liveFlowSummary.length ? liveFlowSummary : workspace.signalCards).map((item) => {
                if ("asset" in item) {
                  const bias = item.hyperliquid?.flowBias ?? (item.topTraderBias === "Long-heavy" ? "Bullish" : item.topTraderBias === "Short-heavy" ? "Bearish" : "Neutral");
                  return (
                    <div key={item.asset} className="rounded-xl border border-white/[0.075] bg-black/28 p-4">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div className="font-mono text-lg tracking-[-0.04em] text-white">{item.asset}</div>
                        <BiasBadge bias={bias} />
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="rounded-lg bg-white/[0.035] p-2">
                          <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-slate-600">Net flow proxy</div>
                          <div className="mt-1 font-mono text-blue-100">{formatUsd(item.netFlow7d)}</div>
                        </div>
                        <div className="rounded-lg bg-white/[0.035] p-2">
                          <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-slate-600">OI pressure</div>
                          <div className="mt-1 font-mono text-slate-200">{signed(item.openInterestChange)}%</div>
                        </div>
                      </div>
                      <p className="mt-3 text-xs leading-5 text-slate-400">Abnormal flow {item.abnormalFlowIndex}, rotation {item.capitalRotationScore}, long/short {item.longShortRatio}.</p>
                    </div>
                  );
                }

                return (
                  <div key={item.title} className="rounded-xl border border-white/[0.075] bg-black/28 p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div className="font-mono text-lg tracking-[-0.04em] text-white">{item.title}</div>
                      <BiasBadge bias={item.bias} />
                    </div>
                    <div className="text-sm font-semibold text-blue-100">{item.value}</div>
                    <p className="mt-2 text-xs leading-5 text-slate-400">{item.detail}</p>
                  </div>
                );
              })}
            </CardContent>
          </Panel>
        ) : (
          <Panel>
            <PanelHeader title="Category Signal Cards" action="Context" />
            <CardContent className="grid gap-3 p-4 md:grid-cols-4">
              {workspace.signalCards.map((card) => (
                <div key={card.title} className="rounded-xl border border-white/[0.075] bg-black/28 p-4">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <h2 className="text-sm font-semibold text-white">{card.title}</h2>
                    <BiasBadge bias={card.bias} />
                  </div>
                  <div className="font-mono text-xl tracking-[-0.04em] text-blue-100">{card.value}</div>
                  <p className="mt-2 text-xs leading-5 text-slate-400">{card.detail}</p>
                </div>
              ))}
            </CardContent>
          </Panel>
        )}

        <Panel>
          <PanelHeader title="Market Intelligence Table" action={isObserver ? "2 market preview" : "Category filtered"} />
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-left text-xs">
                <thead className="border-b border-white/[0.075] bg-white/[0.02] font-mono text-[10px] uppercase tracking-[0.12em] text-slate-600">
                  <tr>
                    {["Market", "Category", "Probability", "OracleX Probability", "Spread / Divergence", "Volume", "Smart Money Bias", "Signal Severity", "Last Update"].map((header) => (
                      <th key={header} className="px-4 py-3 font-medium">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visibleMarkets.map((market) => {
                    const gap = divergence(market);
                    const active = selected.id === market.id;
                    return (
                      <tr key={market.id} onClick={() => setSelectedId(market.id)} className={`cursor-pointer border-b border-white/[0.055] transition hover:bg-blue-300/[0.035] ${active ? "bg-blue-300/[0.055]" : "bg-transparent"}`}>
                        <td className="px-4 py-3">
                          <div className="max-w-[270px] font-semibold leading-5 text-white">{market.title}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-400">{market.categoryLabel}</td>
                        <td className="px-4 py-3 font-mono text-slate-200">{probability(market.probability)}</td>
                        <td className="px-4 py-3 font-mono text-blue-100">{probability(market.oracleProbability)}</td>
                        <td className={`px-4 py-3 font-mono ${gap >= 0 ? "text-emerald-200" : "text-red-200"}`}>
                          <span className="inline-flex items-center gap-1">
                            {gap >= 0 ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
                            {signed(gap)} pts
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-300">{market.volume}</td>
                        <td className="px-4 py-3"><BiasBadge bias={market.smartMoneyBias} /></td>
                        <td className="px-4 py-3"><SeverityPill severity={market.signalSeverity} /></td>
                        <td className="px-4 py-3 font-mono text-slate-500">{market.lastUpdate}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Panel>

        {isObserver ? <ObserverLockCard /> : null}

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <Panel>
            <PanelHeader title="Intelligence Feed" action={isObserver ? "Limited" : "Recent signals"} />
            <CardContent className="space-y-2 p-4">
              {(isObserver ? workspace.feed.slice(0, 2) : workspace.feed).map((signal) => (
                <div key={`${signal.time}-${signal.title}`} className="rounded-xl border border-white/[0.065] bg-black/28 p-3">
                  <div className="flex items-start gap-3">
                    <CircleDot className="mt-0.5 size-3.5 shrink-0 text-blue-200" />
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[10px] text-slate-600">{signal.time}</span>
                        <SeverityPill severity={signal.severity} />
                        <BiasBadge bias={signal.bias} />
                      </div>
                      <h2 className="text-sm font-semibold text-white">{signal.title}</h2>
                      <p className="mt-1 text-xs leading-5 text-slate-400">{signal.detail}</p>
                    </div>
                    <span className="shrink-0 font-mono text-[10px] text-blue-200">{signal.value}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Panel>

          <Panel>
            <PanelHeader title="Category Insights" action="Analyst read" />
            <CardContent className="space-y-3 p-4">
              {[
                ["What is moving", workspace.insights.moving, Waves],
                ["Why it matters", workspace.insights.matters, Radio],
                ["Confirming or diverging", workspace.insights.confirmation, Activity],
                ["Interpretation", workspace.insights.interpretation, BrainCircuit],
              ].map(([label, text, Icon]) => (
                <div key={label as string} className="rounded-xl border border-white/[0.065] bg-white/[0.025] p-3">
                  <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-blue-100">
                    <Icon className="size-3.5" />
                    {label as string}
                  </div>
                  <p className="text-xs leading-5 text-slate-400">{text as string}</p>
                </div>
              ))}
            </CardContent>
          </Panel>
        </div>
      </div>

      <aside className="grid gap-4 2xl:sticky 2xl:top-5 2xl:self-start">
        <Panel>
          <PanelHeader title="Selected Market" action={selected.categoryLabel} />
          <CardContent className="p-4">
            <div className="mb-4">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge className="h-6 rounded-lg border border-blue-300/15 bg-blue-300/[0.07] font-mono text-[10px] text-blue-100">{selected.categoryLabel}</Badge>
                <SeverityPill severity={selected.signalSeverity} />
              </div>
              <h2 className="text-xl font-semibold leading-tight tracking-[-0.03em] text-white">{selected.title}</h2>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                ["Market", probability(selected.probability)],
                ["OracleX", probability(selected.oracleProbability)],
                ["Divergence", `${signed(divergence(selected))} pts`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-white/[0.065] bg-white/[0.025] p-3">
                  <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-slate-600">{label}</div>
                  <div className="mt-2 font-mono text-lg tracking-[-0.04em] text-white">{value}</div>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-3">
              {[
                ["Smart money summary", selected.smartMoneySummary],
                ["Narrative context", selected.narrativeContext],
                ["AI interpretation", selected.aiInterpretation],
                ["What to watch next", selected.watchNext],
              ].map(([label, text]) => (
                <div key={label} className="rounded-xl border border-white/[0.065] bg-black/28 p-3">
                  <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500">{label}</div>
                  <p className="text-xs leading-5 text-slate-300">{text}</p>
                </div>
              ))}

              <div className="rounded-xl border border-white/[0.065] bg-black/28 p-3">
                <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500">Related flows</div>
                <div className="space-y-2">
                  {selected.relatedFlows.map((flow) => (
                    <div key={flow} className="flex items-start gap-2 text-xs leading-5 text-slate-300">
                      <CircleDot className="mt-1 size-2.5 shrink-0 text-blue-200" />
                      {flow}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Panel>
      </aside>
    </div>
  );
}
