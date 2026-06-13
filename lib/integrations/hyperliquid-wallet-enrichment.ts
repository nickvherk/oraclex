import "server-only";

import { fetchClearinghouseState } from "@/lib/integrations/hyperliquid";

export type HyperliquidNormalizedPosition = {
  asset: string;
  direction: "long" | "short" | "flat";
  size: number;
  entryPrice: number | null;
  markPrice: number | null;
  positionValue: number;
  leverage: number | null;
  unrealizedPnl: number;
  liquidationPrice: number | null;
  distanceToLiquidationPct: number | null;
};

export type HyperliquidWalletProfile = {
  walletAddress: string;
  snapshotAt: string;
  accountValue: number | null;
  totalNotionalPosition: number | null;
  grossExposure: number;
  netExposure: number;
  avgLeverage: number | null;
  positionCount: number;
  unrealizedPnl: number;
  positions: HyperliquidNormalizedPosition[];
  rawClearinghouseState: unknown;
};

export async function enrichHyperliquidWallet(walletAddress: string): Promise<HyperliquidWalletProfile> {
  assertWalletAddress(walletAddress);
  const rawClearinghouseState = await fetchClearinghouseState(walletAddress);
  return normalizeClearinghouseState(walletAddress.toLowerCase(), rawClearinghouseState);
}

export function normalizeClearinghouseState(walletAddress: string, rawClearinghouseState: unknown): HyperliquidWalletProfile {
  const snapshotAt = new Date().toISOString();
  const state = isRecord(rawClearinghouseState) ? rawClearinghouseState : {};
  const marginSummary = isRecord(state.marginSummary) ? state.marginSummary : {};
  const accountValue = toNumber(marginSummary.accountValue);
  const totalNotionalPosition = toNumber(marginSummary.totalNtlPos);
  const assetPositions = Array.isArray(state.assetPositions) ? state.assetPositions : [];

  const positions = assetPositions.map(normalizePosition).filter((position): position is HyperliquidNormalizedPosition => Boolean(position));
  const grossExposure = positions.reduce((sum, position) => sum + Math.abs(position.positionValue), 0);
  const netExposure = positions.reduce((sum, position) => sum + position.positionValue * (position.direction === "short" ? -1 : 1), 0);
  const unrealizedPnl = positions.reduce((sum, position) => sum + position.unrealizedPnl, 0);
  const leverageValues = positions.map((position) => position.leverage).filter((value): value is number => typeof value === "number" && Number.isFinite(value));

  return {
    walletAddress,
    snapshotAt,
    accountValue,
    totalNotionalPosition,
    grossExposure,
    netExposure,
    avgLeverage: leverageValues.length ? leverageValues.reduce((sum, value) => sum + value, 0) / leverageValues.length : null,
    positionCount: positions.length,
    unrealizedPnl,
    positions,
    rawClearinghouseState,
  };
}

function normalizePosition(assetPosition: unknown): HyperliquidNormalizedPosition | null {
  if (!isRecord(assetPosition) || !isRecord(assetPosition.position)) return null;

  const position = assetPosition.position;
  const asset = typeof position.coin === "string" ? position.coin : null;
  const size = toNumber(position.szi);
  if (!asset || size === null || size === 0) return null;

  const positionValue = toNumber(position.positionValue) ?? 0;
  const leverage = isRecord(position.leverage) ? toNumber(position.leverage.value) : null;
  const markPrice = toNumber(position.markPx);
  const entryPrice = toNumber(position.entryPx);
  const liquidationPrice = toNumber(position.liquidationPx);

  return {
    asset,
    direction: size > 0 ? "long" : "short",
    size,
    entryPrice,
    markPrice,
    positionValue,
    leverage,
    unrealizedPnl: toNumber(position.unrealizedPnl) ?? 0,
    liquidationPrice,
    distanceToLiquidationPct: getDistanceToLiquidationPct(markPrice, entryPrice, liquidationPrice),
  };
}

function getDistanceToLiquidationPct(markPrice: number | null, entryPrice: number | null, liquidationPrice: number | null) {
  const referencePrice = markPrice ?? entryPrice;
  if (!referencePrice || !liquidationPrice) return null;
  return Math.abs((referencePrice - liquidationPrice) / referencePrice) * 100;
}

function assertWalletAddress(address: string) {
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    throw new Error("Expected a 42-character 0x Hyperliquid wallet address.");
  }
}

function toNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
