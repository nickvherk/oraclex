import { HYPERLIQUID_REVALIDATE_SECONDS, getHyperliquidFlows } from "@/lib/integrations/hyperliquid";

export const revalidate = 60;

export async function GET() {
  try {
    const payload = await getHyperliquidFlows();

    return Response.json(payload, {
      headers: {
        "Cache-Control": `s-maxage=${HYPERLIQUID_REVALIDATE_SECONDS}, stale-while-revalidate=${HYPERLIQUID_REVALIDATE_SECONDS}`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Hyperliquid flow error";
    const now = new Date().toISOString();

    return Response.json(
      {
        source: "hyperliquid",
        sourceStatus: "fallback",
        lastUpdated: now,
        updatedAt: now,
        refresh: "live / 60s",
        assets: [],
        topTraders: [],
        metrics: {
          totalSmartMoneyInflow7d: null,
          largestInflowAsset: null,
          largestOutflowAsset: null,
          topTraderNetBias: "Unavailable - requires tracked wallet ingestion",
          openInterestAcceleration: null,
          abnormalFlowIndex: null,
        },
        availability: {
          marketData: "unavailable",
          traderDiscovery: "unavailable",
          userPositions: "live",
          smartMoneyInflow: "unavailable",
          longShortRatio: "unavailable",
          openInterestAcceleration: "unavailable",
          whaleConcentration: "unavailable",
          abnormalFlowIndex: "unavailable",
        },
        limitations: [message],
        error: message,
      },
      { status: 502 },
    );
  }
}
