import { Calendar as CalendarIcon, Clock } from 'lucide-react';

export const EventCalendar = () => {
    // Mock calendar events
    const events = [
        { id: 1, country: 'TUR', time: '14:00', event: 'Interest Rate Decision', impact: 'HIGH', forecast: '45.0%', previous: '42.5%' },
        { id: 2, country: 'USA', time: '15:30', event: 'Core PCE Price Index', impact: 'HIGH', forecast: '0.3%', previous: '0.3%' },
        { id: 3, country: 'BRA', time: '18:00', event: 'Trade Balance', impact: 'MEDIUM', forecast: '$2.1B', previous: '$1.8B' },
        { id: 4, country: 'ZAF', time: 'Tomorrow', event: 'Inflation Rate YoY', impact: 'MEDIUM', forecast: '5.4%', previous: '5.5%' },
    ];

    return (
        <div>
            <h2 className="text-xl" style={{ marginBottom: '16px' }}>Macro Event Calendar</h2>

            <div className="panel">
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--bg-tertiary)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                            <th style={{ padding: '12px' }}>Time</th>
                            <th style={{ padding: '12px' }}>Country</th>
                            <th style={{ padding: '12px' }}>Event</th>
                            <th style={{ padding: '12px' }}>Impact</th>
                            <th style={{ padding: '12px', textAlign: 'right' }}>Forecast</th>
                            <th style={{ padding: '12px', textAlign: 'right' }}>Previous</th>
                        </tr>
                    </thead>
                    <tbody>
                        {events.map(ev => (
                            <tr key={ev.id} style={{ borderBottom: '1px solid var(--bg-tertiary)' }}>
                                <td style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Clock size={12} className="text-muted" />
                                    <span className="text-mono">{ev.time}</span>
                                </td>
                                <td style={{ padding: '12px', fontWeight: 600 }}>{ev.country}</td>
                                <td style={{ padding: '12px' }}>{ev.event}</td>
                                <td style={{ padding: '12px' }}>
                                    <span style={{
                                        padding: '2px 6px',
                                        borderRadius: '4px',
                                        fontSize: '11px',
                                        fontWeight: 700,
                                        backgroundColor: ev.impact === 'HIGH' ? 'rgba(218, 54, 51, 0.2)' : 'rgba(210, 153, 34, 0.2)',
                                        color: ev.impact === 'HIGH' ? 'var(--status-critical)' : 'var(--accent-orange)'
                                    }}>
                                        {ev.impact}
                                    </span>
                                </td>
                                <td style={{ padding: '12px', textAlign: 'right' }} className="text-mono">{ev.forecast}</td>
                                <td style={{ padding: '12px', textAlign: 'right', color: 'var(--text-secondary)' }} className="text-mono">{ev.previous}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
