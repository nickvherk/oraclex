import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { discoverHyperliquidWalletsFromRecentTrades, type HyperliquidDiscoveredWallet } from "@/lib/integrations/hyperliquid-wallet-discovery";
import { enrichHyperliquidWallet, type HyperliquidWalletProfile } from "@/lib/integrations/hyperliquid-wallet-enrichment";

export const dynamic = "force-dynamic";

const MAX_WALLETS_TO_ENRICH = 100;
const ENRICHMENT_CANDIDATE_LIMIT = 1000;

type EnrichmentCandidate = {
  walletAddress: string;
  observedVolumeUsd: number;
  lastSeenAt: string | null;
  assetsSeen: string[];
  latestSnapshotAt: string | null;
};

export async function POST(request: Request) {
  const authError = validateInternalRequest(request);
  if (authError) return authError;

  const supabaseConfigError = getSupabaseConfigError();
  if (supabaseConfigError) {
    return Response.json({
      source: "hyperliquid",
      mode: "dry-run",
      reason: supabaseConfigError,
    });
  }

  let discovery: Awaited<ReturnType<typeof discoverHyperliquidWalletsFromRecentTrades>>;
  try {
    discovery = await discoverHyperliquidWalletsFromRecentTrades();
  } catch (error) {
    console.error("[hyperliquid-ingest] discovery failed", error);
    return Response.json(
      {
        source: "hyperliquid",
        mode: "error",
        stage: "discovery",
        error: "Hyperliquid wallet discovery failed.",
      },
      { status: 502 },
    );
  }

  try {
    await persistDiscoveredWallets(discovery.wallets);
  } catch (error) {
    console.error("[hyperliquid-ingest] discovery persistence failed", error);
    return Response.json(
      {
        source: "hyperliquid",
        mode: "error",
        stage: "discovery-persistence",
        error: getSafePersistenceError(error),
        discoveredWallets: discovery.wallets.length,
        enrichedWallets: 0,
        enrichmentErrors: [],
        stats: discovery.stats,
      },
      { status: 500 },
    );
  }

  let walletsToEnrich: EnrichmentCandidate[];
  try {
    walletsToEnrich = await selectWalletsToEnrich(MAX_WALLETS_TO_ENRICH);
  } catch (error) {
    console.error("[hyperliquid-ingest] enrichment candidate selection failed", error);
    walletsToEnrich = discovery.wallets.slice(0, MAX_WALLETS_TO_ENRICH).map((wallet) => ({
      walletAddress: wallet.walletAddress,
      observedVolumeUsd: wallet.observedVolumeUsd,
      lastSeenAt: wallet.lastSeenAt,
      assetsSeen: wallet.assetsSeen,
      latestSnapshotAt: null,
    }));
  }

  const enrichedProfiles: HyperliquidWalletProfile[] = [];
  const enrichmentErrors: Array<{ walletAddress: string; error: string }> = [];

  for (const wallet of walletsToEnrich) {
    try {
      enrichedProfiles.push(await enrichHyperliquidWallet(wallet.walletAddress));
    } catch (error) {
      enrichmentErrors.push({
        walletAddress: wallet.walletAddress,
        error: error instanceof Error ? error.message : "Unknown enrichment error.",
      });
    }
  }

  try {
    await persistWalletProfiles(enrichedProfiles);
  } catch (error) {
    console.error("[hyperliquid-ingest] persistence failed", error);
    return Response.json(
      {
        source: "hyperliquid",
        mode: "error",
        stage: "persistence",
        error: getSafePersistenceError(error),
        discoveredWallets: discovery.wallets.length,
        enrichedWallets: enrichedProfiles.length,
        enrichmentErrors,
        stats: discovery.stats,
      },
      { status: 500 },
    );
  }

  return Response.json({
    source: "hyperliquid",
    mode: "persisted",
    discoveredWallets: discovery.wallets.length,
    enrichedWallets: enrichedProfiles.length,
    enrichmentCandidates: walletsToEnrich.length,
    enrichmentErrors,
    stats: discovery.stats,
  });
}

export async function GET(request: Request) {
  return POST(request);
}

