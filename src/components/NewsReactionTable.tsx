import React, { useState } from 'react';
import { NewsEvent, NewsTopic, SentimentCategory, TickerSymbol } from '../types';
import { Search, Filter, ArrowUpRight, ArrowDownRight, CheckCircle2, AlertCircle, ChevronRight, BarChart3, Radio, Database, Activity, Server, Zap } from 'lucide-react';
import { COMPANY_METADATA, REALTIME_NEWS_SOURCES } from '../data/mockMarketData';

interface NewsReactionTableProps {
  newsEvents: NewsEvent[];
  onSelectNewsEvent: (event: NewsEvent) => void;
  selectedTicker: TickerSymbol | 'ALL';
}

export const NewsReactionTable: React.FC<NewsReactionTableProps> = ({
  newsEvents,
  onSelectNewsEvent,
  selectedTicker,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string>('ALL');
  const [selectedSentiment, setSelectedSentiment] = useState<string>('ALL');
  const [selectedSource, setSelectedSource] = useState<string>('ALL');
  const [showSourceRegistry, setShowSourceRegistry] = useState(false);

  const topics: NewsTopic[] = [
    'AI Hardware & Chips',
    'Cloud Growth & Infrastructure',
    'Financial Results & Guidance',
    'Regulatory & Anti-Trust',
    'M&A & Strategic Partnerships',
    'Product Launch & Innovation',
    'Political & Regulatory',
    'Geopolitical & Trade Tariffs',
    'Social & Labor Tech Policy',
    'Macro & Fed Interest Rates',
    'Energy Grid & Power Infra',
  ];

  const uniqueSourcesInEvents = Array.from(new Set(newsEvents.map((e) => e.source))).sort();

  const filteredEvents = newsEvents.filter((news) => {
    if (selectedTicker !== 'ALL' && news.ticker !== selectedTicker) return false;
    if (selectedTopic !== 'ALL' && news.topic !== selectedTopic) return false;
    if (selectedSentiment !== 'ALL' && news.sentimentCategory !== selectedSentiment) return false;
    if (selectedSource !== 'ALL') {
      const sel = selectedSource.toLowerCase();
      const src = news.source.toLowerCase();
      const isMatch = src === sel || src.includes(sel) || sel.includes(src);
      if (!isMatch) return false;
    }
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        news.headline.toLowerCase().includes(q) ||
        news.summary.toLowerCase().includes(q) ||
        news.source.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="bg-[#0F0F12] border border-slate-800 rounded-lg shadow-lg overflow-hidden mb-5 font-mono">
      
      {/* Realtime 20+ Data Sources Ticker Banner */}
      <div className="bg-[#09090B] border-b border-slate-800/80 px-4 py-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-bold text-slate-200 uppercase tracking-wide text-[11px] flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            22 REAL-TIME NEWS & MACRO FEEDS ACTIVE
          </span>
          <span className="text-[10px] text-slate-500 hidden md:inline">| Latency: &lt;25ms avg | FIX Protocol &amp; Direct SEC RSS Streams</span>
        </div>

        <button
          onClick={() => setShowSourceRegistry(!showSourceRegistry)}
          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-blue-400 rounded text-[10px] font-bold transition flex items-center gap-1.5 self-end sm:self-auto"
        >
          <Database className="w-3 h-3 text-blue-400" />
          <span>{showSourceRegistry ? 'Hide Data Feeds' : 'View All 22 Data Sources & Pings'}</span>
        </button>
      </div>

      {/* Expandable 22 Realtime Data Sources Drawer */}
      {showSourceRegistry && (
        <div className="bg-[#0A0A0C] border-b border-slate-800 p-4 space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800/60">
            <div>
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-400" />
                <span>INSTITUTIONAL NEWS DATA SOURCE REGISTRY (22 CONNECTED FEEDS)</span>
              </h3>
              <p className="text-[10px] text-slate-500">
                Direct WebSocket, FIX Protocol, and Direct SEC RSS ingestion streams driving real-time sentiment quant analysis.
              </p>
            </div>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/60">
              ALL FEEDS ONLINE (99.2% RE)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 max-h-60 overflow-y-auto pr-1">
            {REALTIME_NEWS_SOURCES.map((src) => (
              <div
                key={src.id}
                onClick={() => {
                  setSelectedSource(src.name);
                  setShowSourceRegistry(false);
                }}
                className={`p-2 rounded border transition cursor-pointer flex flex-col justify-between ${
                  selectedSource === src.name
                    ? 'bg-blue-950/40 border-blue-500 text-blue-200'
                    : 'bg-[#121216] border-slate-800/80 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex justify-between items-start gap-1 mb-1">
                  <span className="text-[11px] font-bold text-slate-100 truncate">{src.name}</span>
                  <span className="text-[8px] font-bold text-emerald-400 bg-emerald-950/60 px-1 py-0.2 rounded border border-emerald-800/50 shrink-0">
                    {src.latencyMs}ms
                  </span>
                </div>
                <div className="text-[9px] text-slate-400 flex items-center justify-between">
                  <span>{src.category}</span>
                  <span className="text-purple-300 font-mono">{src.apiFeedType}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Table Header & Search Filters */}
      <div className="px-4 py-2.5 border-b border-slate-800 bg-[#111114] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 font-mono">
        <div>
          <h2 className="text-xs font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-400" />
            <span>RECENT NEWS & ABNORMAL RETURNS</span>
          </h2>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Real-time sentiment scores, abnormal returns ($AR_t$), and volatility shocks.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Search Bar */}
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="Search headline..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0A0A0B] border border-slate-800 rounded pl-7 pr-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          {/* Source Dropdown */}
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="bg-[#0A0A0B] border border-slate-800 rounded px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-blue-500 font-mono max-w-[140px] truncate"
          >
            <option value="ALL">All 22 Data Sources</option>
            {REALTIME_NEWS_SOURCES.map((s) => (
              <option key={s.id} value={s.name}>{s.name}</option>
            ))}
          </select>

          {/* Topic Dropdown */}
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="bg-[#0A0A0B] border border-slate-800 rounded px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-blue-500 font-mono max-w-[130px] truncate"
          >
            <option value="ALL">All Topics</option>
            {topics.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          {/* Sentiment Dropdown */}
          <select
            value={selectedSentiment}
            onChange={(e) => setSelectedSentiment(e.target.value)}
            className="bg-[#0A0A0B] border border-slate-800 rounded px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-blue-500 font-mono"
          >
            <option value="ALL">All Sentiment</option>
            <option value="Positive">POS (+)</option>
            <option value="Neutral">NEU (0)</option>
            <option value="Negative">NEG (-)</option>
          </select>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse font-mono">
          <thead>
            <tr className="text-[9px] text-slate-500 uppercase font-mono border-b border-slate-800 bg-[#0F0F12]">
              <th className="px-4 py-2 font-medium">Timestamp & Ticker</th>
              <th className="px-4 py-2 font-medium">Headline / Sentiment / Source</th>
              <th className="px-4 py-2 font-medium text-center">Score / Imp.</th>
              <th className="px-4 py-2 font-medium text-right">Actual 1h</th>
              <th className="px-4 py-2 font-medium text-right italic">AR (1h Window)</th>
              <th className="px-4 py-2 font-medium text-center">Vol Jump</th>
              <th className="px-4 py-2 font-medium text-right">Stat. Sig.</th>
              <th className="px-4 py-2 font-medium text-center">Action</th>
            </tr>
          </thead>
          <tbody className="text-[11px] font-mono divide-y divide-slate-800/50">
            {filteredEvents.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500 italic">
                  No news events matching current filter criteria.
                </td>
              </tr>
            ) : (
              filteredEvents.map((news) => {
                const isPositiveAR = news.abnormalReturn1hPercent >= 0;
                const isPos = news.sentimentCategory === 'Positive';
                const isNeg = news.sentimentCategory === 'Negative';

                return (
                  <tr
                    key={news.id}
                    className="hover:bg-slate-800/30 transition cursor-pointer group"
                    onClick={() => onSelectNewsEvent(news)}
                  >
                    {/* Timestamp & Ticker */}
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-blue-900/30 text-blue-400 border border-blue-500/30 text-[10px] font-bold">
                          {news.ticker}
                        </span>
                        <span className="text-slate-500 text-[10px]">{news.displayTime}</span>
                      </div>
                    </td>

                    {/* Headline, Topic & Political/Social Source */}
                    <td className="px-4 py-2.5 max-w-sm">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase shrink-0 ${
                            isPos
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : isNeg
                              ? 'bg-rose-500/10 text-rose-400'
                              : 'bg-slate-500/10 text-slate-400'
                          }`}
                        >
                          {isPos ? 'POS' : isNeg ? 'NEG' : 'NEU'}
                        </span>
                        <div className="truncate">
                          <span className="text-slate-200 group-hover:text-blue-400 transition font-sans text-xs block truncate">
                            {news.headline}
                          </span>
                          <div className="flex items-center gap-2 mt-0.5 text-[9px] text-slate-400">
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedSource(news.source);
                              }}
                              className="text-purple-300 font-mono font-bold hover:underline cursor-pointer"
                              title="Click to filter by source"
                            >
                              {news.source}
                            </span>
                            <span>•</span>
                            <span className="text-slate-500">{news.topic}</span>
                            {news.politicalMacroImpactScore !== undefined && (
                              <span className={`px-1 py-0.2 rounded font-bold ${
                                news.politicalMacroImpactScore >= 0
                                  ? 'bg-purple-950/60 text-purple-300 border border-purple-800/60'
                                  : 'bg-rose-950/60 text-rose-300 border border-rose-800/60'
                              }`}>
                                Political Factor: {news.politicalMacroImpactScore > 0 ? '+' : ''}{news.politicalMacroImpactScore}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Score / Imp */}
                    <td className="px-4 py-2.5 text-center whitespace-nowrap">
                      <span className={news.sentimentScore > 0 ? 'text-emerald-400 font-bold' : news.sentimentScore < 0 ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                        {news.sentimentScore > 0 ? '+' : ''}{news.sentimentScore}
                      </span>
                      <span className="text-slate-500 text-[9px] ml-1">({news.importanceRating}/10)</span>
                    </td>

                    {/* Actual 1h */}
                    <td className="px-4 py-2.5 text-right whitespace-nowrap font-bold">
                      <span className={news.return1hPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {news.return1hPercent >= 0 ? '+' : ''}{news.return1hPercent}%
                      </span>
                    </td>

                    {/* Abnormal Return (AR) */}
                    <td className="px-4 py-2.5 text-right whitespace-nowrap font-bold">
                      <span className={isPositiveAR ? 'text-emerald-400' : 'text-rose-400'}>
                        {isPositiveAR ? '+' : ''}{news.abnormalReturn1hPercent}%
                      </span>
                    </td>

                    {/* Volatility Jump */}
                    <td className="px-4 py-2.5 text-center whitespace-nowrap text-orange-400 font-bold">
                      {news.volatilityJumpRatio}x
                    </td>

                    {/* Stat Sig */}
                    <td className="px-4 py-2.5 text-right whitespace-nowrap text-slate-400">
                      {news.isStatisticallySignificant ? (
                        <span className="text-emerald-400 font-bold">p &lt; 0.05</span>
                      ) : (
                        <span className="text-slate-500">p = {news.pValue}</span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="px-4 py-2.5 text-center whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectNewsEvent(news);
                        }}
                        className="px-2 py-0.5 bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-300 rounded text-[10px] font-bold transition flex items-center justify-center gap-1 mx-auto"
                      >
                        <span>Inspect</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};
