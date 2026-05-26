import "server-only";

import { mockWalletIntelligenceData, type WalletIntelligenceData, type WalletRecord } from "@/lib/wallet-intelligence-data";

type PolymarketAnalyticsRequest = {
  apiKey: string;
};

type PolymarketAnalyticsPayload = {
  topTraders?: unknown;
  walletStats?: unknown;
  walletPositions?: unknown;
};

type FalconRequestBodyFormat = "query" | "text" | "input";
type FalconRequestBody = Partial<Record<FalconRequestBodyFormat, string>>;

type FalconSemanticRetrieveAttempt = {
  requestBodyFormat: FalconRequestBody;
  endpointUrl: string;
  method: "POST";
  responseStatus: number | null;
  responseBodyText: string | null;
  error?: string;
};

export type FalconSemanticRetrieveDebug = {
  apiKeyExists: boolean;
  apiKeyLength: number;
  endpointUrl: string;
  method: "POST";
  attempts: FalconSemanticRetrieveAttempt[];
};

export type FalconSemanticRetrieveResult = {
  data: unknown;
  debug: FalconSemanticRetrieveDebug & {
    success: true;
    workingRequestBodyFormat: FalconSemanticRetrieveAttempt["requestBodyFormat"];
  };
};

const FALCON_SEMANTIC_RETRIEVE_URL = "https://narrative.agent.heisenberg.so/api/v2/semantic/retrieve/parameterized";
const POLYMARKET_ANALYTICS_BASE_URL = process.env.POLYMARKET_ANALYTICS_BASE_URL ?? "";
const FALCON_SEMANTIC_RETRIEVE_METHOD = "POST";
const FALCON_SEMANTIC_RETRIEVE_BODY_FORMATS = ["query", "text", "input"] satisfies FalconRequestBodyFormat[];

export class FalconSemanticRetrieveError extends Error {
  constructor(
    message: string,
    public readonly debug: FalconSemanticRetrieveDebug,
  ) {
    super(message);
    this.name = "FalconSemanticRetrieveError";
  }
}