function validateInternalRequest(request: Request) {
  const expectedSecret = process.env.HYPERLIQUID_INGEST_SECRET ?? process.env.CRON_SECRET;
  if (!expectedSecret) return null;

  const providedSecret = request.headers.get("x-cron-secret") ?? request.headers.get("x-ingest-secret");
  if (providedSecret === expectedSecret) return null;

  return Response.json({ error: "Unauthorized Hyperliquid ingestion request." }, { status: 401 });
}

function getSupabaseConfigError() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return "SUPABASE_SERVICE_ROLE_KEY missing";
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return "NEXT_PUBLIC_SUPABASE_URL missing";
  return null;
}

function getSafePersistenceError(error: unknown) {
  const message = error instanceof Error ? error.message : "";

  if (message.toLowerCase().includes("permission denied")) {
    return "Hyperliquid ingestion could not persist because the Supabase service role does not have permission for one or more Hyperliquid tables.";
  }

  return "Hyperliquid ingestion could not persist to Supabase.";
}

async function persistDiscoveredWallets(wallets: HyperliquidDiscoveredWallet[]) {
  const supabase = createSupabaseAdminClient();
  const now = new Date().toISOString();

  if (wallets.length > 0) {
    const walletAddresses = wallets.map((wallet) => wallet.walletAddress);
    const { data: existingWallets, error: existingWalletsError } = await supabase
      .from("hyperliquid_discovered_wallets")
      .select("wallet_address, first_seen_at, assets_seen, observed_trade_count, observed_volume_usd, is_seeded, tags")
      .in("wallet_address", walletAddresses);

    if (existingWalletsError) throw new Error(`Failed to load existing Hyperliquid discovered wallets: ${existingWalletsError.message}`);

    const existingWalletMap = new Map((existingWallets ?? []).map((wallet) => [wallet.wallet_address as string, wallet]));
    const walletRows = wallets.map((wallet) => ({
      wallet_address: wallet.walletAddress,
      source: wallet.source,
      first_seen_at: existingWalletMap.get(wallet.walletAddress)?.first_seen_at ?? wallet.firstSeenAt,
      last_seen_at: wallet.lastSeenAt,
      assets_seen: mergeTextArrays(existingWalletMap.get(wallet.walletAddress)?.assets_seen, wallet.assetsSeen),
      observed_trade_count: toNumber(existingWalletMap.get(wallet.walletAddress)?.observed_trade_count) + wallet.observedTradeCount,
      observed_volume_usd: toNumber(existingWalletMap.get(wallet.walletAddress)?.observed_volume_usd) + wallet.observedVolumeUsd,
      is_seeded: Boolean(existingWalletMap.get(wallet.walletAddress)?.is_seeded),
      is_active: true,
      tags: mergeTextArrays(existingWalletMap.get(wallet.walletAddress)?.tags, []),
      updated_at: now,
    }));

    const { error } = await supabase.from("hyperliquid_discovered_wallets").upsert(walletRows, { onConflict: "wallet_address" });
    if (error) throw new Error(`Failed to upsert Hyperliquid discovered wallets: ${error.message}`);
  }
}

async function selectWalletsToEnrich(limit: number): Promise<EnrichmentCandidate[]> {
  const supabase = createSupabaseAdminClient();
  const [{ data: wallets, error: walletsError }, { data: snapshots, error: snapshotsError }] = await Promise.all([
    supabase
      .from("hyperliquid_discovered_wallets")
      .select("wallet_address, last_seen_at, assets_seen, observed_volume_usd")
      .eq("is_active", true)
      .order("observed_volume_usd", { ascending: false })
      .limit(ENRICHMENT_CANDIDATE_LIMIT),
    supabase
      .from("hyperliquid_wallet_snapshots")
      .select("wallet_address, snapshot_at")
      .order("snapshot_at", { ascending: false })
      .limit(ENRICHMENT_CANDIDATE_LIMIT * 2),
  ]);

  if (walletsError) throw new Error(`Failed to load Hyperliquid enrichment candidates: ${walletsError.message}`);
  if (snapshotsError) throw new Error(`Failed to load Hyperliquid latest snapshots: ${snapshotsError.message}`);

  const latestSnapshotByWallet = new Map<string, string>();
  (snapshots ?? []).forEach((snapshot) => {
    const walletAddress = typeof snapshot.wallet_address === "string" ? snapshot.wallet_address : null;
    const snapshotAt = typeof snapshot.snapshot_at === "string" ? snapshot.snapshot_at : null;
    if (walletAddress && snapshotAt && !latestSnapshotByWallet.has(walletAddress)) latestSnapshotByWallet.set(walletAddress, snapshotAt);
  });

  return (wallets ?? [])
    .map((wallet): EnrichmentCandidate | null => {
      if (typeof wallet.wallet_address !== "string") return null;
      const assetsSeen = Array.isArray(wallet.assets_seen) ? wallet.assets_seen.filter((asset): asset is string => typeof asset === "string") : [];
      return {
        walletAddress: wallet.wallet_address,
        observedVolumeUsd: toNumber(wallet.observed_volume_usd),
        lastSeenAt: typeof wallet.last_seen_at === "string" ? wallet.last_seen_at : null,
        assetsSeen,
        latestSnapshotAt: latestSnapshotByWallet.get(wallet.wallet_address) ?? null,
      };
    })
    .filter((wallet): wallet is EnrichmentCandidate => Boolean(wallet))
    .sort(compareEnrichmentCandidates)
    .slice(0, Math.max(1, Math.min(limit, MAX_WALLETS_TO_ENRICH)));
}

