import "server-only";

import { TRACKED_ASSET_SET, normalizeAssetSymbol } from "@/lib/tracked-hyperliquid-assets";

export const HYPERLIQUID_INFO_URL = "https://api.hyperliquid.xyz/info";
const HYPERLIQUID_TIMEOUT_MS = 10000;
export const HYPERLIQUID_REVALIDATE_SECONDS = 60;

type Availability = "live" | "derived" | "unavailable";

type HyperliquidInfoBody =
  | { type: "meta" }
  | { type: "metaAndAssetCtxs" }
  | { type: "allMids" }
  | { type: "l2Book"; coin: string; nSigFigs?: number | null; mantissa?: number | null }
  | { type: "clearinghouseState"; user: string }
  | { type: "userFills"; user: string; aggregateByTime?: boolean }
  | { type: "userFillsByTime"; user: string; startTime: number; endTime?: number; aggregateByTime?: boolean }
  | { type: "userFunding"; user: string; startTime: number; endTime?: number }
  | { type: "portfolio"; user: string }
  | { type: "fundingHistory"; coin: string; startTime: number; endTime?: number }
  | { type: "predictedFundings" };

type HyperliquidUniverseAsset = {
  name?: unknown;
  asset?: unknown;
  symbol?: unknown;
  coin?: unknown;
  token?: unknown;
  maxLeverage?: unknown;
  isDelisted?: unknown;
};

type HyperliquidAssetContext = Record<string, unknown>;

export type HyperliquidAssetFlow = {
  asset: string;
  markPrice: number;
  openInterest: number;
  openInterestUsd: number;
  funding: number | null;
  volume24h: number;
  premium: number | null;
  impactPrice: number | null;
  longShortRatio: string | null;
  oiChange: number | null;
  netFlow: number | null;
  avgLeverage: number | null;
  whaleConcentration: string | null;
  abnormalFlowIndex: number | null;
  availability: Record<string, Availability>;
  notes: string[];
  raw: {
    midPrice: number | null;
    oraclePrice: number | null;
    previousDayPrice: number | null;
    openInterestUsd: number;
    dayBaseVolume: number | null;
    impactBidPrice: number | null;
    impactAskPrice: number | null;
    maxLeverage: number | null;
    dailyPriceChange: number | null;
    volumeIntensity: number | null;
    oiToVolume: number | null;
  };

  // Backward-compatible fields consumed by the current terminal view.
  netFlow7d: number;
  flowVsAvg: number;
  topTraderBias: "Long-heavy" | "Short-heavy" | "Mixed";
  openInterestChange: number;
  longPct: number;
  whaleScore: number;
  smartMoneyConcentration: number;
  capitalRotationScore: number;
  flowDivergenceIndex: number;
  interpretation: string;
  flowType: "Inflows" | "Outflows" | "OI Build-Up" | "Leverage Build-Up" | "Asset Rotation";
  traderCount: number;
  minInflow: number;
  relatedMarkets: string[];
  rawDatapoints: string[];
  historicalComparison: string;
  aiExplanation: string;
  hyperliquid: {
    markPrice: number;
    previousDayPrice: number;
    openInterest: number;
    openInterestUsd: number;
    volume24h: number;
    fundingRate: number | null;
    dailyPriceChange: number;
    openInterestChangeProxy: number;
    volumeIntensity: number;
    flowBias: "Bullish" | "Bearish" | "Neutral";
    abnormalFlowIndex: number;
    capitalRotationScore: number;
    leveragePressureProxy: number;
  };
};

export type HyperliquidFlowsResponse = {
  source: "hyperliquid";
  sourceStatus: "live" | "fallback" | "partial";
  lastUpdated: string;
  updatedAt: string;
  refresh: string;
  assets: HyperliquidAssetFlow[];
  topTraders: [];
  metrics: {
    totalSmartMoneyInflow7d: number | null;
    largestInflowAsset: string | null;
    largestOutflowAsset: string | null;
    topTraderNetBias: string;
    openInterestAcceleration: number | null;
    abnormalFlowIndex: number | null;
  };
  availability: Record<string, Availability>;
  limitations: string[];
};

export class HyperliquidInfoError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly responseBody?: string,
  ) {
    super(message);
    this.name = "HyperliquidInfoError";
  }
}

