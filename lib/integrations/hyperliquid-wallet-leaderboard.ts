import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { normalizeAssetSymbol } from "@/lib/tracked-hyperliquid-assets";

const MAX_SNAPSHOT_ROWS = 1000;
const MAX_POSITION_ROWS = 5000;
const DEFAULT_LIMIT = 50;

type WalletRow = {
  wallet_address: string;
  first_seen_at: string | null;
  last_seen_at: string | null;
  assets_seen: string[] | null;
  observed_trade_count: number | string | null;
  observed_volume_usd: number | string | null;
};

type SnapshotRow = {
  wallet_address: string;
  snapshot_at: string;
  account_value: number | string | null;
  total_notional_position: number | string | null;
  gross_exposure: number | string | null;
  net_exposure: number | string | null;
  avg_leverage: number | string | null;
  position_count: number | string | null;
  unrealized_pnl: number | string | null;
};

type PositionRow = {
  wallet_address: string;
  snapshot_at: string;
  asset: string;
  direction: "long" | "short" | "flat" | string;
  position_value: number | string | null;
  leverage: number | string | null;
  unrealized_pnl: number | string | null;
};

export type HyperliquidTrackedWallet = {
  wallet: string;
  rank: number;
  whaleScore: number;
  accountValue: number;
  primaryAsset: string | null;
  direction: "Long" | "Short" | "Mixed" | "Flat";
  grossExposure: number;
  netExposure: number;
  avgLeverage: number;
  unrealizedPnl: number;
  positionCount: number;
  lastSeenAt: string | null;
  assetsSeen: string[];
};

export type HyperliquidWalletExposureSummary = {
  wallet: string;
  rank: number;
  notional: number;
  accountValue: number;
};

export type HyperliquidAssetExposure = {
  asset: string;
  longWalletCount: number;
  shortWalletCount: number;
  longNotional: number;
  shortNotional: number;
  netNotional: number;
  longShortRatio: string;
  topLongWallets: HyperliquidWalletExposureSummary[];
  topShortWallets: HyperliquidWalletExposureSummary[];
};

export type HyperliquidWalletLeaderboardPayload = {
  source: "oraclex-discovered-hyperliquid-wallets";
  method: "recentTrades discovery + clearinghouseState enrichment";
  officialHyperliquidLeaderboard: false;
  updatedAt: string;
  stats: {
    discoveredWallets: number;
    enrichedWallets: number;
    latestIngestTime: string | null;
  };
  wallets: HyperliquidTrackedWallet[];
  assetExposures: HyperliquidAssetExposure[];
  selectedAssetExposure: HyperliquidAssetExposure | null;
};

export async function getHyperliquidWalletLeaderboard(asset?: string | null, limit = DEFAULT_LIMIT): Promise<HyperliquidWalletLeaderboardPayload> {
  const supabase = createSupabaseAdminClient();
  const normalizedAsset = asset ? normalizeAssetSymbol(asset) ?? asset.toUpperCase() : null;

  const [{ count: discoveredWallets, error: countError }, { data: wallets, error: walletsError }, { data: snapshots, error: snapshotsError }] = await Promise.all([
    supabase.from("hyperliquid_discovered_wallets").select("wallet_address", { count: "exact", head: true }),
    supabase
      .from("hyperliquid_discovered_wallets")
      .select("wallet_address, first_seen_at, last_seen_at, assets_seen, observed_trade_count, observed_volume_usd")
      .eq("is_active", true)
      .order("last_seen_at", { ascending: false })
      .limit(MAX_SNAPSHOT_ROWS),
    supabase
      .from("hyperliquid_wallet_snapshots")
      .select("wallet_address, snapshot_at, account_value, total_notional_position, gross_exposure, net_exposure, avg_leverage, position_count, unrealized_pnl")
      .order("snapshot_at", { ascending: false })
      .limit(MAX_SNAPSHOT_ROWS),
  ]);

  if (countError) throw new Error(`Failed to count Hyperliquid discovered wallets: ${countError.message}`);
  if (walletsError) throw new Error(`Failed to load Hyperliquid discovered wallets: ${walletsError.message}`);
  if (snapshotsError) throw new Error(`Failed to load Hyperliquid wallet snapshots: ${snapshotsError.message}`);

  const latestSnapshots = dedupeLatestSnapshots((snapshots ?? []) as SnapshotRow[]);
  const snapshotWallets = Array.from(latestSnapshots.keys());
  const positions = await loadLatestPositions(snapshotWallets, latestSnapshots);
  const positionsByWallet = groupPositionsByWallet(positions);
  const walletMeta = new Map(((wallets ?? []) as WalletRow[]).map((wallet) => [wallet.wallet_address, wallet]));

  const rankedWallets = Array.from(latestSnapshots.values())
    .map((snapshot) => {
      const walletPositions = positionsByWallet.get(snapshot.wallet_address) ?? [];
      return buildTrackedWallet(snapshot, walletMeta.get(snapshot.wallet_address), walletPositions);
    })
    .sort((a, b) => b.whaleScore - a.whaleScore)
    .map((wallet, index) => ({ ...wallet, rank: index + 1 }));

  const assetExposures = buildAssetExposures(positions, rankedWallets);

  return {
    source: "oraclex-discovered-hyperliquid-wallets",
    method: "recentTrades discovery + clearinghouseState enrichment",
    officialHyperliquidLeaderboard: false,
    updatedAt: new Date().toISOString(),
    stats: {
      discoveredWallets: discoveredWallets ?? 0,
      enrichedWallets: latestSnapshots.size,
      latestIngestTime: getLatestSnapshotTime(latestSnapshots),
    },
    wallets: rankedWallets.slice(0, Math.max(1, Math.min(limit, 200))),
    assetExposures,
    selectedAssetExposure: normalizedAsset ? assetExposures.find((exposure) => exposure.asset === normalizedAsset) ?? null : null,
  };
}