async function fetchPolymarketAnalyticsJson<T>({ apiKey, endpoint }: PolymarketAnalyticsRequest & { endpoint: string }): Promise<T> {
  if (!POLYMARKET_ANALYTICS_BASE_URL) {
    throw new Error("POLYMARKET_ANALYTICS_BASE_URL is not configured. TODO: set this once PolymarketAnalytics endpoints are confirmed.");
  }

  const response = await fetch(new URL(endpoint, POLYMARKET_ANALYTICS_BASE_URL), {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`PolymarketAnalytics request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function fetchTopTraders({ apiKey }: PolymarketAnalyticsRequest) {
  // TODO: Replace with the confirmed PolymarketAnalytics top traders endpoint.
  return fetchPolymarketAnalyticsJson<unknown>({ apiKey, endpoint: "/top-traders" });
}

export async function fetchWalletStats({ apiKey }: PolymarketAnalyticsRequest) {
  // TODO: Replace with the confirmed PolymarketAnalytics wallet stats endpoint.
  return fetchPolymarketAnalyticsJson<unknown>({ apiKey, endpoint: "/wallet-stats" });
}

export async function fetchWalletPositions({ apiKey }: PolymarketAnalyticsRequest) {
  // TODO: Replace with the confirmed PolymarketAnalytics wallet positions endpoint.
  return fetchPolymarketAnalyticsJson<unknown>({ apiKey, endpoint: "/wallet-positions" });
}

export async function falconSemanticRetrieve(query: string): Promise<unknown> {
  const result = await falconSemanticRetrieveWithDebug(query);
  return result.data;
}

export async function falconSemanticRetrieveWithDebug(query: string): Promise<FalconSemanticRetrieveResult> {
  const apiKey = process.env.POLYMARKET_ANALYTICS_API_KEY;
  const debug: FalconSemanticRetrieveDebug = {
    apiKeyExists: Boolean(apiKey),
    apiKeyLength: apiKey?.length ?? 0,
    endpointUrl: FALCON_SEMANTIC_RETRIEVE_URL,
    method: FALCON_SEMANTIC_RETRIEVE_METHOD,
    attempts: [],
  };

  if (!apiKey) {
    throw new FalconSemanticRetrieveError("POLYMARKET_ANALYTICS_API_KEY is not configured.", debug);
  }

  for (const format of getFalconRequestBodyFormats(query)) {
    try {
      const response = await fetch(FALCON_SEMANTIC_RETRIEVE_URL, {
        method: FALCON_SEMANTIC_RETRIEVE_METHOD,
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(format),
        cache: "no-store",
      });

      const responseBodyText = await response.text();
      const attempt: FalconSemanticRetrieveAttempt = {
        requestBodyFormat: format,
        endpointUrl: FALCON_SEMANTIC_RETRIEVE_URL,
        method: FALCON_SEMANTIC_RETRIEVE_METHOD,
        responseStatus: response.status,
        responseBodyText,
      };
      debug.attempts.push(attempt);

      if (response.ok) {
        return {
          data: parseFalconResponseBody(responseBodyText),
          debug: {
            ...debug,
            success: true,
            workingRequestBodyFormat: format,
          },
        };
      }
    } catch (error) {
      debug.attempts.push({
        requestBodyFormat: format,
        endpointUrl: FALCON_SEMANTIC_RETRIEVE_URL,
        method: FALCON_SEMANTIC_RETRIEVE_METHOD,
        responseStatus: null,
        responseBodyText: null,
        error: error instanceof Error ? error.message : "Unknown Falcon request error",
      });
    }
  }

  const statuses = debug.attempts.map((attempt) => attempt.responseStatus).filter((status) => status !== null);
  const statusSummary = statuses.length > 0 ? ` with status ${statuses.join(", ")}` : "";
  throw new FalconSemanticRetrieveError(`Falcon semantic retrieve failed${statusSummary}.`, debug);
}

function getFalconRequestBodyFormats(query: string): FalconRequestBody[] {
  return FALCON_SEMANTIC_RETRIEVE_BODY_FORMATS.map((format) => ({ [format]: query }));
}

function parseFalconResponseBody(responseBodyText: string): unknown {
  if (!responseBodyText) return null;

  try {
    return JSON.parse(responseBodyText) as unknown;
  } catch {
    return responseBodyText;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isWalletRecord(value: unknown): value is WalletRecord {
  if (!isRecord(value)) return false;
  return typeof value.wallet === "string" && typeof value.rank === "number" && typeof value.volume === "number";
}

function normalizeKnownShape(raw: unknown): WalletIntelligenceData | null {
  if (!isRecord(raw) || !Array.isArray(raw.wallets) || !raw.wallets.every(isWalletRecord)) {
    return null;
  }

  return {
    ...mockWalletIntelligenceData,
    ...raw,
    wallets: raw.wallets,
    stats: isRecord(raw.stats) ? { ...mockWalletIntelligenceData.stats, ...raw.stats } : mockWalletIntelligenceData.stats,
    consensusInsights: Array.isArray(raw.consensusInsights) ? raw.consensusInsights : mockWalletIntelligenceData.consensusInsights,
    clusters: Array.isArray(raw.clusters) ? raw.clusters : mockWalletIntelligenceData.clusters,
    questionExamples: Array.isArray(raw.questionExamples) ? raw.questionExamples : mockWalletIntelligenceData.questionExamples,
    source: "polymarket-analytics",
    updatedAt: new Date().toISOString(),
  } as WalletIntelligenceData;
}

export function normalizeWalletData(payload: PolymarketAnalyticsPayload | unknown): WalletIntelligenceData {
  const direct = normalizeKnownShape(payload);
  if (direct) return direct;

  if (isRecord(payload)) {
    const topTraders = normalizeKnownShape(payload.topTraders);
    if (topTraders) return topTraders;
  }

  // TODO: Map the confirmed PolymarketAnalytics response schema into WalletRecord,
  // consensus insights, clusters, and summary stats.
  return {
    ...mockWalletIntelligenceData,
    source: "mock",
    updatedAt: new Date().toISOString(),
  };
}
