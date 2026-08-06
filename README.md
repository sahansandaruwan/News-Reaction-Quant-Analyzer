# News Reaction Quant Analyzer

A high-performance quantitative finance platform for analyzing market sentiment, market reactions, and event studies around corporate news and economic announcements.

## Features

- **Event Study Engine**: Measures Cumulative Abnormal Returns (CAR) and Abnormal Returns (AR) across configurable event windows (e.g. [-5, +10] days).
- **Quantitative Analytics Pipeline**:
  - Ordinary Least Squares (OLS) Regression vs. Benchmark
  - Pearson Correlation Matrix
  - Rolling Volatility & Market Beta Calculation
  - Z-Score Sentiment & Impact Normalization
- **AI-Powered Headline Reaction Analysis**: Custom news sentiment evaluation powered by the Google Gemini API.
- **Interactive Multi-Asset Visualizations**: Dynamic price, volume, and sentiment trajectory charting.
- **GitHub Actions Ready**: Pre-configured CI/CD workflow for automated building and deployment.

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide React
- **Backend & Tooling**: Express.js, Vite, Node.js
- **AI Integration**: Google Gemini SDK (`@google/genai`)

## Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/sahansandaruwan/News-Reaction-Quant-Analyzer.git
   cd News-Reaction-Quant-Analyzer
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment**:
   Copy `.env.example` to `.env` and add your Gemini API Key if testing custom headlines server-side:
   ```bash
   cp .env.example .env
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```

5. **Build for Production**:
   ```bash
   npm run build
   ```

## Deployment

The project includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) ready for GitHub Pages or static deployment. Ensure `package-lock.json` is committed for automated CI/CD builds.

## License

MIT
