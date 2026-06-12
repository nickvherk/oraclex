import { getPredictionMarketAnalytics } from "@/lib/integrations/polymarket-analytics";

export const dynamic = "force-dynamic";

export async function GET() {
  const analytics = await getPredictionMarketAnalytics();
  return Response.json(analytics);
}
