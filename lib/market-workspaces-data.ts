export const marketCategories = ["crypto", "politics", "macro", "ai", "sports"] as const;

export type MarketCategory = (typeof marketCategories)[number];
export type MarketBias = "Bullish" | "Bearish" | "Neutral";
export type SignalSeverity = "Informational" | "Elevated" | "High Conviction" | "Critical";

export type MarketWorkspaceMarket = {
  id: string;
  title: string;
  categoryLabel: string;
  probability: number;
  oracleProbability: number;
  volume: string;
  smartMoneyBias: MarketBias;
  signalSeverity: SignalSeverity;
  lastUpdate: string;
  smartMoneySummary: string;
  narrativeContext: string;
  relatedFlows: string[];
  aiInterpretation: string;
  watchNext: string;
};

export type MarketWorkspaceSignal = {
  time: string;
  title: string;
  detail: string;
  value: string;
  bias: MarketBias;
  severity: SignalSeverity;
};

export type MarketWorkspaceData = {
  slug: MarketCategory;
  title: string;
  description: string;
  badge: string;
  metrics: {
    activeMarkets: string;
    signalScore: string;
    smartMoneyActivity: string;
    narrativeMomentum: string;
  };
  markets: MarketWorkspaceMarket[];
  feed: MarketWorkspaceSignal[];
  signalCards: {
    title: string;
    value: string;
    detail: string;
    bias: MarketBias;
  }[];
  insights: {
    moving: string;
    matters: string;
    confirmation: string;
    interpretation: string;
  };
};

export function isMarketCategory(value: string): value is MarketCategory {
  return marketCategories.includes(value as MarketCategory);
}

