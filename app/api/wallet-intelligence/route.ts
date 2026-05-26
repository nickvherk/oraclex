import { FalconSemanticRetrieveError, falconSemanticRetrieve, normalizeWalletData } from "@/lib/integrations/polymarket-analytics";
import { mockWalletIntelligenceData } from "@/lib/wallet-intelligence-data";

const WALLET_INTELLIGENCE_QUERY = "Top Polymarket wallets by volume, ROI, win rate, active positions, and category specialization";

export async function GET() {
  const apiKey = process.env.POLYMARKET_ANALYTICS_API_KEY;

  if (!apiKey) {
    return Response.json({
      ...mockWalletIntelligenceData,
      error: "POLYMARKET_ANALYTICS_API_KEY is not configured.",
      rawFalconResponse: null,
      source: "mock",
      updatedAt: new Date().toISOString(),
    });
  }

  try {
    const rawFalconResponse = await falconSemanticRetrieve(WALLET_INTELLIGENCE_QUERY);

    return Response.json({
      ...normalizeWalletData(rawFalconResponse),
      rawFalconResponse,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown PolymarketAnalytics error";
    const falconDebug = error instanceof FalconSemanticRetrieveError ? error.debug : null;

    return Response.json({
      ...mockWalletIntelligenceData,
      error: message,
      falconDebug,
      rawFalconResponse: null,
      source: "mock",
      updatedAt: new Date().toISOString(),
    });
  }
}
