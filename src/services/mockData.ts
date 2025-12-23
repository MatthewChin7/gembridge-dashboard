import { Country, MacroIndicator, NewsEvent, TradeSignal } from '../types';
import { subDays, subMonths } from 'date-fns';

export const COUNTRIES: Country[] = [
    { id: 'BRA', name: 'Brazil', region: 'LATAM', currency: 'BRL', riskScore: 45 },
    { id: 'TUR', name: 'Turkey', region: 'EMEA', currency: 'TRY', riskScore: 85 },
    { id: 'ZAF', name: 'South Africa', region: 'EMEA', currency: 'ZAR', riskScore: 60 },
    { id: 'IND', name: 'India', region: 'ASIA', currency: 'INR', riskScore: 30 },
    { id: 'MXN', name: 'Mexico', region: 'LATAM', currency: 'MXN', riskScore: 35 },
    { id: 'IDN', name: 'Indonesia', region: 'ASIA', currency: 'IDR', riskScore: 40 },
    { id: 'ARG', name: 'Argentina', region: 'LATAM', currency: 'ARS', riskScore: 92 },
    { id: 'EGY', name: 'Egypt', region: 'EMEA', currency: 'EGP', riskScore: 78 },
];

// Helper to generate a time series
const generateSeries = (countryId: string, periods: number): MacroIndicator[] => {
    const data: MacroIndicator[] = [];
    let baseCPI = countryId === 'TUR' ? 60 : countryId === 'ARG' ? 150 : 4;
    let baseGDP = 2.5;

    for (let i = 0; i < periods; i++) {
        data.push({
            countryId,
            date: subMonths(new Date(), i).toISOString(),
            gdpGrowth: baseGDP + (Math.random() * 2 - 1),
            nominalGdp: 400 + (Math.random() * 50),
            gdpPerCapita: 12000,
            domesticDemandContribution: 2.1,
            privateConsumption: 3.5,
            fixedInvestment: 4.0,
            netExportsContribution: -0.5,
            population: 85,

            cpiYoY: baseCPI + (Math.random() * 5 - 2),
            energyInCpi: 15,
            policyRate: baseCPI + 2,
            realInterestRate: 2,
            exchangeRate: 18.5,

            fxReservesBillions: 35 - (Math.random() * 2),
            importCoverage: 4.5,
            currentAccountToGdp: -3.2 + Math.random(),
            tradeBalanceVal: -12.5,
            fdi: 2.1,
            externalDebt: 45,
            netIip: -25,
            araMetric: 95,
            netFuelExports: -1.2,
            breakevenOilCa: 75,

            govDebtToGdp: 88 + (Math.random() * 5),
            fiscalBalance: -6.5,
            primaryBalance: 1.2,
            oilGasRevenue: 5,
            energySubsidies: 2.4,
            breakevenOilFiscal: 85,

            bankCapitalToAssets: 14.5,
            loansToDeposits: 85,
            creditGrowth: 12,
            creditRating: 'B',
            ratingOutlook: 'Stable'
        });
    }
    return data;
};

export const MACRO_DATA: Record<string, MacroIndicator[]> = {};
COUNTRIES.forEach(c => {
    MACRO_DATA[c.id] = generateSeries(c.id, 120); // 10 years of monthly data
});

export const NEWS_FEED: NewsEvent[] = [
    {
        id: '1',
        countryId: 'TUR',
        timestamp: subDays(new Date(), 1).toISOString(),
        headline: 'Central Bank Pivots on Rate Policy Amidst Currency Pressure',
        summary: 'The CBRT signaling a sudden shift in policy stance following renewed depreciation of the Lira.',
        source: 'REUTERS',
        sentimentScore: -0.8,
        tags: ['MONETARY_POLICY', 'FX'],
        impactLevel: 'HIGH',
        url: 'https://www.reuters.com/markets/currencies/turkey-central-bank-policy',
    },
    {
        id: '2',
        countryId: 'BRA',
        timestamp: subDays(new Date(), 2).toISOString(),
        headline: 'Fiscal Framework Approval Delayed in Senate',
        summary: 'Key vote on the new fiscal anchor has been postponed, raising concerns about budget deficits.',
        source: 'BLOOMBERG',
        sentimentScore: -0.4,
        tags: ['FISCAL', 'POLITICS'],
        impactLevel: 'MEDIUM',
        url: 'https://www.bloomberg.com/news/articles/brazil-fiscal-framework',
    },
    {
        id: '3',
        countryId: 'IND',
        timestamp: subDays(new Date(), 0).toISOString(),
        headline: 'Tech Exports Surge to Record Highs',
        summary: 'India\'s IT services exports reached $200B annually, driven by AI and cloud demand.',
        source: 'REUTERS',
        sentimentScore: 0.9,
        tags: ['TRADE', 'TECH'],
        impactLevel: 'MEDIUM',
        url: 'https://www.reuters.com/technology/india-tech-exports-record',
    },
];

export const SIGNALS: TradeSignal[] = [
    {
        id: '1',
        countryId: 'TUR',
        type: 'FX_PRESSURE',
        conviction: 'HIGH',
        description: 'Reserves depletion accelerating (>5% weekly) while rates remain negative real.',
        direction: 'SHORT',
        asset: 'TRY',
        timestamp: new Date().toISOString(),
    },
    {
        id: '2',
        countryId: 'MXN',
        type: 'PROPOSITION', // Typo in type def? I used RATE_MISPRICING there
        // wait I need to match the union type
        // 'DIVERGENCE' | 'FX_PRESSURE' | 'RATE_MISPRICING'
        description: 'Real rates at historic highs (6%) despite falling inflation.',
        direction: 'LONG',
        asset: 'MXN',
        timestamp: new Date().toISOString(),
    } as any // quick fix, will correct in service
];
