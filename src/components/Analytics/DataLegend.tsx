import React from 'react';

export const DataLegend: React.FC = () => {
    const legendData = [
        { abbr: 'GDP%', name: 'Real GDP Growth', unit: '% (YoY)', avg: '3.2%', note: 'High: >4%, Low: <1%' },
        { abbr: 'Inflation', name: 'CPI Inflation', unit: '% (YoY)', avg: '5.8%', note: 'Target: 2%, Critical: >10%' },
        { abbr: 'Debt%', name: 'Gov Gross Debt/GDP', unit: '%', avg: '93.3%', note: 'Warning: >60-80%' },
        { abbr: 'Fiscal%', name: 'Fiscal Balance/GDP', unit: '%', avg: '-5.5%', note: 'Negative = Deficit' },
        { abbr: 'CA%', name: 'Current Account/GDP', unit: '%', avg: '0.0%', note: 'Risk: < -3% (Chronic)' },
        { abbr: 'FX Res', name: 'FX Reserves', unit: '$B (USD)', avg: '-', note: 'Currency security buffer' }
    ];

    return (
        <div className="panel" style={{ marginTop: '16px', padding: '12px' }}>
            <div className="panel-header" style={{ marginBottom: '8px' }}>DATA KEY & GLOBAL BENCHMARKS</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', color: 'var(--text-tertiary)' }}>
                <thead>
                    <tr style={{ textAlign: 'left', color: 'var(--text-secondary)', borderBottom: '1px solid var(--bg-tertiary)' }}>
                        <th style={{ padding: '4px' }}>ABBR.</th>
                        <th style={{ padding: '4px' }}>INDICATOR NAME</th>
                        <th style={{ padding: '4px' }}>UNIT</th>
                        <th style={{ padding: '4px' }}>GLOBAL AVG (2024)</th>
                        <th style={{ padding: '4px' }}>BENCHMARKS / NOTES</th>
                    </tr>
                </thead>
                <tbody>
                    {legendData.map((item) => (
                        <tr key={item.abbr} style={{ borderBottom: '1px solid #111' }}>
                            <td style={{ padding: '6px 4px', color: 'var(--text-primary)', fontWeight: 'bold' }}>{item.abbr}</td>
                            <td style={{ padding: '6px 4px' }}>{item.name}</td>
                            <td style={{ padding: '6px 4px' }}>{item.unit}</td>
                            <td style={{ padding: '6px 4px', color: 'var(--accent-mint)' }}>{item.avg}</td>
                            <td style={{ padding: '6px 4px', fontSize: '10px' }}>{item.note}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div style={{ marginTop: '12px', fontSize: '10px', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                * Global averages based on weighted mean projections from IMF World Economic Outlook (April 2024).
            </div>
        </div>
    );
};
