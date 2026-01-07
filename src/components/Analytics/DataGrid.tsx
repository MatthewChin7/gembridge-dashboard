import { Country, MacroIndicator } from '../../types';

interface DataGridProps {
    rows: { country: Country; data: MacroIndicator }[];
    sortedData: { country: Country; data: MacroIndicator }[]; // Passed from parent
    handleSort: (key: keyof MacroIndicator) => void;
}

export const DataGrid = ({ sortedData, handleSort }: DataGridProps) => {
    return (
        <div className="panel" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                    <tr style={{ borderBottom: '1px solid var(--bg-tertiary)', textAlign: 'right' }}>
                        <th style={{ textAlign: 'left', padding: '8px' }}>Country</th>
                        <th onClick={() => handleSort('gdpGrowth')} style={{ cursor: 'pointer', padding: '8px' }}>GDP%</th>
                        <th onClick={() => handleSort('cpiYoY')} style={{ cursor: 'pointer', padding: '8px' }}>Inflation</th>
                        <th onClick={() => handleSort('govDebtToGdp')} style={{ cursor: 'pointer', padding: '8px' }}>Debt%</th>
                        <th onClick={() => handleSort('fiscalBalance')} style={{ cursor: 'pointer', padding: '8px' }}>Fiscal%</th>
                        <th onClick={() => handleSort('currentAccountToGdp')} style={{ cursor: 'pointer', padding: '8px' }}>CA%</th>
                        <th onClick={() => handleSort('fxReservesBillions')} style={{ cursor: 'pointer', padding: '8px' }}>FX Res</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedData.map(({ country, data }) => (
                        <tr key={country.id} style={{ borderBottom: '1px solid var(--bg-tertiary)' }}>
                            <td style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontWeight: 600 }}>{country.id}</span>
                                <span className="text-muted">{country.name}</span>
                            </td>
                            <td style={{ padding: '8px', textAlign: 'right', color: (data.gdpGrowth || 0) < 0 ? 'var(--accent-red)' : 'var(--text-primary)' }}>
                                {data.gdpGrowth?.toFixed(1) ?? '-'}%
                            </td>
                            <td style={{ padding: '8px', textAlign: 'right', color: (data.cpiYoY || 0) > 10 ? 'var(--accent-red)' : 'var(--text-primary)' }}>
                                {data.cpiYoY?.toFixed(1) ?? '-'}%
                            </td>
                            <td style={{ padding: '8px', textAlign: 'right' }}>
                                {data.govDebtToGdp?.toFixed(0) ?? '-'}%
                            </td>
                            <td style={{ padding: '8px', textAlign: 'right', color: (data.fiscalBalance || 0) < -3 ? 'var(--accent-amber)' : 'var(--text-primary)' }}>
                                {data.fiscalBalance?.toFixed(1) ?? '-'}%
                            </td>
                            <td style={{ padding: '8px', textAlign: 'right', color: (data.currentAccountToGdp || 0) < -2 ? 'var(--accent-red)' : 'var(--text-primary)' }}>
                                {data.currentAccountToGdp?.toFixed(1) ?? '-'}%
                            </td>
                            <td style={{ padding: '8px', textAlign: 'right' }}>
                                ${data.fxReservesBillions?.toFixed(1) ?? '-'}B
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
