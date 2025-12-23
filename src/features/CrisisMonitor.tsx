import { useEffect, useState } from 'react';
import { MacroService } from '../services/api';
import { Country, MacroIndicator } from '../types';
import { ShieldAlert } from 'lucide-react';

export const CrisisMonitor = () => {
    const [highRiskCountries, setHighRiskCountries] = useState<(Country & { data: MacroIndicator })[]>([]);

    useEffect(() => {
        const fetchRisk = async () => {
            const allCountries = await MacroService.getCountries();
            const riskies = await Promise.all(allCountries
                .filter(c => c.riskScore > 50)
                .map(async c => ({
                    ...c,
                    data: (await MacroService.getLatestIndicators(c.id))!
                }))
            );
            setHighRiskCountries(riskies.sort((a, b) => b.riskScore - a.riskScore));
        };
        fetchRisk();
    }, []);

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) 1fr', gap: '24px' }}>
            <div>
                <h2 className="text-xl" style={{ marginBottom: '16px' }}>Contagion Risk Map</h2>
                <div className="panel" style={{ height: '400px', position: 'relative', overflow: 'hidden', background: '#0d1117' }}>
                    <div style={{ position: 'absolute', top: '20px', left: '20px', color: 'var(--text-secondary)' }}>
                        Regional Spillover Analysis (Node Network)
                    </div>

                    {/* Simplified CSS Node Graph Visualization */}
                    <div style={{
                        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        {/* Central Node */}
                        <div style={{
                            width: '100px', height: '100px', borderRadius: '50%', border: '2px solid var(--accent-red)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'rgba(218, 54, 51, 0.1)',
                            zIndex: 2
                        }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontWeight: 700 }}>TUR</div>
                                <div style={{ fontSize: '10px' }}>Epicenter</div>
                            </div>
                        </div>

                        {/* Spillover Lines */}
                        <div style={{ position: 'absolute', width: '200px', height: '2px', background: 'var(--bg-tertiary)', transform: 'rotate(0deg)' }}></div>
                        <div style={{ position: 'absolute', width: '200px', height: '2px', background: 'var(--bg-tertiary)', transform: 'rotate(120deg)' }}></div>
                        <div style={{ position: 'absolute', width: '200px', height: '2px', background: 'var(--bg-tertiary)', transform: 'rotate(240deg)' }}></div>

                        {/* Satellite Nodes */}
                        <div style={{ position: 'absolute', transform: 'translate(140px, 0)' }}>
                            <div className="panel" style={{ padding: '8px', border: '1px solid var(--accent-orange)' }}>ZAF</div>
                        </div>
                        <div style={{ position: 'absolute', transform: 'translate(-70px, 120px)' }}>
                            <div className="panel" style={{ padding: '8px', border: '1px solid var(--accent-orange)' }}>BRA</div>
                        </div>
                        <div style={{ position: 'absolute', transform: 'translate(-70px, -120px)' }}>
                            <div className="panel" style={{ padding: '8px', border: '1px dotted var(--text-tertiary)' }}>MXN</div>
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <h2 className="text-xl" style={{ marginBottom: '16px' }}>Early Warning Signals</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {highRiskCountries.map(c => (
                        <div key={c.id} className="panel" style={{ borderLeft: c.riskScore > 80 ? '4px solid var(--status-critical)' : '4px solid var(--status-warning)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ fontWeight: 700 }}>{c.name}</span>
                                <span style={{ color: c.riskScore > 80 ? 'var(--status-critical)' : 'var(--status-warning)' }}>
                                    {c.riskScore}/100 Risk
                                </span>
                            </div>

                            <div style={{ display: 'flex', gap: '12px', fontSize: '12px' }}>
                                <div style={{ flex: 1 }}>
                                    <div className="text-muted">Gov. Debt/GDP</div>
                                    <div className="text-xl" style={{ fontWeight: 700 }}>{(c.data.govDebtToGdp ?? 0).toFixed(0)}%</div>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div className="text-muted">Reserves</div>
                                    <div style={{ fontWeight: 600 }}>${(c.data.fxReservesBillions ?? 0).toFixed(0)}B</div>
                                </div>
                            </div>

                            <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--bg-tertiary)', fontSize: '11px', display: 'flex', gap: '4px' }}>
                                <ShieldAlert size={12} />
                                <span>High probability of capital controls if USD/{c.currency} exceeds threshold.</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
