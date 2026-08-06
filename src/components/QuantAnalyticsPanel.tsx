import React, { useState } from 'react';
import { QuantSummaryStats, NewsEvent, TickerSymbol } from '../types';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';
import { Calculator, BarChart2, TrendingUp, Sliders, ShieldCheck, Zap } from 'lucide-react';
import { COMPANY_METADATA } from '../data/mockMarketData';

interface QuantAnalyticsPanelProps {
  stats: QuantSummaryStats;
  newsEvents: NewsEvent[];
  selectedTicker: TickerSymbol | 'ALL';
}

export const QuantAnalyticsPanel: React.FC<QuantAnalyticsPanelProps> = ({
  stats,
  newsEvents,
  selectedTicker,
}) => {
  const [activeTab, setActiveTab] = useState<'regression' | 'event-study' | 'simulator'>('regression');

  // Simulator State
  const [simTicker, setSimTicker] = useState<TickerSymbol>('NVDA');
  const [simSentiment, setSimSentiment] = useState<number>(0.80);
  const [simImportance, setSimImportance] = useState<number>(8);
  const [simMarketReturn, setSimMarketReturn] = useState<number>(0.25);

  const meta = COMPANY_METADATA[simTicker];

  // Predictive OLS Formula:
  // AR = b0 + b1 * Sentiment + b2 * (Importance / 10) + b3 * MarketReturn
  const b0 = stats.regressionStats.coefficients.intercept.value;
  const b1 = stats.regressionStats.coefficients.sentimentScore.value;
  const b2 = stats.regressionStats.coefficients.importanceRating.value;
  const b3 = stats.regressionStats.coefficients.marketReturn.value;

  const predictedAR = b0 + b1 * simSentiment + b2 * (simImportance / 10) + b3 * simMarketReturn;
  const expectedReturn = meta.alpha + meta.beta * simMarketReturn;
  const predictedTotalReturn = expectedReturn + predictedAR;
  const predictedPriceTarget = meta.currentPrice * (1 + predictedTotalReturn / 100);

  // Scatter plot data mapping
  const scatterData = newsEvents.map((news) => ({
    x: news.sentimentScore,
    y: news.abnormalReturn1hPercent,
    z: news.importanceRating,
    headline: news.headline,
    ticker: news.ticker,
    topic: news.topic,
  }));

  // Event study CAR trajectory data
  const carProfileData = [
    { offset: '-2h', PositiveCAR: -0.2, NegativeCAR: 0.1 },
    { offset: '-1h', PositiveCAR: -0.1, NegativeCAR: 0.05 },
    { offset: '-30m', PositiveCAR: 0.0, NegativeCAR: 0.0 },
    { offset: 't0 (News)', PositiveCAR: 0.5, NegativeCAR: -0.6 },
    { offset: '+30m', PositiveCAR: 1.6, NegativeCAR: -1.8 },
    { offset: '+1h', PositiveCAR: 2.7, NegativeCAR: -2.5 },
    { offset: '+2h', PositiveCAR: 3.2, NegativeCAR: -2.9 },
    { offset: '+4h', PositiveCAR: 3.6, NegativeCAR: -3.2 },
    { offset: '+1d', PositiveCAR: 4.1, NegativeCAR: -3.5 },
  ];

  return (
    <div className="bg-[#0F0F12] border border-slate-800 rounded-lg p-4 sm:p-5 mb-5 shadow-lg">
      
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <Calculator className="w-4 h-4 text-blue-400" />
            <h2 className="text-xs font-bold text-slate-200 uppercase tracking-widest font-mono">
              ADVANCED QUANTITATIVE ENGINE
            </h2>
            <span className="text-[10px] px-2 py-0.5 bg-slate-900 border border-slate-800 text-blue-400 font-mono rounded">
              {selectedTicker} Filter
            </span>
          </div>
          <p className="text-[10px] text-slate-500 font-mono mt-0.5">
            OLS Linear Regression, Event Study Cumulative Abnormal Return (CAR), and Predictive Simulator.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-[#0A0A0B] p-0.5 rounded border border-slate-800 font-mono text-xs">
          <button
            onClick={() => setActiveTab('regression')}
            className={`px-3 py-1 rounded text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'regression'
                ? 'bg-blue-600/10 border border-blue-500/50 text-blue-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart2 className="w-3 h-3" />
            <span>OLS Regression</span>
          </button>

          <button
            onClick={() => setActiveTab('event-study')}
            className={`px-3 py-1 rounded text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'event-study'
                ? 'bg-blue-600/10 border border-blue-500/50 text-blue-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-3 h-3" />
            <span>CAR Trajectory</span>
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-3 py-1 rounded text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'simulator'
                ? 'bg-blue-600/10 border border-blue-500/50 text-blue-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3 h-3" />
            <span>Quant Simulator</span>
          </button>
        </div>
      </div>

      {/* TAB 1: OLS REGRESSION & SCATTER PLOT */}
      {activeTab === 'regression' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 font-mono">
          
          {/* Scatter Chart */}
          <div className="bg-[#0A0A0B] border border-slate-800 rounded-lg p-3.5">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-2 flex items-center justify-between">
              <span>Sentiment vs. Abnormal Return Scatter</span>
              <span className="text-blue-400">Corr (ρ) = {stats.correlationSentimentAbnormalReturn}</span>
            </h3>
            <p className="text-[10px] text-slate-500 mb-3">
              Dots represent news events. Fitted OLS regression line shows sensitivity coefficient β₁.
            </p>

            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: -10 }}>
                  <CartesianGrid strokeDasharray="4 4" stroke="#1E293B" />
                  <XAxis
                    type="number"
                    dataKey="x"
                    name="Sentiment Score"
                    domain={[-1, 1]}
                    stroke="#64748b"
                    fontSize={10}
                    tickFormatter={(v) => v.toFixed(1)}
                  />
                  <YAxis
                    type="number"
                    dataKey="y"
                    name="Abnormal Return %"
                    stroke="#64748b"
                    fontSize={10}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <ZAxis type="number" dataKey="z" range={[40, 200]} name="Importance" />
                  <Tooltip
                    cursor={{ strokeDasharray: '4 4' }}
                    contentStyle={{
                      backgroundColor: '#0F0F12',
                      borderColor: '#334155',
                      borderRadius: '0.5rem',
                      color: '#f8fafc',
                      fontSize: '10px',
                      fontFamily: 'monospace',
                    }}
                    formatter={(val: any, name: any) => [
                      name === 'Sentiment Score' ? val : `${val}%`,
                      name,
                    ]}
                  />
                  <Scatter name="News Events" data={scatterData} fill="#3B82F6" opacity={0.8} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* OLS Statistical Summary Table */}
          <div className="bg-[#0A0A0B] border border-slate-800 rounded-lg p-3.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest">
                  MULTIVARIATE OLS MODEL BREAKDOWN
                </h3>
                <span className="text-[10px] px-2 py-0.5 bg-purple-950/60 text-purple-300 rounded border border-purple-800/60 font-bold">
                  R² = {(stats.regressionStats.rSquared * 100).toFixed(1)}%
                </span>
              </div>

              <div className="overflow-x-auto mt-2">
                <table className="w-full text-left text-[11px] font-mono">
                  <thead>
                    <tr className="bg-[#0F0F12] text-slate-500 border-b border-slate-800 text-[9px] uppercase">
                      <th className="py-1.5 px-2">Variable</th>
                      <th className="py-1.5 px-2 text-right">Coeff (β)</th>
                      <th className="py-1.5 px-2 text-right">Std Error</th>
                      <th className="py-1.5 px-2 text-right">t-stat</th>
                      <th className="py-1.5 px-2 text-center">p-val</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    <tr>
                      <td className="py-1.5 px-2 text-slate-300 font-semibold">Intercept (β₀)</td>
                      <td className="py-1.5 px-2 text-right text-blue-400 font-bold">
                        {stats.regressionStats.coefficients.intercept.value}
                      </td>
                      <td className="py-1.5 px-2 text-right text-slate-500">
                        {stats.regressionStats.coefficients.intercept.stdError}
                      </td>
                      <td className="py-1.5 px-2 text-right text-slate-300">
                        {stats.regressionStats.coefficients.intercept.tStat}
                      </td>
                      <td className="py-1.5 px-2 text-center text-emerald-400">
                        {stats.regressionStats.coefficients.intercept.pValue}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-2 text-slate-300 font-semibold">Sentiment Score (β₁)</td>
                      <td className="py-1.5 px-2 text-right text-blue-400 font-bold">
                        +{stats.regressionStats.coefficients.sentimentScore.value}
                      </td>
                      <td className="py-1.5 px-2 text-right text-slate-500">
                        {stats.regressionStats.coefficients.sentimentScore.stdError}
                      </td>
                      <td className="py-1.5 px-2 text-right text-slate-300">
                        {stats.regressionStats.coefficients.sentimentScore.tStat}
                      </td>
                      <td className="py-1.5 px-2 text-center text-emerald-400 font-bold">
                        {stats.regressionStats.coefficients.sentimentScore.pValue}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-2 text-slate-300 font-semibold">Importance Rating (β₂)</td>
                      <td className="py-1.5 px-2 text-right text-blue-400 font-bold">
                        +{stats.regressionStats.coefficients.importanceRating.value}
                      </td>
                      <td className="py-1.5 px-2 text-right text-slate-500">
                        {stats.regressionStats.coefficients.importanceRating.stdError}
                      </td>
                      <td className="py-1.5 px-2 text-right text-slate-300">
                        {stats.regressionStats.coefficients.importanceRating.tStat}
                      </td>
                      <td className="py-1.5 px-2 text-center text-emerald-400">
                        {stats.regressionStats.coefficients.importanceRating.pValue}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-2 text-slate-300 font-semibold">Market SPY Return (β₃)</td>
                      <td className="py-1.5 px-2 text-right text-blue-400 font-bold">
                        +{stats.regressionStats.coefficients.marketReturn.value}
                      </td>
                      <td className="py-1.5 px-2 text-right text-slate-500">
                        {stats.regressionStats.coefficients.marketReturn.stdError}
                      </td>
                      <td className="py-1.5 px-2 text-right text-slate-300">
                        {stats.regressionStats.coefficients.marketReturn.tStat}
                      </td>
                      <td className="py-1.5 px-2 text-center text-emerald-400">
                        {stats.regressionStats.coefficients.marketReturn.pValue}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Model Fit Diagnostics */}
            <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
              <div>
                <span>F-Stat: </span>
                <strong className="text-slate-200">{stats.regressionStats.fStatistic}</strong>
              </div>
              <div>
                <span>Sample (N): </span>
                <strong className="text-slate-200">{stats.regressionStats.sampleSize}</strong>
              </div>
              <div>
                <span>Adj. R²: </span>
                <strong className="text-emerald-400">{(stats.regressionStats.adjustedRSquared * 100).toFixed(1)}%</strong>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: CUMULATIVE ABNORMAL RETURN (CAR) TRAJECTORY */}
      {activeTab === 'event-study' && (
        <div className="bg-[#0A0A0B] border border-slate-800 rounded-lg p-4 font-mono">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
            <div>
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest">
                EVENT STUDY CUMULATIVE ABNORMAL RETURN (CAR) WINDOW
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Tracks average price deviation beyond CAPM market expectations from -2h to +1d around news publication (t₀).
              </p>
            </div>

            <div className="flex items-center gap-4 text-[11px]">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                Positive News
              </span>
              <span className="flex items-center gap-1.5 text-rose-400">
                <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                Negative News
              </span>
            </div>
          </div>

          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={carProfileData} margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="#1E293B" />
                <XAxis dataKey="offset" stroke="#64748b" fontSize={10} />
                <YAxis
                  stroke="#64748b"
                  fontSize={10}
                  tickFormatter={(v) => `${v}%`}
                  domain={[-5, 5]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F0F12',
                    borderColor: '#334155',
                    borderRadius: '0.5rem',
                    color: '#f8fafc',
                    fontSize: '10px',
                    fontFamily: 'monospace',
                  }}
                  formatter={(val: any) => [`${val}%`, 'CAR Deviation']}
                />
                <Line
                  type="monotone"
                  dataKey="PositiveCAR"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#10b981' }}
                />
                <Line
                  type="monotone"
                  dataKey="NegativeCAR"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#f43f5e' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* TAB 3: SCENARIO SIMULATOR / CALCULATOR */}
      {activeTab === 'simulator' && (
        <div className="bg-[#0A0A0B] border border-slate-800 rounded-lg p-4 font-mono">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest mb-1 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-400" />
            <span>QUANTITATIVE SCENARIO SIMULATOR</span>
          </h3>
          <p className="text-[10px] text-slate-500 mb-4">
            Slide parameters to predict instant abnormal stock returns ($AR$) using the fitted OLS model.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Sliders */}
            <div className="space-y-3.5">
              {/* Ticker Selection */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Target Company:</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['NVDA', 'MSFT', 'AMZN'] as TickerSymbol[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setSimTicker(t)}
                      className={`py-1 text-xs font-bold rounded border transition ${
                        simTicker === t
                          ? 'bg-blue-600/10 border-blue-500/50 text-blue-400'
                          : 'bg-[#0F0F12] text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sentiment Score Slider */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400 font-semibold">News Sentiment Score:</span>
                  <span className={`font-bold ${simSentiment >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {simSentiment > 0 ? '+' : ''}{simSentiment.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="-1.0"
                  max="1.0"
                  step="0.05"
                  value={simSentiment}
                  onChange={(e) => setSimSentiment(parseFloat(e.target.value))}
                  className="w-full accent-blue-500 bg-slate-900 h-1.5 rounded cursor-pointer"
                />
              </div>

              {/* Importance Rating Slider */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400 font-semibold">News Importance Rating:</span>
                  <span className="text-amber-400 font-bold">{simImportance} / 10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={simImportance}
                  onChange={(e) => setSimImportance(parseInt(e.target.value))}
                  className="w-full accent-amber-500 bg-slate-900 h-1.5 rounded cursor-pointer"
                />
              </div>

              {/* Market SPY Return Slider */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400 font-semibold">Market Benchmark (SPY) Return:</span>
                  <span className="text-purple-400 font-bold">{simMarketReturn > 0 ? '+' : ''}{simMarketReturn.toFixed(2)}%</span>
                </div>
                <input
                  type="range"
                  min="-2.0"
                  max="2.0"
                  step="0.05"
                  value={simMarketReturn}
                  onChange={(e) => setSimMarketReturn(parseFloat(e.target.value))}
                  className="w-full accent-purple-500 bg-slate-900 h-1.5 rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Projected Outputs Card */}
            <div className="bg-[#0F0F12] border border-slate-800 rounded-lg p-3.5 flex flex-col justify-between">
              <div>
                <span className="text-[9px] text-slate-500 uppercase tracking-widest block font-bold mb-3">
                  MODEL PREDICTED REACTION OUTPUTS
                </span>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between items-center bg-[#0A0A0B] p-2 rounded border border-slate-800">
                    <span className="text-slate-400">Predicted Abnormal Return (AR):</span>
                    <span className={`font-bold text-sm ${predictedAR >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {predictedAR >= 0 ? '+' : ''}{predictedAR.toFixed(2)}%
                    </span>
                  </div>

                  <div className="flex justify-between items-center bg-[#0A0A0B] p-2 rounded border border-slate-800">
                    <span className="text-slate-400">Market Expected Return (CAPM):</span>
                    <span className="font-bold text-slate-200">
                      +{expectedReturn.toFixed(2)}%
                    </span>
                  </div>

                  <div className="flex justify-between items-center bg-[#0A0A0B] p-2 rounded border border-slate-800">
                    <span className="text-slate-400">Predicted Total 1h Move:</span>
                    <span className={`font-bold text-sm ${predictedTotalReturn >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {predictedTotalReturn >= 0 ? '+' : ''}{predictedTotalReturn.toFixed(2)}%
                    </span>
                  </div>

                  <div className="flex justify-between items-center bg-blue-900/20 p-2 rounded border border-blue-500/30">
                    <span className="text-blue-300 font-bold">Predicted Price Target ({simTicker}):</span>
                    <span className="font-bold text-sm text-blue-400">
                      ${predictedPriceTarget.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-slate-500 flex items-center justify-between">
                <span>Confidence Band (95%):</span>
                <span className="text-slate-300 font-bold">
                  [{(predictedAR - 0.68).toFixed(2)}%, {(predictedAR + 0.68).toFixed(2)}%]
                </span>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