export const marketWorkspaceData: Record<MarketCategory, MarketWorkspaceData> = {
  crypto: {
    slug: "crypto",
    title: "Crypto Market Workspace",
    description: "Prediction-market intelligence for crypto catalysts, Hyperliquid flows, ETF narratives, and smart-money leverage.",
    badge: "Live Hyperliquid monitor",
    metrics: {
      activeMarkets: "184",
      signalScore: "87.6",
      smartMoneyActivity: "+$92.4M",
      narrativeMomentum: "+31%",
    },
    markets: [
      {
        id: "sol-etf-q4",
        title: "SOL ETF approved before Q4",
        categoryLabel: "Crypto / ETF",
        probability: 64.8,
        oracleProbability: 71.2,
        volume: "$18.4M",
        smartMoneyBias: "Bullish",
        signalSeverity: "Critical",
        lastUpdate: "2m ago",
        smartMoneySummary: "Linked high-accuracy wallets added YES exposure while SOL perp open interest expanded.",
        narrativeContext: "ETF approval discussion is spreading from issuer-watch accounts into broader L1 rotation markets.",
        relatedFlows: ["SOL long exposure +18.4% over 4h", "ETF basket markets +6.4 pts", "HYPE beta bid remains supportive"],
        aiInterpretation: "OracleX sees flow confirmation ahead of public-market pricing. The gap is actionable while leverage remains controlled.",
        watchNext: "Watch SEC calendar language, SOL funding, and whether BTC ETF inflow accounts amplify the SOL narrative.",
      },
      {
        id: "btc-ath-quarter",
        title: "BTC breaks new ATH this quarter",
        categoryLabel: "Crypto / BTC",
        probability: 58.6,
        oracleProbability: 52.4,
        volume: "$24.1M",
        smartMoneyBias: "Bearish",
        signalSeverity: "High Conviction",
        lastUpdate: "5m ago",
        smartMoneySummary: "Whale exposure is mixed and leverage is rising faster than spot confirmation.",
        narrativeContext: "ETF inflow headlines support the market, but order book depth and funding show a crowded long setup.",
        relatedFlows: ["BTC OI +21.6%", "Funding pressure elevated", "ETF flow narrative still constructive"],
        aiInterpretation: "OracleX discounts the public probability because leverage pressure is doing more work than clean spot demand.",
        watchNext: "Watch funding normalization, ETF net creations, and whether BTC dominance confirms risk appetite.",
      },
      {
        id: "eth-rotation",
        title: "ETH ecosystem rotation continues",
        categoryLabel: "Crypto / ETH",
        probability: 43.2,
        oracleProbability: 39.5,
        volume: "$7.8M",
        smartMoneyBias: "Bearish",
        signalSeverity: "Elevated",
        lastUpdate: "8m ago",
        smartMoneySummary: "Profitable wallets are hedging ETH exposure and reallocating toward SOL-linked upside.",
        narrativeContext: "ETH rotation has weaker persistence as L1 beta and ETF attention move elsewhere.",
        relatedFlows: ["ETH outflows -$22.4M", "ETH/BTC underperformance", "SOL ecosystem correlation +0.69"],
        aiInterpretation: "Flow divergence is confirming a defensive ETH posture rather than outright capitulation.",
        watchNext: "Watch ETH/BTC, L2 revenue headlines, and whether ETF relative inflows stabilize.",
      },
      {
        id: "hype-revenue",
        title: "HYPE ecosystem revenue growth",
        categoryLabel: "Crypto / Perps",
        probability: 61.9,
        oracleProbability: 68.4,
        volume: "$5.6M",
        smartMoneyBias: "Bullish",
        signalSeverity: "Critical",
        lastUpdate: "11m ago",
        smartMoneySummary: "Top wallets are building HYPE exposure with high capital-rotation scores.",
        narrativeContext: "Perp infrastructure revenue is being repriced as HYPE captures attention from on-chain trading accounts.",
        relatedFlows: ["HYPE net flow +$48.2M", "Top traders 68% long", "Revenue narrative +29%"],
        aiInterpretation: "OracleX treats HYPE as the strongest crypto confirmation cluster because flows, narrative, and venue data align.",
        watchNext: "Watch open interest quality, fee revenue releases, and whether SOL rotation spills into HYPE beta.",
      },
    ],
    feed: [
      { time: "14:03", title: "Hyperliquid rotation scan", detail: "BTC, ETH, SOL, and HYPE flow pressure recalculated against live venue context.", value: "Live", bias: "Neutral", severity: "Informational" },
      { time: "14:06", title: "SOL ETF flow confirmation", detail: "Smart wallets increased SOL-linked YES exposure while perp demand strengthened.", value: "+6.4 pts", bias: "Bullish", severity: "Critical" },
      { time: "14:09", title: "BTC leverage warning", detail: "OracleX probability fell below market odds as leverage rose without spot confirmation.", value: "-6.2 pts", bias: "Bearish", severity: "High Conviction" },
      { time: "14:13", title: "HYPE revenue narrative accelerating", detail: "On-chain trading infrastructure accounts are amplifying HYPE revenue expectations.", value: "+29%", bias: "Bullish", severity: "Critical" },
    ],
    signalCards: [
      { title: "BTC", value: "Crowded leverage", detail: "ATH odds need spot confirmation before OracleX upgrades probability.", bias: "Bearish" },
      { title: "ETH", value: "Defensive rotation", detail: "Top wallets are hedging ETH while L1 beta moves elsewhere.", bias: "Bearish" },
      { title: "SOL", value: "ETF confirmation", detail: "Wallet flow and narrative velocity align with approval-window repricing.", bias: "Bullish" },
      { title: "HYPE", value: "Revenue beta", detail: "Capital rotation and venue activity are confirming ecosystem growth.", bias: "Bullish" },
    ],
    insights: {
      moving: "SOL ETF and HYPE revenue markets are moving on confirmed wallet flow; BTC is moving mostly on leverage and ETF headlines.",
      matters: "Crypto prediction markets often reprice first through related flows: perp positioning, ETF basket narratives, and high-accuracy wallet clusters.",
      confirmation: "SOL and HYPE are confirmed by both smart money and narrative velocity. BTC is diverging because public odds lead OracleX probability without clean spot confirmation.",
      interpretation: "The workspace favors selective crypto upside over blanket risk-on exposure. SOL/HYPE show higher-quality confirmation than BTC, while ETH remains a defensive rotation signal.",
    },
  },
  politics: {
    slug: "politics",
    title: "Politics Market Workspace",
    description: "Election, policy, geopolitical, and regulatory market intelligence with source quality and event-window tracking.",
    badge: "Event-window monitor",
    metrics: {
      activeMarkets: "226",
      signalScore: "79.4",
      smartMoneyActivity: "+$14.8M",
      narrativeMomentum: "+18%",
    },
    markets: [
      {
        id: "us-election-odds",
        title: "US election odds",
        categoryLabel: "Politics / Election",
        probability: 47.5,
        oracleProbability: 45.8,
        volume: "$31.2M",
        smartMoneyBias: "Neutral",
        signalSeverity: "Elevated",
        lastUpdate: "3m ago",
        smartMoneySummary: "Sharp wallets are reducing directional exposure and trading polling volatility instead.",
        narrativeContext: "Polling discourse is noisy; source quality has not improved enough to validate the latest odds move.",
        relatedFlows: ["Candidate baskets widened", "Polling-source confidence 68", "Probability volatility +22%"],
        aiInterpretation: "OracleX treats the move as volatility expansion, not a confirmed directional shift.",
        watchNext: "Watch high-quality poll releases, debate windows, and whether sharp wallets rebuild directional exposure.",
      },
      {
        id: "eu-crypto-policy",
        title: "EU crypto policy vote",
        categoryLabel: "Politics / Policy",
        probability: 52.1,
        oracleProbability: 57.9,
        volume: "$4.9M",
        smartMoneyBias: "Bullish",
        signalSeverity: "High Conviction",
        lastUpdate: "9m ago",
        smartMoneySummary: "Policy-specialist wallets bought YES after committee language moved closer to compromise text.",
        narrativeContext: "Regulatory accounts are converging on a softer implementation path.",
        relatedFlows: ["Committee-source quality high", "Crypto policy basket +4.1 pts", "Volume 1.7x baseline"],
        aiInterpretation: "Source quality is strong enough for OracleX to price above public probability.",
        watchNext: "Watch amendment filings and whether member-state commentary confirms the compromise path.",
      },
      {
        id: "ukraine-ceasefire",
        title: "Ukraine ceasefire before September",
        categoryLabel: "Politics / Geopolitical",
        probability: 28.4,
        oracleProbability: 25.6,
        volume: "$8.3M",
        smartMoneyBias: "Bearish",
        signalSeverity: "Elevated",
        lastUpdate: "12m ago",
        smartMoneySummary: "Top wallets are fading headline-driven YES spikes until primary-source confirmation improves.",
        narrativeContext: "Diplomatic headlines are frequent, but conflicting statements keep truth confidence low.",
        relatedFlows: ["Truth confidence 61", "Headline velocity +34%", "Primary-source conflict unresolved"],
        aiInterpretation: "OracleX discounts the probability because narrative speed exceeds source reliability.",
        watchNext: "Watch direct statements from negotiating parties and whether ceasefire-adjacent markets move together.",
      },
      {
        id: "us-crypto-bill",
        title: "US crypto bill passes Senate",
        categoryLabel: "Politics / Regulation",
        probability: 41.6,
        oracleProbability: 49.2,
        volume: "$12.7M",
        smartMoneyBias: "Bullish",
        signalSeverity: "Critical",
        lastUpdate: "16m ago",
        smartMoneySummary: "Regulatory specialist wallets accumulated YES before the public narrative fully adjusted.",
        narrativeContext: "Bipartisan procedural language is being repriced across crypto policy markets.",
        relatedFlows: ["Crypto policy basket +7.6 pts", "Source confidence 84", "Event-window compression"],
        aiInterpretation: "OracleX sees a meaningful gap where source quality and wallet behavior are ahead of public odds.",
        watchNext: "Watch whip-count reporting, committee scheduling, and crypto-sector market sympathy.",
      },
    ],
    feed: [
      { time: "13:58", title: "US election volatility expansion", detail: "Odds moved without enough high-quality polling confirmation.", value: "+22% vol", bias: "Neutral", severity: "Elevated" },
      { time: "14:04", title: "EU crypto vote source upgrade", detail: "Committee text improved policy-market confidence.", value: "57.9 OX", bias: "Bullish", severity: "High Conviction" },
      { time: "14:12", title: "Ceasefire headline conflict", detail: "Truth confidence dropped after competing diplomatic statements.", value: "61 TC", bias: "Bearish", severity: "Elevated" },
      { time: "14:18", title: "US crypto bill accumulation", detail: "Specialist wallets are buying the procedural path before consensus reprices.", value: "+7.6 pts", bias: "Bullish", severity: "Critical" },
    ],
    signalCards: [
      { title: "Narrative shifts", value: "+18%", detail: "Policy accounts are more reliable than broad election chatter this window.", bias: "Bullish" },
      { title: "Event windows", value: "4 active", detail: "Senate scheduling and EU vote timing are the strongest catalysts.", bias: "Neutral" },
      { title: "Probability volatility", value: "+22%", detail: "Election markets are tradable but source confirmation is mixed.", bias: "Neutral" },
      { title: "Truth confidence", value: "72 avg", detail: "Geopolitical markets remain lower confidence than policy markets.", bias: "Bearish" },
    ],
    insights: {
      moving: "Regulatory policy markets are moving on stronger source quality; election and geopolitical markets are mostly volatility-driven.",
      matters: "Political markets can overreact to narrative speed. OracleX separates source hierarchy, event windows, and wallet quality before upgrading probabilities.",
      confirmation: "US and EU crypto policy markets are confirmed by specialist wallets and source quality. Election odds and ceasefire markets are diverging because public movement lacks clean confirmation.",
      interpretation: "The better political intelligence is currently in policy process markets, not headline-heavy election or conflict markets.",
    },
  },
  macro: {
    slug: "macro",
    title: "Macro Market Workspace",
    description: "Rates, CPI, Fed, liquidity, and risk-appetite intelligence for macro-linked prediction markets.",
    badge: "Liquidity pressure monitor",
    metrics: {
      activeMarkets: "142",
      signalScore: "74.8",
      smartMoneyActivity: "-$6.1M",
      narrativeMomentum: "-4%",
    },
    markets: [
      {
        id: "fed-next-meeting",
        title: "Fed cuts rates at next meeting",
        categoryLabel: "Macro / Rates",
        probability: 38.1,
        oracleProbability: 42.6,
        volume: "$9.7M",
        smartMoneyBias: "Neutral",
        signalSeverity: "High Conviction",
        lastUpdate: "4m ago",
        smartMoneySummary: "Rates-focused wallets are buying optionality, not clean directional exposure.",
        narrativeContext: "Fed language is softer, but inflation data has not confirmed enough easing pressure.",
        relatedFlows: ["Rates vol elevated", "Dollar liquidity mixed", "Fed-source conflict"],
        aiInterpretation: "OracleX prices modest upside to cut odds while avoiding high conviction until CPI confirms.",
        watchNext: "Watch CPI nowcast drift, Fedspeak hierarchy, and front-end yield reaction.",
      },
      {
        id: "cpi-below",
        title: "CPI comes in below expectations",
        categoryLabel: "Macro / Inflation",
        probability: 46.4,
        oracleProbability: 48.9,
        volume: "$6.8M",
        smartMoneyBias: "Bullish",
        signalSeverity: "Elevated",
        lastUpdate: "7m ago",
        smartMoneySummary: "Inflation-specialist wallets are lightly positioned for a softer print.",
        narrativeContext: "Goods disinflation and energy inputs support downside, but services remain a constraint.",
        relatedFlows: ["Nowcast drift -0.08", "Inflation basket +2.5 pts", "Rates response muted"],
        aiInterpretation: "Confirmation is partial, with enough signal to lean below expectations but not enough for a critical alert.",
        watchNext: "Watch services components, energy base effects, and rates-market follow-through.",
      },
      {
        id: "treasury-vol",
        title: "Treasury volatility expands",
        categoryLabel: "Macro / Volatility",
        probability: 57.2,
        oracleProbability: 63.1,
        volume: "$5.2M",
        smartMoneyBias: "Bullish",
        signalSeverity: "Critical",
        lastUpdate: "13m ago",
        smartMoneySummary: "Volatility desks are adding exposure around data-event clustering.",
        narrativeContext: "Liquidity is thinner into CPI and Fed communications, increasing rate-shock sensitivity.",
        relatedFlows: ["MOVE proxy elevated", "Depth lower", "Event-window clustering"],
        aiInterpretation: "OracleX upgrades this because market structure and calendar risk are aligned.",
        watchNext: "Watch auction tails, front-end depth, and whether equities absorb rate volatility.",
      },
      {
        id: "dollar-liquidity",
        title: "Dollar liquidity improves",
        categoryLabel: "Macro / Liquidity",
        probability: 44.7,
        oracleProbability: 40.2,
        volume: "$4.4M",
        smartMoneyBias: "Bearish",
        signalSeverity: "Elevated",
        lastUpdate: "19m ago",
        smartMoneySummary: "Liquidity-sensitive wallets are reducing risk-on exposure into tighter funding signals.",
        narrativeContext: "Dollar liquidity improvement remains a popular narrative, but funding data is not confirming.",
        relatedFlows: ["Funding pressure rising", "Risk appetite fading", "Liquidity basket -4.5 pts"],
        aiInterpretation: "OracleX is below market because the liquidity narrative is ahead of measured conditions.",
        watchNext: "Watch repo stress, dollar index reaction, and crypto beta sensitivity.",
      },
    ],
    feed: [
      { time: "14:02", title: "Treasury volatility confirmation", detail: "Event-window clustering and thinner depth lifted OracleX volatility odds.", value: "63.1 OX", bias: "Bullish", severity: "Critical" },
      { time: "14:07", title: "Fed cut source conflict", detail: "Softer language improved odds but inflation confirmation is incomplete.", value: "+4.5 pts", bias: "Neutral", severity: "High Conviction" },
      { time: "14:15", title: "Liquidity narrative divergence", detail: "Risk-on markets are pricing easier liquidity than funding data supports.", value: "-4.5 pts", bias: "Bearish", severity: "Elevated" },
      { time: "14:21", title: "CPI downside partial confirmation", detail: "Nowcast drift supports below-expectation pricing with services risk still open.", value: "+2.5 pts", bias: "Bullish", severity: "Elevated" },
    ],
    signalCards: [
      { title: "Macro pressure", value: "Elevated", detail: "Rates volatility is the dominant pressure point.", bias: "Bearish" },
      { title: "Market structure", value: "Thin depth", detail: "Treasury liquidity is weaker into clustered data events.", bias: "Bearish" },
      { title: "Risk mode", value: "Selective", detail: "Risk-on confirmation is incomplete while liquidity signals conflict.", bias: "Neutral" },
      { title: "Liquidity", value: "Mixed", detail: "Funding data is not confirming the easier-liquidity narrative.", bias: "Bearish" },
    ],
    insights: {
      moving: "Treasury volatility and Fed-cut markets are moving on event clustering and softer policy language.",
      matters: "Macro prediction markets can drag crypto, AI, and equity-linked markets when liquidity and rates signals shift together.",
      confirmation: "Treasury volatility is confirmed by structure and calendar risk. Liquidity improvement is diverging from funding data.",
      interpretation: "OracleX reads the macro backdrop as fragile: volatility is confirmed, easing is possible, but risk appetite lacks clean liquidity confirmation.",
    },
  },
  ai: {
    slug: "ai",
    title: "AI Market Workspace",
    description: "AI agent, regulation, infrastructure, and sector-narrative intelligence across prediction and equity-linked markets.",
    badge: "Narrative acceleration monitor",
    metrics: {
      activeMarkets: "118",
      signalScore: "82.3",
      smartMoneyActivity: "+$21.3M",
      narrativeMomentum: "+27%",
    },
    markets: [
      {
        id: "agent-os",
        title: "Major AI lab releases agent OS",
        categoryLabel: "AI / Agents",
        probability: 55.3,
        oracleProbability: 61.9,
        volume: "$6.2M",
        smartMoneyBias: "Bullish",
        signalSeverity: "High Conviction",
        lastUpdate: "6m ago",
        smartMoneySummary: "AI-specialist wallets are accumulating YES after developer ecosystem signals accelerated.",
        narrativeContext: "Agent OS language is spreading through product, tooling, and developer communities.",
        relatedFlows: ["Agent narrative +27%", "Developer-source quality high", "Infra basket +4.8 pts"],
        aiInterpretation: "OracleX is above market because substance signals are catching up to hype.",
        watchNext: "Watch SDK releases, app-store language, and enterprise pilot references.",
      },
      {
        id: "ai-regulation",
        title: "AI regulation bill passes",
        categoryLabel: "AI / Policy",
        probability: 33.8,
        oracleProbability: 30.4,
        volume: "$5.5M",
        smartMoneyBias: "Bearish",
        signalSeverity: "Elevated",
        lastUpdate: "10m ago",
        smartMoneySummary: "Policy wallets faded YES after procedural path weakened.",
        narrativeContext: "Regulation headlines are strong, but legislative timing remains poor.",
        relatedFlows: ["Policy source confidence 64", "Committee timing slipped", "AI policy basket -3.4 pts"],
        aiInterpretation: "OracleX discounts headline momentum because procedural confirmation is weak.",
        watchNext: "Watch committee scheduling, sponsor count, and compute-policy amendments.",
      },
      {
        id: "agent-market-share",
        title: "AI agents reach market share milestone",
        categoryLabel: "AI / Adoption",
        probability: 48.9,
        oracleProbability: 54.7,
        volume: "$3.7M",
        smartMoneyBias: "Bullish",
        signalSeverity: "Critical",
        lastUpdate: "14m ago",
        smartMoneySummary: "Top wallets increased exposure after usage metrics and enterprise pilots improved.",
        narrativeContext: "Agent adoption is moving from hype to measurable workflow share.",
        relatedFlows: ["Enterprise pilot mentions +34%", "Usage source quality high", "Agent OS correlation +0.66"],
        aiInterpretation: "OracleX sees the strongest AI confirmation in adoption metrics, not press-release volume.",
        watchNext: "Watch usage disclosures, enterprise workflow penetration, and platform integration depth.",
      },
      {
        id: "nvidia-market-cap",
        title: "Nvidia market cap event",
        categoryLabel: "AI / Infrastructure",
        probability: 62.8,
        oracleProbability: 59.6,
        volume: "$11.1M",
        smartMoneyBias: "Neutral",
        signalSeverity: "Informational",
        lastUpdate: "20m ago",
        smartMoneySummary: "Institutional participation is high, but positioning is crowded and less informational.",
        narrativeContext: "AI infrastructure demand remains strong, but the event market is already consensus-owned.",
        relatedFlows: ["Semis narrative high", "Crowding elevated", "Compute capex stable"],
        aiInterpretation: "OracleX stays below market because the signal is consensus-heavy and less asymmetric.",
        watchNext: "Watch capex guidance, export-control headlines, and hyperscaler demand commentary.",
      },
    ],
    feed: [
      { time: "14:01", title: "Agent adoption metric upgrade", detail: "Enterprise pilot references improved usage confidence.", value: "+5.8 pts", bias: "Bullish", severity: "Critical" },
      { time: "14:08", title: "Agent OS developer signal", detail: "Developer ecosystem language accelerated across credible technical sources.", value: "61.9 OX", bias: "Bullish", severity: "High Conviction" },
      { time: "14:16", title: "AI regulation timing slipped", detail: "Policy wallets faded passage odds after committee timing weakened.", value: "-3.4 pts", bias: "Bearish", severity: "Elevated" },
      { time: "14:22", title: "Infrastructure crowding check", detail: "Nvidia event remains strong but consensus-owned.", value: "Crowded", bias: "Neutral", severity: "Informational" },
    ],
    signalCards: [
      { title: "Narrative acceleration", value: "+27%", detail: "Agent markets are accelerating faster than AI policy markets.", bias: "Bullish" },
      { title: "Institutional participation", value: "High", detail: "Infra markets have depth but less informational edge.", bias: "Neutral" },
      { title: "Hype vs substance", value: "Improving", detail: "Usage and developer signals are confirming selected agent markets.", bias: "Bullish" },
      { title: "Market impact", value: "Selective", detail: "Adoption markets look stronger than regulation or mega-cap event markets.", bias: "Bullish" },
    ],
    insights: {
      moving: "Agent adoption and agent OS markets are moving on developer and enterprise usage signals.",
      matters: "AI markets often overprice headlines. OracleX separates usage, institutional participation, and procedural policy signals.",
      confirmation: "Agent adoption is confirmed by usage and enterprise pilots. Regulation is diverging because headlines exceed legislative timing.",
      interpretation: "AI intelligence is constructive where usage is measurable and weaker where markets rely on policy headlines or crowded mega-cap positioning.",
    },
  },
  sports: {
    slug: "sports",
    title: "Sports Market Workspace",
    description: "Game-specific positioning, odds movement, top-wallet activity, and sharp-money intelligence for sports prediction markets.",
    badge: "Sharp-money monitor",
    metrics: {
      activeMarkets: "312",
      signalScore: "76.1",
      smartMoneyActivity: "+$8.6M",
      narrativeMomentum: "+11%",
    },
    markets: [
      {
        id: "lakers-tonight",
        title: "Lakers win tonight",
        categoryLabel: "Sports / NBA",
        probability: 54.2,
        oracleProbability: 49.8,
        volume: "$2.8M",
        smartMoneyBias: "Bearish",
        signalSeverity: "High Conviction",
        lastUpdate: "1m ago",
        smartMoneySummary: "Top wallets are fading late public Lakers money after injury and pace signals shifted.",
        narrativeContext: "Public narrative is star-driven, while sharp positioning is reacting to rotation and matchup data.",
        relatedFlows: ["Top wallet NO +$420K", "Odds divergence -4.4 pts", "Injury-minute uncertainty"],
        aiInterpretation: "OracleX discounts public probability because sharp flow and lineup sensitivity point lower.",
        watchNext: "Watch final injury report, starting lineup, and live first-quarter pace.",
      },
      {
        id: "ucl-final",
        title: "Champions League final winner",
        categoryLabel: "Sports / Soccer",
        probability: 51.7,
        oracleProbability: 53.5,
        volume: "$7.4M",
        smartMoneyBias: "Bullish",
        signalSeverity: "Elevated",
        lastUpdate: "5m ago",
        smartMoneySummary: "Sharp wallets are leaning modestly toward the favorite after market depth improved.",
        narrativeContext: "Odds movement is steady rather than forced, with correlated props confirming the edge.",
        relatedFlows: ["Sharp favorite +$610K", "Props alignment +0.58", "Market depth improving"],
        aiInterpretation: "OracleX sees mild confirmation, but the edge is not large enough for critical severity.",
        watchNext: "Watch lineup leaks, weather, and whether goal-total markets confirm favorite pressure.",
      },
      {
        id: "nba-total",
        title: "NBA total points over/under",
        categoryLabel: "Sports / NBA",
        probability: 47.3,
        oracleProbability: 56.4,
        volume: "$1.9M",
        smartMoneyBias: "Bullish",
        signalSeverity: "Critical",
        lastUpdate: "9m ago",
        smartMoneySummary: "Top wallets are concentrated on OVER after pace and referee assignment updated.",
        narrativeContext: "The public line lagged a pace signal that correlated with high-scoring outcomes.",
        relatedFlows: ["Top wallet OVER +$530K", "Pace model +8.1 pts", "Referee signal positive"],
        aiInterpretation: "OracleX flags a high-conviction odds divergence because sharp flow and game context align.",
        watchNext: "Watch closing total, lineup pace, and whether live market adjusts after opening possessions.",
      },
      {
        id: "super-bowl-shift",
        title: "Super Bowl odds shift",
        categoryLabel: "Sports / NFL",
        probability: 18.6,
        oracleProbability: 21.7,
        volume: "$10.5M",
        smartMoneyBias: "Bullish",
        signalSeverity: "Elevated",
        lastUpdate: "17m ago",
        smartMoneySummary: "Long-horizon wallets are accumulating a team whose schedule-adjusted profile improved.",
        narrativeContext: "The market is slowly recognizing efficiency gains that are not fully priced into futures.",
        relatedFlows: ["Futures wallet cluster +$1.1M", "Schedule-adjusted rating +3", "Public ownership low"],
        aiInterpretation: "OracleX upgrades the futures probability, but horizon risk keeps severity below critical.",
        watchNext: "Watch injury trends, divisional market movement, and correlated MVP/award markets.",
      },
    ],
    feed: [
      { time: "14:00", title: "NBA total sharp activity", detail: "Top wallets concentrated on OVER after pace and officiating signal.", value: "+9.1 pts", bias: "Bullish", severity: "Critical" },
      { time: "14:05", title: "Lakers public-sharp divergence", detail: "Public money lifted odds while sharp wallets faded the move.", value: "-4.4 pts", bias: "Bearish", severity: "High Conviction" },
      { time: "14:11", title: "Champions League favorite pressure", detail: "Depth improved with correlated prop alignment.", value: "+1.8 pts", bias: "Bullish", severity: "Elevated" },
      { time: "14:18", title: "NFL futures accumulation", detail: "Long-horizon top wallets added exposure before public ownership rose.", value: "+$1.1M", bias: "Bullish", severity: "Elevated" },
    ],
    signalCards: [
      { title: "Top wallets", value: "Active", detail: "NBA and NFL futures have the highest wallet-quality signals.", bias: "Bullish" },
      { title: "Sharp money bias", value: "Selective", detail: "Sharps are fading Lakers but backing NBA total and futures edges.", bias: "Neutral" },
      { title: "Odds divergence", value: "9.1 pts", detail: "Largest current gap is the NBA total points market.", bias: "Bullish" },
      { title: "Market movement", value: "Explained", detail: "Late odds moves are tied to injuries, pace, lineup, and prop confirmation.", bias: "Neutral" },
    ],
    insights: {
      moving: "NBA total and Lakers markets are moving on sharp-wallet activity, lineup sensitivity, and late public money.",
      matters: "Sports prediction markets are highly timing-sensitive; top-wallet quality and odds divergence can matter more than broad narrative.",
      confirmation: "NBA total is confirmed by pace, referee, and wallet flow. Lakers odds are diverging because public money conflicts with sharp positioning.",
      interpretation: "The highest-quality sports signal is not the most popular side. OracleX favors markets where sharp money, context, and line movement explain each other.",
    },
  },
};
