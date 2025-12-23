import { useEffect, useState } from 'react';
import { MacroService } from '../services/api';
import { Country, MacroIndicator } from '../types';
import { MacroSnapshot } from '../components/Dashboard/MacroSnapshot';
import { LatestIntelligence } from '../components/Dashboard/LatestIntelligence';
import { CountryDetail } from './CountryDetail';

export const CountryOverview = () => {
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

        // Filter
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
    }

    const toggleSort = () => {
        setSortConfig(prev => ({
            key: prev.key === 'RISK' ? 'NAME' : 'RISK',
            direction: 'DESC'
        }));
    }

    const cycleFilter = () => {
        const regions = ['ALL', 'LATAM', 'EMEA', 'ASIA'];
        const nextIdx = (regions.indexOf(filterRegion) + 1) % regions.length;
        setFilterRegion(regions[nextIdx]);
    }

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: '24px' }}>
            <div>
                <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 className="text-xl">Sovereign Watchlist</h2>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn" onClick={cycleFilter}>
                            Region: {filterRegion}
                        </button>
                        <button className="btn" onClick={toggleSort}>
                            Sort: {sortConfig.key === 'RISK' ? 'Highest Risk' : 'Name'}
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <LatestIntelligence />

                <div className="panel">
                    <div className="panel-header">AI Trade Brief</div>
                    <div className="text-sm text-muted" style={{ lineHeight: '1.5' }}>
                        <p style={{ marginBottom: '8px' }}>
                            Global risk appetite is fading as US real rates hit new highs.
                            EM FX carry trades are unwinding.
                        </p>
                        <div style={{ padding: '8px', background: 'rgba(218, 54, 51, 0.1)', borderLeft: '2px solid var(--status-critical)' }}>
                            <strong>Recommendation:</strong> Reduce high-beta EM exposure (ZAR, TRY).
                        </div>
                    </div>
                </div>
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
