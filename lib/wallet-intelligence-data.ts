export const TRACKED_WALLET_UNIVERSE = 12480;
export const SMART_MONEY_WALLETS = 1250;
export const ACTIVE_WALLETS = 840;

export type WalletCategory = "Sports" | "Politics" | "Geopolitics" | "Crypto" | "Macro" | "AI";
export type WalletBias = "YES-heavy" | "NO-heavy" | "Neutral" | "Contrarian";
export type WalletSignalType = "Consensus" | "Divergence" | "Momentum" | "Whale Rotation" | "Early Positioning";
export type WalletMarketType = "Binary" | "Spread" | "Range" | "Event Basket";

export type WalletRecord = {
  rank: number;
  wallet: string;
  tag: string;
  category: WalletCategory;
  group: string;
  pnl?: number | null;
  pnlSource?: "live" | "derived" | "unavailable";
  roi: number;
  winRate: number;
  volume: number;
  bias: WalletBias;
  conviction: number;
  earlySignal: number;
  smartMoneyRating: number;
  divergence: number;
  activeMarkets: number;
  lastPosition: string;
  lastActive: string;
  signalType: WalletSignalType;
  exposure: string;
  specialization: string;
  accuracy: number;
  cluster: string;
  marketType: WalletMarketType;
  positionSize: number;
  entries: string[];
  activeMarketsList: string[];
  interpretation: string;
  totalPositions?: number;
  totalWins?: number;
  totalLosses?: number;
};

export type ConsensusInsight = {
  segment: string;
  wallets: number;
  volume: number;
  exposure: string;
  timeframe: string;
  confidence: number;
  insight: string;
};

export type WalletCluster = {
  title: string;
  wallets: number;
  volume: number;
  confidence: number;
  impact: string;
  divergence: string;
  severity: string;
  detail: string;
};

export type WalletIntelligenceData = {
  stats: {
    trackedWalletUniverse: number;
    smartMoneyWallets: number;
    activeWallets: number;
  };
  wallets: WalletRecord[];
  consensusInsights: ConsensusInsight[];
  clusters: WalletCluster[];
  questionExamples: string[];
  source: "polymarket-analytics" | "mock";
  updatedAt: string;
};

