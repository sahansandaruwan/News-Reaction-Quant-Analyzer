import React from 'react';
import { QuantSummaryStats } from '../types';
import { TrendingUp, Award, Zap, BarChart2, ShieldCheck, Flame } from 'lucide-react';

interface KpiCardsProps {
  stats: QuantSummaryStats;
}

export const KpiCards: React.FC<KpiCardsProps> = ({ stats }) => {
  const isPositiveSentiment = stats.avgSentimentScore >= 0;
  const isPositiveAR = stats.avg1hAbnormalReturnPercent >= 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-5 font-mono">
      
      {/* 1. Avg Sentiment Score */}
      <div className="bg-[#0F0F12] border border-slate-800 rounded-lg p-3 flex flex-col justify-between hover:border-slate-700 transition">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Avg Sentiment</span>
          <Flame className={`w-3.5 h-3.5 ${isPositiveSentiment ? 'text-emerald-400' : 'text-rose-400'}`} />
        </div>
        <div className="mt-2">
          <div className="flex items-baseline gap-1">
            <span className={`text-lg font-bold font-mono ${isPositiveSentiment ? 'text-emerald-400' : 'text-rose-400'}`}>
              {stats.avgSentimentScore > 0 ? '+' : ''}{stats.avgSentimentScore}
            </span>
            <span className="text-[9px] text-slate-500 font-normal">[-1, +1]</span>
          </div>
          <p className="text-[9px] text-slate-500 mt-0.5 truncate uppercase">
            {stats.avgSentimentScore > 0.3 ? 'Bullish' : stats.avgSentimentScore < -0.3 ? 'Bearish' : 'Neutral'}
          </p>
        </div>
      </div>

      {/* 2. Mean 1h Abnormal Return */}
      <div className="bg-[#0F0F12] border border-slate-800 rounded-lg p-3 flex flex-col justify-between hover:border-slate-700 transition">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Mean 1h AR</span>
          <TrendingUp className={`w-3.5 h-3.5 ${isPositiveAR ? 'text-emerald-400' : 'text-rose-400'}`} />
        </div>
        <div className="mt-2">
          <div className="flex items-baseline">
            <span className={`text-lg font-bold font-mono ${isPositiveAR ? 'text-emerald-400' : 'text-rose-400'}`}>
              {stats.avg1hAbnormalReturnPercent > 0 ? '+' : ''}{stats.avg1hAbnormalReturnPercent}%
            </span>
          </div>
          <p className="text-[9px] text-slate-500 mt-0.5 truncate uppercase">
            Alpha Beyond SPY
          </p>
        </div>
      </div>

      {/* 3. Pearson Correlation (rho) */}
      <div className="bg-[#0F0F12] border border-slate-800 rounded-lg p-3 flex flex-col justify-between hover:border-slate-700 transition">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Correlation (ρ)</span>
          <BarChart2 className="w-3.5 h-3.5 text-blue-400" />
        </div>
        <div className="mt-2">
          <div className="flex items-baseline">
            <span className="text-lg font-bold font-mono text-blue-400">
              {stats.correlationSentimentAbnormalReturn}
            </span>
          </div>
          <p className="text-[9px] text-slate-500 mt-0.5 truncate uppercase">
            Sentiment ↔ AR
          </p>
        </div>
      </div>

      {/* 4. Multiple OLS R-Squared */}
      <div className="bg-[#0F0F12] border border-slate-800 rounded-lg p-3 flex flex-col justify-between hover:border-slate-700 transition">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">OLS R² Fit</span>
          <Award className="w-3.5 h-3.5 text-purple-400" />
        </div>
        <div className="mt-2">
          <div className="flex items-baseline">
            <span className="text-lg font-bold font-mono text-purple-400">
              {(stats.rSquared * 100).toFixed(1)}%
            </span>
          </div>
          <p className="text-[9px] text-slate-500 mt-0.5 truncate uppercase">
            Model Variance
          </p>
        </div>
      </div>

      {/* 5. Statistically Significant Events */}
      <div className="bg-[#0F0F12] border border-slate-800 rounded-lg p-3 flex flex-col justify-between hover:border-slate-700 transition">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Sig. Events</span>
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
        </div>
        <div className="mt-2">
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold font-mono text-amber-400">
              {stats.significantEventsCount}
            </span>
            <span className="text-[10px] text-slate-500 font-normal">/ {stats.totalNewsEvents}</span>
          </div>
          <p className="text-[9px] text-slate-500 mt-0.5 truncate uppercase">
            p &lt; 0.05 Conf
          </p>
        </div>
      </div>

      {/* 6. Volatility Jump Ratio */}
      <div className="bg-[#0F0F12] border border-slate-800 rounded-lg p-3 flex flex-col justify-between hover:border-slate-700 transition">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Vol Shock</span>
          <Zap className="w-3.5 h-3.5 text-orange-400" />
        </div>
        <div className="mt-2">
          <div className="flex items-baseline">
            <span className="text-lg font-bold font-mono text-orange-400">
              {stats.avgVolatilityJumpRatio}x
            </span>
          </div>
          <p className="text-[9px] text-slate-500 mt-0.5 truncate uppercase">
            Post/Pre Ratio
          </p>
        </div>
      </div>

    </div>
  );
};
