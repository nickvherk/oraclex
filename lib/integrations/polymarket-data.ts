import "server-only";

const POLYMARKET_DATA_URL = "https://data-api.polymarket.com";

type QueryValue = string | number | boolean | null | undefined;

type PolymarketDataCall<T> = {
  ok: boolean;
  status: number | null;
  data: T;
  error?: string;
};

export type PolymarketPosition = {
  proxyWallet?: string;
  asset?: string;
  conditionId?: string;
  size?: number;
  avgPrice?: number;
  initialValue?: number;
  currentValue?: number;
  cashPnl?: number;
  percentPnl?: number;
  totalBought?: number;
  realizedPnl?: number;
  percentRealizedPnl?: number;
  curPrice?: number;
  title?: string;
  slug?: string;
  icon?: string;
  eventSlug?: string;
  outcome?: string;
  outcomeIndex?: number;
  oppositeOutcome?: string;
  oppositeAsset?: string;
  endDate?: string;
  negativeRisk?: boolean;
};

export type PolymarketTrade = {
  proxyWallet?: string;
  side?: "BUY" | "SELL" | string;
  asset?: string;
  conditionId?: string;
  size?: number;
  price?: number;
  timestamp?: number;
  title?: string;
  slug?: string;
  icon?: string;
  eventSlug?: string;
  outcome?: string;
  outcomeIndex?: number;
  name?: string;
  pseudonym?: string;
  bio?: string;
  profileImage?: string;
  profileImageOptimized?: string;
  transactionHash?: string;
};

export type PolymarketActivity = PolymarketTrade & {
  usdcSize?: number;
  isCombo?: boolean;
  type?: string;
};

export type PolymarketClosedPosition = {
  proxyWallet?: string;
  asset?: string;
  conditionId?: string;
  avgPrice?: number;
  totalBought?: number;
  realizedPnl?: number;
  percentPnl?: number;
  percentRealizedPnl?: number;
  curPrice?: number;
  timestamp?: number;
  title?: string;
  slug?: string;
  icon?: string;
  eventSlug?: string;
  outcome?: string;
  outcomeIndex?: number;
  oppositeOutcome?: string;
  oppositeAsset?: string;
  endDate?: string;
};

export type PolymarketWalletValue = {
  user?: string;
  value?: number;
};

export type PolymarketWalletEnrichment = {
  positions: PolymarketPosition[];
  trades: PolymarketTrade[];
  activity: PolymarketActivity[];
  value: PolymarketWalletValue | null;
  closedPositions: PolymarketClosedPosition[];
  calls: {
    label: string;
    ok: boolean;
    status: number | null;
    count: number;
    error?: string;
  }[];
};

export async function getPolymarketWalletEnrichment(wallet: string): Promise<PolymarketWalletEnrichment> {
  const [positions, value, trades, activity, closedPositions] = await Promise.all([
    getPolymarketPositions({ user: wallet, limit: 500, offset: 0 }),
    getPolymarketValue({ user: wallet }),
    getPolymarketTrades({ user: wallet, limit: 100, offset: 0 }),
    getPolymarketActivity({ user: wallet, type: "TRADE", limit: 100, offset: 0 }),
    getPolymarketClosedPositions({ user: wallet, limit: 50, offset: 0 }),
  ]);

  return {
    positions: positions.data,
    value: value.data,
    trades: trades.data,
    activity: activity.data,
    closedPositions: closedPositions.data,
    calls: [
      callSummary("positions", positions),
      callSummary("value", value, value.data ? 1 : 0),
      callSummary("trades", trades),
      callSummary("activity", activity),
      callSummary("closed-positions", closedPositions),
    ],
  };
}

export function getPolymarketPositions(params: { user: string; limit?: number; offset?: number; sizeThreshold?: number; sortBy?: string; sortDirection?: "ASC" | "DESC" }) {
  return dataApiArray<PolymarketPosition>("/positions", params);
}

export function getPolymarketTrades(params: { user: string; limit?: number; offset?: number }) {
  return dataApiArray<PolymarketTrade>("/trades", params);
}

export function getPolymarketActivity(params: { user: string; type?: "TRADE"; limit?: number; offset?: number }) {
  return dataApiArray<PolymarketActivity>("/activity", params);
}

export async function getPolymarketValue(params: { user: string }) {
  const result = await dataApiUnknown("/value", params);
  const value = Array.isArray(result.data) ? result.data.find(isRecord) : result.data;
  return {
    ...result,
    data: isRecord(value) ? (value as PolymarketWalletValue) : null,
  };
}

export function getPolymarketClosedPositions(params: { user: string; limit?: number; offset?: number }) {
  return dataApiArray<PolymarketClosedPosition>("/closed-positions", { ...params, limit: params.limit === undefined ? undefined : Math.min(params.limit, 50) });
}

async function dataApiArray<T>(path: string, params: Record<string, QueryValue>): Promise<PolymarketDataCall<T[]>> {
  const result = await dataApiUnknown(path, params);
  return {
    ...result,
    data: Array.isArray(result.data) ? result.data.filter(isRecord) as T[] : [],
  };
}

async function dataApiUnknown(path: string, params: Record<string, QueryValue>): Promise<PolymarketDataCall<unknown>> {
  try {
    const response = await fetch(`${POLYMARKET_DATA_URL}${path}?${queryString(params)}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    const text = await response.text();
    const payload = parseJson(text);

    return {
      ok: response.ok,
      status: response.status,
      data: response.ok ? payload : null,
      error: response.ok ? undefined : extractError(payload) ?? `Polymarket Data API request failed with ${response.status}`,
    };
  } catch (error) {
    return {
      ok: false,
      status: null,
      data: null,
      error: error instanceof Error ? error.message : "Unknown Polymarket Data API request error",
    };
  }
}

function callSummary<T>(label: string, call: PolymarketDataCall<T[]>, count?: number): PolymarketWalletEnrichment["calls"][number];
function callSummary<T>(label: string, call: PolymarketDataCall<T>, count: number): PolymarketWalletEnrichment["calls"][number];
function callSummary<T>(label: string, call: PolymarketDataCall<T[] | T>, count?: number) {
  return {
    label,
    ok: call.ok,
    status: call.status,
    count: count ?? (Array.isArray(call.data) ? call.data.length : 0),
    error: call.error,
  };
}

function queryString(params: Record<string, QueryValue>) {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    searchParams.set(key, String(value));
  }
  return searchParams.toString();
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

function extractError(payload: unknown) {
  if (!isRecord(payload)) return null;
  if (typeof payload.error === "string") return payload.error;
  if (typeof payload.message === "string") return payload.message;
  return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
