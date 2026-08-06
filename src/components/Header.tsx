import React, { useState, useEffect } from 'react';
import { Activity, Sparkles, RefreshCw, PlusCircle, TrendingUp, Cpu, Cloud, ShoppingBag, Key, Check } from 'lucide-react';
import { TickerSymbol, Timeframe } from '../types';
import { COMPANY_METADATA } from '../data/mockMarketData';
import { getStoredGeminiApiKey } from '../lib/geminiClient';

interface HeaderProps {
  selectedTicker: TickerSymbol | 'ALL';
  onSelectTicker: (ticker: TickerSymbol | 'ALL') => void;
  selectedTimeframe: Timeframe;
  onSelectTimeframe: (timeframe: Timeframe) => void;
  onOpenCustomModal: () => void;
  onOpenKeyModal: () => void;
  onFetchLiveNews: () => void;
  isRefreshingLive: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  selectedTicker,
  onSelectTicker,
  selectedTimeframe,
  onSelectTimeframe,
  onOpenCustomModal,
  onOpenKeyModal,
  onFetchLiveNews,
  isRefreshingLive,
}) => {
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    const checkKey = () => setHasKey(Boolean(getStoredGeminiApiKey()));
    checkKey();
    window.addEventListener('storage', checkKey);
    return () => window.removeEventListener('storage', checkKey);
  }, []);

  const activeTickerMeta = selectedTicker !== 'ALL' ? COMPANY_METADATA[selectedTicker] : COMPANY_METADATA['NVDA'];

  return (
    <div className="w-full shrink-0 select-none border-b border-slate-800 bg-[#111114]">
      {/* Top Terminal Status Header Bar */}
      <header className="min-h-12 border-b border-slate-800/80 bg-[#111114] flex flex-col md:flex-row md:items-center justify-between px-4 lg:px-6 py-2 gap-2 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 px-2 py-1 rounded text-white text-[10px] font-bold tracking-tighter uppercase italic shadow-sm shrink-0">
            QUANT_ANALYTICS v2.4
          </div>
          <h1 className="text-xs sm:text-sm font-bold tracking-wide text-slate-100 font-mono truncate">
            EVENT STUDY: STOCK-NEWS CORRELATION ENGINE
          </h1>
        </div>

        {/* Live Index Market Tickers */}
        <div className="flex items-center gap-4 text-[11px] font-mono shrink-0 overflow-x-auto">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-bold">SPY</span>
            <span className="text-emerald-400 font-bold">5,117.08 (+0.42%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-bold">IXIC</span>
            <span className="text-rose-400 font-bold">16,274.94 (-0.11%)</span>
          </div>
          <div className="text-slate-500 hidden sm:block">
            {new Date().toISOString().replace('T', ' ').substring(0, 19)} UTC
          </div>
        </div>
      </header>

      {/* Navigation & Market Quick Stats Bar */}
      <nav className="min-h-12 border-b border-slate-800 bg-[#0F0F12] flex flex-wrap items-center justify-between px-4 lg:px-6 py-2 gap-3 shrink-0">
        
        {/* Company Selector Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => onSelectTicker('ALL')}
            className={`px-3 py-1.5 rounded text-xs font-bold font-mono transition ${
              selectedTicker === 'ALL'
                ? 'bg-blue-600/10 border border-blue-500/50 text-blue-400'
                : 'hover:bg-slate-800 border border-transparent text-slate-400'
            }`}
          >
            ALL TECH (NVDA, MSFT, AMZN)
          </button>

          {(['NVDA', 'MSFT', 'AMZN'] as TickerSymbol[]).map((ticker) => {
            const meta = COMPANY_METADATA[ticker];
            const isSelected = selectedTicker === ticker;

            return (
              <button
                key={ticker}
                onClick={() => onSelectTicker(ticker)}
                className={`px-3 py-1.5 rounded text-xs font-bold font-mono transition flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-blue-600/10 border border-blue-500/50 text-blue-400'
                    : 'hover:bg-slate-800 border border-transparent text-slate-400'
                }`}
              >
                <span>{meta.name.split(' ')[0]} ({ticker})</span>
                <span
                  className={`text-[9px] px-1 rounded ${
                    meta.dayChangePercent >= 0 ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
                  }`}
                >
                  {meta.dayChangePercent >= 0 ? '+' : ''}{meta.dayChangePercent}%
                </span>
              </button>
            );
          })}
        </div>

        {/* Quick Stock Metrics & Actions */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="hidden lg:flex items-center gap-4 text-xs font-mono border-l border-slate-800 pl-4">
            <div className="flex flex-col">
              <span className="text-[9px] uppercase text-slate-500 font-bold tracking-wider">Price</span>
              <span className="text-xs font-mono font-bold text-slate-200">
                ${activeTickerMeta.currentPrice}{' '}
                <span className={activeTickerMeta.dayChangePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                  {activeTickerMeta.dayChangePercent >= 0 ? '+' : ''}{activeTickerMeta.dayChangePercent}%
                </span>
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] uppercase text-slate-500 font-bold tracking-wider">Beta (β)</span>
              <span className="text-xs font-mono font-bold text-slate-200">{activeTickerMeta.beta}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] uppercase text-slate-500 font-bold tracking-wider">Alpha (α)</span>
              <span className="text-xs font-mono font-bold text-slate-200">{activeTickerMeta.alpha}</span>
            </div>
          </div>

          <div className="h-4 w-px bg-slate-800 hidden lg:block"></div>

          {/* Timeframe Selector */}
          <div className="flex items-center bg-[#0A0A0B] rounded border border-slate-800 p-0.5">
            {(['5m', '15m', '1h', '1d'] as Timeframe[]).map((tf) => (
              <button
                key={tf}
                onClick={() => onSelectTimeframe(tf)}
                className={`px-2 py-0.5 text-[10px] font-mono rounded ${
                  selectedTimeframe === tf
                    ? 'bg-blue-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Live News Refresh */}
          <button
            onClick={onFetchLiveNews}
            disabled={isRefreshingLive}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-[11px] font-mono font-bold flex items-center gap-1.5 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshingLive ? 'animate-spin text-emerald-400' : ''}`} />
            <span>{isRefreshingLive ? 'FETCHING' : 'LIVE FEED'}</span>
          </button>

          {/* Gemini API Key Modal Button */}
          <button
            onClick={onOpenKeyModal}
            className={`px-2.5 py-1 rounded text-xs font-bold font-mono flex items-center gap-1.5 transition border ${
              hasKey
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                : 'bg-slate-800 border-slate-700 text-cyan-400 hover:bg-slate-700'
            }`}
            title="Configure Gemini API key for direct client-side AI predictions"
          >
            <Key className="w-3.5 h-3.5" />
            <span>{hasKey ? 'GEMINI ACTIVE' : 'GEMINI API KEY'}</span>
          </button>

          {/* Test Headline AI */}
          <button
            onClick={onOpenCustomModal}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold font-mono flex items-center gap-1.5 shadow transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>TEST HEADLINE</span>
          </button>
        </div>

      </nav>
    </div>
  );
};

