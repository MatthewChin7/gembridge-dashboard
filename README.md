# Gembridge Sovereign Intelligence Dashboard

An institutional-grade terminal for sovereign macro and credit intelligence. Provides real-time monitoring of emerging market fundamentals, yield curve dislocations, and global macro news.

---

## 🏗 System Architecture

### Frontend (React + Vite + TypeScript)
- **Framework**: React 18 with Vite for ultra-fast HMR and building.
- **Styling**: Vanilla CSS for maximum performance and rigorous "Terminal" aesthetic (pure black `#000`, amber `#ff9900`, cyan `#00ffff`).
- **Data Visualization**: [Recharts](https://recharts.org/) for high-precision time-series and scatter plots.
- **Routing**: Internal state-driven view switching (Overview, Credit, Comparative, etc.).
- **Proxies**: Uses `vite.config.ts` (local) and `vercel.json` (production) to proxy requests to:
  - **IMF Data Mapper API** (`/api/imf`) to bypass CORS.
  - **GemBridge Backend** (`/api/backend`) for quantitative analytics.

### Backend (Python + FastAPI)
- **API**: FastAPI providing high-performance asynchronous endpoints for credit analysis and prediction markets.
- **Service Layer**: 
  - `bbg_service.py`: Connectivity to **Bloomberg B-PIPE (BLPAPI)**. Automatically falls back to high-fidelity synthetic data if the terminal is offline.
  - `aggregator.py`: Periodic sync of World Bank and IMF WEO/IFS data into a local SQLite/DuckDB cache.
  - `quant_engine.py`: The "math house" for yield curve fitting and RV metrics.

---

## 📈 Tab Breakdown

### 1. Overview (Live)
Central command for macro monitoring.
- **Macro Snapshot**: Real-time GNI per capita, GDP, CPI, and Debt metrics.
- **Projection Engine**: Visualizes IMF forecasts up to 2030 (labeled with `(Proj.)` and rendered as dotted lines in charts).
- **Global Context**: Compares country data against "World Averages" across all metrics.

### 2. Credit (Beta)
An RV (Relative Value) scanner for sovereign global bonds.
- **NSS Yield Curve**: High-precision fitting of the **Nelson-Siegel-Svensson** model through cash bond points.
- **"The Fly" Scanner**: Automatically identifies the top 5 bonds with the highest **Residuals** (Spread-over-Curve).
- **Basis Monitor**: Allows switching from an NSS (Bond) benchmark to a **Par CDS** benchmark to distinguish between fundamental credit shifts and local technical dislocations.
- **Z-Score Analytics**: Normalizes price moves against 90-day history to surface statistical outliers.

### 3. Latest Intelligence
A high-frequency terminal wire for macro news.
- **Real-time Feed**: Leverages Google News RSS with `when:7d` and EM-specific keywords.
- **Filtering**: Asset-class level filters (EQTY, FX, RATES, CMDTY) using title heuristics.
- **Recency**: Strictly sorted by `pubDate` with precise timestamps for every headline.

---

## 🧪 Quantitative Methodology: The NSS Model

The dashboard's credit analytics are driven by the **Nelson-Siegel-Svensson (NSS)** extension.

### The Formula
$$y(t) = \beta_0 + \beta_1 \left( \frac{1 - e^{-t/\tau_1}}{t/\tau_1} \right) + \beta_2 \left( \frac{1 - e^{-t/\tau_1}}{t/\tau_1} - e^{-t/\tau_1} \right) + \beta_3 \left( \frac{1 - e^{-t/\tau_2}}{t/\tau_2} - e^{-t/\tau_2} \right)$$

### Parameters Explained
- **$\beta_0$ (Level)**: Long-term interest rate floor.
- **$\beta_1$ (Slope)**: The short-term spread (Inverted vs. Normal).
- **$\beta_2 / \beta_3$ (Curvature)**: Governs the medium-term "humps" and "twists."
- **$\tau_1 / \tau_2$ (Decay)**: Dictates the maturity at which the humps peak.

### Fair Value Logic
The "Fair Value" of any bond is the yield predicted by the NSS curve at its maturity.
- **Residual**: `Market Yield - NSS Yield`. 
  - **Positive Residual** = Bond is **Cheap** (Yielding more than the model).
  - **Negative Residual** = Bond is **Rich** (Yielding less than the model).

---

## 🚀 Setup & Deployment

### Local Development

1. **Frontend**:
   ```bash
   cd gembridge-dashboard
   npm install
   npm run dev
   ```
2. **Backend**:
   ```bash
   cd backend
   pip install fastapi uvicorn blpapi numpy scipy pandas
   python main.py
   ```

### Production (Vercel)
The project is optimized for Vercel. 
- Ensure `vercel.json` contains the rewrite rules for `/api/imf` and `/api/backend`.
- **Note**: For production B-PIPE usage, the Vercel deployment must have network access to a Bloomberg Server API (SAPI) instance.

---

## 🛠 Maintenance & Expansion
- **Adding Metrics**: Update `METRIC_GROUPS` in `CountryDetail.tsx`.
- **Improving Curves**: Adjust initial guesses for the `Levenberg-Marquardt` optimizer in `quant_engine.py`.
- **News**: Refine the `query` string in `NewsTerminal.tsx` to target specific regional desks.

---

## 🚀 Future Roadmap & Institutional Requirements

The following items are critical for transitioning from a high-fidelity prototype to a production-ready institutional terminal:

### 1. Intelligence & News (LLM Integration)
- **Problem**: Current news filtering in `NewsTerminal.tsx` uses basic keyword matching and title-length heuristics. This results in generic results.
- **Solution**: Implement an LLM-based "Intelligence Desk" (using Gemini or GPT-4o) to:
  - Extract entities and sentiment from headlines.
  - Grade news relevance to the selected country's fiscal or monetary outlook.
  - Automatically filter out "noise" that keyword matching misses.

### 2. Prediction Markets (Attribution Logic)
- **Problem**: Broad keyword tagging in `aggregator.py` causes geographic misallocation. For example, Russia-Ukraine conflict events often appear under "USA" because the headlines mention "Biden" or "White House."
- **Solution**: Refine the tagging engine to prioritize "Primary Effect" entities and use more granular logic to prevent US-centric bias in global event attribution.

### 3. Macro Data Expansion (IMF Surplus)
- **Problem**: The current `IMFService` handles GDP, CPI, Debt, and Current Account, but lacks "General Gov Net Lending/Borrowing" (Financial Surplus/Deficit).
- **Solution**: Expand `imf_live.ts` to fetch and visualize `GGLN_NGDP` metrics to give traders a better view of fiscal headroom.

### 4. Direct Bloomberg Connectivity
- **Problem**: `bbg_service.py` currently operates primarily in **MOCK mode**. While high-fidelity, it produces artificial curves.
- **Solution**: Implement the skeletal `fetch_bond_data` logic with real `blpapi` RefData requests for ISINs. This requires a sidecar Bloomberg connectivity service or SAPI credentials.

### 5. Advanced Credit Math
- **Problem**: The **CDS Proxy** current uses linear interpolation and a simplified `Risk-Free + Spread` model.
- **Solution**:
  - **NSS Refinement**: Move beyond `L-BFGS-B` to a more robust global optimizer for NSS parameters to handle disparate "humps" in distressed curves.
  - **CDS Bootstrapping**: Implement a full bootstrap of the Par CDS curve to derive Zero-Coupon spreads for more accurate RV analysis.

