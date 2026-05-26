import "server-only";

const HYPERLIQUID_INFO_URL = "https://api.hyperliquid.xyz/info";
const HYPERLIQUID_TIMEOUT_MS = 10000;

type HyperliquidInfoBody =
  | { type: "metaAndAssetCtxs" }
  | { type: "allMids" }
  | { type: "clearinghouseState"; user: string }
  | { type: "userFills"; user: string }
  | Record<string, unknown>;

export class HyperliquidInfoError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly responseBody?: string,
  ) {
    super(message);
    this.name = "HyperliquidInfoError";
  }
}

export async function hyperliquidInfo<T = unknown>(body: HyperliquidInfoBody): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), HYPERLIQUID_TIMEOUT_MS);

  try {
    const response = await fetch(HYPERLIQUID_INFO_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: controller.signal,
    });

    const responseBody = await response.text();

    if (!response.ok) {
      throw new HyperliquidInfoError(`Hyperliquid info request failed with status ${response.status}.`, response.status, responseBody);
    }

    if (!responseBody) {
      return null as T;
    }

    return JSON.parse(responseBody) as T;
  } catch (error) {
    if (error instanceof HyperliquidInfoError) {
      throw error;
    }

    const message = error instanceof Error ? error.message : "Unknown Hyperliquid request error";
    throw new HyperliquidInfoError(`Hyperliquid info request failed: ${message}`);
  } finally {
    clearTimeout(timeout);
  }
}

export function fetchMetaAndAssetCtxs() {
  return hyperliquidInfo({ type: "metaAndAssetCtxs" });
}

export function fetchAllMids() {
  return hyperliquidInfo<Record<string, string>>({ type: "allMids" });
}

export function fetchClearinghouseState(userAddress: string) {
  return hyperliquidInfo({ type: "clearinghouseState", user: userAddress });
}

export function fetchUserFills(userAddress: string) {
  return hyperliquidInfo({ type: "userFills", user: userAddress });
}