async function persistWalletProfiles(profiles: HyperliquidWalletProfile[]) {
  const supabase = createSupabaseAdminClient();

  for (const profile of profiles) {
    const { error: snapshotError } = await supabase.from("hyperliquid_wallet_snapshots").upsert(
      {
        wallet_address: profile.walletAddress,
        snapshot_at: profile.snapshotAt,
        account_value: profile.accountValue,
        total_notional_position: profile.totalNotionalPosition,
        gross_exposure: profile.grossExposure,
        net_exposure: profile.netExposure,
        avg_leverage: profile.avgLeverage,
        position_count: profile.positionCount,
        unrealized_pnl: profile.unrealizedPnl,
        raw_clearinghouse_state: profile.rawClearinghouseState,
      },
      { onConflict: "wallet_address,snapshot_at" },
    );

    if (snapshotError) throw new Error(`Failed to upsert Hyperliquid wallet snapshot: ${snapshotError.message}`);

    if (profile.positions.length === 0) continue;

    const positionRows = profile.positions.map((position) => ({
      wallet_address: profile.walletAddress,
      snapshot_at: profile.snapshotAt,
      asset: position.asset,
      direction: position.direction,
      size: position.size,
      entry_price: position.entryPrice,
      mark_price: position.markPrice,
      position_value: position.positionValue,
      leverage: position.leverage,
      unrealized_pnl: position.unrealizedPnl,
      liquidation_price: position.liquidationPrice,
      distance_to_liquidation_pct: position.distanceToLiquidationPct,
    }));

    const { error: positionsError } = await supabase.from("hyperliquid_positions").upsert(positionRows, { onConflict: "wallet_address,snapshot_at,asset" });
    if (positionsError) throw new Error(`Failed to upsert Hyperliquid positions: ${positionsError.message}`);
  }
}

function compareEnrichmentCandidates(a: EnrichmentCandidate, b: EnrichmentCandidate) {
  const aSnapshotAge = getSnapshotAgeHours(a.latestSnapshotAt);
  const bSnapshotAge = getSnapshotAgeHours(b.latestSnapshotAt);
  const aNeedsRefresh = a.latestSnapshotAt ? 0 : 1;
  const bNeedsRefresh = b.latestSnapshotAt ? 0 : 1;

  return (
    b.observedVolumeUsd - a.observedVolumeUsd ||
    getTimestamp(b.lastSeenAt) - getTimestamp(a.lastSeenAt) ||
    b.assetsSeen.length - a.assetsSeen.length ||
    bNeedsRefresh - aNeedsRefresh ||
    bSnapshotAge - aSnapshotAge
  );
}

function getSnapshotAgeHours(value: string | null) {
  if (!value) return Number.POSITIVE_INFINITY;
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) return Number.POSITIVE_INFINITY;
  return Math.max(0, (Date.now() - timestamp) / 3600000);
}

function getTimestamp(value: string | null) {
  if (!value) return 0;
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function mergeTextArrays(existing: unknown, next: string[]) {
  const existingValues = Array.isArray(existing) ? existing.filter((value): value is string => typeof value === "string") : [];
  return Array.from(new Set([...existingValues, ...next]));
}

function toNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
}
