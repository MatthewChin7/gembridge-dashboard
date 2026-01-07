import { Country, MacroIndicator, NewsEvent, TradeSignal } from '../types';
import { COUNTRIES, NEWS_FEED, SIGNALS } from './mockData';
import { WorldBankService } from './worldbank';

import { IMFService as RealIMFService } from './imf_live';

export const MacroService = {
    getCountries: async (): Promise<Country[]> => {
        try {
            const live = await WorldBankService.getCountries();
            if (live.length > 0) return live;
            return COUNTRIES;
        } catch (e) {
            return COUNTRIES;
        }
    },

    getCountry: (id: string): Promise<Country | undefined> => {
        return Promise.resolve(COUNTRIES.find(c => c.id === id));
    },

    getMacroData: async (countryId: string): Promise<MacroIndicator[]> => {
        try {
            const [history, forecasts] = await Promise.all([
                WorldBankService.getHistoricalMacroData(countryId, 10),
                RealIMFService.getForecasts(countryId)
            ]);

            // Combine and sort (Newest first) with deduplication by year
            const dataMap = new Map<string, MacroIndicator>();

            // 1. Add Historical Data (World Bank) - Treat as source of truth for past
            history.forEach(d => {
                const year = d.date.substring(0, 4);
                dataMap.set(year, d);
            });

            // 2. Add Forecasts (IMF) - Merge with existing data or add new
            forecasts.forEach(d => {
                const year = d.date.substring(0, 4);
                if (dataMap.has(year)) {
                    // Merge logic: Fill in missing gaps, AND overwrite with IMF if it's a projection year
                    // This fixes the issue where stale/partial WB data (e.g. old estimates) overrides fresh IMF WEO forecasts
                    const existing = dataMap.get(year)!;
                    dataMap.set(year, {
                        ...existing,
                        // Prioritize IMF for key macro metrics if they exist
                        gdpGrowth: d.gdpGrowth ?? existing.gdpGrowth,
                        cpiYoY: d.cpiYoY ?? existing.cpiYoY,
                        govDebtToGdp: d.govDebtToGdp ?? existing.govDebtToGdp,
                        currentAccountToGdp: d.currentAccountToGdp ?? existing.currentAccountToGdp,
                        source: existing.source + ' + IMF Forecast'
                    });
                } else {
                    dataMap.set(year, d);
                }
            });

            const combined = Array.from(dataMap.values()).sort((a, b) =>
                new Date(b.date).getTime() - new Date(a.date).getTime()
            );

            return combined;
        } catch (e) {
            console.warn(`Error fetching macro data for ${countryId}`, e);
            return [];
        }
    },

    getLatestIndicators: async (countryId: string): Promise<MacroIndicator | undefined> => {
        // Strict Live Mode: No mock fallback
        try {
            // Parallel fetch: World Bank (Historical/Lagged) + IMF (Forecasts)
            const [wbData, imfData] = await Promise.all([
                WorldBankService.getLatestMacroData(countryId).catch(() => ({})),
                RealIMFService.getLatestForecasts(countryId).catch(() => ({} as any))
            ]);

            const liveData = { ...wbData, ...imfData };
            const hasData = Object.keys(liveData).length > 0;

            if (!hasData) {
                return {
                    countryId,
                    date: new Date().toISOString(),
                    isMock: false,
                    source: 'No Live Data'
                };
            }

            return {
                countryId,
                date: liveData.date || new Date().toISOString(),

                // Activity
                gdpGrowth: liveData.gdpGrowth,
                nominalGdp: liveData.nominalGdp,
                gdpPerCapita: liveData.gdpPerCapita,
                domesticDemandContribution: undefined,
                privateConsumption: liveData.privateConsumption,
                fixedInvestment: liveData.fixedInvestment,
                netExportsContribution: undefined,
                population: liveData.population,

                // Prices
                cpiYoY: liveData.cpiYoY,
                energyInCpi: undefined,
                policyRate: liveData.policyRate,
                realInterestRate: liveData.realInterestRate,
                exchangeRate: liveData.exchangeRate,

                // External
                currentAccountToGdp: liveData.currentAccountToGdp,
                tradeBalanceVal: liveData.tradeBalanceVal,
                fdi: liveData.fdi,
                externalDebt: liveData.externalDebt,
                fxReservesBillions: liveData.fxReservesBillions,
                netIip: undefined,
                importCoverage: liveData.importCoverage,
                araMetric: undefined,
                netFuelExports: undefined,
                breakevenOilCa: undefined,

                // Fiscal
                fiscalBalance: liveData.fiscalBalance,
                primaryBalance: undefined,
                govDebtToGdp: liveData.govDebtToGdp,
                oilGasRevenue: undefined,
                energySubsidies: undefined,
                breakevenOilFiscal: undefined,

                // Banking
                bankCapitalToAssets: liveData.bankCapitalToAssets,
                loansToDeposits: undefined,
                creditGrowth: undefined,
                creditRating: undefined,
                ratingOutlook: undefined,

                isMock: false,
                source: (imfData as any).source ? 'IMF WEO / WB' : 'World Bank'
            };
        } catch (e) {
            console.warn(`Fetch failed for ${countryId}`, e);
            return undefined;
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