export async function hyperliquidInfo<T = unknown>(body: HyperliquidInfoBody): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), HYPERLIQUID_TIMEOUT_MS);

  try {
    const response = await fetch(HYPERLIQUID_INFO_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      next: { revalidate: HYPERLIQUID_REVALIDATE_SECONDS },
      signal: controller.signal,
    });

    const responseBody = await response.text();

    if (!response.ok) {
      throw new HyperliquidInfoError(`Hyperliquid info request failed with status ${response.status}.`, response.status, responseBody);
    }

    return responseBody ? (JSON.parse(responseBody) as T) : (null as T);
  } catch (error) {
    if (error instanceof HyperliquidInfoError) throw error;
    const message = error instanceof Error ? error.message : "Unknown Hyperliquid request error";
    throw new HyperliquidInfoError(`Hyperliquid info request failed: ${message}`);
  } finally {
    clearTimeout(timeout);
  }
}

export function fetchMetaAndAssetCtxs() {
  return hyperliquidInfo({ type: "metaAndAssetCtxs" });
}

export function fetchAllMids() {
  return hyperliquidInfo<Record<string, string>>({ type: "allMids" });
}

export function fetchL2Book(coin: string) {
  return hyperliquidInfo({ type: "l2Book", coin });
}

export function fetchFundingHistory(coin: string, startTime: number, endTime?: number) {
  return hyperliquidInfo({ type: "fundingHistory", coin, startTime, endTime });
}

export function fetchPredictedFundings() {
  return hyperliquidInfo({ type: "predictedFundings" });
}

export function getHyperliquidUserState(address: string) {
  assertWalletAddress(address);
  return hyperliquidInfo({ type: "clearinghouseState", user: address });
}

export function fetchClearinghouseState(userAddress: string) {
  return getHyperliquidUserState(userAddress);
}

export function fetchUserFills(userAddress: string) {
  assertWalletAddress(userAddress);
  return hyperliquidInfo({ type: "userFills", user: userAddress });
}

export function fetchUserFunding(userAddress: string, startTime: number, endTime?: number) {
  assertWalletAddress(userAddress);
  return hyperliquidInfo({ type: "userFunding", user: userAddress, startTime, endTime });
}

export function fetchUserPortfolio(userAddress: string) {
  assertWalletAddress(userAddress);
  return hyperliquidInfo({ type: "portfolio", user: userAddress });
}

export async function getHyperliquidFlows(): Promise<HyperliquidFlowsResponse> {
  const raw = await fetchMetaAndAssetCtxs();
  const assets = normalizeMetaAndAssetCtxs(raw);
  const metrics = deriveMetrics(assets);
  const now = new Date().toISOString();

  const payload: HyperliquidFlowsResponse = {
    source: "hyperliquid",
    sourceStatus: assets.length > 0 ? "live" : "fallback",
    lastUpdated: now,
    updatedAt: now,
    refresh: "live / 60s",
    assets,
    topTraders: [],
    metrics,
    availability: {
      marketData: assets.length > 0 ? "live" : "unavailable",
      traderDiscovery: "unavailable",
      userPositions: "live",
      smartMoneyInflow: "derived",
      longShortRatio: "derived",
      openInterestAcceleration: "derived",
      whaleConcentration: "unavailable",
      abnormalFlowIndex: "derived",
    },
    limitations: [
      "Hyperliquid public info endpoints provide live market context but not a public top-trader leaderboard.",
      "Wallet-level positions are available only when OracleX is given specific wallet addresses to query.",
      "Smart-money inflow, long/short ratio, OI acceleration, and abnormal flow are derived market-data proxies until wallet ingestion is added.",
      "Whale concentration is unavailable from market-level public data and is not presented as live.",
    ],
  };

  if (process.env.NODE_ENV === "development") {
    const finalRows = payload.assets.filter((asset) => asset.asset === "HYPE" || asset.asset === "BTC");
    console.log(
      "[hyperliquid-flows] final API rows",
      finalRows.map(({ asset, markPrice, openInterest, openInterestUsd, funding, volume24h, premium, availability, raw, hyperliquid }) => ({
        asset,
        markPrice,
        openInterest,
        openInterestUsd,
        funding,
        volume24h,
        premium,
        availability,
        raw,
        hyperliquid,
      })),
    );
  }

  return payload;
}

