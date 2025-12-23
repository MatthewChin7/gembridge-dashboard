import { useEffect, useState } from 'react';
import { MacroService } from '../services/api';
import { Country, MacroIndicator } from '../types';
import { MacroSnapshot } from '../components/Dashboard/MacroSnapshot';
import { LatestIntelligence } from '../components/Dashboard/LatestIntelligence';
import { CountryDetail } from './CountryDetail';

interface CountryOverviewProps {
    desk?: 'FX' | 'RATES' | 'EM';
}

export const CountryOverview = ({ desk }: CountryOverviewProps) => {
    const [countries, setCountries] = useState<Country[]>([]);
    const [latestData, setLatestData] = useState<Record<string, MacroIndicator>>({});
    const [sortConfig, setSortConfig] = useState<{ key: 'RISK' | 'NAME'; direction: 'ASC' | 'DESC' }>({ key: 'RISK', direction: 'DESC' });
    const [filterRegion, setFilterRegion] = useState<string>('ALL');
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

        // Sort
        result.sort((a, b) => {
            if (sortConfig.key === 'RISK') {
                return sortConfig.direction === 'DESC'
                    ? b.riskScore - a.riskScore
                    : a.riskScore - b.riskScore;
            } else {
                return a.name.localeCompare(b.name);
            }
        });

        return result;
    };

    const toggleSort = () => {
        setSortConfig(prev => ({
            key: prev.key === 'RISK' ? 'NAME' : 'RISK',
            direction: 'DESC'
        }));
    };

    const cycleFilter = () => {
        const regions = ['ALL', 'LATAM', 'EMEA', 'ASIA', 'G10'];
        const nextIdx = (regions.indexOf(filterRegion) + 1) % regions.length;
        setFilterRegion(regions[nextIdx]);
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 350px', gap: '24px' }}>
            {/* Main Column: Sovereign Watchlist */}
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div>
                        <h1 className="text-2xl" style={{ fontWeight: '600' }}>
                            {desk ? `${desk} Desk Monitor` : 'Sovereign Watchlist'}
                        </h1>
                        <p className="text-secondary">
                            {desk
                                ? `Real-time ${desk} market surveillance and opportunities`
                                : 'Real-time monitoring of sovereign risk and macro divergence'}
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn" onClick={cycleFilter}>
                            Region: {filterRegion}
                        </button>
                        <button className="btn" onClick={toggleSort}>
                            Sort: {sortConfig.key === 'RISK' ? 'High Risk' : 'Name'}
                        </button>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                    {getSortedAndFilteredCountries().map(country => (
                        latestData[country.id] && (
                            <div key={country.id} onClick={() => setSelectedCountry(country)} style={{ cursor: 'pointer', transition: 'transform 0.2s' }}>
                                <MacroSnapshot
                                    country={country}
                                    data={latestData[country.id]}
                                />
                            </div>
                        )
                    ))}
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'sticky', top: '24px', height: 'calc(100vh - 48px)' }}>
                <LatestIntelligence
                    selectedCountries={getSortedAndFilteredCountries().map(c => c.id)}
                    regionFilter={filterRegion}
                />
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
