import React, { useState, useEffect } from 'react';
import { TickerSymbol, NewsEvent, NewsTopic } from '../types';
import { COMPANY_METADATA } from '../data/mockMarketData';
import { Sparkles, X, Activity, ArrowRight, CheckCircle2, ShieldCheck, Zap, Key } from 'lucide-react';
import { getStoredGeminiApiKey, analyzeHeadlineClientGemini } from '../lib/geminiClient';

interface CustomHeadlineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalysisSuccess: (newEvent: NewsEvent) => void;
  onOpenKeyModal?: () => void;
}

export const CustomHeadlineModal: React.FC<CustomHeadlineModalProps> = ({
  isOpen,
  onClose,
  onAnalysisSuccess,
  onOpenKeyModal,
}) => {
  const [headline, setHeadline] = useState('');
  const [content, setContent] = useState('');
  const [ticker, setTicker] = useState<TickerSymbol>('NVDA');
  const [marketReturn, setMarketReturn] = useState<number>(0.25);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setHasApiKey(Boolean(getStoredGeminiApiKey()));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const generateClientSideAnalysis = (headlineText: string, targetTicker: TickerSymbol, mktRet: number, bodyContent?: string): NewsEvent => {
    const lower = headlineText.toLowerCase();
    const isPos = lower.includes('surge') || lower.includes('upgrade') || lower.includes('approve') || lower.includes('record') || lower.includes('soar') || lower.includes('beat') || lower.includes('contract') || lower.includes('unveil') || lower.includes('launch') || lower.includes('exemption') || lower.includes('boost') || lower.includes('fast-track') || lower.includes('reaffirms');
    const isNeg = lower.includes('inquiry') || lower.includes('tariff') || lower.includes('drop') || lower.includes('cut') || lower.includes('lawsuit') || lower.includes('fall') || lower.includes('compress') || lower.includes('sanction') || lower.includes('fails');
    
    const sentimentScore = isPos ? 0.82 : isNeg ? -0.72 : 0.25;
    const sentimentCategory = isPos ? 'Positive' : isNeg ? 'Negative' : 'Neutral';
    const alpha = targetTicker === 'NVDA' ? 0.08 : targetTicker === 'MSFT' ? 0.04 : 0.05;
    const beta = targetTicker === 'NVDA' ? 1.68 : targetTicker === 'MSFT' ? 1.12 : 1.34;
    const expectedReturn = alpha + beta * mktRet;
    const abnormalReturn = sentimentScore * 1.85;
    const return1h = expectedReturn + abnormalReturn;

    const currentPriceMap: Record<TickerSymbol, number> = {
      NVDA: 128.50,
      MSFT: 428.10,
      AMZN: 184.30,
      GOOGL: 172.40,
      META: 498.20,
      AAPL: 221.50,
    };

    const currentPrice = currentPriceMap[targetTicker] || 150.00;
    const price1hPost = Number((currentPrice * (1 + return1h / 100)).toFixed(2));

    return {
      id: `custom-ghp-${Date.now()}`,
      timestamp: new Date().toISOString(),
      displayTime: 'Just Now',
      ticker: targetTicker,
      headline: headlineText,
      summary: bodyContent || `Quantitative sentiment analysis generated for: "${headlineText}"`,
      source: 'Quant Engine (Static Feed)',
      sentimentScore,
      sentimentCategory: sentimentCategory as any,
      importanceRating: Math.abs(sentimentScore) > 0.7 ? 8 : 6,
      topic: (lower.includes('tariff') || lower.includes('power') || lower.includes('policy') ? 'Geopolitical & Trade Tariffs' : 'Product Launch & Innovation') as NewsTopic,
      priceAtEvent: currentPrice,
      price1hPost,
      price1dPost: Number((price1hPost * 1.008).toFixed(2)),
      return5mPercent: Number((return1h * 0.35).toFixed(2)),
      return30mPercent: Number((return1h * 0.75).toFixed(2)),
      return1hPercent: Number(return1h.toFixed(2)),
      return1dPercent: Number((return1h * 1.30).toFixed(2)),
      marketReturn1hPercent: mktRet,
      expectedReturn1hPercent: Number(expectedReturn.toFixed(2)),
      abnormalReturn1hPercent: Number(abnormalReturn.toFixed(2)),
      cumulativeAbnormalReturn: Number((abnormalReturn * 1.35).toFixed(2)),
      preEventVolatility: 0.65,
      postEventVolatility: 1.80,
      volatilityJumpRatio: 2.77,
      isStatisticallySignificant: Math.abs(abnormalReturn) > 0.5,
      pValue: 0.0025,
    };
  };

  const handleRunAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!headline.trim()) {
      setErrorMsg('Please enter a valid news headline or announcement.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMsg('');

    const apiKey = getStoredGeminiApiKey();

    if (apiKey) {
      try {
        const geminiEvent = await analyzeHeadlineClientGemini(apiKey, headline, ticker, marketReturn, content);
        onAnalysisSuccess(geminiEvent);
        onClose();
        setHeadline('');
        setContent('');
        setIsAnalyzing(false);
        return;
      } catch (err: any) {
        console.warn('Direct Gemini API call failed, trying server endpoint or rule fallback:', err);
      }
    }

    try {
      const response = await fetch('/api/analyze-headline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          headline,
          content,
          ticker,
          marketReturnContextPercent: marketReturn,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.newEvent) {
          onAnalysisSuccess(data.newEvent);
          onClose();
          setHeadline('');
          setContent('');
          return;
        }
      }
      
      // Client-side static fallback
      const fallbackEvent = generateClientSideAnalysis(headline, ticker, marketReturn, content);
      onAnalysisSuccess(fallbackEvent);
      onClose();
      setHeadline('');
      setContent('');
    } catch (err: any) {
      console.warn('Backend API unavailable, executing client-side quant analysis:', err);
      const fallbackEvent = generateClientSideAnalysis(headline, ticker, marketReturn, content);
      onAnalysisSuccess(fallbackEvent);
      onClose();
      setHeadline('');
      setContent('');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const sampleHeadlines = [
    { ticker: 'NVDA' as TickerSymbol, text: 'US Commerce Dept Issues Export Tariff Exemption for Next-Gen High-Density AI Server Architecture' },
    { ticker: 'MSFT' as TickerSymbol, text: 'Federal Reserve Lowers Interest Rates by 50bps as Macro Capital Expenditures Surge Across Tech' },
    { ticker: 'AMZN' as TickerSymbol, text: 'EU Commission Passes Binding Workplace AI Ethics & Labor Rights Accord for Automated Logistics Hubs' },
    { ticker: 'NVDA' as TickerSymbol, text: 'Bipartisan US Clean Power Grid Legislation Fast-Tracks Nuclear Power Supply Permits for Hyperscaler AI Data Centers' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto font-mono">
      <div className="bg-[#0F0F12] border border-slate-800 rounded-lg max-w-xl w-full p-5 shadow-2xl relative my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white bg-[#0A0A0B] hover:bg-slate-800 rounded border border-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-2 mb-2 pr-8">
          <div className="p-1.5 bg-blue-600/20 text-blue-400 rounded border border-blue-500/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-200 uppercase tracking-widest">
                TEST CUSTOM HEADLINE (GEMINI QUANT AI)
              </h2>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Evaluate custom news headlines & simulate quantitative stock price reactions in real time.
            </p>
          </div>
        </div>

        {/* Gemini API Key Status Banner */}
        <div className="mb-3 px-2.5 py-1.5 rounded bg-[#0A0A0B] border border-slate-800 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Key className="w-3.5 h-3.5 text-cyan-400" />
            {hasApiKey ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Gemini API Key Active
              </span>
            ) : (
              <span className="text-slate-400">
                Gemini API Key: <span className="text-amber-400 font-semibold">Not Set</span> (Using Server/Rule Fallback)
              </span>
            )}
          </div>
          {onOpenKeyModal && (
            <button
              type="button"
              onClick={onOpenKeyModal}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 text-[10px] font-bold border border-slate-700 transition"
            >
              {hasApiKey ? 'Manage Key' : '+ Add Gemini Key'}
            </button>
          )}
        </div>

        {errorMsg && (
          <div className="mb-3 p-2 bg-rose-950/80 border border-rose-800 text-rose-300 rounded text-[10px] font-mono">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleRunAnalysis} className="space-y-3.5 font-mono mt-3">
          
          {/* Target Company */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Target Company Ticker:</label>
            <div className="grid grid-cols-3 gap-2">
              {(['NVDA', 'MSFT', 'AMZN'] as TickerSymbol[]).map((t) => {
                const meta = COMPANY_METADATA[t];
                return (
                  <button
                    type="button"
                    key={t}
                    onClick={() => setTicker(t)}
                    className={`py-1 px-2 text-xs font-bold rounded border transition flex items-center justify-center space-x-1.5 ${
                      ticker === t
                        ? 'bg-blue-600/10 border-blue-500/50 text-blue-400'
                        : 'bg-[#0A0A0B] text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <span>{t}</span>
                    <span className="text-[10px] opacity-70">${meta.currentPrice}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Headline Input */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">News Headline / Title:</label>
            <input
              type="text"
              required
              placeholder="e.g. NVIDIA announces major breakthroughs in optical interconnect chips..."
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full bg-[#0A0A0B] border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-sans"
            />
          </div>

          {/* Quick Preset Prompts */}
          <div>
            <span className="text-[9px] text-slate-500 uppercase tracking-widest block mb-1">Quick Sample Headlines:</span>
            <div className="space-y-1">
              {sampleHeadlines.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setTicker(sample.ticker);
                    setHeadline(sample.text);
                  }}
                  className="w-full text-left p-1.5 bg-[#0A0A0B] hover:bg-slate-900 border border-slate-800 rounded text-[10px] text-slate-400 hover:text-blue-400 transition truncate font-sans"
                >
                  <strong className="font-mono text-blue-400 mr-1.5">[{sample.ticker}]</strong>
                  {sample.text}
                </button>
              ))}
            </div>
          </div>

          {/* Market SPY Return Context */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400 font-semibold">Market Benchmark SPY Context:</span>
              <span className="text-purple-400 font-bold">{marketReturn > 0 ? '+' : ''}{marketReturn.toFixed(2)}%</span>
            </div>
            <input
              type="range"
              min="-2.0"
              max="2.0"
              step="0.1"
              value={marketReturn}
              onChange={(e) => setMarketReturn(parseFloat(e.target.value))}
              className="w-full accent-purple-500 bg-[#0A0A0B] h-1.5 rounded cursor-pointer"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-1">
            <button
              type="submit"
              disabled={isAnalyzing}
              className="w-full py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/50 rounded text-xs font-bold flex items-center justify-center space-x-2 transition disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <Activity className="w-3.5 h-3.5 animate-spin text-blue-400" />
                  <span>Running Gemini Quant Model...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Run AI Quant Reaction Analysis</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
