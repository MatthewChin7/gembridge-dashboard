import { Country, MacroIndicator, NewsEvent, TradeSignal } from '../types';
import { COUNTRIES, MACRO_DATA, NEWS_FEED, SIGNALS } from './mockData';

export const MacroService = {
    getCountries: (): Promise<Country[]> => {
        return Promise.resolve(COUNTRIES);
    },

    getCountry: (id: string): Promise<Country | undefined> => {
        return Promise.resolve(COUNTRIES.find(c => c.id === id));
    },

    getMacroData: (countryId: string): Promise<MacroIndicator[]> => {
        return Promise.resolve(MACRO_DATA[countryId] || []);
    },

    getLatestIndicators: (countryId: string): Promise<MacroIndicator | undefined> => {
        const data = MACRO_DATA[countryId];
        return Promise.resolve(data && data.length > 0 ? data[0] : undefined);
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
