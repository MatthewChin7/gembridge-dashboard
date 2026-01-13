import { useEffect, useState } from 'react';
import { MacroService } from '../services/api';
import { Country, MacroIndicator } from '../types';
import { Search } from 'lucide-react';
import { MacroSnapshot } from '../components/Dashboard/MacroSnapshot';

import { CountryDetail } from './CountryDetail';
import { WatchlistLegend } from '../components/Dashboard/WatchlistLegend';

interface CountryOverviewProps {
    desk?: 'FX' | 'RATES' | 'EM';
}

export const CountryOverview = ({ desk }: CountryOverviewProps) => {
    const [countries, setCountries] = useState<Country[]>([]);
    const [latestData, setLatestData] = useState<Record<string, MacroIndicator>>({});
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRegion, setFilterRegion] = useState<string>('ALL');
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['Developed', 'Emerging', 'Developing', 'Frontier']);
    const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);

    useEffect(() => {
        MacroService.getCountries().then(setCountries);
    }, []);

    useEffect(() => {
        countries.forEach(async (c) => {
            const data = await MacroService.getLatestIndicators(c.id);
            if (data) {
                setLatestData(prev => ({ ...prev, [c.id]: data }));
            }
        });
    }, [countries]);

    const toggleStatus = (status: string) => {
        if (status === 'ALL') {
            setSelectedStatuses(['Developed', 'Emerging', 'Developing', 'Frontier']);
            return;
        }
        setSelectedStatuses(prev =>
            prev.includes(status)
                ? prev.filter(s => s !== status)
                : [...prev, status]
        );
    };

    const getSortedAndFilteredCountries = () => {
        let result = [...countries];

        // Desk-based pre-filtering (Example logic)
        if (desk === 'EM') {
            result = result.filter(c => c.region !== 'G10');
        } else if (desk === 'FX') {
            // maybe show all or specific subset
        }

        // Region Filter
        if (filterRegion !== 'ALL') {
            result = result.filter(c => c.region === filterRegion);
        }

        // Economy Filter (Multi-select)
        result = result.filter(c => {
            if (!c.developmentStatus) return true;
            return selectedStatuses.includes(c.developmentStatus);
        });

        // Search Filter
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(c =>
                c.name.toLowerCase().includes(q) ||
                c.id.toLowerCase().includes(q)
            );
        }

        // Sort (Always Alphabetical)
        result.sort((a, b) => a.name.localeCompare(b.name));

        return result;
    };

    const cycleFilter = () => {
        const regions = ['ALL', 'LATAM', 'EMEA', 'ASIA', 'G10'];
        const nextIdx = (regions.indexOf(filterRegion) + 1) % regions.length;
        setFilterRegion(regions[nextIdx]);
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0px', height: '100%' }}>
            {/* Main Column: Sovereign Watchlist */}
            <div style={{ paddingRight: '0px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--bg-tertiary)' }}>
                    <div>
                        <h1 className="text-lg" style={{ color: 'var(--text-primary)', textTransform: 'uppercase' }}>
                            {desk ? `${desk} Desk Monitor` : 'Sovereign Watchlist'}
                        </h1>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <div style={{ position: 'relative' }}>
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={12} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            <input
                                type="text"
                                placeholder="SEARCH..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    padding: '4px 8px 4px 24px',
                                    borderRadius: '0',
                                    border: '1px solid var(--bg-tertiary)',
                                    background: '#000',
                                    color: 'var(--text-primary)',
                                    outline: 'none',
                                    width: '120px',
                                    fontSize: '11px',
                                    fontFamily: 'var(--font-mono)',
                                    textTransform: 'uppercase'
                                }}
                            />
                        </div>
                        <button className="btn" onClick={cycleFilter} style={{ fontSize: '11px', whiteSpace: 'nowrap' }}>
                            REGION: {filterRegion}
                        </button>
                        <div style={{ display: 'flex', gap: '1px', background: 'var(--bg-tertiary)', padding: '1px', borderRadius: '2px' }}>
                            {['Developed', 'Emerging', 'Developing', 'Frontier'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => toggleStatus(status)}
                                    title={status}
                                    style={{
                                        padding: '4px 6px',
                                        fontSize: '9px',
                                        border: 'none',
                                        background: selectedStatuses.includes(status) ? 'var(--text-primary)' : '#000',
                                        color: selectedStatuses.includes(status) ? '#000' : 'var(--text-tertiary)',
                                        cursor: 'pointer',
                                        fontWeight: 'bold',
                                        borderRadius: '1px'
                                    }}
                                >
                                    {status[0]}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1px', background: 'var(--bg-tertiary)', padding: '1px' }}>
                    {getSortedAndFilteredCountries().map(country => (
                        latestData[country.id] && (
                            <div key={country.id} onClick={() => setSelectedCountry(country)} style={{ cursor: 'pointer', background: '#000' }}>
                                <MacroSnapshot
                                    country={country}
                                    data={latestData[country.id]}
                                />
                            </div>
                        )
                    ))}
                </div>
                <WatchlistLegend />
            </div>

            {selectedCountry && (
                <CountryDetail
                    country={selectedCountry}
                    onClose={() => setSelectedCountry(null)}
                />
            )}
        </div>
    );
};
