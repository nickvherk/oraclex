import { getPredictionMarketAnalytics, getPredictionMarketWalletProfile } from "@/lib/integrations/polymarket-analytics";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get("wallet");

  if (wallet) {
    const profile = await getPredictionMarketWalletProfile(wallet);
    return Response.json(profile);
  }

  const analytics = await getPredictionMarketAnalytics();
  return Response.json(analytics);
}
