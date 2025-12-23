import { useEffect, useState } from 'react';
import { MacroService } from '../../services/api';
import { Country, MacroIndicator } from '../../types';
import { MacroSnapshot } from '../../components/Dashboard/MacroSnapshot';
import { LatestIntelligence } from '../../components/Dashboard/LatestIntelligence';

export const CountryOverview = () => {
    const [countries, setCountries] = useState<Country[]>([]);
    const [latestData, setLatestData] = useState<Record<string, MacroIndicator>>({});

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

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: '24px' }}>
            <div>
                <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 className="text-xl">Sovereign Watchlist</h2>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn">Filter: All Regions</button>
                        <button className="btn">Sort: Risk Score</button>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                    {countries.map(country => (
                        latestData[country.id] && (
                            <MacroSnapshot
                                key={country.id}
                                country={country}
                                data={latestData[country.id]}
                            />
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
        </div>
    );
};
