import React from 'react';

interface DetailedLegendProps {
    visibleMetrics: Set<string>;
}

export const DetailedLegend: React.FC<DetailedLegendProps> = ({ visibleMetrics }) => {
    const legendData = [
        {
            group: 'ACTIVITY',
            description: 'Real economy drivers: growth, size, and standard of living.',
            metrics: [
                { abbr: 'GDP YoY', name: 'Real GDP Growth', unit: '% (YoY)', note: 'Avg: 3.4% (2025E)' },
                { abbr: 'NOM GDP', name: 'Nominal GDP', unit: '$B (Current USD)', note: 'Economic size' },
                { abbr: 'GDP/CAP', name: 'GDP Per Capita', unit: '$ (Current)', note: 'Standard of living' },
                { abbr: 'PVT CONS', name: 'Private Consumption', unit: '% Growth', note: 'Consumer activity' },
                { abbr: 'FIX INV', name: 'Fixed Investment', unit: '% Growth', note: 'Business investment' },
                { abbr: 'POP (M)', name: 'Total Population', unit: 'Millions', note: 'Market size' }
            ]
        },
        {
            group: 'EXTERNAL',
            description: 'Balance of payments, trade competitiveness, and currency buffers.',
            metrics: [
                { abbr: 'CA/GDP', name: 'Current Account/GDP', unit: '%', note: 'Balance of payments' },
                { abbr: 'TRD BAL', name: 'Trade Balance', unit: '$B (USD)', note: 'Exports minus imports' },
                { abbr: 'FDI %', name: 'FDI Inflows/GDP', unit: '%', note: 'Foreign investment' },
                { abbr: 'EXT DEBT', name: 'External Debt/GDP', unit: '%', note: 'Crisis risk: >100%' },
                { abbr: 'FX RES', name: 'FX Reserves', unit: '$B (USD)', note: 'Liquidity buffer' },
                { abbr: 'IMP COV', name: 'Import Coverage', unit: 'Months', note: 'Critical: < 3 months' }
            ]
        },
        {
            group: 'FISCAL',
            description: 'Government revenue, spending, and debt sustainability.',
            metrics: [
                { abbr: 'FISC BAL', name: 'Fiscal Balance/GDP', unit: '%', note: 'Deficit if negative' },
                { abbr: 'DEBT/GDP', name: 'Public Debt/GDP', unit: '%', note: 'Avg: 95% (2025E)' },
                { abbr: 'OIL REV', name: 'Resource Revenues', unit: '% of Revenue', note: 'Budget volatility' }
            ]
        },
        {
            group: 'PRICES',
            description: 'Monetary stability, inflation control, and currency valuation.',
            metrics: [
                { abbr: 'CPI', name: 'Consumer Prices', unit: '% (YoY)', note: 'Avg: 4.2% (2025E)' },
                { abbr: 'FX RATE', name: 'Exchange Rate', unit: 'LCU per USD', note: 'Currency value' },
                { abbr: 'REAL RATE', name: 'Real interest Rate', unit: '%', note: 'Lending rate - Inflation' }
            ]
        },
        {
            group: 'BANKING',
            description: 'Financial system health and capital adequacy.',
            metrics: [
                { abbr: 'CAP/AST', name: 'Bank Cap. to Assets', unit: '%', note: 'Safety buffer: >8%' }
            ]
        }
    ];

    // Filter groups to only show those that have at least one visible metric
    const filteredLegend = legendData.map(group => ({
        ...group,
        metrics: group.metrics.filter(m => {
            // Check if any of our internal keys map to the visible metrics
            // We need a mapping or we can just check if the label-based abbr is relevant
            // Actually, the visibleMetrics set contains keys like 'gdpGrowth'
            // We should map them.
            const metricMap: Record<string, string> = {
                'gdpGrowth': 'GDP YoY',
                'nominalGdp': 'NOM GDP',
                'gdpPerCapita': 'GDP/CAP',
                'privateConsumption': 'PVT CONS',
                'fixedInvestment': 'FIX INV',
                'population': 'POP (M)',
                'currentAccountToGdp': 'CA/GDP',
                'tradeBalanceVal': 'TRD BAL',
                'fdi': 'FDI %',
                'externalDebt': 'EXT DEBT',
                'fxReservesBillions': 'FX RES',
                'importCoverage': 'IMP COV',
                'fiscalBalance': 'FISC BAL',
                'govDebtToGdp': 'DEBT/GDP',
                'oilGasRevenue': 'OIL REV',
                'cpiYoY': 'CPI',
                'exchangeRate': 'FX RATE',
                'realInterestRate': 'REAL RATE',
                'bankCapitalToAssets': 'CAP/AST'
            };

            return Object.entries(metricMap).some(([key, abbr]) =>
                visibleMetrics.has(key) && abbr === m.abbr
            );
        })
    })).filter(group => group.metrics.length > 0);

    return (
        <div style={{
            marginTop: '24px',
            padding: '16px',
            border: '1px solid var(--bg-tertiary)',
            background: '#0a0a0a',
            borderRadius: '4px'
        }}>
            <div style={{
                fontSize: '12px',
                fontWeight: 'bold',
                color: 'var(--text-primary)',
                marginBottom: '16px',
                borderBottom: '1px solid var(--text-secondary)',
                paddingBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '1px'
            }}>
                INDICATOR DEFINITIONS, UNITS & BENCHMARKS
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                {filteredLegend.map((group) => (
                    <div key={group.group} style={{ borderLeft: '2px solid var(--bg-tertiary)', paddingLeft: '12px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '12px' }}>
                            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 'bold', textTransform: 'uppercase' }}>{group.group}</span>
                            <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontStyle: 'italic', marginTop: '2px' }}>{group.description}</span>
                        </div>
                        <table style={{ width: '100%', fontSize: '11px', color: 'var(--text-tertiary)', borderCollapse: 'collapse' }}>
                            <tbody>
                                {group.metrics.map((m) => (
                                    <tr key={m.abbr} style={{ borderBottom: '1px solid #1a1a1a' }}>
                                        <td style={{ padding: '6px 0', width: '70px', color: 'var(--text-primary)', fontWeight: 'bold' }}>{m.abbr}</td>
                                        <td style={{ padding: '6px 8px' }}>{m.name} <span style={{ opacity: 0.6, fontSize: '9px' }}>({m.unit})</span></td>
                                        <td style={{ padding: '6px 0', textAlign: 'right', fontSize: '10px', color: 'var(--accent-amber)' }}>{m.note}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: '16px', fontSize: '9px', color: 'var(--text-tertiary)', textAlign: 'right', opacity: 0.7 }}>
                * Benchmarks sourced from IMF World Economic Outlook (Latest 2025 Estimates).
            </div>
        </div>
    );
};
