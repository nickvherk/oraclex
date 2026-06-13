import { getPredictionMarketAnalytics, getPredictionMarketWalletProfile } from "@/lib/integrations/polymarket-analytics";
import {
  getPolymarketWalletEnrichment,
  type PolymarketClosedPosition,
  type PolymarketPosition,
  type PolymarketTrade,
  type PolymarketWalletEnrichment,
} from "@/lib/integrations/polymarket-data";
import { type WalletPosition } from "@/lib/wallet-profile-data";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get("wallet");
  const limit = numberParam(searchParams.get("limit"));
  const offset = numberParam(searchParams.get("offset"));

  if (wallet) {
    const [profile, polymarket] = await Promise.all([
      getPredictionMarketWalletProfile(wallet),
      getPolymarketWalletEnrichment(wallet),
    ]);
    return Response.json(enrichWalletProfile(profile, polymarket));
  }

  const analytics = await getPredictionMarketAnalytics({ limit, offset });
  return Response.json(analytics);
}

function numberParam(value: string | null) {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function enrichWalletProfile(profile: Awaited<ReturnType<typeof getPredictionMarketWalletProfile>>, polymarket: PolymarketWalletEnrichment) {
  const positions = polymarket.positions.map(positionToWalletPosition);
  const polymarketTrades = (polymarket.trades.length ? polymarket.trades : polymarket.activity).map(tradeToWalletPosition);
  const value = optionalNumber(polymarket.value?.value);
  const totalCurrentValue = value ?? sumNumbers(polymarket.positions.map((position) => optionalNumber(position.currentValue)));
  const totalExposure = sumNumbers(polymarket.positions.map(positionExposure));
  const largest = maxBy(polymarket.positions, positionExposure);
  const best = maxBy(polymarket.positions, (position) => optionalNumber(position.cashPnl) ?? Number.NEGATIVE_INFINITY);
  const worst = minBy(polymarket.positions, (position) => optionalNumber(position.cashPnl) ?? Number.POSITIVE_INFINITY);
  const largestExposure = largest ? positionExposure(largest) : null;
  const concentration = largestExposure && totalCurrentValue ? `${Math.round((largestExposure / totalCurrentValue) * 100)}%` : "Unavailable";
  const hasPolymarketPositions = positions.length > 0;
  const hasPolymarketTrades = polymarketTrades.length > 0;
  const closedHistory = polymarket.closedPositions.length ? polymarket.closedPositions.map(closedPositionToHistory) : [];
  const hasClosedPositions = closedHistory.length > 0;
  const dataApiOk = polymarket.calls.some((call) => call.ok);
  const livePolymarketFields = [
    "Polymarket current value",
    ...(hasPolymarketPositions ? ["Polymarket active positions"] : []),
    ...(hasPolymarketTrades ? ["Polymarket recent trades"] : []),
    ...(hasClosedPositions ? ["Polymarket closed positions"] : []),
  ];
  const unavailablePolymarketFields = [
    ...(!hasPolymarketPositions ? ["Polymarket active positions: unavailable / no rows returned"] : []),
    ...(!hasPolymarketTrades ? ["Polymarket recent trades: unavailable / no rows returned"] : []),
    ...(!hasClosedPositions ? ["Polymarket closed positions: unavailable / no rows returned"] : []),
  ];

  return {
    ...profile,
    openPositions: hasPolymarketPositions ? positions.length : 0,
    exposure: hasPolymarketPositions
      ? `${formatMoney(totalCurrentValue)} current value / ${formatMoney(totalExposure)} exposure`
      : "No active Polymarket positions found",
    interpretation: `${profile.interpretation} Polymarket Data API enrichment found ${positions.length} active positions, ${polymarketTrades.length} recent wallet-specific trades, and ${polymarket.closedPositions.length} closed positions for this wallet.`,
    positions,
    recentChanges: hasPolymarketTrades ? polymarketTrades.slice(0, 6).map(tradeToChange) : profile.recentChanges,
    recentTrades: hasPolymarketTrades ? polymarketTrades : profile.recentTrades.map((trade) => ({ ...trade, source: "Falcon" as const })),
    positionHistory: closedHistory.length ? closedHistory : [{ label: "Closed positions", value: "No closed Polymarket positions found", source: "Polymarket Data API" as const }],
    marketExposure: [
      { label: "Current value", value: formatMoney(totalCurrentValue), tone: "text-blue-100" },
      { label: "Total exposure", value: formatMoney(totalExposure), tone: "text-slate-200" },
      { label: "Active positions", value: positions.length.toLocaleString(), tone: positions.length ? "text-emerald-200" : "text-slate-500" },
      { label: "Largest position", value: largest ? `${formatTitle(largest.title)} ${formatMoney(largestExposure)}` : "Unavailable", tone: "text-blue-100" },
      { label: "Best position", value: best ? `${formatTitle(best.title)} ${formatMoney(optionalNumber(best.cashPnl))}` : "Unavailable", tone: "text-emerald-200" },
      { label: "Worst position", value: worst ? `${formatTitle(worst.title)} ${formatMoney(optionalNumber(worst.cashPnl))}` : "Unavailable", tone: "text-red-200" },
      { label: "Market concentration", value: concentration, tone: "text-slate-300" },
    ],
    evidence: [
      ...profile.evidence.filter((item) => !item.toLowerCase().includes("fallback position")),
      dataApiOk ? "Polymarket Data API responded for wallet-specific positions, value, trades, activity, and closed positions." : "Polymarket Data API enrichment unavailable for this wallet.",
      hasPolymarketPositions ? `${positions.length} active Polymarket positions found for this wallet.` : "No active Polymarket positions found for this wallet.",
      hasPolymarketTrades ? `${polymarketTrades.length} recent Polymarket trades or activity rows found for this wallet.` : "No recent Polymarket trades returned; Falcon recent trades remain the secondary fallback.",
      hasClosedPositions ? `${closedHistory.length} closed Polymarket positions found for this wallet.` : "No closed Polymarket positions returned.",
    ],
    performance: [
      ...profile.performance,
      { label: "Polymarket value", value: formatMoney(totalCurrentValue) },
      { label: "Closed positions", value: polymarket.closedPositions.length.toLocaleString() },
    ],
    sourceStatus: {
      ...profile.sourceStatus,
      label: `${profile.sourceStatus.label} Polymarket Data API checked positions, trades, value, and closed positions.`,
      liveFields: unique([
        ...profile.sourceStatus.liveFields,
        ...livePolymarketFields,
      ]),
      unavailableFields: unique([
        ...profile.sourceStatus.unavailableFields.filter((field) => {
          if (field === "active positions") return !hasPolymarketPositions;
          if (field === "recent trades") return !hasPolymarketTrades;
          if (field === "position history time series") return !hasClosedPositions;
          return true;
        }),
        ...unavailablePolymarketFields,
      ]),
    },
    polymarketData: {
      source: "Polymarket Data API",
      calls: polymarket.calls,
      value: polymarket.value,
      activePositionsLoaded: positions.length,
      recentTradesLoaded: polymarketTrades.length,
      closedPositionsLoaded: polymarket.closedPositions.length,
    },
  };
}

function positionToWalletPosition(position: PolymarketPosition): WalletPosition {
  const cashPnl = optionalNumber(position.cashPnl);

  return {
    market: formatTitle(position.title),
    side: outcomeSide(position.outcome),
    positionSize: positionExposure(position) ?? 0,
    avgPrice: formatPrice(position.avgPrice),
    currentPrice: formatPrice(position.curPrice),
    unrealizedPnl: formatMoney(cashPnl),
    conviction: convictionFromPnl(cashPnl),
    lastUpdated: position.endDate ? `Resolves ${position.endDate}` : "Live position",
    source: "Polymarket Data API",
    slug: position.slug,
    outcome: position.outcome,
    size: optionalNumber(position.size),
    currentValue: optionalNumber(position.currentValue),
    cashPnl,
    percentPnl: optionalNumber(position.percentPnl),
    realizedPnl: optionalNumber(position.realizedPnl),
    conditionId: position.conditionId,
    asset: position.asset,
  };
}

function tradeToWalletPosition(trade: PolymarketTrade): WalletPosition {
  const size = optionalNumber(trade.size);
  const price = optionalNumber(trade.price);
  const positionSize = size !== null && price !== null ? size * price : size ?? 0;

  return {
    market: formatTitle(trade.title),
    side: outcomeSide(trade.outcome),
    positionSize,
    avgPrice: formatPrice(price),
    currentPrice: "Unavailable",
    unrealizedPnl: "Unavailable",
    conviction: "Watch",
    lastUpdated: trade.timestamp ? timeAgo(trade.timestamp) : "Live trade",
    source: "Polymarket Data API",
    slug: trade.slug,
    outcome: trade.outcome,
    size,
    price,
    timestamp: optionalNumber(trade.timestamp),
    conditionId: trade.conditionId,
    asset: trade.asset,
    tradeSide: trade.side,
  };
}

function closedPositionToHistory(position: PolymarketClosedPosition) {
  const realizedPnl = optionalNumber(position.realizedPnl);
  const percentPnl = optionalNumber(position.percentPnl ?? position.percentRealizedPnl);

  return {
    label: formatTitle(position.title),
    value: `${formatMoney(realizedPnl)} realized${percentPnl === null ? "" : ` / ${formatPercent(percentPnl)}`}`,
    market: formatTitle(position.title),
    realizedPnl,
    percentPnl,
    outcome: position.outcome,
    timestamp: optionalNumber(position.timestamp),
    source: "Polymarket Data API" as const,
  };
}

function tradeToChange(trade: WalletPosition) {
  const side = trade.tradeSide ? `${trade.tradeSide} ` : "";
  const outcome = trade.outcome ? `${trade.outcome} ` : "";
  return `${side}${formatMoney(trade.positionSize)} ${outcome}on ${trade.market} at ${trade.avgPrice} (Source: ${trade.source})`;
}

function positionExposure(position: PolymarketPosition) {
  const currentValue = optionalNumber(position.currentValue);
  if (currentValue !== null) return currentValue;
  const size = optionalNumber(position.size);
  const price = optionalNumber(position.curPrice ?? position.avgPrice);
  if (size === null || price === null) return null;
  return size * price;
}

function optionalNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value.replace(/[$,%]/g, ""));
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function sumNumbers(values: Array<number | null>) {
  return values.reduce<number>((sum, value) => sum + (value ?? 0), 0);
}

