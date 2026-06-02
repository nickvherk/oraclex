export const TRACKED_ASSETS = ["BTC", "ETH", "SOL", "BNB", "XRP", "HYPE", "DOGE"] as const;

export const TRACKED_ASSET_SET = new Set<string>(TRACKED_ASSETS);

export function normalizeAssetSymbol(rowOrSymbol: unknown) {
  const symbol =
    typeof rowOrSymbol === "object" && rowOrSymbol !== null && !Array.isArray(rowOrSymbol)
      ? ((rowOrSymbol as Record<string, unknown>).asset ?? (rowOrSymbol as Record<string, unknown>).symbol ?? (rowOrSymbol as Record<string, unknown>).coin ?? (rowOrSymbol as Record<string, unknown>).name ?? (rowOrSymbol as Record<string, unknown>).token)
      : rowOrSymbol;

  const normalized = String(symbol ?? "").trim().toUpperCase();
  return normalized.length > 0 ? normalized : null;
}
