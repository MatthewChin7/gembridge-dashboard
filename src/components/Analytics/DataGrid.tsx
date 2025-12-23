import { Country, MacroIndicator } from '../../types';

interface DataGridProps {
    rows: { country: Country; data: MacroIndicator }[];
}

export const DataGrid = ({ rows }: DataGridProps) => {
    return (
        <div className="panel" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                    <tr style={{ borderBottom: '1px solid var(--bg-tertiary)', textAlign: 'right' }}>
                        <th style={{ textAlign: 'left', padding: '8px' }}>Country</th>
                        <th style={{ padding: '8px' }}>GDP %</th>
                        <th style={{ padding: '8px' }}>CPI %</th>
                        <th style={{ padding: '8px' }}>Real Rate %</th>
                        <th style={{ padding: '8px' }}>Debt/GDP %</th>
                        <th style={{ padding: '8px' }}>FX Res ($B)</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map(({ country, data }) => (
                        <tr key={country.id} style={{ borderBottom: '1px solid var(--bg-tertiary)' }}>
                            <td style={{ padding: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span className="text-mono" style={{ fontWeight: 600 }}>{country.id}</span>
                                <span className="text-muted">{country.name}</span>
                            </td>
                            <td style={{ padding: '8px', textAlign: 'right', color: data.gdpGrowth < 0 ? 'var(--accent-red)' : 'var(--text-primary)' }}>
                                {data.gdpGrowth.toFixed(1)}
                            </td>
                            <td style={{ padding: '8px', textAlign: 'right', color: data.cpiYoY > 10 ? 'var(--accent-red)' : 'var(--text-primary)' }}>
                                {data.cpiYoY.toFixed(1)}
                            </td>
                            <td style={{ padding: '8px', textAlign: 'right', fontWeight: 600 }}>
                                {(data.policyRate - data.cpiYoY).toFixed(1)}
                            </td>
                            <td style={{ padding: '8px', textAlign: 'right' }}>
                                {data.debtToGdp.toFixed(0)}
                            </td>
                            <td style={{ padding: '8px', textAlign: 'right' }}>
                                {data.fxReservesBillions.toFixed(0)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
