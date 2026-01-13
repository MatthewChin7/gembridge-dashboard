
interface FXRate {
    date: string;
    rate: number;
}

interface MarketData {
    base: string;
    rates: Record<string, number>;
    date: string;
}

export const MarketService = {
    async getLatestRates(base: string = 'USD', symbols: string[] = []): Promise<MarketData | null> {
        const symbolsParam = symbols.length > 0 ? `&to=${symbols.join(',')}` : '';
        const url = `https://api.frankfurter.app/latest?from=${base}${symbolsParam}`;

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch market data');
            return await response.json();
        } catch (error) {
            console.error('Market Service Error:', error);
            return null;
        }
    },

    async getHistoricalRates(from: string, to: string, startDate: string): Promise<FXRate[]> {
        const url = `https://api.frankfurter.app/${startDate}..?from=${from}&to=${to}`;

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch history');

            const json = await response.json();
            if (!json.rates) return [];

            // Transform { "2024-01-01": { "TRY": 30.1 } } -> [ { date: "2024-01-01", rate: 30.1 } ]
            return Object.entries(json.rates).map(([date, rates]: [string, any]) => ({
                date,
                rate: rates[to] as number
            }));
        } catch (error) {
            console.error('Market History Error:', error);
            return [];
        }
    },

    async getPredictionMarkets(countryCode: string): Promise<any[]> {
        const url = `/api/backend/markets/${countryCode}`;

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch prediction markets');
            return await response.json();
        } catch (error) {
            console.error('Prediction Market Error:', error);
            return [];
        }
    }
};
