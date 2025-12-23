import { MacroIndicator } from '../types';

const BASE_URL = 'https://api.worldbank.org/v2/country';
const FORMAT = 'format=json';

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

    // Monetary & Prices
    INFLATION: 'FP.CPI.TOTL.ZG',
    REAL_RATE: 'FR.INR.RINR',
    FX_RATE: 'PA.NUS.FCRF', // Official exchange rate

    // Banking (Limited in WB)
    BANK_CAPITAL: 'FB.BNK.CAPA.ZS', // Bank capital to assets
    CREDIT_GROWTH: 'FS.AST.PRVT.GD.ZS', // Domestic credit to private sector
};

export const WorldBankService = {
    async getLatestMacroData(countryId: string): Promise<Partial<MacroIndicator>> {
        // Re-use historical fetcher for simplicity and consistency
        const history = await this.getHistoricalMacroData(countryId, 1);
        return history.length > 0 ? history[0] : {};
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
                series.forEach(point => {
                    if (!dataMap[point.date]) dataMap[point.date] = {};
                    dataMap[point.date][indicatorKey] = point.value;
                });
            });

            // Convert map to array and sort by date descending
            const macroData: MacroIndicator[] = Object.keys(dataMap)
                .sort((a, b) => parseInt(b) - parseInt(a))
                .map(year => {
                    const d = dataMap[year];
                    // Helper to get value or default
                    const val = (k: keyof typeof INDICATORS) => d[k] ?? null;

                    return {
                        countryId,
                        date: new Date(`${year}-12-31`).toISOString(), // Anchor to end of year

                        // Activity
                        gdpGrowth: val('GDP_GROWTH') ?? 0,
                        nominalGdp: (val('NOMINAL_GDP') ?? 0) / 1e9,
                        gdpPerCapita: val('GDP_PCAP') ?? 0,
                        domesticDemandContribution: val('DOMESTIC_DEMAND') ?? 0,
                        privateConsumption: val('PRIV_CONSUMPTION') ?? 0,
                        fixedInvestment: val('FIXED_INVESTMENT') ?? 0,
                        netExportsContribution: 0, // Need calc
                        population: (val('POPULATION') ?? 0) / 1e6,

                        // Prices
                        cpiYoY: val('INFLATION') ?? 0,
                        energyInCpi: 0, // Unavailable in WB
                        policyRate: 0, // Unavailable in WB
                        realInterestRate: val('REAL_RATE') ?? 0,
                        exchangeRate: val('FX_RATE') ?? 0,

                        // External
                        currentAccountToGdp: val('CURRENT_ACCOUNT') ?? 0,
                        tradeBalanceVal: (val('TRADE_BALANCE') ?? 0) / 1e9,
                        fdi: val('FDI') ?? 0,
                        externalDebt: val('EXTERNAL_DEBT') ?? 0,
                        fxReservesBillions: (val('FX_RESERVES') ?? 0) / 1e9,
                        netIip: 0, // Unavailable
                        importCoverage: val('IMPORT_COVER') ?? 0,
                        araMetric: 0,
                        netFuelExports: 0,
                        breakevenOilCa: 0,

                        // Fiscal
                        fiscalBalance: val('FISCAL_BALANCE') ?? 0,
                        primaryBalance: 0,
                        govDebtToGdp: val('GOV_DEBT') ?? 0,
                        oilGasRevenue: 0,
                        energySubsidies: 0,
                        breakevenOilFiscal: 0,

                        // Banking
                        bankCapitalToAssets: val('BANK_CAPITAL') ?? 0,
                        loansToDeposits: 0,
                        creditGrowth: val('CREDIT_GROWTH') ?? 0,
                        creditRating: 'N/A',
                        ratingOutlook: 'Stable'
                    } as MacroIndicator;
                });

            return macroData;

        } catch (error) {
            console.warn(`WB History Fetch failed for ${countryId}`, error);
            return [];
        }
    },

    async fetchIndicatorSeries(countryCode: string, indicator: string, dateRange: string): Promise<{ date: string, value: number }[]> {
        try {
            const url = `${BASE_URL}/${countryCode}/indicator/${indicator}?${FORMAT}&per_page=100&date=${dateRange}`;
            const response = await fetch(url);
            const data = await response.json();

            if (data && data[1]) {
                return data[1]
                    .filter((d: any) => d.value !== null)
                    .map((d: any) => ({
                        date: d.date,
                        value: d.value
                    }));
            }
            return [];
        } catch (e) {
            return [];
        }
    }
};
