export type WalletPosition = {
  market: string;
  side: "YES" | "NO";
  positionSize: number;
  avgPrice: string;
  currentPrice: string;
  unrealizedPnl: string;
  conviction: "High" | "Medium" | "Watch";
  lastUpdated: string;
};

export type WalletProfile = {
  wallet: string;
  tag: string;
  category: string;
  cohort: string;
  roi: number;
  pnl: number;
  winRate: number;
  volume: number;
  openPositions: number;
  conviction: number;
  exposure: string;
  interpretation: string;
  positions: WalletPosition[];
  recentChanges: string[];
  marketExposure: { label: string; value: string; tone?: string }[];
  relatedWallets: { wallet: string; tag: string; relationship: string }[];
  evidence: string[];
  performance: { label: string; value: string }[];
};

export function money(value: number) {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  return `$${(value / 1000).toFixed(0)}K`;
}

export function shortWallet(wallet: string) {
  return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
}

export function walletProfilePath(wallet: string) {
  return `/terminal/prediction-market-analytics/wallet/${encodeURIComponent(wallet)}`;
}

const walletProfiles: WalletProfile[] = [
  {
    wallet: "0x91d022c45aa4ef70d657dba303318c8344f5a117",
    tag: "SPORTS-MM-08",
    category: "Sports",
    cohort: "Top 20 Sports Wallets",
    roi: 24.7,
    pnl: 3112200,
    winRate: 68,
    volume: 12600000,
    openPositions: 18,
    conviction: 84,
    exposure: "60% Lakers YES / 24% totals / 16% cash",
    interpretation: "Sports specialist adding exposure into Lakers YES while reducing public-favorite spread risk. OracleX treats this wallet as a high-signal sports market maker because position changes cluster before late injury and lineup repricing.",
    positions: [
      { market: "Lakers Win Tonight", side: "YES", positionSize: 42500, avgPrice: "0.61", currentPrice: "0.67", unrealizedPnl: "+$4.1K", conviction: "High", lastUpdated: "12m ago" },
      { market: "Celtics 1H", side: "YES", positionSize: 280000, avgPrice: "0.49", currentPrice: "0.53", unrealizedPnl: "+$22.8K", conviction: "Medium", lastUpdated: "18m ago" },
      { market: "NBA total under 221.5", side: "YES", positionSize: 170000, avgPrice: "0.47", currentPrice: "0.50", unrealizedPnl: "+$10.9K", conviction: "Medium", lastUpdated: "34m ago" },
    ],
    recentChanges: ["+$340K YES Lakers win tonight at 61c", "+$210K YES under 214.5 at 47c", "+$125K NO Yankees F5 at 55c"],
    marketExposure: [
      { label: "NBA sides", value: "$6.8M net adds", tone: "text-blue-100" },
      { label: "Totals", value: "$2.1M active", tone: "text-slate-300" },
      { label: "Public fades", value: "61% NO", tone: "text-red-200" },
    ],
    relatedWallets: [
      { wallet: "0x2bf1904d1728eb3e2c66351d4374fbd73e096d51", tag: "SPORTS-LATE-87", relationship: "NBA injury-news basket" },
      { wallet: "0x7b49b92d4dd5f8b2a730e98860be66a9e2548014", tag: "NBA-INJURY-14", relationship: "Late lineup confirmation" },
    ],
    evidence: ["12 top sports wallets aligned on Lakers YES", "$6.8M net exposure added over 24h", "Position updates concentrated within 90 minutes of injury-news windows", "Source: Polymarket wallet analytics placeholder"],
    performance: [
      { label: "30D ROI", value: "+24.7%" },
      { label: "All-time win rate", value: "68%" },
      { label: "Best category", value: "NBA sides" },
      { label: "Worst category", value: "Late spread reversals" },
    ],
  },
  {
    wallet: "0x48f3cb240ff2ac88d01e8e75c635911c03fc7704",
    tag: "CRYPTO-INST-12",
    category: "Crypto",
    cohort: "Top 50 Crypto Wallets",
    roi: 31.2,
    pnl: 6895200,
    winRate: 70,
    volume: 22100000,
    openPositions: 14,
    conviction: 89,
    exposure: "64% SOL ETF YES / 24% BTC ATH YES / 12% cash",
    interpretation: "Crypto adoption wallet is accumulating SOL ETF and BTC ATH exposure while public probabilities remain behind OracleX modeled probability. This is the primary wallet profile for the SOL ETF smart-money consensus card.",
    positions: [
      { market: "SOL ETF Approval", side: "YES", positionSize: 540000, avgPrice: "0.62", currentPrice: "0.68", unrealizedPnl: "+$52.3K", conviction: "High", lastUpdated: "9m ago" },
      { market: "BTC ATH this quarter", side: "YES", positionSize: 1100000, avgPrice: "0.57", currentPrice: "0.61", unrealizedPnl: "+$77.2K", conviction: "High", lastUpdated: "12m ago" },
      { market: "ETH relative volume", side: "NO", positionSize: 220000, avgPrice: "0.43", currentPrice: "0.39", unrealizedPnl: "+$13.6K", conviction: "Medium", lastUpdated: "26m ago" },
    ],
    recentChanges: ["+$540K YES SOL ETF at 62c", "+$1.1M YES BTC ATH at 57c", "+$220K NO ETH volume at 43c"],
    marketExposure: [
      { label: "SOL ETF", value: "$3.8M cohort adds", tone: "text-blue-100" },
      { label: "BTC ATH", value: "$1.1M position", tone: "text-emerald-200" },
      { label: "ETH rotation", value: "NO hedge active", tone: "text-slate-300" },
    ],
    relatedWallets: [
      { wallet: "0xad904d3c8938dfce6a9170ee41e5b7d5a9d13af4", tag: "CRYPTO-SOL-142", relationship: "SOL ETF accumulation cluster" },
      { wallet: "0xe6a1b1a7c63b843765048c9b4e764d2e18c93309", tag: "SOL-ETF-09", relationship: "ETF specialist wallet" },
    ],
    evidence: ["14 linked wallets active", "$3.8M YES accumulation", "72% directional alignment across crypto adoption wallets", "Source: Polymarket wallet analytics placeholder"],
    performance: [
      { label: "30D ROI", value: "+31.2%" },
      { label: "All-time win rate", value: "70%" },
      { label: "Best category", value: "Crypto adoption" },
      { label: "Worst category", value: "Low-liquidity alt baskets" },
    ],
  },
  {
    wallet: "0x13b9af0d65a45e1f862d40bdf6c1b3ab7401d4f2",
    tag: "MACRO-HEDGE-18",
    category: "Macro",
    cohort: "Top 100 Macro Wallets",
    roi: 19.6,
    pnl: 1920800,
    winRate: 64,
    volume: 9800000,
    openPositions: 9,
    conviction: 63,
    exposure: "53% Fed cuts YES / 31% CPI NO / 16% cash",
    interpretation: "Macro wallet has a modest tilt toward Fed cuts, but the signal is less crowded and less directional than sports or crypto consensus. OracleX uses this profile as a macro context object rather than a high-conviction lead signal.",
    positions: [
      { market: "Fed Cuts Next Meeting", side: "YES", positionSize: 240000, avgPrice: "0.38", currentPrice: "0.41", unrealizedPnl: "+$11.6K", conviction: "Medium", lastUpdated: "19m ago" },
      { market: "CPI below 2.6", side: "NO", positionSize: 190000, avgPrice: "0.61", currentPrice: "0.58", unrealizedPnl: "+$8.7K", conviction: "Watch", lastUpdated: "43m ago" },
    ],
    recentChanges: ["+$240K YES Fed cuts next meeting at 38c", "+$190K NO CPI below 2.6 at 61c", "+$80K YES auction tail"],
    marketExposure: [
      { label: "Rates", value: "$2.1M cohort adds", tone: "text-blue-100" },
      { label: "Inflation", value: "NO CPI hedge", tone: "text-red-200" },
      { label: "Treasury risk", value: "Event-driven", tone: "text-slate-300" },
    ],
    relatedWallets: [
      { wallet: "0x3bb24418bb51a53cf036a124c671ed442f14d901", tag: "RATES-CUT-44", relationship: "Rates event wallet" },
      { wallet: "0x52722ff4d0e9d8cbf2029a55bb0be634d17dc012", tag: "CPI-DESK-12", relationship: "Inflation specialist" },
    ],
    evidence: ["31 macro wallets aligned", "$2.1M net exposure added over 7d", "Only 53% YES alignment, so signal strength remains moderate", "Source: Polymarket wallet analytics placeholder"],
    performance: [
      { label: "30D ROI", value: "+19.6%" },
      { label: "All-time win rate", value: "64%" },
      { label: "Best category", value: "Rates event windows" },
      { label: "Worst category", value: "Source-conflict CPI markets" },
    ],
  },
];

const fallbackProfile = walletProfiles[0];

export function getWalletProfile(wallet: string) {
  return walletProfiles.find((profile) => profile.wallet.toLowerCase() === wallet.toLowerCase()) ?? {
    ...fallbackProfile,
    wallet,
    tag: "TRACKED-WALLET",
    cohort: "Tracked Wallet Universe",
    interpretation: "This wallet profile is using structured placeholder analytics until the Polymarket wallet positions integration is connected.",
  };
}
