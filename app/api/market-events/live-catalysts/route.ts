import { getLiveMarketCatalysts, LIVE_CATALYST_REVALIDATE_SECONDS } from "@/lib/integrations/market-news";

export const revalidate = 1800;

export async function GET() {
  try {
    const payload = await getLiveMarketCatalysts();
    const status = payload.status === "live" ? 200 : 503;

    return Response.json(payload, {
      status,
      headers: {
        "Cache-Control": `s-maxage=${LIVE_CATALYST_REVALIDATE_SECONDS}, stale-while-revalidate=${LIVE_CATALYST_REVALIDATE_SECONDS}`,
      },
    });
  } catch (error) {
    const now = new Date();
    const message = error instanceof Error ? error.message : "Unknown live catalyst error";

    return Response.json(
      {
        status: "unavailable",
        label: "Live news unavailable",
        refreshedAt: now.toISOString(),
        nextRefreshAt: new Date(now.getTime() + LIVE_CATALYST_REVALIDATE_SECONDS * 1000).toISOString(),
        catalysts: [],
        errors: [message],
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }
}
