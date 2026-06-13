import { getHyperliquidWalletProfile } from "@/lib/integrations/hyperliquid-wallet-profile";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ wallet: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { wallet } = await context.params;

  try {
    const profile = await getHyperliquidWalletProfile(wallet);
    return Response.json(profile, { status: profile.walletFound ? 200 : 404 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Hyperliquid wallet enrichment error.";
    return Response.json({ source: "hyperliquid", wallet, error: message }, { status: 502 });
  }
}
