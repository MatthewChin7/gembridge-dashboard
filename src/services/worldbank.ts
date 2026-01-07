import { MacroIndicator, Country } from '../types';

// World Bank API Service for fetching live macro-economic data

// Comprehensive Indicator Codes
const INDICATORS = {
    // Activity
    GDP_GROWTH: 'NY.GDP.MKTP.KD.ZG',
    NOMINAL_GDP: 'NY.GDP.MKTP.CD',
    GDP_PCAP: 'NY.GDP.PCAP.CD',
    PRIV_CONSUMPTION: 'NE.CON.PRVT.KD.ZG',
    FIXED_INVESTMENT: 'NE.GDI.FTOT.KD.ZG',
    POPULATION: 'SP.POP.TOTL',
    DOMESTIC_DEMAND: 'NE.DAB.TOTL.ZS', // Proxy or Gross National Expenditure
    NET_EXPORTS: 'NE.EXP.GNFS.ZS', // Exports % GDP - Imports % GDP (Derived)
    GNI_PCAP: 'NY.GNP.PCAP.CD', // GNI per capita, Atlas method (current US$)

    // External
    CURRENT_ACCOUNT: 'BN.CAB.XOKA.GD.ZS',
    TRADE_BALANCE: 'BN.GSR.GNFS.CD', // Net trade goods/services USD
    FDI: 'BX.KLT.DINV.WD.GD.ZS',
    EXTERNAL_DEBT: 'DT.DOD.DECT.GN.ZS',
    FX_RESERVES: 'FI.RES.TOTL.CD',
    IMPORT_COVER: 'FI.RES.TOTL.MO',
    NET_IIP: 'BN.KLT.DINV.CD', // Not exact IIP, but Net Investment. WB differs.

    // Fiscal
    FISCAL_BALANCE: 'GC.BAL.CASH.GD.ZS', // Cash surplus/deficit
    GOV_DEBT: 'GC.DOD.TOTL.GD.ZS', // Central gov debt
    IMF_CREDIT: 'DT.DOD.DIMF.CD', // Use of IMF credit (DOD, current US$)

    // Monetary & Prices
    INFLATION: 'FP.CPI.TOTL.ZG',
    REAL_RATE: 'FR.INR.RINR',
    FX_RATE: 'PA.NUS.FCRF', // Official exchange rate

    // Banking (Limited in WB)
    BANK_CAPITAL: 'FB.BNK.CAPA.ZS', // Bank capital to assets
    CREDIT_GROWTH: 'FS.AST.PRVT.GD.ZS', // Domestic credit to private sector
};