function normalizeMetaAndAssetCtxs(raw: unknown): HyperliquidAssetFlow[] {
  if (!Array.isArray(raw) || raw.length < 2) {
    throw new Error("Unexpected Hyperliquid metaAndAssetCtxs response shape.");
  }

  const [meta, assetContexts] = raw;
  const universe = getUniverse(meta);

  if (!Array.isArray(assetContexts)) {
    throw new Error("Unexpected Hyperliquid asset context response shape.");
  }

  const selected = universe
    .map((asset, index) => normalizeAssetFlow(asset, assetContexts[index]))
    .filter((asset): asset is HyperliquidAssetFlow => Boolean(asset))
    .filter((asset) => TRACKED_ASSET_SET.has(asset.asset));

  if (process.env.NODE_ENV === "development") {
    universe.forEach((universeAsset, index) => {
      const asset = normalizeAssetSymbol(universeAsset.name ?? universeAsset.asset ?? universeAsset.symbol ?? universeAsset.coin ?? universeAsset.token);
      if (!asset || !TRACKED_ASSET_SET.has(asset)) return;

      const normalized = selected.find((item) => item.asset === asset);
      console.log("[hyperliquid-flows] metaAndAssetCtxs mapping", {
        asset,
        rawUniverse: universeAsset,
        rawAssetCtx: assetContexts[index],
        normalized: normalized
          ? {
              markPrice: normalized.markPrice,
              openInterest: normalized.openInterest,
              openInterestUsd: normalized.openInterestUsd,
              funding: normalized.funding,
              volume24h: normalized.volume24h,
              premium: normalized.premium,
              previousDayPrice: normalized.raw.previousDayPrice,
              sourceLabels: normalized.availability,
            }
          : null,
      });
    });
  }

  const averageVolume = average(selected.map((asset) => asset.volume24h).filter((value) => value > 0));

  return selected
    .map((asset) => {
      const volumeIntensity = averageVolume > 0 ? (asset.volume24h / averageVolume) * 100 : 100;
      const abnormalFlowIndex = deriveAbnormalFlowIndex(asset, volumeIntensity);
      const capitalRotationScore = clamp(Math.round(45 + (asset.raw.dailyPriceChange ?? 0) * 4 + Math.max(0, asset.funding ?? 0) * 90000 + Math.max(0, volumeIntensity - 80) * 0.25), 0, 100);
      const flowDivergenceIndex = clamp(Math.round((abnormalFlowIndex + Math.abs(asset.openInterestChange) + Math.abs(asset.flowVsAvg)) / 3), 0, 100);

      return {
        ...asset,
        flowVsAvg: round1(volumeIntensity - 100),
        abnormalFlowIndex,
        whaleScore: 0,
        smartMoneyConcentration: abnormalFlowIndex,
        capitalRotationScore,
        flowDivergenceIndex,
        raw: { ...asset.raw, volumeIntensity: round1(volumeIntensity) },
        hyperliquid: {
          ...asset.hyperliquid,
          volumeIntensity: round1(volumeIntensity),
          abnormalFlowIndex,
          capitalRotationScore,
        },
      };
    })
    .sort((a, b) => (b.abnormalFlowIndex ?? 0) - (a.abnormalFlowIndex ?? 0));
}

