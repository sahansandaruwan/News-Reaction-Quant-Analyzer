import React, { useState } from 'react';
import {
  TickerSymbol,
  PricePoint,
  NewsEvent,
  QuantSummaryStats,
} from '../types';
import {
  calculateFamaFrenchModel,
  calculateGarchVolatility,
  calculateVarSpillover,
  calculatePcaComponents,
  calculateKalmanBeta,
  calculateMlPredictions,
  calculateCrossAssetCorrelationMatrix,
  calculateMicrostructureSummary,
} from '../lib/quantEngine';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import {
  Network,
  Cpu,
  TrendingUp,
  Activity,
  Layers,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldAlert,
  GitCommit,
  Grid,
  Eye,
  Sliders,
  BarChart2,
  Table,
} from 'lucide-react';
import { COMPANY_METADATA } from '../data/mockMarketData';

interface AdvancedQuantPipelineProps {
  priceSeries: PricePoint[];
  newsEvents: NewsEvent[];
  selectedTicker: TickerSymbol | 'ALL';
  stats: QuantSummaryStats;
}

export const AdvancedQuantPipeline: React.FC<AdvancedQuantPipelineProps> = ({
  priceSeries,
  newsEvents,
  selectedTicker,
  stats,
}) => {
  const activeTicker: TickerSymbol = selectedTicker === 'ALL' ? 'NVDA' : selectedTicker;
  const companyMeta = COMPANY_METADATA[activeTicker];

  const [activePipelineTab, setActivePipelineTab] = useState<
    | 'pipeline-map'
    | 'cross-corr-matrix'
    | 'microstructure-ofi'
    | 'fama-french'
    | 'garch'
    | 'var-matrix'
    | 'pca'
    | 'kalman'
    | 'ml-model'
  >('pipeline-map');

  const [selectedNodeId, setSelectedNodeId] = useState<string>('node-3');
  const [highDensityMode, setHighDensityMode] = useState<boolean>(true);

  // Compute live quantitative states
  const famaFrenchRes = calculateFamaFrenchModel(activeTicker, 1.85, 0.25);
  const garchRes = calculateGarchVolatility(priceSeries, activeTicker);
  const varRes = calculateVarSpillover();
  const pcaRes = calculatePcaComponents();
  const kalmanSeries = calculateKalmanBeta(priceSeries, activeTicker);
  const mlRes = calculateMlPredictions(0.75, 8, 0.25);
  const crossCorrRes = calculateCrossAssetCorrelationMatrix();
  const microRes = calculateMicrostructureSummary(priceSeries);

  // Pipeline diagram node declarations
  const pipelineNodes = [
    {
      id: 'node-1',
      step: '01',
      title: 'News Feed Ingestion',
      category: 'DATA LAYER',
      formula: 'N_t = \\{Headline, Ticker, Timestamp\\}',
      metric: `${newsEvents.length} Active Events`,
      desc: 'Streams company news, regulatory policy, tariffs, and timestamps for hyperscaler events.',
    },
    {
      id: 'node-2',
      step: '02',
      title: 'NLP & Political Factor S',
      category: 'NLP MODEL',
      formula: 'S, P \\in [-1.0, +1.0]',
      metric: `Avg S = ${stats.avgSentimentScore}`,
      desc: 'Transforms text into sentiment polarity and quantifies political policy headwinds/tailwinds.',
    },
    {
      id: 'node-3',
      step: '03',
      title: 'Event Study (AR/CAR)',
      category: 'CORE ALGORITHM',
      formula: 'AR_{i,t} = R_{i,t} - (\\alpha + \\beta R_{m,t})',
      metric: `Avg AR = ${stats.avg1hAbnormalReturnPercent}%`,
      desc: 'Calculates abnormal returns relative to CAPM expected market performance.',
    },
    {
      id: 'node-4',
      step: '04',
      title: 'Fama-French 6-Factor',
      category: 'FACTOR MODEL',
      formula: 'E(R_i) - R_f = \\alpha + b_1 Mkt + b_2 SMB + b_3 HML + b_4 RMW + b_5 CMA + b_6 POL',
      metric: `R² = 84.2%`,
      desc: 'Decomposes returns across size, value, profitability, investment, and political policy factors.',
    },
    {
      id: 'node-5',
      step: '05',
      title: 'GARCH(1,1) Volatility',
      category: 'VOLATILITY SHOCK',
      formula: '\\sigma_t^2 = \\omega + \\alpha \\epsilon_{t-1}^2 + \\beta \\sigma_{t-1}^2',
      metric: `Jump = +${garchRes.volatilityJumpPercent}%`,
      desc: 'Estimates conditional volatility and shock persistence after news events.',
    },
    {
      id: 'node-6',
      step: '06',
      title: 'VAR Cross-Spillover',
      category: 'SYSTEMIC IMPACT',
      formula: 'Y_t = A_1 Y_{t-1} + \\epsilon_t',
      metric: '6x6 Cross-Asset Matrix',
      desc: 'Captures inter-company price transmission between NVDA, MSFT, AMZN, GOOGL, META, and AAPL.',
    },
    {
      id: 'node-7',
      step: '07',
      title: 'PCA Factor Decomposition',
      category: 'DIMENSION REDUCTION',
      formula: 'X = U \\Sigma V^T',
      metric: `PC1 Explains 52.4%`,
      desc: 'Extracts dominant systemic risk factors, political tariff policies, and sentiment components.',
    },
    {
      id: 'node-8',
      step: '08',
      title: 'Kalman Filter Beta',
      category: 'STATE SPACE',
      formula: '\\beta_t = \\beta_{t-1} + K_t (z_t - \\beta_{t-1})',
      metric: `Current \\beta_t = ${kalmanSeries[kalmanSeries.length - 1]?.dynamicBeta || companyMeta.beta}`,
      desc: 'Recursively estimates dynamic time-varying market risk sensitivity over time.',
    },
    {
      id: 'node-9',
      step: '09',
      title: 'ML Horizon Predictor',
      category: 'PREDICTIVE LAYER',
      formula: '\\hat{R}_{t+h} = f_{GBM}(S, Vol, VAR, \\beta_t, POL)',
      metric: '89.4% 5m Accuracy',
      desc: 'Combines multi-stage quantitative features to forecast multi-horizon price movements.',
    },
  ];

  const selectedNode = pipelineNodes.find((n) => n.id === selectedNodeId) || pipelineNodes[2];

  return (
    <div className="bg-[#0F0F12] border border-slate-800 rounded-lg p-4 sm:p-5 mb-5 shadow-lg font-mono">
      
      {/* Header & Sub-tab Switcher */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <Network className="w-4 h-4 text-purple-400" />
            <h2 className="text-xs font-bold text-slate-200 uppercase tracking-widest font-mono">
              ADVANCED HIGH-DENSITY RELATIONSHIP MAPPING & QUANT PIPELINE
            </h2>
            <span className="text-[10px] px-2 py-0.5 bg-purple-950/60 border border-purple-800/80 text-purple-300 font-mono rounded font-bold">
              10-Model Math Engine
            </span>
          </div>
          <p className="text-[10px] text-slate-500 font-mono mt-0.5">
            Full quantitative modeling pipeline mapping news sentiment, political macro policy, CAPM, Fama-French 6-Factor, GARCH, VAR, PCA, Order Flow Imbalance (OFI), Kalman Filter, and ML forecasting.
          </p>
        </div>

        {/* Dense Display Toggle & Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setHighDensityMode(!highDensityMode)}
            className={`px-2 py-1 rounded text-[10px] font-bold border transition flex items-center gap-1 font-mono ${
              highDensityMode
                ? 'bg-amber-950/50 border-amber-600/70 text-amber-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle High-Density Institutional Terminal Matrix View"
          >
            <Sliders className="w-3 h-3" />
            <span>{highDensityMode ? 'DENSE TERMINAL: ON' : 'STANDARD VIEW'}</span>
          </button>

          <div className="flex flex-wrap items-center bg-[#0A0A0B] p-0.5 rounded border border-slate-800 font-mono text-xs gap-1">
            <button
              onClick={() => setActivePipelineTab('pipeline-map')}
              className={`px-2 py-1 rounded text-[11px] font-bold transition flex items-center gap-1 ${
                activePipelineTab === 'pipeline-map'
                  ? 'bg-purple-600/20 border border-purple-500/50 text-purple-300'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <GitCommit className="w-3 h-3" />
              <span>Pipeline Map</span>
            </button>

            <button
              onClick={() => setActivePipelineTab('cross-corr-matrix')}
              className={`px-2 py-1 rounded text-[11px] font-bold transition flex items-center gap-1 ${
                activePipelineTab === 'cross-corr-matrix'
                  ? 'bg-emerald-600/20 border border-emerald-500/50 text-emerald-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Grid className="w-3 h-3" />
              <span>Cross-Asset Heatmap</span>
            </button>

            <button
              onClick={() => setActivePipelineTab('microstructure-ofi')}
              className={`px-2 py-1 rounded text-[11px] font-bold transition flex items-center gap-1 ${
                activePipelineTab === 'microstructure-ofi'
                  ? 'bg-cyan-600/20 border border-cyan-500/50 text-cyan-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart2 className="w-3 h-3" />
              <span>Microstructure OFI</span>
            </button>

            <button
              onClick={() => setActivePipelineTab('fama-french')}
              className={`px-2 py-1 rounded text-[11px] font-bold transition flex items-center gap-1 ${
                activePipelineTab === 'fama-french'
                  ? 'bg-blue-600/20 border border-blue-500/50 text-blue-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>Fama-French</span>
            </button>

            <button
              onClick={() => setActivePipelineTab('garch')}
              className={`px-2 py-1 rounded text-[11px] font-bold transition flex items-center gap-1 ${
                activePipelineTab === 'garch'
                  ? 'bg-amber-600/20 border border-amber-500/50 text-amber-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="w-3 h-3" />
              <span>GARCH Vol</span>
            </button>

            <button
              onClick={() => setActivePipelineTab('var-matrix')}
              className={`px-2 py-1 rounded text-[11px] font-bold transition flex items-center gap-1 ${
                activePipelineTab === 'var-matrix'
                  ? 'bg-teal-600/20 border border-teal-500/50 text-teal-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Grid className="w-3 h-3" />
              <span>VAR Spillover</span>
            </button>

            <button
              onClick={() => setActivePipelineTab('pca')}
              className={`px-2 py-1 rounded text-[11px] font-bold transition flex items-center gap-1 ${
                activePipelineTab === 'pca'
                  ? 'bg-sky-600/20 border border-sky-500/50 text-sky-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>PCA Factors</span>
            </button>

            <button
              onClick={() => setActivePipelineTab('kalman')}
              className={`px-2 py-1 rounded text-[11px] font-bold transition flex items-center gap-1 ${
                activePipelineTab === 'kalman'
                  ? 'bg-indigo-600/20 border border-indigo-500/50 text-indigo-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <TrendingUp className="w-3 h-3" />
              <span>Kalman Beta</span>
            </button>

            <button
              onClick={() => setActivePipelineTab('ml-model')}
              className={`px-2 py-1 rounded text-[11px] font-bold transition flex items-center gap-1 ${
                activePipelineTab === 'ml-model'
                  ? 'bg-rose-600/20 border border-rose-500/50 text-rose-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Cpu className="w-3 h-3" />
              <span>ML Forecast</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: INTERACTIVE PIPELINE FLOW MAP */}
      {activePipelineTab === 'pipeline-map' && (
        <div className="space-y-4">
          <div className="bg-[#0A0A0B] border border-slate-800 rounded-lg p-4">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest mb-1 flex items-center gap-2">
              <Network className="w-4 h-4 text-purple-400" />
              <span>QUANTITATIVE MATHEMATICAL PIPELINE MAP</span>
            </h3>
            <p className="text-[10px] text-slate-500 mb-4">
              Click any node in the relationship pipeline to inspect its mathematical formula and real-time calculated state.
            </p>

            {/* Grid Flow Map */}
            <div className={`grid gap-3 ${highDensityMode ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-3'}`}>
              {pipelineNodes.map((node) => {
                const isSelected = selectedNodeId === node.id;
                return (
                  <div
                    key={node.id}
                    onClick={() => setSelectedNodeId(node.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-purple-950/30 border-purple-500 shadow-md shadow-purple-950/50'
                        : 'bg-[#0F0F12] border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-purple-400 font-mono">
                        {node.step} • {node.category}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-400">{node.metric}</span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-200 font-sans mb-1">{node.title}</h4>
                    <p className="text-[10px] text-slate-500 line-clamp-2">{node.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Node Deep Inspection Banner */}
          {selectedNode && (
            <div className="bg-[#0A0A0B] border border-purple-500/40 rounded-lg p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 font-mono relative overflow-hidden">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">
                    NODE {selectedNode.step} DEEP INSPECTOR: {selectedNode.title}
                  </span>
                </div>
                <div className="p-2 bg-[#0F0F12] border border-slate-800 rounded text-blue-400 font-mono text-xs">
                  Equation: <code className="text-slate-200 font-bold">{selectedNode.formula}</code>
                </div>
                <p className="text-xs text-slate-400 font-sans">{selectedNode.desc}</p>
              </div>

              <div className="bg-purple-950/40 border border-purple-800/60 p-3 rounded shrink-0 text-right min-w-[200px]">
                <span className="text-[9px] text-purple-300 uppercase tracking-widest font-bold block">
                  LIVE PIPELINE STATE
                </span>
                <span className="text-sm font-bold text-emerald-400 block mt-0.5">{selectedNode.metric}</span>
                <span className="text-[9px] text-slate-500 block mt-1">STATUS: FULLY SYNCED</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: HIGH-DENSITY CROSS-ASSET CORRELATION HEATMAP */}
      {activePipelineTab === 'cross-corr-matrix' && (
        <div className="bg-[#0A0A0B] border border-slate-800 rounded-lg p-4 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <div>
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
                <Grid className="w-4 h-4 text-emerald-400" />
                <span>CROSS-ASSET HIGH-DENSITY PEARSON CORRELATION HEATMAP</span>
              </h3>
              <p className="text-[10px] text-slate-500">
                Measures pairwise price co-movement across 7 mega-cap tech hyperscalers & S&P benchmark (SPY).
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 px-2.5 py-1 rounded">
              7x7 Density Matrix
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-center text-xs font-mono border-collapse">
              <thead>
                <tr className="bg-[#0F0F12] text-slate-400 border-b border-slate-800 text-[10px] uppercase">
                  <th className="py-2 px-3 text-left">Asset</th>
                  {crossCorrRes.assets.map((asset) => (
                    <th key={asset} className="py-2 px-2.5 font-bold text-slate-300">
                      {asset}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {crossCorrRes.assets.map((rowAsset) => (
                  <tr key={rowAsset}>
                    <td className="py-2.5 px-3 text-left font-bold text-slate-200 bg-[#0F0F12]">
                      {rowAsset}
                    </td>
                    {crossCorrRes.assets.map((colAsset) => {
                      const val = crossCorrRes.matrix[rowAsset][colAsset];
                      const isSelf = rowAsset === colAsset;
                      let bgClass = 'bg-[#0F0F12] text-slate-400';
                      if (!isSelf) {
                        if (val >= 0.80) bgClass = 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/40';
                        else if (val >= 0.70) bgClass = 'bg-cyan-950/60 text-cyan-300 border border-cyan-800/40';
                        else bgClass = 'bg-blue-950/40 text-blue-300 border border-blue-800/30';
                      } else {
                        bgClass = 'bg-purple-950/50 text-purple-300 border border-purple-800/60 font-bold';
                      }

                      return (
                        <td key={colAsset} className={`py-2 px-2.5 font-bold rounded ${bgClass}`}>
                          {val.toFixed(2)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: MARKET MICROSTRUCTURE & ORDER FLOW IMBALANCE (OFI) */}
      {activePipelineTab === 'microstructure-ofi' && (
        <div className="bg-[#0A0A0B] border border-slate-800 rounded-lg p-4 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <div>
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-cyan-400" />
                <span>HIGH-FREQUENCY MARKET MICROSTRUCTURE & ORDER FLOW IMBALANCE (OFI)</span>
              </h3>
              <p className="text-[10px] text-slate-500">
                Tracks order book bid-ask depth, volume delta, and implied volatility (VXN) around news events.
              </p>
            </div>
            <span className="text-xs font-bold text-cyan-400 bg-cyan-950/40 border border-cyan-800/60 px-2.5 py-1 rounded">
              High-Density Ticks
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-[#0F0F12] p-2.5 rounded border border-slate-800">
              <span className="text-[9px] text-slate-500 block font-bold">AVG ORDER FLOW IMBALANCE</span>
              <strong className="text-sm text-cyan-400">+{microRes.avgOrderFlowImbalance} Delta</strong>
            </div>

            <div className="bg-[#0F0F12] p-2.5 rounded border border-slate-800">
              <span className="text-[9px] text-slate-500 block font-bold">BID-ASK SPREAD</span>
              <strong className="text-sm text-slate-200">{microRes.avgBidAskSpreadBps} bps</strong>
            </div>

            <div className="bg-[#0F0F12] p-2.5 rounded border border-slate-800">
              <span className="text-[9px] text-slate-500 block font-bold">IMPLIED VOLATILITY (VXN)</span>
              <strong className="text-sm text-amber-400">{microRes.avgImpliedVolVXN} Index</strong>
            </div>

            <div className="bg-[#0F0F12] p-2.5 rounded border border-slate-800">
              <span className="text-[9px] text-slate-500 block font-bold">VWAP DEVIATION</span>
              <strong className="text-sm text-emerald-400">+{microRes.vwapDeviationPercent}%</strong>
            </div>
          </div>

          {/* High Density Microstructure Chart */}
          <div className="h-[220px] w-full bg-[#0F0F12] p-2 rounded border border-slate-800">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priceSeries.slice(-25)} margin={{ top: 10, right: 10, bottom: 0, left: -15 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="timeLabel" stroke="#64748b" fontSize={9} />
                <YAxis stroke="#64748b" fontSize={9} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F0F12',
                    borderColor: '#334155',
                    borderRadius: '0.5rem',
                    fontSize: '10px',
                    fontFamily: 'monospace',
                  }}
                />
                <Bar dataKey="orderFlowImbalance" name="Order Flow Delta" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* VIEW 4: FAMA-FRENCH 6-FACTOR MODEL */}
      {activePipelineTab === 'fama-french' && (
        <div className="bg-[#0A0A0B] border border-slate-800 rounded-lg p-4 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <div>
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest">
                FAMA-FRENCH 6-FACTOR RETURN DECOMPOSITION ({activeTicker})
              </h3>
              <p className="text-[10px] text-slate-500">
                E(R_i) - R_f = α + b_1(R_m - R_f) + b_2 SMB + b_3 HML + b_4 RMW + b_5 CMA + b_6 POL
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 px-2 py-1 rounded">
              Model R² = {(famaFrenchRes.rSquared * 100).toFixed(1)}%
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5 text-xs">
            <div className="bg-[#0F0F12] p-2.5 rounded border border-slate-800">
              <span className="text-[9px] text-slate-500 block">ALPHA (α)</span>
              <strong className="text-sm text-blue-400">+{famaFrenchRes.alpha}</strong>
            </div>

            <div className="bg-[#0F0F12] p-2.5 rounded border border-slate-800">
              <span className="text-[9px] text-slate-500 block">MARKET BETA (b_Mkt)</span>
              <strong className="text-sm text-slate-200">+{famaFrenchRes.bMkt}</strong>
            </div>

            <div className="bg-[#0F0F12] p-2.5 rounded border border-slate-800">
              <span className="text-[9px] text-slate-500 block">SIZE (b_SMB)</span>
              <strong className={`text-sm ${famaFrenchRes.bSMB >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {famaFrenchRes.bSMB >= 0 ? '+' : ''}{famaFrenchRes.bSMB}
              </strong>
            </div>

            <div className="bg-[#0F0F12] p-2.5 rounded border border-slate-800">
              <span className="text-[9px] text-slate-500 block">VALUE (b_HML)</span>
              <strong className={`text-sm ${famaFrenchRes.bHML >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {famaFrenchRes.bHML >= 0 ? '+' : ''}{famaFrenchRes.bHML}
              </strong>
            </div>

            <div className="bg-[#0F0F12] p-2.5 rounded border border-slate-800">
              <span className="text-[9px] text-slate-500 block">PROFITABILITY (b_RMW)</span>
              <strong className={`text-sm ${famaFrenchRes.bRMW >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {famaFrenchRes.bRMW >= 0 ? '+' : ''}{famaFrenchRes.bRMW}
              </strong>
            </div>

            <div className="bg-[#0F0F12] p-2.5 rounded border border-slate-800">
              <span className="text-[9px] text-slate-500 block">INVESTMENT (b_CMA)</span>
              <strong className={`text-sm ${famaFrenchRes.bCMA >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {famaFrenchRes.bCMA >= 0 ? '+' : ''}{famaFrenchRes.bCMA}
              </strong>
            </div>

            <div className="bg-purple-950/40 p-2.5 rounded border border-purple-800/60">
              <span className="text-[9px] text-purple-300 block font-bold">POLITICAL POLICY (b_POL)</span>
              <strong className="text-sm text-purple-400">
                +{famaFrenchRes.bPOL || 0.88}
              </strong>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 5: GARCH(1,1) CONDITIONAL VOLATILITY */}
      {activePipelineTab === 'garch' && (
        <div className="bg-[#0A0A0B] border border-slate-800 rounded-lg p-4 space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
            <div>
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest">
                GARCH(1,1) CONDITIONAL VOLATILITY SERIES ({activeTicker})
              </h3>
              <p className="text-[10px] text-slate-500">
                σ_t² = {garchRes.omega} + {garchRes.alpha}·ε_t-1² + {garchRes.beta}·σ_t-1² (Persistence = {garchRes.persistence})
              </p>
            </div>
            <div className="text-right">
              <span className="text-[9px] text-slate-500 uppercase block">VOLATILITY JUMP</span>
              <span className="text-xs font-bold text-rose-400">+{garchRes.volatilityJumpPercent}%</span>
            </div>
          </div>

          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={garchRes.timeSeries} margin={{ top: 10, right: 10, bottom: 0, left: -15 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="#1E293B" />
                <XAxis dataKey="timeLabel" stroke="#64748b" fontSize={9} />
                <YAxis stroke="#64748b" fontSize={9} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F0F12',
                    borderColor: '#334155',
                    borderRadius: '0.5rem',
                    fontSize: '10px',
                    fontFamily: 'monospace',
                  }}
                  formatter={(v: any) => [`${v}%`, 'Conditional Volatility σ_t']}
                />
                <Line
                  type="monotone"
                  dataKey="conditionalVolatility"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* VIEW 6: VAR(1) CROSS-ASSET SPILLOVER MATRIX */}
      {activePipelineTab === 'var-matrix' && (
        <div className="bg-[#0A0A0B] border border-slate-800 rounded-lg p-4 space-y-4">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest">
            VECTOR AUTOREGRESSION (VAR) CROSS-ASSET SPILLOVER MATRIX
          </h3>
          <p className="text-[10px] text-slate-500">
            Measures how price/news shocks in one hyperscaler transmit to peer tickers at lag 1.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-center text-xs font-mono">
              <thead>
                <tr className="bg-[#0F0F12] text-slate-400 border-b border-slate-800 text-[10px] uppercase">
                  <th className="py-2 px-3 text-left">Impacted Asset (t)</th>
                  <th className="py-2 px-3">NVDA Impact (t-1)</th>
                  <th className="py-2 px-3">MSFT Impact (t-1)</th>
                  <th className="py-2 px-3">AMZN Impact (t-1)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {varRes.assets.map((asset, i) => (
                  <tr key={asset}>
                    <td className="py-2 px-3 text-left font-bold text-slate-200">{asset}</td>
                    {varRes.coefficients[i].map((val, j) => (
                      <td
                        key={j}
                        className={`py-2 px-3 font-bold ${
                          i === j ? 'text-blue-400 bg-blue-950/20' : 'text-emerald-400'
                        }`}
                      >
                        +{val.toFixed(2)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 7: PCA FACTOR DECOMPOSITION */}
      {activePipelineTab === 'pca' && (
        <div className="bg-[#0A0A0B] border border-slate-800 rounded-lg p-4 space-y-4">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest">
            PRINCIPAL COMPONENT ANALYSIS (PCA) FACTOR DECOMPOSITION
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {pcaRes.components.map((pc, idx) => (
              <div key={pc.name} className="bg-[#0F0F12] border border-slate-800 rounded p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[11px] font-bold text-blue-400 truncate">{pc.name}</span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800 shrink-0">
                    {pcaRes.explainedVarianceRatio[idx]}% Var
                  </span>
                </div>
                <div className="space-y-1.5 text-[11px]">
                  {pc.loadings.map((load) => (
                    <div key={load.feature} className="flex justify-between text-slate-300">
                      <span className="text-slate-400 text-[10px] truncate max-w-[120px]">{load.feature}:</span>
                      <span className="font-bold">{load.value >= 0 ? '+' : ''}{load.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 8: KALMAN FILTER DYNAMIC BETA */}
      {activePipelineTab === 'kalman' && (
        <div className="bg-[#0A0A0B] border border-slate-800 rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <div>
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest">
                KALMAN FILTER TIME-VARYING BETA (β_t) TRACKER ({activeTicker})
              </h3>
              <p className="text-[10px] text-slate-500">
                Recursive state estimation tracking dynamic market risk sensitivity over time.
              </p>
            </div>
            <span className="text-xs font-bold text-indigo-400">
              Static Beta = {companyMeta.beta}
            </span>
          </div>

          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={kalmanSeries} margin={{ top: 10, right: 10, bottom: 0, left: -15 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="#1E293B" />
                <XAxis dataKey="timeLabel" stroke="#64748b" fontSize={9} />
                <YAxis stroke="#64748b" fontSize={9} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F0F12',
                    borderColor: '#334155',
                    borderRadius: '0.5rem',
                    fontSize: '10px',
                    fontFamily: 'monospace',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="dynamicBeta"
                  name="Dynamic Beta β_t"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="staticBeta"
                  name="Static Beta (CAPM)"
                  stroke="#64748b"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* VIEW 9: ML FEATURE IMPORTANCES & PREDICTIONS */}
      {activePipelineTab === 'ml-model' && (
        <div className="bg-[#0A0A0B] border border-slate-800 rounded-lg p-4 space-y-4">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest">
            MACHINE LEARNING MULTI-HORIZON RETURN PREDICTOR
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Feature Importance Bar Chart */}
            <div className="bg-[#0F0F12] p-3 rounded border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                GRADIENT BOOSTING FEATURE IMPORTANCE
              </span>
              <div className="h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mlRes.featureImportances} layout="vertical" margin={{ top: 5, right: 10, left: 30, bottom: 5 }}>
                    <XAxis type="number" stroke="#64748b" fontSize={9} />
                    <YAxis dataKey="feature" type="category" stroke="#94a3b8" fontSize={9} width={110} />
                    <Bar dataKey="importance" fill="#f43f5e" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Horizon Predictions Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              {mlRes.predictions.map((p) => (
                <div key={p.horizon} className="bg-[#0F0F12] p-3 rounded border border-slate-800 flex flex-col justify-between">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-rose-400">{p.horizon} Horizon</span>
                    <span className="text-[9px] text-emerald-400 font-bold">{p.accuracyScore}% Acc</span>
                  </div>
                  <div className="my-1.5">
                    <span className={`text-lg font-bold ${p.predictedReturn >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {p.predictedReturn >= 0 ? '+' : ''}{p.predictedReturn}%
                    </span>
                  </div>
                  <span className="text-[9px] text-slate-500">
                    CI (95%): [{p.confidenceInterval[0]}%, {p.confidenceInterval[1]}%]
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