async function loadLatestPositions(wallets: string[], latestSnapshots: Map<string, SnapshotRow>) {
  if (wallets.length === 0) return [];

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("hyperliquid_positions")
    .select("wallet_address, snapshot_at, asset, direction, position_value, leverage, unrealized_pnl")
    .in("wallet_address", wallets)
    .order("snapshot_at", { ascending: false })
    .limit(MAX_POSITION_ROWS);

  if (error) throw new Error(`Failed to load Hyperliquid positions: ${error.message}`);

  return ((data ?? []) as PositionRow[]).filter((position) => latestSnapshots.get(position.wallet_address)?.snapshot_at === position.snapshot_at);
}

function dedupeLatestSnapshots(snapshots: SnapshotRow[]) {
  const latest = new Map<string, SnapshotRow>();
  snapshots.forEach((snapshot) => {
    if (!latest.has(snapshot.wallet_address)) latest.set(snapshot.wallet_address, snapshot);
  });
  return latest;
}

function buildTrackedWallet(snapshot: SnapshotRow, wallet: WalletRow | undefined, positions: PositionRow[]): HyperliquidTrackedWallet {
  const accountValue = toNumber(snapshot.account_value);
  const grossExposure = toNumber(snapshot.gross_exposure) || toNumber(snapshot.total_notional_position);
  const netExposure = toNumber(snapshot.net_exposure);
  const avgLeverage = toNumber(snapshot.avg_leverage);
  const unrealizedPnl = toNumber(snapshot.unrealized_pnl);
  const positionCount = toNumber(snapshot.position_count) || positions.filter((position) => position.direction !== "flat").length;
  const primaryPosition = positions
    .filter((position) => position.direction === "long" || position.direction === "short")
    .sort((a, b) => Math.abs(toNumber(b.position_value)) - Math.abs(toNumber(a.position_value)))[0];
  const assetsSeen = normalizeAssets([...(wallet?.assets_seen ?? []), ...positions.map((position) => position.asset)]);

  return {
    wallet: snapshot.wallet_address,
    rank: 0,
    accountValue,
    primaryAsset: primaryPosition ? normalizeAssetSymbol(primaryPosition.asset) ?? primaryPosition.asset.toUpperCase() : assetsSeen[0] ?? null,
    direction: getWalletDirection(netExposure, positions),
    grossExposure,
    netExposure,
    avgLeverage,
    unrealizedPnl,
    positionCount,
    lastSeenAt: wallet?.last_seen_at ?? snapshot.snapshot_at,
    assetsSeen,
    whaleScore: calculateWhaleScore({
      accountValue,
      grossExposure,
      netExposure,
      positionCount,
      avgLeverage,
      unrealizedPnl,
      observedVolume: toNumber(wallet?.observed_volume_usd),
      lastSeenAt: wallet?.last_seen_at ?? snapshot.snapshot_at,
    }),
  };
}

