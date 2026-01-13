import { useEffect, useState } from 'react';
import { MacroService } from '../services/api';
import { Country, MacroIndicator } from '../types';
import { DataGrid } from '../components/Analytics/DataGrid';
import { DataLegend } from '../components/Analytics/DataLegend';
import { Heatmap } from '../components/Analytics/Heatmap';

export const ComparativeAnalytics = () => {
    const [data, setData] = useState<{ country: Country; data: MacroIndicator }[]>([]);
    const [sortConfig, setSortConfig] = useState<{ key: keyof MacroIndicator; direction: 'asc' | 'desc' } | null>(null);
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['Developed', 'Emerging', 'Developing', 'Frontier']);

    useEffect(() => {
        const fetchData = async () => {
            const countries = await MacroService.getCountries();
            const rows = await Promise.all(countries.map(async (c) => {
                const d = await MacroService.getLatestIndicators(c.id);
                return d ? { country: c, data: d } : null;
            }));
            setData(rows.filter((r): r is { country: Country; data: MacroIndicator } => r !== null));
        };
        fetchData();
    }, []);

    const toggleStatus = (status: string) => {
        if (status === 'ALL') {
            setSelectedStatuses(['Developed', 'Emerging', 'Developing', 'Frontier']);
            return;
        }
        setSelectedStatuses(prev =>
            prev.includes(status)
                ? prev.filter(s => s !== status)
                : [...prev, status]
        );
    };

    const handleSort = (key: keyof MacroIndicator) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const filteredData = data.filter(d => {
        if (!d.country.developmentStatus) return true; // Show if untagged
        return selectedStatuses.includes(d.country.developmentStatus);
    });

    const sortedData = [...filteredData].sort((a, b) => {
        if (!sortConfig) return 0;
        const { key, direction } = sortConfig;

        let valA: number = 0;
        let valB: number = 0;

        if (key) {
            // Handle potentially undefined macro fields safely
            valA = (a.data[key] as number) || 0;
            valB = (b.data[key] as number) || 0;
        }

        if (valA < valB) return direction === 'asc' ? -1 : 1;
        if (valA > valB) return direction === 'asc' ? 1 : -1;
        return 0;
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
                <h2 className="text-xl" style={{ marginBottom: '16px' }}>Comparative Analytics</h2>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-primary">Table View</button>
                        <button className="btn">Heatmap View</button>
                    </div>
                    <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-tertiary)', padding: '2px', borderRadius: '4px' }}>
                        <button
                            onClick={() => toggleStatus('ALL')}
                            style={{
                                padding: '4px 12px',
                                fontSize: '11px',
                                border: 'none',
                                background: selectedStatuses.length === 4 ? 'var(--text-primary)' : 'transparent',
                                color: selectedStatuses.length === 4 ? '#000' : 'var(--text-secondary)',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                borderRadius: '2px'
                            }}
                        >
                            ALL
                        </button>
                        {['Developed', 'Emerging', 'Developing', 'Frontier'].map(status => (
                            <button
                                key={status}
                                onClick={() => toggleStatus(status)}
                                style={{
                                    padding: '4px 12px',
                                    fontSize: '11px',
                                    border: 'none',
                                    background: selectedStatuses.includes(status) ? 'var(--text-primary)' : 'transparent',
                                    color: selectedStatuses.includes(status) ? '#000' : 'var(--text-secondary)',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    borderRadius: '2px'
                                }}
                            >
                                {status.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <DataGrid rows={filteredData} sortedData={sortedData} handleSort={handleSort} />
            <DataLegend />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <Heatmap
                    data={data.map(d => ({ country: d.country, indicator: d.data }))}
                    metric="cpiYoY"
                />
                <Heatmap
                    data={data.map(d => ({ country: d.country, indicator: d.data }))}
                    metric="policyRate"
                />
            </div>
        </div>
    );
};
