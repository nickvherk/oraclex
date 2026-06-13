import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { FeatureGate } from "@/components/terminal/access-gate";
import { Panel, PanelHeader } from "@/components/terminal/terminal-shell";
import { Badge } from "@/components/ui/badge";
import { CardContent } from "@/components/ui/card";
import { getHyperliquidWalletProfile, type HyperliquidWalletProfilePayload } from "@/lib/integrations/hyperliquid-wallet-profile";

export const dynamic = "force-dynamic";

type WalletProfilePageProps = {
  params: Promise<{ wallet: string }>;
};

export default async function HyperliquidWalletProfilePage({ params }: WalletProfilePageProps) {
  const { wallet } = await params;
  const profile = await loadProfile(wallet);

  return (
    <FeatureGate feature="crossMarketFlows" explanation="Hyperliquid Wallet Profiles are part of the Operator terminal and Enterprise workspace.">
      <div className="grid gap-4">
        <section className="rounded-xl border border-white/[0.075] bg-[#070b14]/86 p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <Link href="/terminal/flows" className="mb-4 inline-flex h-8 items-center gap-2 rounded-lg border border-white/[0.08] px-2 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-400 hover:text-blue-100">
                <ArrowLeft className="size-3.5" />
                Hyperliquid Flows
              </Link>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge className="h-6 rounded-lg border border-blue-300/15 bg-blue-300/[0.07] font-mono text-[10px] uppercase text-blue-100">Hyperliquid Wallet Profile</Badge>
                {profile?.liveRefreshAvailable ? (
                  <Badge className="h-6 rounded-lg border border-emerald-300/18 bg-emerald-300/[0.08] font-mono text-[10px] uppercase text-emerald-100">Live clearinghouseState</Badge>
                ) : null}
                {profile?.message ? <Badge className="h-6 rounded-lg border border-amber-200/20 bg-amber-200/[0.06] font-mono text-[10px] uppercase text-amber-100">{profile.message}</Badge> : null}
              </div>
              <h1 className="text-2xl font-semibold tracking-[-0.03em] text-white">Hyperliquid Wallet Profile</h1>
              <p className="mt-2 break-all font-mono text-xs text-slate-400">{wallet}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-500 sm:grid-cols-4">
              <span>Discovery</span>
              <span>Positions</span>
              <span>Fills</span>
              <span>Storage</span>
            </div>
          </div>
        </section>

        {!profile || !profile.walletFound ? (
          <Panel>
            <CardContent className="p-4">
              <div className="rounded-xl border border-amber-200/15 bg-amber-200/[0.04] p-4">
                <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-amber-100">Wallet unavailable</div>
                <p className="mt-2 text-sm leading-6 text-slate-300">Wallet not found in tracked Hyperliquid universe.</p>
              </div>
            </CardContent>
          </Panel>
        ) : (
          <>
            <Panel>
              <PanelHeader title="Wallet Overview" action={profile.snapshotSource === "live" ? "Live refresh" : "Stored snapshot"} />
              <CardContent className="p-4">
                <div className="grid gap-2 md:grid-cols-3 xl:grid-cols-4">
                  {[
                    ["Wallet", profile.wallet.address],
                    ["OracleX Rank", profile.wallet.rank ? `#${profile.wallet.rank}` : "Unranked"],
                    ["Whale Score", profile.wallet.whaleScore !== null ? `${profile.wallet.whaleScore}` : "Unavailable"],
                    ["Account Value", money(profile.wallet.accountValue)],
                    ["Gross Exposure", money(profile.wallet.grossExposure)],
                    ["Net Exposure", money(profile.wallet.netExposure)],
                    ["Unrealized PnL", money(profile.wallet.unrealizedPnl)],
                    ["Average Leverage", leverage(profile.wallet.avgLeverage)],
                    ["Last Seen", formatDateTime(profile.wallet.lastSeenAt)],
                    ["Assets Seen", profile.wallet.assetsSeen.length ? profile.wallet.assetsSeen.join(", ") : "Unavailable"],
                    ["Position Count", `${profile.wallet.positionCount}`],
                    ["Observed Volume", money(profile.wallet.observedVolumeUsd)],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-lg border border-white/[0.065] bg-white/[0.025] px-3 py-2">
                      <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-slate-600">{label}</div>
                      <div className="mt-1 break-words text-xs leading-5 text-white">{value}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Panel>

            <Panel>
              <PanelHeader title="Current Positions" action="clearinghouseState" />
              <CardContent className="overflow-x-auto p-0">
                <table className="w-full min-w-[1120px] text-left text-xs">
                  <thead className="border-b border-white/[0.075] bg-white/[0.025] font-mono text-[10px] uppercase tracking-[0.12em] text-slate-600">
                    <tr>{["Asset", "Direction", "Size", "Entry Price", "Mark Price", "Position Value", "Leverage", "Unrealized PnL", "Liquidation Price", "Liquidation Distance"].map((header) => <th key={header} className="px-4 py-3 font-medium">{header}</th>)}</tr>
                  </thead>
                  <tbody>
                    {profile.positions.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="px-4 py-8 text-center text-sm text-slate-400">No current positions available for this wallet.</td>
                      </tr>
                    ) : null}
                    {profile.positions.map((position) => (
                      <tr key={`${position.asset}-${position.direction}-${position.size}`} className="border-b border-white/[0.055]">
                        <td className="px-4 py-3 font-mono text-white">{position.asset}</td>
                        <td className={`px-4 py-3 ${position.direction === "long" ? "text-emerald-200" : position.direction === "short" ? "text-red-200" : "text-slate-300"}`}>{position.direction}</td>
                        <td className="px-4 py-3 font-mono text-slate-200">{number(position.size)}</td>
                        <td className="px-4 py-3 font-mono text-slate-200">{price(position.entryPrice)}</td>
                        <td className="px-4 py-3 font-mono text-slate-200">{price(position.markPrice)}</td>
                        <td className="px-4 py-3 font-mono text-white">{money(position.positionValue)}</td>
                        <td className="px-4 py-3 font-mono text-slate-200">{leverage(position.leverage)}</td>
                        <td className={`px-4 py-3 font-mono ${position.unrealizedPnl >= 0 ? "text-emerald-200" : "text-red-200"}`}>{money(position.unrealizedPnl)}</td>
                        <td className="px-4 py-3 font-mono text-slate-200">{price(position.liquidationPrice)}</td>
                        <td className="px-4 py-3 font-mono text-slate-200">{percent(position.distanceToLiquidationPct)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Panel>

            <Panel>
              <PanelHeader title="Recent Fills" action="userFills" />
              <CardContent className="overflow-x-auto p-0">
                {profile.recentFills.length === 0 ? (
                  <div className="p-4 text-sm leading-6 text-slate-300">No recent fills available for this wallet.</div>
                ) : (
                  <table className="w-full min-w-[900px] text-left text-xs">
                    <thead className="border-b border-white/[0.075] bg-white/[0.025] font-mono text-[10px] uppercase tracking-[0.12em] text-slate-600">
                      <tr>{["Asset", "Side", "Price", "Size", "Notional", "Closed PnL", "Time"].map((header) => <th key={header} className="px-4 py-3 font-medium">{header}</th>)}</tr>
                    </thead>
                    <tbody>
                      {profile.recentFills.map((fill, index) => (
                        <tr key={`${fill.asset}-${fill.time}-${index}`} className="border-b border-white/[0.055]">
                          <td className="px-4 py-3 font-mono text-white">{fill.asset ?? "Unavailable"}</td>
                          <td className="px-4 py-3 text-slate-200">{fill.side ?? "Unavailable"}</td>
                          <td className="px-4 py-3 font-mono text-slate-200">{price(fill.price)}</td>
                          <td className="px-4 py-3 font-mono text-slate-200">{number(fill.size)}</td>
                          <td className="px-4 py-3 font-mono text-white">{money(fill.notional)}</td>
                          <td className={`px-4 py-3 font-mono ${(fill.closedPnl ?? 0) >= 0 ? "text-emerald-200" : "text-red-200"}`}>{money(fill.closedPnl)}</td>
                          <td className="px-4 py-3 font-mono text-slate-500">{formatDateTime(fill.time)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Panel>

            <Panel>
              <PanelHeader title="Wallet Interpretation" action="OracleX interpretation" />
              <CardContent className="space-y-4 p-4">
                <p className="text-sm leading-6 text-slate-300">{buildInterpretation(profile)}</p>
                <div className="grid gap-2 md:grid-cols-4">
                  {[
                    ["Discovery", "recentTrades"],
                    ["Positions", "clearinghouseState"],
                    ["Fills", "userFills"],
                    ["Stored snapshots", "Supabase"],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-lg border border-white/[0.065] bg-white/[0.025] px-3 py-2">
                      <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-slate-600">{label}</div>
                      <div className="mt-1 flex items-center gap-2 text-xs leading-5 text-white">
                        {value}
                        <ExternalLink className="size-3 text-slate-600" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Panel>
          </>
        )}
      </div>
    </FeatureGate>
  );
}

async function loadProfile(wallet: string) {
  try {
    return await getHyperliquidWalletProfile(wallet);
  } catch {
    return null;
  }
}

function buildInterpretation(profile: HyperliquidWalletProfilePayload) {
  const primary = [...profile.positions].sort((a, b) => Math.abs(b.positionValue) - Math.abs(a.positionValue))[0];
  const primaryAsset = primary?.asset ?? profile.wallet.assetsSeen[0] ?? "no active asset";
  const netDirection = profile.wallet.netExposure > 0 ? "net long" : profile.wallet.netExposure < 0 ? "net short" : "flat";
  return `This wallet is currently primarily exposed to ${primaryAsset}, with ${netDirection} direction and ${leverage(profile.wallet.avgLeverage)} leverage.`;
}

function money(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "Unavailable";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function price(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "Unavailable";
  if (Math.abs(value) >= 1000) return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  if (Math.abs(value) >= 1) return `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  return `$${value.toLocaleString(undefined, { maximumFractionDigits: 6 })}`;
}

function number(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "Unavailable";
  return value.toLocaleString(undefined, { maximumFractionDigits: 6 });
}

function leverage(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "Unavailable";
  return `${value.toFixed(1)}x`;
}

function percent(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "Unavailable";
  return `${value.toFixed(2)}%`;
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "Unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unavailable";
  return date.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}
