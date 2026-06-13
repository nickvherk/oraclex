import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { fetchUserFills, fetchUserFunding, fetchUserPortfolio } from "@/lib/integrations/hyperliquid";
import { enrichHyperliquidWallet, type HyperliquidNormalizedPosition, type HyperliquidWalletProfile } from "@/lib/integrations/hyperliquid-wallet-enrichment";
import { getHyperliquidWalletLeaderboard, type HyperliquidTrackedWallet } from "@/lib/integrations/hyperliquid-wallet-leaderboard";

const USER_ACTIVITY_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

type DiscoveredWalletRow = {
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
  raw_clearinghouse_state: unknown;
};

type PositionRow = {
  asset: string;
  direction: "long" | "short" | "flat" | string;
  size: number | string | null;
  entry_price: number | string | null;
  mark_price: number | string | null;
  position_value: number | string | null;
  leverage: number | string | null;
  unrealized_pnl: number | string | null;
  liquidation_price: number | string | null;
  distance_to_liquidation_pct: number | string | null;
};

export type HyperliquidWalletFill = {
  asset: string | null;
  side: string | null;
  price: number | null;
  size: number | null;
  notional: number | null;
  closedPnl: number | null;
  time: string | null;
  raw: unknown;
};

export type HyperliquidWalletProfilePayload = {
  source: "hyperliquid";
  walletFound: boolean;
  liveRefreshAvailable: boolean;
  snapshotSource: "live" | "stored";
  message: string | null;
  updatedAt: string;
  wallet: {
    address: string;
    rank: number | null;
    whaleScore: number | null;
    accountValue: number | null;
    grossExposure: number;
    netExposure: number;
    avgLeverage: number | null;
    unrealizedPnl: number;
    positionCount: number;
    lastSeenAt: string | null;
    assetsSeen: string[];
    observedTradeCount: number;
    observedVolumeUsd: number;
  };
  positions: HyperliquidNormalizedPosition[];
  recentFills: HyperliquidWalletFill[];
  funding: unknown[] | null;
  portfolio: unknown;
  raw: {
    clearinghouseState: unknown;
    storedSnapshot: SnapshotRow | null;
    userFills: unknown;
    userFunding: unknown;
    portfolio: unknown;
  };
};

