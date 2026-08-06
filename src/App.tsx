import React, { useState, useEffect } from 'react';
import { TickerSymbol, Timeframe, NewsEvent, PricePoint, QuantSummaryStats } from './types';
import { Header } from './components/Header';
import { KpiCards } from './components/KpiCards';
import { StockChartOverlay } from './components/StockChartOverlay';
import { NewsReactionTable } from './components/NewsReactionTable';
import { QuantAnalyticsPanel } from './components/QuantAnalyticsPanel';
import { AdvancedQuantPipeline } from './components/AdvancedQuantPipeline';
import { EventStudyModal } from './components/EventStudyModal';
import { CustomHeadlineModal } from './components/CustomHeadlineModal';
import { GeminiKeyModal } from './components/GeminiKeyModal';
import { INITIAL_NEWS_EVENTS, generatePriceSeries, COMPANY_METADATA } from './data/mockMarketData';
import { calculatePearsonCorrelation, runMultipleOLS, calculateMean } from './lib/quantEngine';

export default function App() {
  const [selectedTicker, setSelectedTicker] = useState<TickerSymbol | 'ALL'>('ALL');
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>('1h');
  
  const [priceSeries, setPriceSeries] = useState<PricePoint[]>([]);
  const [newsEvents, setNewsEvents] = useState<NewsEvent[]>([]);
  const [quantStats, setQuantStats] = useState<QuantSummaryStats | null>(null);
  
  const [activeNewsEvent, setActiveNewsEvent] = useState<NewsEvent | null>(null);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [isRefreshingLive, setIsRefreshingLive] = useState(false);

  // Fetch or initialize market data and news events
  useEffect(() => {
    fetchMarketData();
    fetchNewsEvents();
  }, [selectedTicker]);

  const fetchMarketData = async () => {
    try {
      const res = await fetch('/api/market-data');
      if (res.ok) {
        const data = await res.json();
        setPriceSeries(data.priceSeries || generatePriceSeries());
      } else {
        setPriceSeries(generatePriceSeries());
      }
    } catch (err) {
      console.warn('Backend API unavailable, using client-side quant dataset:', err);
      setPriceSeries(generatePriceSeries());
    }
  };

  const fetchNewsEvents = async () => {
    try {
      const res = await fetch(`/api/news?ticker=${selectedTicker}`);
      if (res.ok) {
        const data = await res.json();
        setNewsEvents(data);
        calculateQuantStats(data);
      } else {
        const filtered = selectedTicker === 'ALL'
          ? INITIAL_NEWS_EVENTS
          : INITIAL_NEWS_EVENTS.filter(n => n.ticker === selectedTicker);
        setNewsEvents(filtered);
        calculateQuantStats(filtered);
      }
    } catch (err) {
      const filtered = selectedTicker === 'ALL'
        ? INITIAL_NEWS_EVENTS
        : INITIAL_NEWS_EVENTS.filter(n => n.ticker === selectedTicker);
      setNewsEvents(filtered);
      calculateQuantStats(filtered);
    }
  };

  const calculateQuantStats = (events: NewsEvent[]) => {
    if (events.length === 0) return;

    const sentiments = events.map(e => e.sentimentScore);
    const abnormalReturns = events.map(e => e.abnormalReturn1hPercent);
    const correlation = calculatePearsonCorrelation(sentiments, abnormalReturns);

    const olsDataPoints = events.map(e => ({
      sentimentScore: e.sentimentScore,
      importanceRating: e.importanceRating,
      marketReturn: e.marketReturn1hPercent,
      abnormalReturn: e.abnormalReturn1hPercent,
    }));

    const olsStats = runMultipleOLS(olsDataPoints);

    const avgSentiment = calculateMean(sentiments);
    const avg1hReturn = calculateMean(events.map(e => e.return1hPercent));
    const avg1hAR = calculateMean(abnormalReturns);
    const sigCount = events.filter(e => e.isStatisticallySignificant).length;
    const avgVolJump = calculateMean(events.map(e => e.volatilityJumpRatio));

    setQuantStats({
      ticker: selectedTicker,
      totalNewsEvents: events.length,
      avgSentimentScore: Number(avgSentiment.toFixed(2)),
      avg1hReturnPercent: Number(avg1hReturn.toFixed(2)),
      avg1hAbnormalReturnPercent: Number(avg1hAR.toFixed(2)),
      correlationSentimentAbnormalReturn: Number(correlation.toFixed(3)),
      rSquared: olsStats.rSquared,
      significantEventsCount: sigCount,
      avgVolatilityJumpRatio: Number(avgVolJump.toFixed(2)),
      regressionStats: olsStats,
    });
  };

  const handleFetchLiveNews = async () => {
    setIsRefreshingLive(true);
    try {
      const res = await fetch('/api/fetch-live-news');
      if (res.ok) {
        await fetchNewsEvents();
      }
    } catch (err) {
      console.warn('Live refresh error:', err);
    } finally {
      setIsRefreshingLive(false);
    }
  };

  const handleCustomAnalysisSuccess = (newEvent: NewsEvent) => {
    const updated = [newEvent, ...newsEvents];
    setNewsEvents(updated);
    calculateQuantStats(updated);
    setActiveNewsEvent(newEvent);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-slate-100 font-sans selection:bg-blue-500 selection:text-white flex flex-col">
      
      {/* Header */}
      <Header
        selectedTicker={selectedTicker}
        onSelectTicker={setSelectedTicker}
        selectedTimeframe={selectedTimeframe}
        onSelectTimeframe={setSelectedTimeframe}
        onOpenCustomModal={() => setIsCustomModalOpen(true)}
        onOpenKeyModal={() => setIsKeyModalOpen(true)}
        onFetchLiveNews={handleFetchLiveNews}
        isRefreshingLive={isRefreshingLive}
      />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-6 py-4">
        
        {/* KPI Metric Cards */}
        {quantStats && <KpiCards stats={quantStats} />}

        {/* Interactive Stock Chart with Overlay News Event Dots */}
        <StockChartOverlay
          priceSeries={priceSeries}
          newsEvents={newsEvents}
          selectedTicker={selectedTicker}
          onSelectNewsEvent={setActiveNewsEvent}
          activeNewsEvent={activeNewsEvent}
        />

        {/* News & Quant Reaction Stream Table */}
        <NewsReactionTable
          newsEvents={newsEvents}
          onSelectNewsEvent={setActiveNewsEvent}
          selectedTicker={selectedTicker}
        />

        {/* Math & Analytics Panel (OLS Regression, CAR Trajectory, Scenario Simulator) */}
        {quantStats && (
          <QuantAnalyticsPanel
            stats={quantStats}
            newsEvents={newsEvents}
            selectedTicker={selectedTicker}
          />
        )}

        {/* Advanced Relationship Mapping & Quant Pipeline */}
        {quantStats && (
          <AdvancedQuantPipeline
            priceSeries={priceSeries}
            newsEvents={newsEvents}
            selectedTicker={selectedTicker}
            stats={quantStats}
          />
        )}

      </main>

      {/* Footer / Terminal Status Bar */}
      <footer className="border-t border-slate-800 bg-[#0F0F12] py-2.5 px-4 text-center font-mono text-[10px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>SYSTEM_STATUS: ONLINE • ENGINE: GEMINI 2.5 FLASH • OLS REGRESSION ACTIVE</span>
        </div>
        <div>
          <span>CAPM FORMULA: AR_t = R_i,t - (α + β·R_m,t) • HIGH DENSITY QUANT ENGINE</span>
        </div>
      </footer>

      {/* Event Study Inspector Modal */}
      <EventStudyModal
        news={activeNewsEvent}
        onClose={() => setActiveNewsEvent(null)}
      />

      {/* Custom Headline Testing AI Modal */}
      <CustomHeadlineModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onAnalysisSuccess={handleCustomAnalysisSuccess}
        onOpenKeyModal={() => setIsKeyModalOpen(true)}
      />

      {/* Gemini API Key Configuration Modal */}
      <GeminiKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
      />

    </div>
  );
}
