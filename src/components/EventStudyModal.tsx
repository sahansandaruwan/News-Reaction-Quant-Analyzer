import React from 'react';
import { NewsEvent, EventWindowPoint } from '../types';
import { generateEventWindowPoints, COMPANY_METADATA } from '../data/mockMarketData';
import { X, TrendingUp, Zap, ShieldCheck, Calculator, ExternalLink } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface EventStudyModalProps {
  news: NewsEvent | null;
  onClose: () => void;
}

export const EventStudyModal: React.FC<EventStudyModalProps> = ({ news, onClose }) => {
  if (!news) return null;

  const timelinePoints: EventWindowPoint[] = generateEventWindowPoints(news);
  const meta = COMPANY_METADATA[news.ticker];
  const isPositiveAR = news.abnormalReturn1hPercent >= 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto font-mono">
      <div className="bg-[#0F0F12] border border-slate-800 rounded-lg max-w-3xl w-full p-5 shadow-2xl my-8 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white bg-[#0A0A0B] hover:bg-slate-800 rounded border border-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="mb-4 pb-3 border-b border-slate-800 pr-10">
          <div className="flex items-center space-x-2 mb-2">
            <span className="px-2 py-0.5 text-xs font-bold rounded bg-blue-900/30 text-blue-400 border border-blue-500/30">
              {news.ticker}
            </span>
            <span className="text-[10px] text-slate-500">{news.displayTime}</span>
            <span className="text-[10px] px-2 py-0.5 bg-slate-900 text-slate-300 border border-slate-800 rounded">
              {news.topic}
            </span>
          </div>
          <h2 className="text-sm sm:text-base font-bold text-slate-100 font-sans leading-snug">
            {news.headline}
          </h2>
          <p className="text-xs text-slate-400 mt-2 bg-[#0A0A0B] p-3 rounded border border-slate-800/80 leading-relaxed font-sans">
            {news.summary}
          </p>
        </div>

        {/* Quant Metric Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3 font-mono">
          
          <div className="bg-[#0A0A0B] p-2.5 rounded border border-slate-800">
            <span className="text-[9px] text-slate-500 uppercase tracking-widest block font-bold">AI Sentiment</span>
            <span
              className={`text-sm font-bold ${
                news.sentimentScore > 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {news.sentimentScore > 0 ? '+' : ''}{news.sentimentScore}
            </span>
            <span className="text-[9px] text-slate-500 block mt-0.5">Importance {news.importanceRating}/10</span>
          </div>

          <div className="bg-[#0A0A0B] p-2.5 rounded border border-slate-800">
            <span className="text-[9px] text-slate-500 uppercase tracking-widest block font-bold">Actual 1h Return</span>
            <span className={`text-sm font-bold ${news.return1hPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {news.return1hPercent >= 0 ? '+' : ''}{news.return1hPercent}%
            </span>
            <span className="text-[9px] text-slate-500 block mt-0.5">Price: ${news.price1hPost}</span>
          </div>

          <div className="bg-[#0A0A0B] p-2.5 rounded border border-slate-800">
            <span className="text-[9px] text-slate-500 uppercase tracking-widest block font-bold">Abnormal Return (AR)</span>
            <span className={`text-sm font-bold ${isPositiveAR ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isPositiveAR ? '+' : ''}{news.abnormalReturn1hPercent}%
            </span>
            <span className="text-[9px] text-slate-500 block mt-0.5">Alpha Over SPY</span>
          </div>

          <div className="bg-[#0A0A0B] p-2.5 rounded border border-slate-800">
            <span className="text-[9px] text-slate-500 uppercase tracking-widest block font-bold">Vol Jump & Sig.</span>
            <span className="text-sm font-bold text-orange-400 block">
              {news.volatilityJumpRatio}x
            </span>
            <span className="text-[9px] text-emerald-400 block mt-0.5 font-bold">
              {news.isStatisticallySignificant ? `Sig. (p=${news.pValue})` : `p=${news.pValue}`}
            </span>
          </div>

        </div>

        {/* Political & Social Macro Factor Banner */}
        {news.politicalMacroImpactScore !== undefined && (
          <div className="bg-purple-950/30 border border-purple-800/60 rounded p-3 mb-5 font-mono">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-purple-300 uppercase tracking-widest flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-purple-400" />
                <span>POLITICAL, SOCIAL & GEOPOLITICAL MACRO IMPACT FACTOR</span>
              </span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                news.politicalMacroImpactScore >= 0
                  ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-400'
                  : 'bg-rose-950/60 border border-rose-800 text-rose-400'
              }`}>
                Score: {news.politicalMacroImpactScore > 0 ? '+' : ''}{news.politicalMacroImpactScore} ({news.politicalMacroCategory || 'Macro Policy'})
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-sans leading-normal">
              {news.politicalMacroReasoning || 'Government regulatory policy, trade tariffs, central bank interest rate choices, and labor/social directives directly shift asset cost structures and risk premiums.'}
            </p>
          </div>
        )}

        {/* Event Study Window Chart */}
        <div className="bg-[#0A0A0B] border border-slate-800 rounded p-3 mb-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest font-mono flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
              <span>EVENT STUDY WINDOW TIMELINE (-2h to +1d)</span>
            </h3>
            <span className="text-[9px] text-slate-500 font-mono">t₀ = Publication</span>
          </div>

          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelinePoints} margin={{ top: 10, right: 15, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="#1E293B" />
                <XAxis dataKey="timeOffset" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F0F12',
                    borderColor: '#334155',
                    borderRadius: '0.5rem',
                    color: '#f8fafc',
                    fontSize: '10px',
                    fontFamily: 'monospace',
                  }}
                  formatter={(val: any, name: any) => [`${val}%`, name]}
                />
                <Line
                  type="monotone"
                  dataKey="stockReturnPercent"
                  name="Stock Return %"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="expectedReturnPercent"
                  name="CAPM Expected %"
                  stroke="#8884d8"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="abnormalReturnPercent"
                  name="Abnormal Return (AR)"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Mathematical Formula Breakdown */}
        <div className="bg-[#0A0A0B] p-3 rounded border border-slate-800 font-mono text-xs">
          <h4 className="text-slate-300 font-bold mb-2 flex items-center gap-1.5 text-xs">
            <Calculator className="w-3.5 h-3.5 text-blue-400" />
            <span>QUANT MATHEMATICAL FORMULA DECOMPOSITION</span>
          </h4>
          <div className="space-y-1 text-slate-400 text-[10px] leading-relaxed">
            <p>
              • <strong className="text-slate-200">Actual Return (Rᵢ):</strong> {news.return1hPercent}%
            </p>
            <p>
              • <strong className="text-slate-200">CAPM Market Model Expected (E[Rᵢ]):</strong> α ({meta.alpha}) + β ({meta.beta}) × R_market ({news.marketReturn1hPercent}%) = <span className="text-purple-400 font-bold">{news.expectedReturn1hPercent}%</span>
            </p>
            <p>
              • <strong className="text-slate-200">Abnormal Return (ARᵢ):</strong> Rᵢ ({news.return1hPercent}%) - E[Rᵢ] ({news.expectedReturn1hPercent}%) = <span className="text-emerald-400 font-bold">+{news.abnormalReturn1hPercent}%</span>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