export const mockWallets: WalletRecord[] = [
  {
    rank: 3,
    wallet: "0x7c81a4b6f23d91e44a8c6f210bb2a981b49d03ef",
    tag: "GEO-EARLY-03",
    category: "Geopolitics",
    group: "Top 50 Geopolitics Wallets",
    roi: 38.4,
    winRate: 72,
    volume: 18400000,
    bias: "YES-heavy",
    conviction: 91,
    earlySignal: 88,
    smartMoneyRating: 94,
    divergence: 71,
    activeMarkets: 11,
    lastPosition: "+$620K YES ceasefire at 41c",
    lastActive: "4m ago",
    signalType: "Early Positioning",
    exposure: "72% YES / 16% NO / 12% cash",
    specialization: "Geopolitical de-escalation and event-window markets",
    accuracy: 74,
    cluster: "Ceasefire accumulation cluster A",
    marketType: "Binary",
    positionSize: 620000,
    entries: ["+$620K YES Ukraine ceasefire at 41c", "+$180K YES sanctions extension at 58c", "-$90K reduced NO maritime escalation"],
    activeMarketsList: ["Ukraine ceasefire before September", "EU sanctions extension", "Middle East summit announcement"],
    interpretation: "Rank 3 geopolitics wallet is 72% YES exposed across ceasefire outcomes, with $18.4M tracked volume, 91 Conviction Score, and 71 Flow Divergence Index.",
  },
  {
    rank: 8,
    wallet: "0x91d022c45aa4ef70d657dba303318c8344f5a117",
    tag: "SPORTS-MM-08",
    category: "Sports",
    group: "Top 20 Sports Wallets",
    roi: 24.7,
    winRate: 68,
    volume: 12600000,
    bias: "NO-heavy",
    conviction: 84,
    earlySignal: 76,
    smartMoneyRating: 86,
    divergence: 82,
    activeMarkets: 18,
    lastPosition: "+$340K NO Lakers spread at 52c",
    lastActive: "8m ago",
    signalType: "Divergence",
    exposure: "27% YES / 61% NO / 12% cash",
    specialization: "US sports spreads, totals, and public-favorite fades",
    accuracy: 69,
    cluster: "Sports public divergence cluster",
    marketType: "Spread",
    positionSize: 340000,
    entries: ["+$340K NO Lakers spread at 52c", "+$210K YES under 214.5 at 47c", "+$125K NO Yankees F5 at 55c"],
    activeMarketsList: ["Lakers spread market", "Knicks moneyline", "Yankees first five innings"],
    interpretation: "Top sports wallet is 61% NO exposed against public-favorite game lines, backed by $12.6M tracked volume, 18 active markets, and an 82 Flow Divergence Index.",
  },
  {
    rank: 12,
    wallet: "0x48f3cb240ff2ac88d01e8e75c635911c03fc7704",
    tag: "CRYPTO-INST-12",
    category: "Crypto",
    group: "Top 100 Crypto Wallets",
    roi: 31.2,
    winRate: 70,
    volume: 22100000,
    bias: "YES-heavy",
    conviction: 89,
    earlySignal: 82,
    smartMoneyRating: 91,
    divergence: 66,
    activeMarkets: 14,
    lastPosition: "+$1.1M YES BTC ATH at 57c",
    lastActive: "12m ago",
    signalType: "Momentum",
    exposure: "69% YES / 20% NO / 11% cash",
    specialization: "Crypto adoption, ETF, and ATH probability markets",
    accuracy: 71,
    cluster: "Institutional crypto adoption cluster",
    marketType: "Event Basket",
    positionSize: 1100000,
    entries: ["+$1.1M YES BTC ATH at 57c", "+$540K YES SOL ETF at 62c", "+$220K NO ETH volume at 43c"],
    activeMarketsList: ["BTC new ATH this quarter", "SOL ETF approval", "ETH relative volume"],
    interpretation: "Top crypto wallet is 69% YES exposed to adoption outcomes, with $22.1M tracked volume and 82 Early Signal Score before broad odds repricing.",
  },
  {
    rank: 18,
    wallet: "0x13b9af0d65a45e1f862d40bdf6c1b3ab7401d4f2",
    tag: "MACRO-HEDGE-18",
    category: "Macro",
    group: "Top Macro Wallets",
    roi: 19.6,
    winRate: 64,
    volume: 9800000,
    bias: "Neutral",
    conviction: 63,
    earlySignal: 71,
    smartMoneyRating: 70,
    divergence: 39,
    activeMarkets: 9,
    lastPosition: "+$240K YES Fed cut at 38c",
    lastActive: "19m ago",
    signalType: "Consensus",
    exposure: "39% YES / 34% NO / 27% cash",
    specialization: "Rates, inflation prints, and Treasury event risk",
    accuracy: 65,
    cluster: "Macro hedge basket",
    marketType: "Range",
    positionSize: 240000,
    entries: ["+$240K YES Fed cut at 38c", "+$190K NO CPI below 2.6 at 61c", "+$80K YES auction tail"],
    activeMarketsList: ["Fed cuts rates next meeting", "CPI below 2.6", "Treasury auction tail"],
    interpretation: "Top macro wallet is balanced at 39% YES and 34% NO, so OracleX treats it as regime context rather than a directional signal.",
  },
  {
    rank: 21,
    wallet: "0x6a502df4b0aece8316322778f3d11a88762b8120",
    tag: "AI-RELEASE-21",
    category: "AI",
    group: "Top AI Wallets",
    roi: 44.1,
    winRate: 75,
    volume: 7400000,
    bias: "YES-heavy",
    conviction: 93,
    earlySignal: 90,
    smartMoneyRating: 95,
    divergence: 78,
    activeMarkets: 8,
    lastPosition: "+$420K YES agent OS at 54c",
    lastActive: "23m ago",
    signalType: "Whale Rotation",
    exposure: "76% YES / 13% NO / 11% cash",
    specialization: "AI release cycles and frontier lab event markets",
    accuracy: 76,
    cluster: "AI release-cycle accumulation",
    marketType: "Binary",
    positionSize: 420000,
    entries: ["+$420K YES agent OS at 54c", "+$160K YES model release at 49c", "+$70K NO EU AI delay at 36c"],
    activeMarketsList: ["Major AI lab releases agent OS", "Frontier model release", "EU AI act delay"],
    interpretation: "AI release specialist is 76% YES exposed, with 44.1% ROI, 75% win rate, and 90 Early Signal Score across release-cycle markets.",
  },
  {
    rank: 31,
    wallet: "0xe1f55a8a92f96431c5b79d11d2a71d89c0396bc0",
    tag: "POL-POLL-31",
    category: "Politics",
    group: "Top Politics Wallets",
    roi: 16.8,
    winRate: 61,
    volume: 15600000,
    bias: "NO-heavy",
    conviction: 77,
    earlySignal: 69,
    smartMoneyRating: 75,
    divergence: 54,
    activeMarkets: 16,
    lastPosition: "+$510K NO approval above 45c",
    lastActive: "31m ago",
    signalType: "Consensus",
    exposure: "28% YES / 58% NO / 14% cash",
    specialization: "Polling dislocations and event-calendar politics",
    accuracy: 62,
    cluster: "Approval fade cluster",
    marketType: "Binary",
    positionSize: 510000,
    entries: ["+$510K NO approval above 45c", "+$130K YES debate held before July", "+$95K NO polling surge"],
    activeMarketsList: ["Incumbent approval above 45%", "Debate before July", "Third-party polling surge"],
    interpretation: "Politics desk is 58% NO exposed to approval recovery, backed by $15.6M tracked volume and 16 active markets.",
  },
  {
    rank: 44,
    wallet: "0xb3bb81402066ea311cf5eb862f9c642982fe7a83",
    tag: "GEO-LINK-44",
    category: "Geopolitics",
    group: "Top 50 Geopolitics Wallets",
    roi: 27.5,
    winRate: 67,
    volume: 6100000,
    bias: "YES-heavy",
    conviction: 81,
    earlySignal: 86,
    smartMoneyRating: 83,
    divergence: 68,
    activeMarkets: 7,
    lastPosition: "+$260K YES ceasefire extension at 46c",
    lastActive: "42m ago",
    signalType: "Early Positioning",
    exposure: "63% YES / 22% NO / 15% cash",
    specialization: "Secondary geopolitics wallets linked to larger clusters",
    accuracy: 68,
    cluster: "Ceasefire accumulation cluster A",
    marketType: "Binary",
    positionSize: 260000,
    entries: ["+$260K YES extension at 46c", "+$140K NO oil disruption at 51c", "+$90K YES summit at 33c"],
    activeMarketsList: ["Middle East ceasefire extension", "Oil disruption", "Summit announcement"],
    interpretation: "Linked geopolitics wallet confirms the de-escalation cluster with 63% YES exposure, 86 Early Signal Score, and 68 Flow Divergence Index.",
  },
  {
    rank: 87,
    wallet: "0x2bf1904d1728eb3e2c66351d4374fbd73e096d51",
    tag: "SPORTS-LATE-87",
    category: "Sports",
    group: "Top 100 Sports Wallets",
    roi: 21.1,
    winRate: 66,
    volume: 8900000,
    bias: "YES-heavy",
    conviction: 79,
    earlySignal: 73,
    smartMoneyRating: 82,
    divergence: 61,
    activeMarkets: 22,
    lastPosition: "+$280K YES Celtics 1H at 49c",
    lastActive: "55m ago",
    signalType: "Momentum",
    exposure: "64% YES / 21% NO / 15% cash",
    specialization: "Late injury news and NBA first-half markets",
    accuracy: 67,
    cluster: "NBA injury-news basket",
    marketType: "Spread",
    positionSize: 280000,
    entries: ["+$280K YES Celtics 1H at 49c", "+$170K YES under 221.5", "-$60K closed NO player prop"],
    activeMarketsList: ["Celtics first half", "NBA total", "player availability basket"],
    interpretation: "Top 100 sports wallet is 64% YES exposed on NBA markets after injury news, with $8.9M tracked volume and 22 active markets.",
  },
  {
    rank: 142,
    wallet: "0xad904d3c8938dfce6a9170ee41e5b7d5a9d13af4",
    tag: "CRYPTO-SOL-142",
    category: "Crypto",
    group: "Top 500 Crypto Wallets",
    roi: 29.8,
    winRate: 69,
    volume: 13400000,
    bias: "YES-heavy",
    conviction: 86,
    earlySignal: 84,
    smartMoneyRating: 88,
    divergence: 64,
    activeMarkets: 12,
    lastPosition: "+$480K YES SOL ETF at 60c",
    lastActive: "1h ago",
    signalType: "Early Positioning",
    exposure: "67% YES / 18% NO / 15% cash",
    specialization: "SOL ecosystem catalysts and ETF market structure",
    accuracy: 70,
    cluster: "SOL ETF accumulation cluster",
    marketType: "Event Basket",
    positionSize: 480000,
    entries: ["+$480K YES SOL ETF at 60c", "+$190K YES SOL ecosystem TVL", "+$95K NO ETH relative strength"],
    activeMarketsList: ["SOL ETF approval", "SOL ecosystem TVL", "ETH/SOL rotation"],
    interpretation: "Top 500 crypto wallet is 67% YES exposed to SOL ecosystem outcomes, with 84 Early Signal Score and $13.4M tracked volume.",
  },
];

