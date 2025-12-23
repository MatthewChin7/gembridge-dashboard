import { Country, MacroIndicator, NewsEvent, TradeSignal } from '../types';
import { COUNTRIES, MACRO_DATA, NEWS_FEED, SIGNALS } from './mockData';
import { WorldBankService } from './worldbank';

export const MacroService = {
    getCountries: (): Promise<Country[]> => {
        return Promise.resolve(COUNTRIES);
    },

    getCountry: (id: string): Promise<Country | undefined> => {
        return Promise.resolve(COUNTRIES.find(c => c.id === id));
    },

    getMacroData: async (countryId: string): Promise<MacroIndicator[]> => {
        const liveData = await WorldBankService.getHistoricalMacroData(countryId, 10);
        if (liveData.length > 0) {
            return liveData;
        }
        // Fallback to mock only if API completely fails (to prevent empty screen) or return empty
        console.warn(`Falling back to mock data for ${countryId} history`);
        return MACRO_DATA[countryId] || [];
    },

    getLatestIndicators: async (countryId: string): Promise<MacroIndicator | undefined> => {
        const baseData = MACRO_DATA[countryId] && MACRO_DATA[countryId].length > 0 ? MACRO_DATA[countryId][0] : undefined;
        if (!baseData) return undefined;

        try {
            // Fetch live data from World Bank to overlay on mock data
            // In a real app, this would be the primary source
            const wbData = await WorldBankService.getLatestMacroData(countryId);
            return {
                ...baseData,
                // Activity
                gdpGrowth: wbData.gdpGrowth ?? baseData.gdpGrowth,
                nominalGdp: wbData.nominalGdp ?? baseData.nominalGdp,
                gdpPerCapita: wbData.gdpPerCapita ?? baseData.gdpPerCapita,
                domesticDemandContribution: baseData.domesticDemandContribution,
                privateConsumption: wbData.privateConsumption ?? baseData.privateConsumption,
                fixedInvestment: wbData.fixedInvestment ?? baseData.fixedInvestment,
                netExportsContribution: baseData.netExportsContribution,
                population: wbData.population ?? baseData.population,

                // Prices
                cpiYoY: wbData.cpiYoY ?? baseData.cpiYoY,
                energyInCpi: baseData.energyInCpi,
                policyRate: baseData.policyRate,
                realInterestRate: wbData.realInterestRate ?? baseData.realInterestRate,
                exchangeRate: wbData.exchangeRate ?? baseData.exchangeRate,

                // External
                currentAccountToGdp: wbData.currentAccountToGdp ?? baseData.currentAccountToGdp,
                tradeBalanceVal: baseData.tradeBalanceVal,
                fdi: wbData.fdi ?? baseData.fdi,
                externalDebt: wbData.externalDebt ?? baseData.externalDebt,
                fxReservesBillions: wbData.fxReservesBillions ?? baseData.fxReservesBillions,
                netIip: baseData.netIip,
                importCoverage: wbData.importCoverage ?? baseData.importCoverage,
                araMetric: baseData.araMetric,
                netFuelExports: baseData.netFuelExports,
                breakevenOilCa: baseData.breakevenOilCa,

                // Fiscal
                fiscalBalance: wbData.fiscalBalance ?? baseData.fiscalBalance,
                primaryBalance: baseData.primaryBalance,
                govDebtToGdp: wbData.govDebtToGdp ?? baseData.govDebtToGdp,
                oilGasRevenue: baseData.oilGasRevenue,
                energySubsidies: baseData.energySubsidies,
                breakevenOilFiscal: baseData.breakevenOilFiscal,

                // Banking
                bankCapitalToAssets: baseData.bankCapitalToAssets,
                loansToDeposits: baseData.loansToDeposits,
                creditGrowth: baseData.creditGrowth,
                creditRating: baseData.creditRating,
                ratingOutlook: baseData.ratingOutlook
            };
        } catch (e) {
            console.warn(`WB Fetch failed for ${countryId}, falling back to mock`, e);
            return baseData;
        }
    }
};

export const NewsService = {
    getLatestNews: (): Promise<NewsEvent[]> => {
        return Promise.resolve(NEWS_FEED);
    },

    getNewsByCountry: (countryId: string): Promise<NewsEvent[]> => {
        return Promise.resolve(NEWS_FEED.filter(n => n.countryId === countryId));
    }
};

export const SignalService = {
    getActiveSignals: (): Promise<TradeSignal[]> => {
        return Promise.resolve(SIGNALS);
    }
};
