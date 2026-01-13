export type Region = 'LATAM' | 'EMEA' | 'ASIA' | 'G10';
export type TrafficLight = 'GREEN' | 'AMBER' | 'RED';
export type Direction = 'LONG' | 'SHORT' | 'NEUTRAL';

export interface IMFProgram {
    countryId: string;
    programType: string; // e.g. "EFF", "SBA", "RFI"
    accessAmountBn: number; // In Billions USD (or SDR converted)
    approvalDate: string;
    endDate: string;
    quotaPercent: number;
    status: 'Active' | 'Completed' | 'Terminated';
}

export type DevelopmentStatus = 'Developed' | 'Emerging' | 'Developing' | 'Frontier';

export interface Country {
    id: string; // ISO code e.g. "BRA"
    name: string;
    region: Region;
    currency: string;
    incomeLevel?: string;
    lendingType?: string;
    developmentStatus?: DevelopmentStatus;
}

export interface MacroIndicator {
    countryId: string;
    date: string; // ISO Date
    isMock?: boolean;
    source?: string;

    // Activity & Output
    gdpGrowth?: number; // Real GDP % y/y
    nominalGdp?: number; // USD bn
    gdpPerCapita?: number; // USD
    gniPerCapita?: number; // Added for Income Filters
    domesticDemandContribution?: number; // pp [NEW]
    privateConsumption?: number; // % y/y
    fixedInvestment?: number; // % y/y
    netExportsContribution?: number; // pp [NEW]
    population?: number; // million

    // External Sector
    currentAccountToGdp?: number; // % GDP
    tradeBalanceVal?: number; // USD bn [NEW]
    fdi?: number; // % GDP
    externalDebt?: number; // % GDP
    fxReservesBillions?: number;
    imfCredit?: number; // USD bn [NEW]
    netIip?: number; // % GDP [NEW]
    importCoverage?: number; // months
    araMetric?: number; // % [NEW]
    netFuelExports?: number; // % GDP [NEW]
    breakevenOilCa?: number; // $/b [NEW]

    // Public Sector
    fiscalBalance?: number; // % GDP
    primaryBalance?: number; // % GDP [NEW]
    govDebtToGdp?: number; // % GDP
    oilGasRevenue?: number; // % gov rev [NEW]
    energySubsidies?: number; // % GDP [NEW]
    breakevenOilFiscal?: number; // $/b [NEW]

    // Prices & Monetary
    cpiYoY?: number; // %
    energyInCpi?: number; // % [NEW]
    policyRate?: number; // %
    realInterestRate?: number; // %
    exchangeRate?: number; // LCU per USD

    // Banking & Risk
    bankCapitalToAssets?: number; // % [NEW]
    loansToDeposits?: number; // % [NEW]
    creditGrowth?: number; // % since 2019 [NEW]
    creditRating?: string; // S&P/Moody's proxy
    ratingOutlook?: 'Positive' | 'Stable' | 'Negative'; // [NEW]
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
    url?: string; // Optional URL to source article
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
