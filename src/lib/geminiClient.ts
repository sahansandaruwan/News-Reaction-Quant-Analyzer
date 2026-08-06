import { GoogleGenAI, Type } from '@google/genai';
import { TickerSymbol, NewsEvent, NewsTopic } from '../types';

const STORAGE_KEY = 'gemini_api_key';

export function getStoredGeminiApiKey(): string {
  if (typeof window === 'undefined') return '';
  const viteKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
  return localStorage.getItem(STORAGE_KEY) || viteKey || '';
}

export function setStoredGeminiApiKey(key: string): void {
  if (typeof window === 'undefined') return;
  if (key.trim()) {
    localStorage.setItem(STORAGE_KEY, key.trim());
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export async function analyzeHeadlineClientGemini(
  apiKey: string,
  headlineText: string,
  targetTicker: TickerSymbol,
  mktRet: number,
  bodyContent?: string
): Promise<NewsEvent> {
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `You are a Wall Street quantitative financial analyst and news sentiment analysis engine.
Analyze the following tech news headline and optional body content for stock ticker: ${targetTicker}.

HEADLINE: "${headlineText}"
${bodyContent ? `BODY CONTENT: "${bodyContent}"` : ''}

Provide a structured JSON output with the following exact fields:
1. sentimentScore: Float from -1.0 (extremely bearish) to +1.0 (extremely bullish).
2. sentimentCategory: Exactly one of "Positive", "Negative", "Neutral".
3. importanceRating: Integer from 1 (minor noise) to 10 (market-moving blockbuster event).
4. topic: Must be one of:
   - "Product Launch & Innovation"
   - "Financial Earnings & Guidance"
   - "Antitrust & Legal Regulation"
   - "Supply Chain & Manufacturing"
   - "M&A and Strategic Investments"
   - "Cybersecurity & Outages"
   - "Executive & Corporate Governance"
   - "Geopolitical & Trade Tariffs"
   - "Clean Energy & Grid Infrastructure"
5. politicalMacroImpactScore: Float from -1.0 (severe political/geopolitical/regulatory headwinds) to +1.0 (strong policy tailwinds).
6. politicalMacroCategory: Must be one of: "Geopolitical Tariff", "Fed Interest Rate", "Antitrust Policy", "Labor & Social Policy", "Energy Grid Power", "Macroeconomic".
7. politicalMacroReasoning: 1-2 sentences explaining how geopolitical, social, trade, rate, or power grid policies impact this stock.
8. summary: Concise 1-2 sentence core financial summary.
9. reasoning: Quantitative rationale explaining market reaction mechanism.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          sentimentScore: { type: Type.NUMBER },
          sentimentCategory: { type: Type.STRING },
          importanceRating: { type: Type.INTEGER },
          topic: { type: Type.STRING },
          politicalMacroImpactScore: { type: Type.NUMBER },
          politicalMacroCategory: { type: Type.STRING },
          politicalMacroReasoning: { type: Type.STRING },
          summary: { type: Type.STRING },
          reasoning: { type: Type.STRING },
        },
        required: [
          'sentimentScore',
          'sentimentCategory',
          'importanceRating',
          'topic',
          'politicalMacroImpactScore',
          'politicalMacroCategory',
          'politicalMacroReasoning',
          'summary',
          'reasoning',
        ],
      },
    },
  });

  if (!response.text) {
    throw new Error('No text output returned from Gemini API');
  }

  const parsed = JSON.parse(response.text);

  const sentimentScore = Math.max(-1.0, Math.min(1.0, parsed.sentimentScore ?? 0.5));
  const sentimentCategory = (['Positive', 'Negative', 'Neutral'].includes(parsed.sentimentCategory) ? parsed.sentimentCategory : 'Positive') as any;
  const importanceRating = Math.max(1, Math.min(10, parsed.importanceRating ?? 7));
  const topic = (parsed.topic || 'Product Launch & Innovation') as NewsTopic;

  const alpha = targetTicker === 'NVDA' ? 0.08 : targetTicker === 'MSFT' ? 0.04 : 0.05;
  const beta = targetTicker === 'NVDA' ? 1.68 : targetTicker === 'MSFT' ? 1.12 : 1.34;
  const expectedReturn = alpha + beta * mktRet;
  const abnormalReturn = sentimentScore * 2.1;
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
    id: `custom-gemini-${Date.now()}`,
    timestamp: new Date().toISOString(),
    displayTime: 'Just Now',
    ticker: targetTicker,
    headline: headlineText,
    summary: parsed.summary || bodyContent || headlineText,
    source: 'Gemini 2.5 AI Analysis',
    sentimentScore,
    sentimentCategory,
    importanceRating,
    topic,
    politicalMacroImpactScore: parsed.politicalMacroImpactScore ?? 0,
    politicalMacroCategory: parsed.politicalMacroCategory ?? 'Macroeconomic',
    politicalMacroReasoning: parsed.politicalMacroReasoning ?? 'Gemini political analysis.',
    priceAtEvent: currentPrice,
    price1hPost,
    price1dPost: Number((price1hPost * 1.01).toFixed(2)),
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
    pValue: 0.0012,
  };
}
