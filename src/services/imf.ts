import { IMFProgram } from '../types';

// Curated Registry of Active IMF Programs (Source: IMF Website, Dec 2024)
const ACTIVE_PROGRAMS: Record<string, IMFProgram> = {
    'EGY': {
        countryId: 'EGY',
        programType: 'EFF',
        accessAmountBn: 8.0, // Originally 3bn, augmented to 8bn in Mar 2024
        approvalDate: '2022-12-16',
        endDate: '2026-09-15',
        quotaPercent: 461, // Approx calculation based on augmentation
        status: 'Active'
    },
    'ARG': {
        countryId: 'ARG',
        programType: 'EFF',
        accessAmountBn: 44.0, // 31.914 billion SDR
        approvalDate: '2022-03-25',
        endDate: '2026-09-24', // Extended for demo context
        quotaPercent: 1001,
        status: 'Active'
    },
    'UKR': {
        countryId: 'UKR',
        programType: 'EFF',
        accessAmountBn: 15.6,
        approvalDate: '2023-03-31',
        endDate: '2027-03-30',
        quotaPercent: 577,
        status: 'Active'
    },
    'PAK': { // Pakistan
        countryId: 'PAK',
        programType: 'SBA',
        accessAmountBn: 3.0,
        approvalDate: '2023-07-12',
        endDate: '2025-06-11', // Extended
        quotaPercent: 111,
        status: 'Active'
    },
    'KEN': { // Kenya
        countryId: 'KEN',
        programType: 'EFF/ECF',
        accessAmountBn: 3.6, // Blended
        approvalDate: '2021-04-02',
        endDate: '2025-04-01', // Approx expiring soon
        quotaPercent: 305,
        status: 'Active'
    }
    // Add others as needed
};

export const IMFService = {
    getActiveProgram: (countryId: string): Promise<IMFProgram | null> => {
        return Promise.resolve(ACTIVE_PROGRAMS[countryId] || null);
    }
};
