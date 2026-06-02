import { HYPERLIQUID_REVALIDATE_SECONDS, fetchMetaAndAssetCtxs } from "@/lib/integrations/hyperliquid";
import { TRACKED_ASSET_SET, normalizeAssetSymbol } from "@/lib/tracked-hyperliquid-assets";

type HyperliquidUniverseAsset = {
  asset?: unknown;
  symbol?: unknown;
  coin?: unknown;
  name?: unknown;
  token?: unknown;
  maxLeverage?: unknown;
};

type HyperliquidAssetContext = Record<string, unknown>;

type AssetFlow = {
  asset: string;
  netFlow7d: number;
  flowVsAvg: number;
  topTraderBias: "Long-heavy" | "Short-heavy" | "Mixed";
  openInterestChange: number;
  longShortRatio: string;
  longPct: number;
  avgLeverage: number;
  whaleConcentration: "Low" | "Medium" | "High";
  whaleScore: number;
  abnormalFlowIndex: number;
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

export async function GET() {
  try {
    const raw = await fetchMetaAndAssetCtxs();
    const normalized = normalizeMetaAndAssetCtxs(raw);

    return Response.json(
      {
        source: "hyperliquid",
        updatedAt: new Date().toISOString(),
        refresh: "hourly",
        assets: normalized,
        raw: {
          endpoint: "https://api.hyperliquid.xyz/info",
          requestBody: { type: "metaAndAssetCtxs" },
        },
      },
      {
        headers: {
          "Cache-Control": `s-maxage=${HYPERLIQUID_REVALIDATE_SECONDS}, stale-while-revalidate=${HYPERLIQUID_REVALIDATE_SECONDS}`,
        },
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Hyperliquid flow error";

    return Response.json(
      {
        source: "mock",
        error: message,
        updatedAt: new Date().toISOString(),
        assets: [],
      },
      { status: 502 },
    );
  }
}

function normalizeMetaAndAssetCtxs(raw: unknown): AssetFlow[] {
  if (!Array.isArray(raw) || raw.length < 2) {
    throw new Error("Unexpected Hyperliquid metaAndAssetCtxs response shape.");
  }

  const [meta, assetContexts] = raw;
  const universe = getUniverse(meta);

  if (!Array.isArray(assetContexts)) {
    throw new Error("Unexpected Hyperliquid asset context response shape.");
  }

  const normalizedSymbols = universe.map((asset) => normalizeAssetSymbol(asset)).filter((asset): asset is string => Boolean(asset));
  const allUsableAssets = universe
    .map((asset, index) => normalizeUniverseAsset(asset, assetContexts[index]))
    .filter((asset): asset is AssetFlow => Boolean(asset));
  const selected = allUsableAssets.filter((asset) => TRACKED_ASSET_SET.has(asset.asset));

  if (process.env.NODE_ENV === "development") {
    console.log("[hyperliquid-flows] metaAndAssetCtxs assets", {
      rawAssetsLength: universe.length,
      contextCount: assetContexts.length,
      rawAssetSymbols: universe.map((asset) => asset.asset ?? asset.symbol ?? asset.coin ?? asset.name ?? asset.token),
      normalizedSymbols,
      trackedCount: selected.length,
    });
  }

  if (selected.length === 0) {
    if (process.env.NODE_ENV === "development") {
      console.log("[hyperliquid-flows] no tracked assets matched; using UI fallback rows", {
        trackedAssets: Array.from(TRACKED_ASSET_SET),
        availableSymbols: allUsableAssets.map((asset) => asset.asset),
      });
    }
    throw new Error("No tracked Hyperliquid assets were found in metaAndAssetCtxs.");
  }

  const averageVolume = selected.reduce((sum, asset) => sum + asset.hyperliquid.volume24h, 0) / selected.length;

  return selected
    .map((asset) => {
      const volumeIntensity = averageVolume > 0 ? (asset.hyperliquid.volume24h / averageVolume) * 100 : 100;
      const abnormalFlowIndex = clamp(Math.round(asset.abnormalFlowIndex * 0.7 + Math.min(100, volumeIntensity) * 0.3), 0, 100);
      const capitalRotationScore = clamp(Math.round(asset.capitalRotationScore * 0.75 + Math.max(0, volumeIntensity - 75) * 0.25), 0, 100);

      return {
        ...asset,
        flowVsAvg: round1(volumeIntensity - 100),
        abnormalFlowIndex,
        capitalRotationScore,
        flowDivergenceIndex: clamp(Math.round((abnormalFlowIndex + Math.abs(asset.openInterestChange) + asset.hyperliquid.leveragePressureProxy) / 3), 0, 100),
        hyperliquid: {
          ...asset.hyperliquid,
          volumeIntensity: round1(volumeIntensity),
          abnormalFlowIndex,
          capitalRotationScore,
        },
      };
    })
    .sort((a, b) => b.abnormalFlowIndex - a.abnormalFlowIndex);
}

function normalizeUniverseAsset(asset: HyperliquidUniverseAsset, context: unknown) {
  const normalizedAsset = normalizeAssetSymbol(asset);
  if (!normalizedAsset || !isRecord(context)) return null;

  try {
    return normalizeAssetFlow(normalizedAsset, asset, context);
  } catch {
    return null;
  }
}

function getUniverse(meta: unknown): HyperliquidUniverseAsset[] {
  if (!isRecord(meta) || !Array.isArray(meta.universe)) {
    throw new Error("Unexpected Hyperliquid metadata response shape.");
  }

  return meta.universe.filter(isRecord);
}

function normalizeAssetFlow(asset: string, universeAsset: HyperliquidUniverseAsset, context: HyperliquidAssetContext): AssetFlow {
  const markPrice = firstNumber(context.markPx, context.midPx, context.oraclePx);
  const previousDayPrice = firstNumber(context.prevDayPx, context.previousDayPx, context.markPx, context.midPx, context.oraclePx);
  const openInterest = firstNumber(context.openInterest, context.oi, context.openInterestUsd) ?? 0;
  const volume24h = firstNumber(context.dayNtlVlm, context.volume24h, context.dayBaseVlm) ?? 0;
  const fundingRate = firstNumber(context.funding, context.fundingRate);
  const maxLeverage = typeof universeAsset.maxLeverage === "number" ? universeAsset.maxLeverage : 20;

  if (!markPrice || !previousDayPrice) {
    throw new Error(`Missing Hyperliquid price context for ${asset}.`);
  }

  const dailyPriceChange = ((markPrice - previousDayPrice) / previousDayPrice) * 100;
  const openInterestUsd = openInterest * markPrice;
  const oiToVolume = volume24h > 0 ? openInterestUsd / volume24h : 0;
  const fundingPct = fundingRate === null ? 0 : fundingRate * 100;
  const openInterestChangeProxy = clamp(dailyPriceChange * 1.35 + fundingPct * 18 + oiToVolume * Math.sign(dailyPriceChange || fundingPct) * 8, -60, 60);
  const flowBias = getFlowBias(dailyPriceChange, fundingPct);
  const longPct = clamp(Math.round(50 + dailyPriceChange * 2.2 + fundingPct * 60), 18, 82);
  const leveragePressureProxy = clamp(Math.round(oiToVolume * 35 + Math.abs(fundingPct) * 60 + Math.min(maxLeverage, 50) * 0.5), 0, 100);
  const abnormalFlowIndex = clamp(Math.round(48 + Math.abs(dailyPriceChange) * 5 + oiToVolume * 18 + Math.abs(fundingPct) * 90), 0, 100);
  const capitalRotationScore = clamp(Math.round(45 + dailyPriceChange * 5 + Math.max(0, fundingPct) * 90 + oiToVolume * 12), 0, 100);
  const netFlow7d = volume24h * (dailyPriceChange / 100) * (1 + Math.min(1.5, Math.abs(fundingPct) * 4));
  const topTraderBias = longPct >= 58 ? "Long-heavy" : longPct <= 42 ? "Short-heavy" : "Mixed";
  const flowType = getFlowType(netFlow7d, openInterestChangeProxy, leveragePressureProxy, capitalRotationScore);

  return {
    asset,
    netFlow7d,
    flowVsAvg: 0,
    topTraderBias,
    openInterestChange: round1(openInterestChangeProxy),
    longShortRatio: `${longPct}/${100 - longPct}`,
    longPct,
    avgLeverage: round1(Math.max(1, Math.min(8, leveragePressureProxy / 15))),
    whaleConcentration: leveragePressureProxy >= 70 ? "High" : leveragePressureProxy >= 45 ? "Medium" : "Low",
    whaleScore: clamp(Math.round(leveragePressureProxy * 0.72 + abnormalFlowIndex * 0.28), 0, 100),
    abnormalFlowIndex,
    smartMoneyConcentration: clamp(Math.round(50 + Math.abs(dailyPriceChange) * 4 + oiToVolume * 16), 0, 100),
    capitalRotationScore,
    flowDivergenceIndex: abnormalFlowIndex,
    interpretation: getInterpretation(flowBias, flowType),
    flowType,
    traderCount: clamp(Math.round(35 + Math.min(65, volume24h / 100000000)), 20, 100),
    minInflow: netFlow7d,
    relatedMarkets: getRelatedMarkets(asset),
    rawDatapoints: [
      `Mark ${formatUsd(markPrice)}`,
      `Previous day ${formatUsd(previousDayPrice)}`,
      `24h volume ${formatUsd(volume24h)}`,
      `Open interest ${formatUsd(openInterestUsd)}`,
      fundingRate === null ? "Funding unavailable" : `Funding ${(fundingRate * 100).toFixed(4)}%`,
      `Daily price change ${signedPct(dailyPriceChange)}`,
    ],
    historicalComparison: `${asset} volume intensity and open-interest pressure are normalized against the tracked Hyperliquid asset universe from live market context.`,
    aiExplanation: `${asset} shows ${signedPct(dailyPriceChange)} daily price change, ${formatUsd(volume24h)} in 24h volume, and ${formatUsd(openInterestUsd)} open interest. OracleX classifies this as ${getInterpretation(flowBias, flowType).toLowerCase()}.`,
    hyperliquid: {
      markPrice,
      previousDayPrice,
      openInterest,
      openInterestUsd,
      volume24h,
      fundingRate,
      dailyPriceChange: round1(dailyPriceChange),
      openInterestChangeProxy: round1(openInterestChangeProxy),
      volumeIntensity: 100,
      flowBias,
      abnormalFlowIndex,
      capitalRotationScore,
      leveragePressureProxy,
    },
  };
}

function getFlowBias(dailyPriceChange: number, fundingPct: number): "Bullish" | "Bearish" | "Neutral" {
  const score = dailyPriceChange + fundingPct * 8;
  if (score > 1) return "Bullish";
  if (score < -1) return "Bearish";
  return "Neutral";
}

function getFlowType(netFlow7d: number, openInterestChangeProxy: number, leveragePressureProxy: number, capitalRotationScore: number): AssetFlow["flowType"] {
  if (capitalRotationScore >= 75) return "Asset Rotation";
  if (leveragePressureProxy >= 70) return "Leverage Build-Up";
  if (openInterestChangeProxy >= 12) return "OI Build-Up";
  if (netFlow7d < 0) return "Outflows";
  return "Inflows";
}

function getInterpretation(flowBias: "Bullish" | "Bearish" | "Neutral", flowType: AssetFlow["flowType"]) {
  if (flowType === "Asset Rotation") return "Strong capital rotation";
  if (flowType === "Leverage Build-Up") return "Leverage build-up";
  if (flowType === "OI Build-Up") return "Open interest acceleration";
  if (flowBias === "Bearish") return "Defensive positioning";
  if (flowBias === "Bullish") return "Directional inflow pressure";
  return "Balanced market flow";
}

function getRelatedMarkets(asset: string) {
  const markets: Record<string, string[]> = {
    BTC: ["BTC ATH Probability", "Bitcoin Weekly Close", "ETF inflow continuation"],
    ETH: ["ETH Ecosystem Rotation", "ETH ETF relative inflows", "ETH/BTC underperformance"],
    SOL: ["SOL ETF Approval", "SOL ecosystem TVL", "L1 rotation"],
    HYPE: ["AI Agent Market Share", "HYPE ecosystem revenue", "On-chain trading infra"],
    DOGE: ["DOGE ETF speculation", "Meme rotation", "Retail risk appetite"],
    XRP: ["XRP ETF odds", "SEC settlement outcomes", "Payment-token rotation"],
    BNB: ["Exchange token regulation", "BNB chain activity", "CEX market share"],
    ADA: ["Large-cap alt rotation", "L1 relative strength", "ADA ecosystem activity"],
    TRX: ["Stable settlement activity", "TRON network flows", "Large-cap defensives"],
    LINK: ["Oracle infrastructure demand", "DeFi data-layer rotation", "LINK ecosystem catalysts"],
    FARTCOIN: ["Meme coin momentum", "Retail rotation", "High-beta crypto baskets"],
  };

  return markets[asset] ?? [`${asset} probability repricing`, `${asset} liquidity rotation`, `${asset} volatility expansion`];
}

function firstNumber(...values: unknown[]) {
  for (const value of values) {
    const parsed = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
    if (Number.isFinite(parsed)) return parsed;
  }

  return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStablecoinAsset(asset: string) {
  return ["USDT", "USDC", "DAI", "USDE", "FDUSD", "TUSD", "PYUSD", "USDD", "FRAX", "LUSD"].includes(asset);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function round1(value: number) {
  return Math.round(value * 10) / 10;
}

function signedPct(value: number) {
  return `${value > 0 ? "+" : ""}${round1(value).toFixed(1)}%`;
}

function formatUsd(value: number) {
  if (Math.abs(value) >= 1000000000) return `$${(value / 1000000000).toFixed(2)}B`;
  if (Math.abs(value) >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(1)}K`;
  return `$${value.toFixed(2)}`;
}