function maxBy<T>(items: T[], score: (item: T) => number | null) {
  return items.reduce<T | null>((best, item) => {
    const value = score(item);
    if (value === null || !Number.isFinite(value)) return best;
    if (!best) return item;
    const bestValue = score(best);
    return bestValue === null || value > bestValue ? item : best;
  }, null);
}

function minBy<T>(items: T[], score: (item: T) => number | null) {
  return items.reduce<T | null>((worst, item) => {
    const value = score(item);
    if (value === null || !Number.isFinite(value)) return worst;
    if (!worst) return item;
    const worstValue = score(worst);
    return worstValue === null || value < worstValue ? item : worst;
  }, null);
}

function outcomeSide(outcome: unknown): "YES" | "NO" {
  return typeof outcome === "string" && outcome.toLowerCase().includes("no") ? "NO" : "YES";
}

function convictionFromPnl(value: number | null): WalletPosition["conviction"] {
  if (value === null) return "Watch";
  if (value > 10000) return "High";
  if (value > 0) return "Medium";
  return "Watch";
}

function formatTitle(value: unknown) {
  return typeof value === "string" && value.trim() ? value : "Unknown market";
}

function formatPrice(value: unknown) {
  const parsed = optionalNumber(value);
  return parsed === null ? "Unavailable" : parsed.toFixed(3);
}

function formatMoney(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "Unavailable";
  const sign = value < 0 ? "-" : "";
  const absolute = Math.abs(value);
  if (absolute >= 1000000) return `${sign}$${(absolute / 1000000).toFixed(1)}M`;
  if (absolute >= 1000) return `${sign}$${(absolute / 1000).toFixed(1)}K`;
  return `${sign}$${absolute.toFixed(2)}`;
}

function formatPercent(value: number | null) {
  if (value === null) return "Unavailable";
  return `${value.toFixed(1)}%`;
}

function timeAgo(timestamp: number) {
  const milliseconds = timestamp > 1000000000000 ? timestamp : timestamp * 1000;
  const minutes = Math.max(1, Math.round((Date.now() - milliseconds) / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 1440) return `${Math.round(minutes / 60)}h ago`;
  return `${Math.round(minutes / 1440)}d ago`;
}

function unique(values: string[]) {
  return values.filter((value, index, array) => array.indexOf(value) === index);
}
