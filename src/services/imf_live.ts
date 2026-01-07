import { MacroIndicator } from '../types';

// IMF Data Mapper API (Unofficial but public)
// Base: https://www.imf.org/external/datamapper/api/v1/
// Indicators:
// NGDP_RPCH = Real GDP Growth
// PCPIPCH = Inflation (Average Consumer Prices)
// LUR = Unemployment
// GGXWDG_NGDP = General Gov Gross Debt % GDP
// BCA_NGDPD = Current Account % GDP

const IMF_INDICATORS = {
    GDP_GROWTH: 'NGDP_RPCH',
    INFLATION: 'PCPIPCH',
    GOV_DEBT: 'GGXWDG_NGDP',
    CURRENT_ACCOUNT: 'BCA_NGDPD'
};

export const IMFService = {
    async getForecasts(countryId: string): Promise<MacroIndicator[]> {
        const year = new Date().getFullYear();
        // Fetch from previous year up to 2030 to cover full forecast horizon
        const endYear = 2030;
        const nextYears: number[] = [];
        for (let y = year - 1; y <= endYear; y++) {
            nextYears.push(y);
        }

        try {
            const indicators = Object.values(IMF_INDICATORS).join('/');
            // Use local proxy to avoid CORS
            const url = `/api/imf/${indicators}/${countryId}`;

            const response = await fetch(url);
            if (!response.ok) return [];

            const json = await response.json();
            const values = json.values;

            if (!values) return [];

            const getVal = (code: string, y: number) => values[code]?.[countryId]?.[y];

            return nextYears.map(y => ({
                countryId,
                date: new Date(`${y}-12-31`).toISOString(),
                gdpGrowth: parseFloat(getVal(IMF_INDICATORS.GDP_GROWTH, y) || 0),
                cpiYoY: parseFloat(getVal(IMF_INDICATORS.INFLATION, y) || 0),
                govDebtToGdp: parseFloat(getVal(IMF_INDICATORS.GOV_DEBT, y) || 0),
                currentAccountToGdp: parseFloat(getVal(IMF_INDICATORS.CURRENT_ACCOUNT, y) || 0),
                isMock: false,
                source: 'IMF WEO Forecast'
            })).filter(d => d.gdpGrowth || d.cpiYoY); // Only return if valid data found

        } catch (e) {
            console.warn('IMF Forecast fetch failed', e);
            return [];
        }
    },

    async getLatestForecasts(countryId: string): Promise<Partial<MacroIndicator>> {
        // IMF uses 3-letter codes as well, usually matching ISO.
        // Some might differ (e.g. KV for Kosovo), but major ones match.

        try {
            const year = new Date().getFullYear();
            // const nextYear = year + 1;

            // We need to fetch multiple indicators. 
            // The API allows multiple indicators in one call? or we do parallel.
            // https://www.imf.org/external/datamapper/api/v1/{indicator}/{country}/{year}
            // format: values -> { "NGDP_RPCH": { "BRA": { "2024": 2.1, "2025": 2.4 } } }

            const indicators = Object.values(IMF_INDICATORS).join('/');
            // Use local proxy to avoid CORS
            const url = `/api/imf/${indicators}/${countryId}`;

            const response = await fetch(url);
            if (!response.ok) return {};

            const json = await response.json();
            const values = json.values; // { INDICATOR: { COUNTRY: { YEAR: VALUE } } }

            if (!values) return {};

            const getValue = (code: string, targetYear: number) => {
                const countryData = values[code]?.[countryId];
                if (!countryData) return undefined;
                // Try target year, fallback to previous if not found (lag), or next if forecast
                return parseFloat(countryData[targetYear] || countryData[targetYear - 1]);
            };

            return {
                gdpGrowth: getValue(IMF_INDICATORS.GDP_GROWTH, year),
                cpiYoY: getValue(IMF_INDICATORS.INFLATION, year),
                govDebtToGdp: getValue(IMF_INDICATORS.GOV_DEBT, year),
                currentAccountToGdp: getValue(IMF_INDICATORS.CURRENT_ACCOUNT, year),
                source: 'IMF WEO Forecasts',
                isMock: false
            };

        } catch (e) {
            console.warn('IMF API fetch failed', e);
            return {};
        }
    }
};
