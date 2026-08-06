import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceDot,
} from 'recharts';
import { NewsEvent, PricePoint, TickerSymbol, ChartCurvePointInspection } from '../types';
import { COMPANY_METADATA, BENCHMARK_INFO } from '../data/mockMarketData';
import { Layers, Info, Zap, Crosshair, ArrowUpRight, ArrowDownRight, Compass } from 'lucide-react';

interface StockChartOverlayProps {
  priceSeries: PricePoint[];
  newsEvents: NewsEvent[];
  selectedTicker: TickerSymbol | 'ALL';
  onSelectNewsEvent: (event: NewsEvent) => void;
  activeNewsEvent: NewsEvent | null;
}

export const StockChartOverlay: React.FC<StockChartOverlayProps> = ({
  priceSeries,
  newsEvents,
  selectedTicker,
  onSelectNewsEvent,
  activeNewsEvent,
}) => {
  const [showBenchmark, setShowBenchmark] = useState(true);
  const [inspectedCurvePoint, setInspectedCurvePoint] = useState<ChartCurvePointInspection | null>(null);

  const activeTicker: TickerSymbol = selectedTicker === 'ALL' ? 'NVDA' : selectedTicker;
  const companyMeta = COMPANY_METADATA[activeTicker];

  // Map news events to price series dates for reference dots
  const mappedNewsEvents = newsEvents
    .filter(n => selectedTicker === 'ALL' || n.ticker === selectedTicker)
    .map(news => {
      const newsDateStr = news.timestamp.split('T')[0];
      const matchPoint = priceSeries.find(p => p.timestamp === newsDateStr) || priceSeries[Math.floor(priceSeries.length / 2)];
      const priceVal = (matchPoint ? (matchPoint[news.ticker] as number) : companyMeta.currentPrice) || companyMeta.currentPrice;

      return {
        ...news,
        chartTimestamp: matchPoint ? matchPoint.timestamp : newsDateStr,
        chartTimeLabel: matchPoint ? matchPoint.timeLabel : 'News',
        chartPrice: priceVal,
      };
    });

  // Handle clicking anywhere on the chart curve
  const handleChartClick = (e: any) => {
    if (!e || !e.activePayload || e.activePayload.length === 0) return;

    const activePoint = e.activePayload[0].payload as PricePoint;
    const activeIndex = priceSeries.findIndex(p => p.timeLabel === activePoint.timeLabel);
    const prevPoint = activeIndex > 0 ? priceSeries[activeIndex - 1] : priceSeries[0];

    const currentPrice = Number(activePoint[activeTicker] || companyMeta.currentPrice);
    const prevPrice = Number(prevPoint[activeTicker] || currentPrice);
    const priceReturn = prevPrice > 0 ? ((currentPrice - prevPrice) / prevPrice) * 100 : 0;

    const currentSpy = Number(activePoint.SPY || BENCHMARK_INFO.currentPrice);
    const prevSpy = Number(prevPoint.SPY || currentSpy);
    const spyReturn = prevSpy > 0 ? ((currentSpy - prevSpy) / prevSpy) * 100 : 0;

    const expectedReturn = companyMeta.alpha + companyMeta.beta * spyReturn;
    const abnormalReturn = priceReturn - expectedReturn;

    // Find nearest or preceding news event for this ticker
    const matchingNews = newsEvents.find(n => n.ticker === activeTicker) || newsEvents[0];

    const pointInfo: ChartCurvePointInspection = {
      timeLabel: activePoint.timeLabel,
      timestamp: activePoint.timestamp,
      ticker: activeTicker,
      price: currentPrice,
      prevPrice,
      priceReturnPercent: Number(priceReturn.toFixed(2)),
      spyPrice: currentSpy,
      spyReturnPercent: Number(spyReturn.toFixed(2)),
      expectedReturnPercent: Number(expectedReturn.toFixed(2)),
      abnormalReturnPercent: Number(abnormalReturn.toFixed(2)),
      associatedNewsEvent: matchingNews,
      volatilityShock: Number((1.2 + Math.abs(abnormalReturn) * 0.8).toFixed(2)),
    };

    setInspectedCurvePoint(pointInfo);
    if (matchingNews) {
      onSelectNewsEvent(matchingNews);
    }
  };

  return (
    <div className="bg-[#0F0F12] border border-slate-800 rounded-lg p-4 sm:p-5 mb-5 shadow-lg font-mono">
      
      {/* Chart Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800/80">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-mono flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
              <span>{companyMeta.symbol} — {companyMeta.name} Returns vs News Event Overlay</span>
            </h2>
            <span className="text-[10px] px-2 py-0.5 bg-slate-900 border border-slate-800 text-slate-300 rounded font-mono">
              ${companyMeta.currentPrice}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 font-mono italic mt-1 flex items-center gap-1.5">
            <Crosshair className="w-3 h-3 text-amber-400 inline" />
            <span>Click anywhere on the curve to inspect news relationship at that exact timestamp</span>
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-3 text-xs font-mono">
          <div className="flex items-center gap-3 mr-2 text-[10px] uppercase text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> Stock Price
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> News Marker
            </span>
          </div>

          <button
            onClick={() => setShowBenchmark(!showBenchmark)}
            className={`px-2.5 py-1 text-[11px] rounded font-mono font-bold border flex items-center space-x-1.5 transition ${
              showBenchmark
                ? 'bg-blue-900/20 text-blue-400 border-blue-500/40'
                : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>SPY Benchmark</span>
          </button>
        </div>
      </div>

      {/* Main Chart Container */}
      <div className="h-[310px] w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={priceSeries}
            margin={{ top: 15, right: 20, left: -10, bottom: 5 }}
            onClick={handleChartClick}
            className="cursor-crosshair"
          >
            <CartesianGrid strokeDasharray="4 4" stroke="#1E293B" vertical={false} />
            <XAxis
              dataKey="timeLabel"
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: '#1E293B' }}
            />
            
            {/* Y-Axis Primary Stock */}
            <YAxis
              yAxisId="left"
              domain={['auto', 'auto']}
              stroke="#94a3b8"
              fontSize={10}
              tickFormatter={(v) => `$${v}`}
              tickLine={false}
              axisLine={{ stroke: '#1E293B' }}
            />

            {/* Y-Axis Benchmark SPY */}
            {showBenchmark && (
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={['auto', 'auto']}
                stroke="#8884d8"
                fontSize={10}
                tickFormatter={(v) => `$${v}`}
                tickLine={false}
                axisLine={false}
              />
            )}

            <Tooltip
              contentStyle={{
                backgroundColor: '#0F0F12',
                borderColor: '#334155',
                borderRadius: '0.5rem',
                color: '#f8fafc',
                fontSize: '11px',
                fontFamily: 'monospace',
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.8)',
              }}
              formatter={(value: any, name: any) => [
                `$${value}`,
                name === activeTicker ? `${activeTicker} Price` : 'SPY Index',
              ]}
            />

            {/* Primary Company Price Line */}
            <Line
              yAxisId="left"
              type="monotone"
              dataKey={activeTicker}
              stroke="#3B82F6"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6, strokeWidth: 2, stroke: '#38bdf8', fill: '#0F0F12' }}
            />

            {/* Benchmark SPY Line */}
            {showBenchmark && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="SPY"
                stroke={BENCHMARK_INFO.color}
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false}
              />
            )}

            {/* Interactive News Event Overlay Markers */}
            {mappedNewsEvents.map((news) => {
              const isPositive = news.sentimentCategory === 'Positive';
              const isNegative = news.sentimentCategory === 'Negative';
              const dotColor = isPositive ? '#F59E0B' : isNegative ? '#f43f5e' : '#94a3b8';
              const isSelected = activeNewsEvent?.id === news.id;

              return (
                <ReferenceDot
                  key={news.id}
                  yAxisId="left"
                  x={news.chartTimeLabel}
                  y={news.chartPrice}
                  r={isSelected ? 8 : 5}
                  fill={dotColor}
                  stroke={isSelected ? '#ffffff' : '#0F0F12'}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                  className="cursor-pointer transition-all hover:scale-125"
                  onClick={(e) => {
                    e?.stopPropagation();
                    onSelectNewsEvent(news);
                  }}
                />
              );
            })}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* CURVE POSITION NEWS INSPECTION POPUP / CARD */}
      {inspectedCurvePoint && (
        <div className="mt-4 p-3.5 bg-[#0A0A0B] border border-blue-500/40 rounded-lg flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 font-mono shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>

          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-[9px] px-2 py-0.5 bg-blue-900/40 border border-blue-500/50 text-blue-400 font-bold rounded flex items-center gap-1">
                <Compass className="w-3 h-3" /> CURVE POSITION INSPECTED
              </span>
              <span className="text-xs font-bold text-slate-200">{inspectedCurvePoint.timeLabel}</span>
              <span className="text-xs text-slate-400">({inspectedCurvePoint.timestamp})</span>
            </div>

            <div className="flex items-center space-x-3 text-xs pt-1">
              <span>
                Price: <strong className="text-blue-400">${inspectedCurvePoint.price}</strong>
              </span>
              <span className={`font-bold flex items-center ${inspectedCurvePoint.priceReturnPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {inspectedCurvePoint.priceReturnPercent >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                {inspectedCurvePoint.priceReturnPercent >= 0 ? '+' : ''}{inspectedCurvePoint.priceReturnPercent}%
              </span>
              <span className="text-slate-500">|</span>
              <span>
                Expected (CAPM): <strong className="text-slate-300">+{inspectedCurvePoint.expectedReturnPercent}%</strong>
              </span>
              <span className="text-slate-500">|</span>
              <span>
                Abnormal Return (AR): <strong className={inspectedCurvePoint.abnormalReturnPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                  {inspectedCurvePoint.abnormalReturnPercent >= 0 ? '+' : ''}{inspectedCurvePoint.abnormalReturnPercent}%
                </strong>
              </span>
            </div>

            {inspectedCurvePoint.associatedNewsEvent && (
              <div className="pt-1.5 flex items-start gap-2">
                <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-300 font-sans line-clamp-1">
                  <strong className="font-mono text-amber-400 mr-1.5">DRIVING NEWS:</strong>
                  {inspectedCurvePoint.associatedNewsEvent.headline}
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3 self-end lg:self-center shrink-0">
            {inspectedCurvePoint.associatedNewsEvent && (
              <button
                onClick={() => onSelectNewsEvent(inspectedCurvePoint.associatedNewsEvent!)}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold flex items-center space-x-1.5 transition shadow-md"
              >
                <Info className="w-3.5 h-3.5" />
                <span>OPEN FULL EVENT STUDY</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Selected News Banner Quick Inspection */}
      {!inspectedCurvePoint && activeNewsEvent && (
        <div className="mt-4 p-3 bg-[#0A0A0B] border border-slate-800 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3 font-mono">
          <div className="flex items-start space-x-3">
            <div className="p-1.5 bg-blue-900/30 text-blue-400 border border-blue-500/30 rounded mt-0.5">
              <Zap className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-blue-400">{activeNewsEvent.ticker}</span>
                <span className="text-[10px] text-slate-500">{activeNewsEvent.displayTime}</span>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    activeNewsEvent.sentimentCategory === 'Positive'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : activeNewsEvent.sentimentCategory === 'Negative'
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  Sentiment: {activeNewsEvent.sentimentScore > 0 ? '+' : ''}{activeNewsEvent.sentimentScore}
                </span>
              </div>
              <h4 className="text-xs font-semibold text-slate-200 mt-0.5 line-clamp-1 font-sans">
                {activeNewsEvent.headline}
              </h4>
            </div>
          </div>

          <div className="flex items-center space-x-4 self-end md:self-auto">
            <div className="text-right">
              <span className="text-[9px] text-slate-500 uppercase tracking-widest block font-bold">1h Abnormal Return</span>
              <span
                className={`text-xs font-bold ${
                  activeNewsEvent.abnormalReturn1hPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {activeNewsEvent.abnormalReturn1hPercent >= 0 ? '+' : ''}
                {activeNewsEvent.abnormalReturn1hPercent}%
              </span>
            </div>

            <button
              onClick={() => onSelectNewsEvent(activeNewsEvent)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold flex items-center space-x-1 transition shadow"
            >
              <Info className="w-3.5 h-3.5" />
              <span>INSPECT</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

