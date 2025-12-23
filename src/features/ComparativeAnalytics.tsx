import { useEffect, useState } from 'react';
import { MacroService } from '../../services/api';
import { Country, MacroIndicator } from '../../types';
import { DataGrid } from '../../components/Analytics/DataGrid';
import { Heatmap } from '../../components/Analytics/Heatmap';

export const ComparativeAnalytics = () => {
    const [data, setData] = useState<{ country: Country; data: MacroIndicator }[]>([]);

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

            <DataGrid rows={data} />

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
