import "server-only";

import { HYPERLIQUID_INFO_URL } from "@/lib/integrations/hyperliquid";

export const HYPERLIQUID_DISCOVERY_ASSETS = [
  "BTC",
  "ETH",
  "SOL",
  "HYPE",
  "DOGE",
  "XRP",
  "BNB",
  "FARTCOIN",
  "kPEPE",
  "PUMP",
  "ENA",
  "LINK",
  "AVAX",
  "AAVE",
  "WLD",
  "ONDO",
  "ZEC",
  "PAXG",
  "LTC",
  "TRX",
  "SUI",
  "TAO",
] as const;

const HYPERLIQUID_RECENT_TRADES_TIMEOUT_MS = 10000;

export type HyperliquidDiscoveryAsset = (typeof HYPERLIQUID_DISCOVERY_ASSETS)[number];

export type HyperliquidDiscoveredWallet = {
  walletAddress: string;
  source: "recent_trades";
  assetsSeen: string[];
  observedTradeCount: number;
  observedVolumeUsd: number;
  firstSeenAt: string;
  lastSeenAt: string;
};

export type HyperliquidWalletDiscoveryResult = {
  wallets: HyperliquidDiscoveredWallet[];
  stats: {
    assetsScanned: string[];
    assetsSkipped: string[];
    tradesSeen: number;
    walletsSeen: number;
    discoveredAt: string;
  };
};

type HyperliquidRecentTrade = {
  coin?: unknown;
  px?: unknown;
  sz?: unknown;
  time?: unknown;
  users?: unknown;
};

export async function discoverHyperliquidWalletsFromRecentTrades(assets: readonly string[] = HYPERLIQUID_DISCOVERY_ASSETS): Promise<HyperliquidWalletDiscoveryResult> {
  const discoveredAt = new Date().toISOString();
  const walletMap = new Map<string, HyperliquidDiscoveredWallet>();
  const assetsScanned: string[] = [];
  const assetsSkipped: string[] = [];
  let tradesSeen = 0;

  for (const asset of assets) {
    let trades: HyperliquidRecentTrade[];
    try {
      trades = await fetchRecentTrades(asset);
      assetsScanned.push(asset);
    } catch (error) {
      assetsSkipped.push(asset);
      if (process.env.NODE_ENV === "development") {
        console.warn("[hyperliquid-discovery] skipping recentTrades asset", asset, error);
      }
      continue;
    }

    tradesSeen += trades.length;

    trades.forEach((trade) => {
      const notional = getTradeNotional(trade);
      const users = Array.isArray(trade.users) ? trade.users : [];

      users.forEach((user) => {
        if (typeof user !== "string" || !isWalletAddress(user)) return;
        const walletAddress = user.toLowerCase();
        const existing = walletMap.get(walletAddress);

        if (existing) {
          existing.observedTradeCount += 1;
          existing.observedVolumeUsd += notional;
          existing.assetsSeen = Array.from(new Set([...existing.assetsSeen, asset]));
          return;
        }

        walletMap.set(walletAddress, {
          walletAddress,
          source: "recent_trades",
          assetsSeen: [asset],
          observedTradeCount: 1,
          observedVolumeUsd: notional,
          firstSeenAt: discoveredAt,
          lastSeenAt: discoveredAt,
        });
      });
    });
  }

  const wallets = Array.from(walletMap.values()).sort((a, b) => b.observedVolumeUsd - a.observedVolumeUsd);

  return {
    wallets,
    stats: {
      assetsScanned,
      assetsSkipped,
      tradesSeen,
      walletsSeen: wallets.length,
      discoveredAt,
    },
  };
}

async function fetchRecentTrades(coin: string): Promise<HyperliquidRecentTrade[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), HYPERLIQUID_RECENT_TRADES_TIMEOUT_MS);

  try {
    const response = await fetch(HYPERLIQUID_INFO_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "recentTrades", coin }),
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Hyperliquid recentTrades failed for ${coin} with status ${response.status}.`);
    }

    const payload: unknown = await response.json();
    return Array.isArray(payload) ? payload.filter(isRecord) : [];
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Hyperliquid recentTrades timed out for ${coin}.`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function getTradeNotional(trade: HyperliquidRecentTrade) {
  const price = toNumber(trade.px);
  const size = toNumber(trade.sz);
  return price && size ? Math.abs(price * size) : 0;
}

function isWalletAddress(value: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(value);
}

function toNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function isRecord(value: unknown): value is HyperliquidRecentTrade {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
