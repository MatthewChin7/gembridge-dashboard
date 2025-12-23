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
                    // Helper to get value from the data map for this year
                    const getValue = (indicatorCode: string) => d[indicatorCode] ?? undefined;

                    return {
                        countryId,
                        date: new Date(`${year}-12-31`).toISOString(), // Anchor to end of year

                        // Activity
                        gdpGrowth: getValue('NY.GDP.MKTP.KD.ZG'),
                        nominalGdp: getValue('NY.GDP.MKTP.CD') ? getValue('NY.GDP.MKTP.CD')! / 1e9 : undefined, // BN USD
                        gdpPerCapita: getValue('NY.GDP.PCAP.CD'),
                        domesticDemandContribution: undefined, // WB doesn't provide this directly usually
                        privateConsumption: getValue('NE.CON.PRVT.ZS'),
                        fixedInvestment: getValue('NE.GDI.TOTL.ZS'),
                        netExportsContribution: undefined,
                        population: getValue('SP.POP.TOTL') ? getValue('SP.POP.TOTL')! / 1e6 : undefined, // Million

                        // External
                        currentAccountToGdp: getValue('BN.CAB.XOKA.GD.ZS'),
                        tradeBalanceVal: getValue('BN.CAB.XOKA.CD') ? getValue('BN.CAB.XOKA.CD')! / 1e9 : undefined,
                        fdi: getValue('BX.KLT.DINV.WD.GD.ZS'),
                        externalDebt: getValue('DT.DOD.DECT.GN.ZS'),
                        fxReservesBillions: getValue('FI.RES.TOTL.CD') ? getValue('FI.RES.TOTL.CD')! / 1e9 : undefined, // BN USD
                        netIip: undefined,
                        importCoverage: getValue('FI.RES.TOTL.MO'),
                        araMetric: undefined,
                        netFuelExports: undefined,
                        breakevenOilCa: undefined,

                        // Fiscal
                        fiscalBalance: getValue('GC.BAL.CASH.GD.ZS'), // Cash surplus/def
                        primaryBalance: undefined,
                        govDebtToGdp: getValue('GC.DOD.TOTL.GD.ZS'), // Central gov debt
                        oilGasRevenue: getValue('NY.GDP.PETR.RT.ZS'), // Oil rents % GDP as proxy?
                        energySubsidies: undefined,
                        breakevenOilFiscal: undefined,

                        // Monetary & Prices
                        cpiYoY: getValue('FP.CPI.TOTL.ZG'),
                        energyInCpi: undefined,
                        exchangeRate: getValue('PA.NUS.FCRF'),
                        policyRate: undefined, // WB doesn't have pol rates usually
                        realInterestRate: getValue('FR.INR.RINR'),

                        // Banking
                        bankCapitalToAssets: getValue('FB.BNK.CAPA.ZS'),
                        loansToDeposits: undefined,
                        creditGrowth: undefined,
                        creditRating: undefined, // Qualitative
                        ratingOutlook: undefined,
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
