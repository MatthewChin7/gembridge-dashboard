import { useEffect, useState } from 'react';
import { MacroService } from '../services/api';
import { Country, MacroIndicator } from '../types';
import { DataGrid } from '../components/Analytics/DataGrid';
import { Heatmap } from '../components/Analytics/Heatmap';

export const ComparativeAnalytics = () => {
    const [data, setData] = useState<{ country: Country; data: MacroIndicator }[]>([]);
    const [sortConfig, setSortConfig] = useState<{ key: keyof MacroIndicator | 'riskScore'; direction: 'asc' | 'desc' } | null>(null);

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

    const handleSort = (key: keyof MacroIndicator | 'riskScore') => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedData = [...data].sort((a, b) => {
        if (!sortConfig) return 0;
        const { key, direction } = sortConfig;

        let valA: number = 0;
        let valB: number = 0;

        if (key === 'riskScore') {
            valA = a.country.riskScore;
            valB = b.country.riskScore;
        } else {
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
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                    <button className="btn btn-primary">Table View</button>
                    <button className="btn">Heatmap View</button>
                    <button className="btn">Scatter Plot</button>
                </div>
            </div>

            <DataGrid rows={data} sortedData={sortedData} handleSort={handleSort} />

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
