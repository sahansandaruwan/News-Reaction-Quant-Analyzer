export type TickerSymbol = 'NVDA' | 'MSFT' | 'AMZN' | 'GOOGL' | 'META' | 'AAPL';
export type BenchmarkSymbol = 'SPY' | 'QQQ';

export type Timeframe = '1m' | '5m' | '15m' | '1h' | '1d';

export interface CompanyInfo {
  symbol: TickerSymbol;
  name: string;
  sector: string;
  currentPrice: number;
  dayChangePercent: number;
  beta: number; // Beta relative to SPY
  alpha: number; // Alpha (annualized or daily)
  marketCap: string;
  color: string;
}

export interface PricePoint {
  timestamp: string; // ISO string or format string
  timeLabel: string;
  NVDA: number;
  MSFT: number;
  AMZN: number;
  GOOGL?: number;
  META?: number;
  AAPL?: number;
  SPY: number; // Market benchmark
  QQQ?: number; // Tech benchmark
  
  // High-Density Market Microstructure Metrics
  volume?: number;
  vwap?: number;
  orderFlowImbalance?: number; // -1.0 (heavy sell delta) to +1.0 (heavy buy delta)
  bidAskSpreadBps?: number; // Spread in basis points
  impliedVolVXN?: number; // Tech VIX Index level
  [key: string]: number | string | undefined;
}

export type SentimentCategory = 'Positive' | 'Neutral' | 'Negative';

export type NewsTopic = 
  | 'AI Hardware & Chips'
  | 'Cloud Growth & Infrastructure'
  | 'Financial Results & Guidance'
  | 'Regulatory & Anti-Trust'
  | 'M&A & Strategic Partnerships'
  | 'Executive & Management'
  | 'Product Launch & Innovation'
  | 'Political & Regulatory'
  | 'Geopolitical & Trade Tariffs'
  | 'Social & Labor Tech Policy'
  | 'Macro & Fed Interest Rates'
  | 'Energy Grid & Power Infra';

export interface NewsEvent {
  id: string;
  timestamp: string;
  displayTime: string;
  ticker: TickerSymbol;
  headline: string;
  summary: string;
  source: string;
  url?: string;
  
  // AI Sentiment & NLP Quant Scores
  sentimentScore: number; // -1.0 to +1.0
  sentimentCategory: SentimentCategory;
  importanceRating: number; // 1 to 10
  topic: NewsTopic;

  // Political & Social Macro Factor Metrics
  politicalMacroImpactScore?: number; // -1.0 (severe political headwinds) to +1.0 (political tailwinds)
  politicalMacroCategory?: 'Geopolitical Tariff' | 'Fed Interest Rate' | 'Antitrust Policy' | 'Labor & Social Policy' | 'Energy Grid Power' | 'Macroeconomic' | 'Tech Policy & Innovation';
  politicalMacroReasoning?: string;

  // Pre/Post Price and Quant Reaction Metrics
  priceAtEvent: number;
  price1hPost: number;
  price1dPost: number;
  
  return5mPercent: number;
  return30mPercent: number;
  return1hPercent: number;
  return1dPercent: number;

  marketReturn1hPercent: number; // SPY return over same window
  expectedReturn1hPercent: number; // alpha + beta * marketReturn
  abnormalReturn1hPercent: number; // Return - ExpectedReturn (AR)
  
  cumulativeAbnormalReturn: number; // CAR over event window
  preEventVolatility: number; // Standard deviation before event
  postEventVolatility: number; // Standard deviation after event
  volatilityJumpRatio: number; // postVol / preVol
  
  isStatisticallySignificant: boolean; // p-value < 0.05
  pValue: number;
}

export interface NewsSourceInfo {
  id: string;
  name: string;
  category: string;
  latencyMs: number;
  reliabilityPercent: number;
  status: 'LIVE' | 'SYNCING' | 'STANDBY';
  coverage: string;
  apiFeedType: 'FIX Protocol' | 'REST/WebSocket' | 'Direct SEC RSS' | 'NLP Stream';
}

export interface ChartCurvePointInspection {
  timeLabel: string;
  timestamp: string;
  ticker: TickerSymbol;
  price: number;
  prevPrice: number;
  priceReturnPercent: number;
  spyPrice: number;
  spyReturnPercent: number;
  expectedReturnPercent: number;
  abnormalReturnPercent: number;
  associatedNewsEvent?: NewsEvent;
  volatilityShock: number;
}

