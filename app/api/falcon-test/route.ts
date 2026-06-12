import { FalconAnalyticsError, falconSemanticRetrieveWithDebug } from "@/lib/integrations/polymarket-analytics";

const FALCON_TEST_QUERY = "Top Polymarket traders by volume and profitability";

export async function GET() {
  try {
    const { data, debug } = await falconSemanticRetrieveWithDebug(FALCON_TEST_QUERY);

    return Response.json({
      success: true,
      query: FALCON_TEST_QUERY,
      debug,
      rawFalconResponse: data,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Falcon semantic retrieve error";
    const debug = error instanceof FalconAnalyticsError ? { message } : null;

    return Response.json(
      {
        success: false,
        query: FALCON_TEST_QUERY,
        error: message,
        debug,
      },
      { status: 502 },
    );
  }
}