function buildAssetExposures(positions: PositionRow[], wallets: HyperliquidTrackedWallet[]) {
  const walletsByAddress = new Map(wallets.map((wallet) => [wallet.wallet, wallet]));
  const exposureMap = new Map<string, {
    longWallets: Map<string, number>;
    shortWallets: Map<string, number>;
  }>();

  positions.forEach((position) => {
    const asset = normalizeAssetSymbol(position.asset) ?? position.asset.toUpperCase();
    const notional = Math.abs(toNumber(position.position_value));
    if (!asset || notional <= 0) return;

    const bucket = exposureMap.get(asset) ?? { longWallets: new Map<string, number>(), shortWallets: new Map<string, number>() };
    if (position.direction === "long") bucket.longWallets.set(position.wallet_address, (bucket.longWallets.get(position.wallet_address) ?? 0) + notional);
    if (position.direction === "short") bucket.shortWallets.set(position.wallet_address, (bucket.shortWallets.get(position.wallet_address) ?? 0) + notional);
    exposureMap.set(asset, bucket);
  });

  return Array.from(exposureMap.entries())
    .map(([asset, bucket]) => {
      const longNotional = sumMap(bucket.longWallets);
      const shortNotional = sumMap(bucket.shortWallets);

      return {
        asset,
        longWalletCount: bucket.longWallets.size,
        shortWalletCount: bucket.shortWallets.size,
        longNotional,
        shortNotional,
        netNotional: longNotional - shortNotional,
        longShortRatio: formatLongShortRatio(longNotional, shortNotional),
        topLongWallets: topExposureWallets(bucket.longWallets, walletsByAddress),
        topShortWallets: topExposureWallets(bucket.shortWallets, walletsByAddress),
      };
    })
    .sort((a, b) => Math.abs(b.netNotional) - Math.abs(a.netNotional));
}

function topExposureWallets(exposures: Map<string, number>, wallets: Map<string, HyperliquidTrackedWallet>) {
  return Array.from(exposures.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([wallet, notional]) => ({
      wallet,
      rank: wallets.get(wallet)?.rank ?? 0,
      notional,
      accountValue: wallets.get(wallet)?.accountValue ?? 0,
    }));
}

function calculateWhaleScore(input: { accountValue: number; grossExposure: number; netExposure: number; positionCount: number; avgLeverage: number; unrealizedPnl: number; observedVolume: number; lastSeenAt: string | null }) {
  const recentActivityScore = getRecentActivityScore(input.lastSeenAt);
  const score =
    Math.log10(Math.max(input.accountValue, 0) + 1) * 3 +
    Math.log10(Math.max(input.grossExposure, 0) + 1) * 3 +
    Math.log10(Math.abs(input.netExposure) + 1) * 1.5 +
    Math.min(input.positionCount, 20) * 0.5 +
    Math.min(input.avgLeverage, 25) * 0.4 +
    Math.log10(Math.abs(input.unrealizedPnl) + 1) +
    Math.log10(Math.max(input.observedVolume, 0) + 1) * 1.25 +
    recentActivityScore;

  return Math.round(Math.min(100, Math.max(0, score)));
}

function getRecentActivityScore(value: string | null) {
  if (!value) return 0;
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return 0;
  const ageHours = Math.max(0, (Date.now() - timestamp) / 3600000);
  if (ageHours <= 1) return 12;
  if (ageHours <= 6) return 10;
  if (ageHours <= 24) return 8;
  if (ageHours <= 72) return 5;
  return 2;
}

function getWalletDirection(netExposure: number, positions: PositionRow[]): HyperliquidTrackedWallet["direction"] {
  const longCount = positions.filter((position) => position.direction === "long").length;
  const shortCount = positions.filter((position) => position.direction === "short").length;
  if (longCount > 0 && shortCount > 0) return "Mixed";
  if (longCount > 0 || netExposure > 0) return "Long";
  if (shortCount > 0 || netExposure < 0) return "Short";
  return "Flat";
}

function groupPositionsByWallet(positions: PositionRow[]) {
  const grouped = new Map<string, PositionRow[]>();
  positions.forEach((position) => {
    const current = grouped.get(position.wallet_address) ?? [];
    current.push(position);
    grouped.set(position.wallet_address, current);
  });
  return grouped;
}

function getLatestSnapshotTime(snapshots: Map<string, SnapshotRow>) {
  return Array.from(snapshots.values())
    .map((snapshot) => snapshot.snapshot_at)
    .sort()
    .at(-1) ?? null;
}

function normalizeAssets(values: string[]) {
  return Array.from(new Set(values.map((asset) => normalizeAssetSymbol(asset) ?? asset.toUpperCase()).filter(Boolean))).sort();
}

function formatLongShortRatio(longNotional: number, shortNotional: number) {
  if (longNotional <= 0 && shortNotional <= 0) return "0/0";
  if (shortNotional <= 0) return "100/0";
  if (longNotional <= 0) return "0/100";
  const total = longNotional + shortNotional;
  const longPct = Math.round((longNotional / total) * 100);
  return `${longPct}/${100 - longPct}`;
}

function sumMap(values: Map<string, number>) {
  return Array.from(values.values()).reduce((sum, value) => sum + value, 0);
}

function toNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
}
