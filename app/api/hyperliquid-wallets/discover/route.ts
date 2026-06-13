import { discoverHyperliquidWalletsFromRecentTrades } from "@/lib/integrations/hyperliquid-wallet-discovery";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await discoverHyperliquidWalletsFromRecentTrades();
    return Response.json({
      source: "hyperliquid",
      mode: "recentTrades",
      newlyDiscoveredWallets: result.wallets,
      stats: result.stats,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Hyperliquid wallet discovery error.";
    return Response.json({ source: "hyperliquid", mode: "recentTrades", newlyDiscoveredWallets: [], stats: null, error: message }, { status: 502 });
  }
}
