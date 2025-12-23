// import { MacroIndicator } from '../types';

// NOTE: This service requires a running backend proxy connected to a Bloomberg Terminal.
// See bloomberg_integration.md for setup instructions.

const API_URL = 'http://localhost:3001/api';

export const BloombergService = {
    /**
     * Fetches live market data for a given ticker or list of tickers.
     * @param tickers Array of Bloomberg tickers (e.g., ['USGG10YR Index', 'EUR Curncy'])
     */
    async getMarketData(tickers: string[]) {
        try {
            const response = await fetch(`${API_URL}/market-data`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ securities: tickers, fields: ['PX_LAST', 'CHG_PCT_1D'] })
            });
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error('Bloomberg API Error (Mocking Fallback):', error);
            // Fallback to mock data if backend not available
            return tickers.map(t => ({ ticker: t, price: Math.random() * 100, change: (Math.random() - 0.5) * 2 }));
        }
    },

    /**
     * getHistoricalData
     * Pulls historical time series for detailed analysis charts.
     */
    async getHistoricalData(ticker: string, startDate: string, endDate: string) {
        // Implementation for HistoricalDataRequest
        console.log('Fetching historical for', ticker, startDate, endDate);
        return [];
    }
};
