import { getHyperliquidWalletLeaderboard } from "@/lib/integrations/hyperliquid-wallet-leaderboard";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const asset = url.searchParams.get("asset");
    const limit = Number(url.searchParams.get("limit") ?? 50);
    const payload = await getHyperliquidWalletLeaderboard(asset, Number.isFinite(limit) ? limit : 50);

    return Response.json(payload, {
      headers: {
        "Cache-Control": "s-maxage=30, stale-while-revalidate=60",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Hyperliquid wallet leaderboard error.";

    return Response.json(
      {
        source: "oraclex-discovered-hyperliquid-wallets",
        method: "recentTrades discovery + clearinghouseState enrichment",
        officialHyperliquidLeaderboard: false,
        updatedAt: new Date().toISOString(),
        stats: {
          discoveredWallets: 0,
          enrichedWallets: 0,
          latestIngestTime: null,
        },
        wallets: [],
        assetExposures: [],
        selectedAssetExposure: null,
        error: message,
      },
      { status: 500 },
    );
  }
}
