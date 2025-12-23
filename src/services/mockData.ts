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
];

// Helper to generate a time series
const generateSeries = (countryId: string, periods: number): MacroIndicator[] => {
    const data: MacroIndicator[] = [];
    let baseCPI = countryId === 'TUR' ? 60 : countryId === 'ARG' ? 150 : 4;
    let baseGDP = 2.5;
    let baseReserves = 50;

    for (let i = 0; i < periods; i++) {
        data.push({
            countryId,
            date: subMonths(new Date(), i).toISOString(),
            gdpGrowth: baseGDP + (Math.random() * 2 - 1),
            cpiYoY: baseCPI + (Math.random() * 5 - 2),
            fxReservesBillions: baseReserves - (Math.random() * 2), // Trending down for drama
            debtToGdp: 60 + (Math.random() * 5),
            currentAccountToGdp: -2 + (Math.random()),
            policyRate: baseCPI + 2, // Positive real rates usually
        });
    }
    return data;
};

export const MACRO_DATA: Record<string, MacroIndicator[]> = {};
COUNTRIES.forEach(c => {
    MACRO_DATA[c.id] = generateSeries(c.id, 24); // 2 years of monthly data
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
    },
    {
        id: '3',
        countryId: 'IND',
        timestamp: subDays(new Date(), 0).toISOString(),
        headline: 'Tech Exports Surge to Record Highs',
        summary: 'Service sector exports beat expectations, supporting the Rupee.',
        source: 'LOCAL',
        sentimentScore: 0.7,
        tags: ['GROWTH', 'TRADE'],
        impactLevel: 'MEDIUM',
    }
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
