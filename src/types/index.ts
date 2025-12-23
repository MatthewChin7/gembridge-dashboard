export type Region = 'LATAM' | 'EMEA' | 'ASIA' | 'G10';
export type TrafficLight = 'GREEN' | 'AMBER' | 'RED';
export type Direction = 'UP' | 'DOWN' | 'FLAT';

export interface Country {
    id: string; // ISO code e.g. "BRA"
    name: string;
    region: Region;
    currency: string;
    riskScore: number; // 0-100, 100 is crisis
}

export interface MacroIndicator {
    countryId: string;
    date: string; // ISO Date
    gdpGrowth: number;
    cpiYoY: number;
    fxReservesBillions: number;
    debtToGdp: number;
    currentAccountToGdp: number;
    policyRate: number;
}

export interface NewsEvent {
    id: string;
    countryId: string;
    timestamp: string;
    headline: string;
    summary: string;
    source: 'REUTERS' | 'BLOOMBERG' | 'LOCAL';
    sentimentScore: number; // -1.0 to 1.0
    tags: string[];
    impactLevel: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface TradeSignal {
    id: string;
    countryId: string;
    type: 'DIVERGENCE' | 'FX_PRESSURE' | 'RATE_MISPRICING';
    conviction: 'HIGH' | 'MEDIUM' | 'LOW';
    description: string;
    direction: 'LONG' | 'SHORT';
    asset: string; // e.g., "USD/BRL"
    timestamp: string;
}