export async function getHyperliquidWalletProfile(walletAddress: string): Promise<HyperliquidWalletProfilePayload> {
  assertWalletAddress(walletAddress);
  const normalizedWallet = walletAddress.toLowerCase();
  const supabase = createSupabaseAdminClient();

  const { data: walletRow, error: walletError } = await supabase
    .from("hyperliquid_discovered_wallets")
    .select("wallet_address, first_seen_at, last_seen_at, assets_seen, observed_trade_count, observed_volume_usd")
    .eq("wallet_address", normalizedWallet)
    .maybeSingle();

  if (walletError) throw new Error(`Failed to load tracked Hyperliquid wallet: ${walletError.message}`);

  const { data: snapshotRow, error: snapshotError } = await supabase
    .from("hyperliquid_wallet_snapshots")
    .select("wallet_address, snapshot_at, account_value, total_notional_position, gross_exposure, net_exposure, avg_leverage, position_count, unrealized_pnl, raw_clearinghouse_state")
    .eq("wallet_address", normalizedWallet)
    .order("snapshot_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (snapshotError) throw new Error(`Failed to load tracked Hyperliquid wallet snapshot: ${snapshotError.message}`);

  if (!walletRow && !snapshotRow) {
    return buildNotFoundPayload(normalizedWallet);
  }

  const snapshot = snapshotRow as SnapshotRow | null;
  const storedPositions = snapshot ? await loadStoredPositions(normalizedWallet, snapshot.snapshot_at) : [];
  const [leaderboardWallet, liveProfile, fillsResult, fundingResult, portfolioResult] = await Promise.all([
    loadLeaderboardWallet(normalizedWallet),
    loadLiveProfile(normalizedWallet),
    loadUserFills(normalizedWallet),
    loadUserFunding(normalizedWallet),
    loadUserPortfolio(normalizedWallet),
  ]);

  const effectiveProfile = liveProfile ?? (snapshot ? buildProfileFromStoredSnapshot(normalizedWallet, snapshot, storedPositions) : null);
  const assetsSeen = mergeTextArrays(
    (walletRow as DiscoveredWalletRow | null)?.assets_seen,
    effectiveProfile?.positions.map((position) => position.asset) ?? [],
  );

  return {
    source: "hyperliquid",
    walletFound: true,
    liveRefreshAvailable: Boolean(liveProfile),
    snapshotSource: liveProfile ? "live" : "stored",
    message: liveProfile ? null : "Stored snapshot shown. Live refresh unavailable.",
    updatedAt: new Date().toISOString(),
    wallet: {
      address: normalizedWallet,
      rank: leaderboardWallet?.rank ?? null,
      whaleScore: leaderboardWallet?.whaleScore ?? null,
      accountValue: effectiveProfile?.accountValue ?? null,
      grossExposure: effectiveProfile?.grossExposure ?? 0,
      netExposure: effectiveProfile?.netExposure ?? 0,
      avgLeverage: effectiveProfile?.avgLeverage ?? null,
      unrealizedPnl: effectiveProfile?.unrealizedPnl ?? 0,
      positionCount: effectiveProfile?.positionCount ?? 0,
      lastSeenAt: (walletRow as DiscoveredWalletRow | null)?.last_seen_at ?? effectiveProfile?.snapshotAt ?? null,
      assetsSeen,
      observedTradeCount: toNumber((walletRow as DiscoveredWalletRow | null)?.observed_trade_count),
      observedVolumeUsd: toNumber((walletRow as DiscoveredWalletRow | null)?.observed_volume_usd),
    },
    positions: effectiveProfile?.positions ?? [],
    recentFills: normalizeUserFills(fillsResult.payload),
    funding: Array.isArray(fundingResult.payload) ? fundingResult.payload : null,
    portfolio: portfolioResult.payload,
    raw: {
      clearinghouseState: effectiveProfile?.rawClearinghouseState ?? null,
      storedSnapshot: snapshot,
      userFills: fillsResult.payload,
      userFunding: fundingResult.payload,
      portfolio: portfolioResult.payload,
    },
  };
}

async function loadStoredPositions(walletAddress: string, snapshotAt: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("hyperliquid_positions")
    .select("asset, direction, size, entry_price, mark_price, position_value, leverage, unrealized_pnl, liquidation_price, distance_to_liquidation_pct")
    .eq("wallet_address", walletAddress)
    .eq("snapshot_at", snapshotAt)
    .order("position_value", { ascending: false });

  if (error) throw new Error(`Failed to load tracked Hyperliquid wallet positions: ${error.message}`);
  return (data ?? []) as PositionRow[];
}

async function loadLeaderboardWallet(walletAddress: string): Promise<HyperliquidTrackedWallet | null> {
  try {
    const leaderboard = await getHyperliquidWalletLeaderboard(null, 200);
    return leaderboard.wallets.find((wallet) => wallet.wallet === walletAddress) ?? null;
  } catch {
    return null;
  }
}

async function loadLiveProfile(walletAddress: string): Promise<HyperliquidWalletProfile | null> {
  try {
    return await enrichHyperliquidWallet(walletAddress);
  } catch {
    return null;
  }
}

async function loadUserFills(walletAddress: string) {
  try {
    return { payload: await fetchUserFills(walletAddress) };
  } catch {
    return { payload: null };
  }
}

async function loadUserFunding(walletAddress: string) {
  try {
    const endTime = Date.now();
    return { payload: await fetchUserFunding(walletAddress, endTime - USER_ACTIVITY_WINDOW_MS, endTime) };
  } catch {
    return { payload: null };
  }
}

async function loadUserPortfolio(walletAddress: string) {
  try {
    return { payload: await fetchUserPortfolio(walletAddress) };
  } catch {
    return { payload: null };
  }
}

function buildProfileFromStoredSnapshot(walletAddress: string, snapshot: SnapshotRow, positions: PositionRow[]): HyperliquidWalletProfile {
  const normalizedPositions = positions.map(normalizeStoredPosition).filter((position): position is HyperliquidNormalizedPosition => Boolean(position));

  return {
    walletAddress,
    snapshotAt: snapshot.snapshot_at,
    accountValue: toNullableNumber(snapshot.account_value),
    totalNotionalPosition: toNullableNumber(snapshot.total_notional_position),
    grossExposure: toNumber(snapshot.gross_exposure),
    netExposure: toNumber(snapshot.net_exposure),
    avgLeverage: toNullableNumber(snapshot.avg_leverage),
    positionCount: toNumber(snapshot.position_count),
    unrealizedPnl: toNumber(snapshot.unrealized_pnl),
    positions: normalizedPositions,
    rawClearinghouseState: snapshot.raw_clearinghouse_state,
  };
}

function normalizeStoredPosition(position: PositionRow): HyperliquidNormalizedPosition | null {
  if (!position.asset) return null;

  return {
    asset: position.asset,
    direction: position.direction === "short" ? "short" : position.direction === "flat" ? "flat" : "long",
    size: toNumber(position.size),
    entryPrice: toNullableNumber(position.entry_price),
    markPrice: toNullableNumber(position.mark_price),
    positionValue: toNumber(position.position_value),
    leverage: toNullableNumber(position.leverage),
    unrealizedPnl: toNumber(position.unrealized_pnl),
    liquidationPrice: toNullableNumber(position.liquidation_price),
    distanceToLiquidationPct: toNullableNumber(position.distance_to_liquidation_pct),
  };
}

function normalizeUserFills(payload: unknown): HyperliquidWalletFill[] {
  if (!Array.isArray(payload)) return [];

  return payload
    .filter(isRecord)
    .slice(0, 50)
    .map((fill) => {
      const price = toNullableNumber(fill.px);
      const size = toNullableNumber(fill.sz);
      return {
        asset: stringOrNull(fill.coin),
        side: stringOrNull(fill.side) ?? stringOrNull(fill.dir),
        price,
        size,
        notional: price !== null && size !== null ? Math.abs(price * size) : null,
        closedPnl: toNullableNumber(fill.closedPnl),
        time: formatHyperliquidTime(fill.time),
        raw: fill,
      };
    });
}

function buildNotFoundPayload(walletAddress: string): HyperliquidWalletProfilePayload {
  return {
    source: "hyperliquid",
    walletFound: false,
    liveRefreshAvailable: false,
    snapshotSource: "stored",
    message: "Wallet not found in tracked Hyperliquid universe.",
    updatedAt: new Date().toISOString(),
    wallet: {
      address: walletAddress,
      rank: null,
      whaleScore: null,
      accountValue: null,
      grossExposure: 0,
      netExposure: 0,
      avgLeverage: null,
      unrealizedPnl: 0,
      positionCount: 0,
      lastSeenAt: null,
      assetsSeen: [],
      observedTradeCount: 0,
      observedVolumeUsd: 0,
    },
    positions: [],
    recentFills: [],
    funding: null,
    portfolio: null,
    raw: {
      clearinghouseState: null,
      storedSnapshot: null,
      userFills: null,
      userFunding: null,
      portfolio: null,
    },
  };
}

function mergeTextArrays(existing: unknown, next: string[]) {
  const existingValues = Array.isArray(existing) ? existing.filter((value): value is string => typeof value === "string") : [];
  return Array.from(new Set([...existingValues, ...next])).sort();
}

function formatHyperliquidTime(value: unknown) {
  const timestamp = toNullableNumber(value);
  if (timestamp === null) return null;
  return new Date(timestamp).toISOString();
}

function assertWalletAddress(address: string) {
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    throw new Error("Expected a 42-character 0x Hyperliquid wallet address.");
  }
}

function stringOrNull(value: unknown) {
  return typeof value === "string" && value.trim() !== "" ? value : null;
}

function toNullableNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function toNumber(value: unknown) {
  return toNullableNumber(value) ?? 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
