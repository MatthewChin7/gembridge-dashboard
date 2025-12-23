import { useEffect, useState } from 'react';
import { SignalService } from '../services/api';
import { TradeSignal } from '../types';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const TradeSignals = () => {
    const [signals, setSignals] = useState<TradeSignal[]>([]);

    useEffect(() => {
        SignalService.getActiveSignals().then(setSignals);
    }, []);

    return (
        <div>
            <h2 className="text-xl" style={{ marginBottom: '16px' }}>Active Trade Signals</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '16px' }}>
                {signals.map(signal => (
                    <div key={signal.id} className="panel" style={{ borderLeft: `4px solid ${signal.direction === 'LONG' ? 'var(--accent-green)' : 'var(--accent-red)'}` }}>
                        <div className="panel-header">
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                {signal.type.replace('_', ' ')}
                                <span style={{
                                    background: 'var(--bg-tertiary)',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    color: 'var(--text-primary)'
                                }}>{signal.asset}</span>
                            </span>
                            <span style={{
                                color: signal.conviction === 'HIGH' ? 'var(--accent-orange)' : 'var(--text-secondary)',
                                fontWeight: 600
                            }}>{signal.conviction} CONVICTION</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <div style={{
                                background: signal.direction === 'LONG' ? 'rgba(63, 185, 80, 0.1)' : 'rgba(248, 81, 73, 0.1)',
                                color: signal.direction === 'LONG' ? 'var(--accent-green)' : 'var(--accent-red)',
                                padding: '8px',
                                borderRadius: '50%'
                            }}>
                                {signal.direction === 'LONG' ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                            </div>
                            <div>
                                <div style={{ fontSize: '16px', fontWeight: 600 }}>{signal.direction} {signal.asset}</div>
                                <div className="text-sm text-muted">Signal detected {new Date(signal.timestamp).toLocaleDateString()}</div>
                            </div>
                        </div>

                        <div className="text-sm" style={{ lineHeight: '1.5' }}>
                            {signal.description}
                        </div>

                        <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--bg-tertiary)', display: 'flex', gap: '8px' }}>
                            <button className="btn btn-primary" style={{ flex: 1 }}>Execute Trade</button>
                            <button className="btn" style={{ flex: 1 }}>Analysis</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