export const mockConsensusInsights: ConsensusInsight[] = [
  { segment: "Top 20 Sports Wallets", wallets: 20, volume: 38200000, exposure: "64% YES / 36% NO", timeframe: "24H", confidence: 82, insight: "64% YES exposure across tonight's NBA markets after +$6.8M net adds in the last 24H." },
  { segment: "Top 50 Geopolitics Wallets", wallets: 50, volume: 54700000, exposure: "71% peace / 29% escalation", timeframe: "7D", confidence: 88, insight: "71% positioned toward ceasefire or peace outcomes across four linked markets." },
  { segment: "Top 100 Crypto Wallets", wallets: 100, volume: 91600000, exposure: "58% YES / 42% NO", timeframe: "24H", confidence: 84, insight: "58% accumulating YES exposure on SOL ecosystem markets before odds move." },
  { segment: "Top Macro Wallets", wallets: 76, volume: 33700000, exposure: "53% cuts / 47% no cuts", timeframe: "7D", confidence: 73, insight: "Macro specialists remain near balanced, with only a 6-point tilt toward rate-cut outcomes." },
];

export const mockClusters: WalletCluster[] = [
  { title: "Top 50 geopolitics wallets pricing peace", wallets: 50, volume: 54700000, confidence: 88, impact: "High", divergence: "71 Flow Divergence Index™", severity: "critical", detail: "Ceasefire-linked wallets added $8.4M net YES exposure over 7D while public odds moved only +3.1 points." },
  { title: "Top 20 sports wallets active before games", wallets: 20, volume: 38200000, confidence: 82, impact: "Medium", divergence: "64% YES exposure", severity: "high", detail: "Sports specialists increased NBA YES exposure by $6.8M over 24H with 840 active wallets in the selected universe." },
  { title: "Top 100 crypto wallets accumulating SOL YES", wallets: 100, volume: 91600000, confidence: 84, impact: "Medium", divergence: "58% YES exposure", severity: "high", detail: "Crypto wallets added $11.2M SOL ecosystem YES exposure, with 84 Early Signal Score before broad market repricing." },
];

export const mockQuestionExamples = [
  "What are top sports wallets doing before tonight's games?",
  "Are top geopolitics wallets pricing peace or escalation?",
  "Are top crypto wallets accumulating YES exposure before odds move?",
];

export const mockWalletIntelligenceData: WalletIntelligenceData = {
  stats: {
    trackedWalletUniverse: TRACKED_WALLET_UNIVERSE,
    smartMoneyWallets: SMART_MONEY_WALLETS,
    activeWallets: ACTIVE_WALLETS,
  },
  wallets: mockWallets,
  consensusInsights: mockConsensusInsights,
  clusters: mockClusters,
  questionExamples: mockQuestionExamples,
  source: "mock",
  updatedAt: new Date(0).toISOString(),
};