function normalizeAssetFlow(universeAsset: HyperliquidUniverseAsset, context: unknown): HyperliquidAssetFlow | null {
  const asset = normalizeAssetSymbol(universeAsset.name ?? universeAsset.asset ?? universeAsset.symbol ?? universeAsset.coin ?? universeAsset.token);
  if (!asset || !isRecord(context) || universeAsset.isDelisted === true) return null;

  const markPrice = firstNumber(context.markPx, context.midPx, context.oraclePx);
  const previousDayPrice = firstNumber(context.prevDayPx, context.previousDayPx);
  if (!markPrice) return null;

  const midPrice = firstNumber(context.midPx);
  const oraclePrice = firstNumber(context.oraclePx);
  const openInterest = firstNumber(context.openInterest, context.oi) ?? 0;
  const volume24h = firstNumber(context.dayNtlVlm, context.volume24h) ?? 0;
  const dayBaseVolume = firstNumber(context.dayBaseVlm);
  const funding = firstNumber(context.funding, context.fundingRate);
  const premium = firstNumber(context.premium);
  const impactPrices = Array.isArray(context.impactPxs) ? context.impactPxs : [];
  const impactBidPrice = firstNumber(impactPrices[0]);
  const impactAskPrice = firstNumber(impactPrices[1]);
  const impactPrice = impactBidPrice && impactAskPrice ? (impactBidPrice + impactAskPrice) / 2 : (impactBidPrice ?? impactAskPrice);
  const maxLeverage = firstNumber(universeAsset.maxLeverage);
  const dailyPriceChange = previousDayPrice ? ((markPrice - previousDayPrice) / previousDayPrice) * 100 : null;
  const openInterestUsd = openInterest * markPrice;
  const oiToVolume = volume24h > 0 ? openInterestUsd / volume24h : null;
  const fundingPct = funding === null ? 0 : funding * 100;
  const longPct = deriveLongPct(dailyPriceChange, fundingPct, premium);
  const topTraderBias = longPct >= 58 ? "Long-heavy" : longPct <= 42 ? "Short-heavy" : "Mixed";
  const oiChange = deriveOiChange(dailyPriceChange, fundingPct, oiToVolume);
  const avgLeverage = deriveAverageLeverage(maxLeverage, fundingPct, oiToVolume);
  const netFlow = deriveNetFlow(volume24h, dailyPriceChange, fundingPct, oiToVolume);
  const abnormalFlowIndex = 0;
  const capitalRotationScore = 0;
  const flowDivergenceIndex = 0;
  const flowBias = getFlowBias(dailyPriceChange ?? 0, fundingPct);
  const flowType = getFlowType(netFlow, oiChange, avgLeverage, dailyPriceChange);
  const interpretation = getInterpretation(flowBias, flowType);

  return {
    asset,
    markPrice,
    openInterest,
    openInterestUsd,
    funding,
    volume24h,
    premium,
    impactPrice,
    longShortRatio: `${longPct}/${100 - longPct}`,
    oiChange,
    netFlow,
    avgLeverage,
    whaleConcentration: null,
    abnormalFlowIndex,
    availability: {
      asset: "live",
      markPrice: "live",
      openInterest: "live",
      funding: funding === null ? "unavailable" : "live",
      volume24h: "live",
      premium: premium === null ? "unavailable" : "live",
      impactPrice: impactPrice === null ? "unavailable" : "live",
      longShortRatio: "derived",
      oiChange: "derived",
      netFlow: "derived",
      avgLeverage: "derived",
      whaleConcentration: "unavailable",
      abnormalFlowIndex: "derived",
    },
    notes: [
      "Market data is live from Hyperliquid metaAndAssetCtxs.",
      "Long/short ratio, OI change, net flow, average leverage, and abnormal flow are derived proxies.",
      "Whale concentration requires wallet-level position ingestion and is unavailable here.",
    ],
    raw: {
      midPrice,
      oraclePrice,
      previousDayPrice,
      openInterestUsd,
      dayBaseVolume,
      impactBidPrice,
      impactAskPrice,
      maxLeverage,
      dailyPriceChange,
      volumeIntensity: null,
      oiToVolume,
    },
    netFlow7d: netFlow ?? 0,
    flowVsAvg: 0,
    topTraderBias,
    openInterestChange: oiChange ?? 0,
    longPct,
    whaleScore: 0,
    smartMoneyConcentration: 0,
    capitalRotationScore,
    flowDivergenceIndex,
    interpretation,
    flowType,
    traderCount: 0,
    minInflow: netFlow ?? 0,
    relatedMarkets: getRelatedMarkets(asset),
    rawDatapoints: [
      `Mark ${formatUsd(markPrice)} (live)`,
      previousDayPrice ? `Previous day ${formatUsd(previousDayPrice)} (live)` : "Previous day price unavailable",
      `24h volume ${formatUsd(volume24h)} (live)`,
      `Open interest ${formatUsd(openInterestUsd)} (live, derived USD notional)`,
      funding === null ? "Funding unavailable" : `Funding ${(funding * 100).toFixed(4)}% (live)`,
      premium === null ? "Premium unavailable" : `Premium ${(premium * 100).toFixed(4)}% (live)`,
      impactPrice === null ? "Impact price unavailable" : `Impact midpoint ${formatUsd(impactPrice)} (live)`,
    ],
    historicalComparison: `${asset} OI acceleration and flow are derived from the current Hyperliquid market snapshot. True historical OI acceleration requires persisted snapshots.`,
    aiExplanation: `${asset} has live Hyperliquid market data for mark price, volume, funding, premium, and open interest. Smart-money labels shown here are derived market proxies, not wallet-level top-trader data.`,
    hyperliquid: {
      markPrice,
      previousDayPrice: previousDayPrice ?? markPrice,
      openInterest,
      openInterestUsd,
      volume24h,
      fundingRate: funding,
      dailyPriceChange: round1(dailyPriceChange ?? 0),
      openInterestChangeProxy: oiChange ?? 0,
      volumeIntensity: 0,
      flowBias,
      abnormalFlowIndex,
      capitalRotationScore,
      leveragePressureProxy: avgLeverage ? avgLeverage * 12 : 0,
    },
  };
}

