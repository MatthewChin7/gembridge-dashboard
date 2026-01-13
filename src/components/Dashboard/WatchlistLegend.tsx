import React from 'react';

export const WatchlistLegend: React.FC = () => {
    const classifications = [
        {
            status: 'Developed',
            definition: 'High financial stability, mature markets.',
            logic: 'World Bank High Income (HIC) status + No lending assistance (LNX).',
            color: 'var(--text-primary)'
        },
        {
            status: 'Emerging',
            definition: 'Major middle-income economies with maturing financial sectors.',
            logic: 'Select G20/BRICS/OECD members not in HIC-LNX (e.g. BRA, CHN, TUR, ZAF).',
            color: 'var(--accent-green)'
        },
        {
            status: 'Developing',
            definition: 'Other middle-income economies on path to maturity.',
            logic: 'Standard World Bank Middle Income Status (MIC) not on Emerging list.',
            color: 'var(--accent-amber)'
        },
        {
            status: 'Frontier',
            definition: 'Lower income or pre-emerging high-potential markets.',
            logic: 'World Bank Low Income (LIC) status or IDA lending assistance.',
            color: 'var(--accent-red)'
        }
    ];

    return (
        <div style={{
            marginTop: '16px',
            padding: '12px',
            border: '1px solid var(--bg-tertiary)',
            background: '#0a0a0a',
            fontFamily: 'var(--font-mono)'
        }}>
            <div style={{
                fontSize: '11px',
                fontWeight: 'bold',
                color: 'var(--text-secondary)',
                marginBottom: '12px',
                borderBottom: '1px solid var(--bg-tertiary)',
                paddingBottom: '4px',
                textTransform: 'uppercase'
            }}>
                Economic Classification & Methodology
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                {classifications.map((item) => (
                    <div key={item.status}>
                        <div style={{ fontSize: '11px', color: item.color, fontWeight: 'bold', marginBottom: '4px' }}>
                            {item.status.toUpperCase()}
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--text-primary)', marginBottom: '4px' }}>
                            {item.definition}
                        </div>
                        <div style={{ fontSize: '9px', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                            Logic: {item.logic}
                        </div>
                    </div>
                ))}
            </div>

            <div style={{
                marginTop: '12px',
                paddingTop: '8px',
                borderTop: '1px solid #1a1a1a',
                fontSize: '9px',
                color: 'var(--text-tertiary)',
                display: 'flex',
                justifyContent: 'space-between'
            }}>
                <span>Source: World Bank Dynamic Metadata API (Live)</span>
                <span>Last Updated: July 2025 Classifications (Latest as of Jan 2026)</span>
            </div>
        </div>
    );
};