export interface FamaFrenchFactors {
  mktRf: number; // Market Risk Premium (Rm - Rf)
  smb: number;   // Small Minus Big (Size)
  hml: number;   // High Minus Low (Value)
  rmw: number;   // Robust Minus Weak (Profitability)
  cma: number;   // Conservative Minus Aggressive (Investment)
}

export interface FamaFrenchModelResult {
  alpha: number;
  bMkt: number;
  bSMB: number;
  bHML: number;
  bRMW: number;
  bCMA: number;
  rSquared: number;
  expectedReturn1h: number;
  abnormalReturn1h: number;
}

export interface GarchPoint {
  timeLabel: string;
  returns: number;
  conditionalVolatility: number; // sigma_t %
  isShock: boolean;
}

export interface GarchModelResult {
  omega: number; // omega (constant)
  alpha: number; // ARCH coefficient (epsilon_{t-1}^2)
  beta: number;  // GARCH coefficient (sigma_{t-1}^2)
  persistence: number; // alpha + beta
  preNewsVol: number;
  postNewsVol: number;
  volatilityJumpPercent: number;
  timeSeries: GarchPoint[];
}

export interface VarMatrixResult {
  assets: TickerSymbol[];
  coefficients: number[][]; // 3x3 spillover impact matrix
  impulseResponses: {
    shockAsset: TickerSymbol;
    responseAsset: TickerSymbol;
    period: number; // 1 to 5 steps ahead
    impact: number;
  }[];
}

export interface PcaResult {
  eigenvalues: number[];
  explainedVarianceRatio: number[];
  components: {
    name: string; // e.g. "PC1: Market Factor", "PC2: Sentiment Alpha", "PC3: Tech Volatility"
    loadings: { feature: string; value: number }[];
  }[];
}

export interface KalmanBetaPoint {
  timeLabel: string;
  dynamicBeta: number;
  staticBeta: number;
  uncertaintyBand: [number, number];
}

export interface MlFeatureImportance {
  feature: string;
  importance: number; // 0 to 1
  category: string;
}

export interface MlHorizonPrediction {
  horizon: '5m' | '30m' | '1h' | '1d';
  predictedReturn: number;
  confidenceInterval: [number, number];
  accuracyScore: number;
}

export interface PipelineNodeInfo {
  id: string;
  title: string;
  subtitle: string;
  formula: string;
  status: 'active' | 'synced' | 'computed';
  liveMetric: string;
  description: string;
}

export interface EventWindowPoint {
  timeOffset: string; // e.g., "-2h", "-1h", "-30m", "t0", "+30m", "+1h", "+2h", "+4h", "+1d"
  offsetMinutes: number;
  rawPrice: number;
  stockReturnPercent: number;
  marketReturnPercent: number;
  expectedReturnPercent: number;
  abnormalReturnPercent: number;
  cumulativeAbnormalReturnPercent: number;
}

export interface RegressionStats {
  dependentVariable: string; // "Abnormal Return (1h %)"
  sampleSize: number;
  rSquared: number;
  adjustedRSquared: number;
  fStatistic: number;
  fPValue: number;
  coefficients: {
    intercept: { value: number; stdError: number; tStat: number; pValue: number };
    sentimentScore: { value: number; stdError: number; tStat: number; pValue: number };
    importanceRating: { value: number; stdError: number; tStat: number; pValue: number };
    marketReturn: { value: number; stdError: number; tStat: number; pValue: number };
  };
}

export interface QuantSummaryStats {
  ticker: string; // NVDA | MSFT | AMZN | ALL
  totalNewsEvents: number;
  avgSentimentScore: number;
  avg1hReturnPercent: number;
  avg1hAbnormalReturnPercent: number;
  correlationSentimentAbnormalReturn: number; // rho
  rSquared: number;
  significantEventsCount: number;
  avgVolatilityJumpRatio: number;
  regressionStats: RegressionStats;
}

export interface HeadlineAnalysisRequest {
  headline: string;
  content?: string;
  ticker: TickerSymbol;
  marketReturnContextPercent?: number;
}

export interface HeadlineAnalysisResponse {
  headline: string;
  ticker: TickerSymbol;
  sentimentScore: number;
  sentimentCategory: SentimentCategory;
  importanceRating: number;
  topic: NewsTopic;
  summary: string;
  reasoning: string;
  
  // Quant reaction predictions
  predicted5mReturnPercent: number;
  predicted1hReturnPercent: number;
  predicted1hAbnormalReturnPercent: number;
  predicted1dAbnormalReturnPercent: number;
  confidenceInterval95: [number, number]; // [lower, upper] %
  volatilityShockEstimate: number;
}