function deriveMetrics(assets: HyperliquidAssetFlow[]): HyperliquidFlowsResponse["metrics"] {
  if (assets.length === 0) {
    return {
      totalSmartMoneyInflow7d: null,
      largestInflowAsset: null,
      largestOutflowAsset: null,
      topTraderNetBias: "Unavailable - requires tracked wallet ingestion",
      openInterestAcceleration: null,
      abnormalFlowIndex: null,
    };
  }

  const largestInflow = assets.reduce((best, asset) => ((asset.netFlow ?? 0) > (best.netFlow ?? 0) ? asset : best), assets[0]);
  const largestOutflow = assets.reduce((best, asset) => ((asset.netFlow ?? 0) < (best.netFlow ?? 0) ? asset : best), assets[0]);
  const oiAcceleration = assets.reduce((best, asset) => ((asset.oiChange ?? 0) > (best.oiChange ?? 0) ? asset : best), assets[0]);
  const abnormal = assets.reduce((best, asset) => ((asset.abnormalFlowIndex ?? 0) > (best.abnormalFlowIndex ?? 0) ? asset : best), assets[0]);
  const positiveFlow = assets.filter((asset) => (asset.netFlow ?? 0) > 0).reduce((sum, asset) => sum + (asset.netFlow ?? 0), 0);

  return {
    totalSmartMoneyInflow7d: positiveFlow,
    largestInflowAsset: largestInflow.asset,
    largestOutflowAsset: largestOutflow.asset,
    topTraderNetBias: "Unavailable - requires tracked wallet ingestion",
    openInterestAcceleration: oiAcceleration.oiChange,
    abnormalFlowIndex: abnormal.abnormalFlowIndex,
  };
}

function deriveLongPct(dailyPriceChange: number | null, fundingPct: number, premium: number | null) {
  const premiumPct = premium === null ? 0 : premium * 100;
  return clamp(Math.round(50 + (dailyPriceChange ?? 0) * 1.2 + fundingPct * 140 + premiumPct * 45), 25, 75);
}

function deriveOiChange(dailyPriceChange: number | null, fundingPct: number, oiToVolume: number | null) {
  return round1(clamp((dailyPriceChange ?? 0) * 0.9 + fundingPct * 35 + (oiToVolume ?? 0) * Math.sign(dailyPriceChange || fundingPct || 1) * 4, -50, 50));
}

function deriveAverageLeverage(maxLeverage: number | null, fundingPct: number, oiToVolume: number | null) {
  return round1(clamp(1 + (oiToVolume ?? 0) * 0.8 + Math.abs(fundingPct) * 9 + (maxLeverage ?? 20) / 35, 1, 12));
}

function deriveNetFlow(volume24h: number, dailyPriceChange: number | null, fundingPct: number, oiToVolume: number | null) {
  const directionalPressure = ((dailyPriceChange ?? 0) / 100) + fundingPct * 0.04;
  const oiMultiplier = 1 + Math.min(1.5, Math.max(0, oiToVolume ?? 0) * 0.2);
  return Math.round(volume24h * directionalPressure * oiMultiplier);
}