export const WorldBankService = {
    async getCountries(): Promise<Country[]> {
        // Fetch all countries (using a large per_page to get all in one go, max is usually 300)
        const url = 'https://api.worldbank.org/v2/country?format=json&per_page=300';
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch countries');

            const json = await response.json();
            // json[1] is the array of countries
            if (!json || !json[1]) return [];

            const rawCountries = json[1];

            return rawCountries
                .filter((c: any) => c.region.value !== 'Aggregates') // Filter out "World", "Africa", etc.
                .map((c: any) => ({
                    id: c.id, // ISO3 Code e.g. ARG
                    name: c.name,
                    region: this.mapRegion(c.region.value),
                    currency: 'USD', // Helper: WB doesn't return currency in this endpoint easily, defaulting for now
                }));

        } catch (e) {
            console.warn('Failed to load WB countries', e);
            return [];
        }
    },

    mapRegion(wbRegion: string): 'LATAM' | 'EMEA' | 'ASIA' | 'G10' {
        // Simple heuristic mapping
        if (wbRegion.includes('Latin America')) return 'LATAM';
        if (wbRegion.includes('Europe') || wbRegion.includes('Middle East') || wbRegion.includes('Africa')) return 'EMEA';
        if (wbRegion.includes('Asia')) return 'ASIA';
        if (wbRegion.includes('North America')) return 'G10'; // Approximation
        return 'G10';
    },

    async getLatestMacroData(countryId: string): Promise<Partial<MacroIndicator>> {
        // MRV (Most Recent Value) Logic: World Bank has reporting lag
        // Fetch last 5 years and pick the most recent non-null value for each indicator
        const history = await this.getHistoricalMacroData(countryId, 5);

        if (history.length === 0) return {};

        // Iterate through years (newest first) and build composite "latest" object
        const latest: Partial<MacroIndicator> = {
            countryId,
            date: history[0].date // Use the most recent year's date as reference
        };

        // For each field, find the most recent non-null value
        const fields: (keyof MacroIndicator)[] = [
            'gdpGrowth', 'nominalGdp', 'gdpPerCapita', 'gniPerCapita', 'privateConsumption',
            'fixedInvestment', 'population', 'cpiYoY', 'realInterestRate',
            'exchangeRate', 'currentAccountToGdp', 'tradeBalanceVal', 'fdi',
            'externalDebt', 'fxReservesBillions', 'importCoverage',
            'fiscalBalance', 'govDebtToGdp', 'bankCapitalToAssets'
        ];

        for (const field of fields) {
            for (const row of history) {
                if (row[field] !== undefined && row[field] !== null) {
                    latest[field] = row[field] as any;
                    break; // Take the first (most recent) non-null value
                }
            }
        }

        return latest;
    },

    async getHistoricalMacroData(countryId: string, years: number = 10): Promise<MacroIndicator[]> {
        try {
            const endDate = new Date().getFullYear();
            const startDate = endDate - years;
            const dateRange = `${startDate}:${endDate}`;

            // Fetch all indicators in parallel
            const keys = Object.keys(INDICATORS) as (keyof typeof INDICATORS)[];
            const promises = keys.map(key => this.fetchIndicatorSeries(countryId, INDICATORS[key], dateRange));

            const results = await Promise.all(promises);
            const dataMap: Record<string, Record<string, number>> = {}; // year -> indicator -> value

            // Process results into a year-based map
            results.forEach((series, index) => {
                const indicatorKey = keys[index];
                const indicatorCode = INDICATORS[indicatorKey]; // Use the actual WB code as the key
                series.forEach(point => {
                    if (!dataMap[point.date]) dataMap[point.date] = {};
                    dataMap[point.date][indicatorCode] = point.value;
                });
            });

            // Convert map to array and sort by date descending
            const macroData: MacroIndicator[] = Object.keys(dataMap)
                .sort((a, b) => parseInt(b) - parseInt(a))
                .map(year => {
                    const d = dataMap[year];
                    // Helper to get value from the data map for this year
                    const getValue = (indicatorCode: string) => d[indicatorCode] ?? undefined;

                    return {
                        countryId,
                        date: new Date(`${year}-12-31`).toISOString(), // Anchor to end of year

                        // Activity
                        gdpGrowth: getValue('NY.GDP.MKTP.KD.ZG'),
                        nominalGdp: getValue('NY.GDP.MKTP.CD') ? getValue('NY.GDP.MKTP.CD')! / 1e9 : undefined, // BN USD
                        gdpPerCapita: getValue('NY.GDP.PCAP.CD'),
                        privateConsumption: getValue('NE.CON.PRVT.ZS'),
                        fixedInvestment: getValue('NE.GDI.TOTL.ZS'),
                        population: getValue('SP.POP.TOTL') ? getValue('SP.POP.TOTL')! / 1e6 : undefined, // Million
                        gniPerCapita: getValue('NY.GNP.PCAP.CD'),

                        // External
                        currentAccountToGdp: getValue('BN.CAB.XOKA.GD.ZS'),
                        tradeBalanceVal: getValue('BN.CAB.XOKA.CD') ? getValue('BN.CAB.XOKA.CD')! / 1e9 : undefined,
                        fdi: getValue('BX.KLT.DINV.WD.GD.ZS'),
                        externalDebt: getValue('DT.DOD.DECT.GN.ZS'),
                        fxReservesBillions: getValue('FI.RES.TOTL.CD') ? getValue('FI.RES.TOTL.CD')! / 1e9 : undefined, // BN USD
                        importCoverage: getValue('FI.RES.TOTL.MO'),
                        imfCredit: getValue('DT.DOD.DIMF.CD') ? getValue('DT.DOD.DIMF.CD')! / 1e9 : undefined,

                        // Fiscal
                        fiscalBalance: getValue('GC.BAL.CASH.GD.ZS'), // Cash surplus/def
                        govDebtToGdp: getValue('GC.DOD.TOTL.GD.ZS'), // Central gov debt
                        oilGasRevenue: getValue('NY.GDP.PETR.RT.ZS'), // Oil rents % GDP as proxy?

                        // Monetary & Prices
                        cpiYoY: getValue('FP.CPI.TOTL.ZG'),
                        exchangeRate: getValue('PA.NUS.FCRF'),
                        realInterestRate: getValue('FR.INR.RINR'),

                        // Banking
                        bankCapitalToAssets: getValue('FB.BNK.CAPA.ZS'),
                    } as MacroIndicator;
                });

            return macroData;

        } catch (error) {
            console.warn(`WB History Fetch failed for ${countryId}`, error);
            return [];
        }
    },

    async fetchIndicatorSeries(countryId: string, indicatorCode: string, dateRange: string): Promise<{ date: string; value: number }[]> {
        const url = `https://api.worldbank.org/v2/country/${countryId}/indicator/${indicatorCode}?date=${dateRange}&format=json&per_page=100`;

        try {
            const response = await fetch(url);
            if (!response.ok) return [];

            const json = await response.json();

            // World Bank API returns [metadata, data_array]
            // We need the second element (index 1)
            if (!Array.isArray(json) || json.length < 2) return [];

            const dataPoints = json[1];
            if (!Array.isArray(dataPoints)) return [];

            return dataPoints
                .filter(point => point.value !== null && point.value !== undefined)
                .map(point => ({
                    date: point.date, // Year as string, e.g., "2024"
                    value: typeof point.value === 'number' ? point.value : parseFloat(point.value)
                }));
        } catch (error) {
            console.warn(`Failed to fetch ${indicatorCode} for ${countryId}:`, error);
            return [];
        }
    },
};