function deriveAbnormalFlowIndex(asset: HyperliquidAssetFlow, volumeIntensity: number) {
  const dailyMove = Math.abs(asset.raw.dailyPriceChange ?? 0);
  const oiPressure = Math.min(100, (asset.raw.oiToVolume ?? 0) * 18);
  const fundingPressure = Math.min(100, Math.abs(asset.funding ?? 0) * 100000);
  const premiumPressure = Math.min(100, Math.abs(asset.premium ?? 0) * 35000);
  const volumePressure = Math.min(100, volumeIntensity);
  const impactSpread =
    asset.raw.impactBidPrice && asset.raw.impactAskPrice && asset.markPrice
      ? Math.min(100, (Math.abs(asset.raw.impactAskPrice - asset.raw.impactBidPrice) / asset.markPrice) * 4000)
      : 0;

  const score = dailyMove * 5 + oiPressure * 0.25 + fundingPressure * 0.16 + premiumPressure * 0.14 + volumePressure * 0.28 + impactSpread * 0.12;
  return clamp(Math.round(score), 0, 100);
}

function getUniverse(meta: unknown): HyperliquidUniverseAsset[] {
  if (!isRecord(meta) || !Array.isArray(meta.universe)) {
    throw new Error("Unexpected Hyperliquid metadata response shape.");
  }

  return meta.universe.filter(isRecord);
}

function getFlowBias(dailyPriceChange: number, fundingPct: number): "Bullish" | "Bearish" | "Neutral" {
  const score = dailyPriceChange + fundingPct * 12;
  if (score > 1) return "Bullish";
  if (score < -1) return "Bearish";
  return "Neutral";
}

function getFlowType(netFlow: number | null, oiChange: number | null, avgLeverage: number | null, dailyPriceChange: number | null): HyperliquidAssetFlow["flowType"] {
  if ((avgLeverage ?? 0) >= 5) return "Leverage Build-Up";
  if ((oiChange ?? 0) >= 8) return "OI Build-Up";
  if ((netFlow ?? 0) < 0 || (dailyPriceChange ?? 0) < -2) return "Outflows";
  return "Inflows";
}

function getInterpretation(flowBias: "Bullish" | "Bearish" | "Neutral", flowType: HyperliquidAssetFlow["flowType"]) {
  if (flowType === "Leverage Build-Up") return "Derived leverage build-up";
  if (flowType === "OI Build-Up") return "Derived OI build-up";
  if (flowType === "Outflows") return "Derived outflow pressure";
  if (flowBias === "Bullish") return "Derived positive flow pressure";
  if (flowBias === "Bearish") return "Derived defensive flow pressure";
  return "Live market context, neutral derived flow";
}

function getRelatedMarkets(asset: string) {
  const map: Record<string, string[]> = {
    BTC: ["BTC ATH Probability", "ETF inflow continuation", "Bitcoin weekly close"],
    ETH: ["ETH ecosystem rotation", "ETH ETF relative inflows", "ETH/BTC performance"],
    SOL: ["SOL ETF Approval", "SOL ecosystem TVL", "L1 rotation"],
    BNB: ["Exchange-token regulation", "BNB chain activity", "CEX market share"],
    XRP: ["XRP ETF odds", "Payment-token rotation", "SEC settlement outcomes"],
    HYPE: ["Hyperliquid revenue", "On-chain trading infrastructure", "HYPE ecosystem flows"],
    DOGE: ["DOGE ETF speculation", "Meme rotation", "Retail risk appetite"],
  };

  return map[asset] ?? [`${asset} flow context`];
}

function assertWalletAddress(address: string) {
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    throw new Error("Hyperliquid user state requires a 42-character 0x wallet address.");
  }
}

function firstNumber(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() !== "") {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }

  return null;
}

function average(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function round1(value: number) {
  return Math.round(value * 10) / 10;
}

function formatUsd(value: number) {
  if (Math.abs(value) >= 1000000000) return `$${(value / 1000000000).toFixed(2)}B`;
  if (Math.abs(value) >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(1)}K`;
  return `$${value.toFixed(2)}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
