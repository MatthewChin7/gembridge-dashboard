import { Country, MacroIndicator } from '../../types';

interface HeatmapProps {
    data: { country: Country; indicator: MacroIndicator }[];
    metric: keyof MacroIndicator;
}

export const Heatmap = ({ data, metric }: HeatmapProps) => {
    // Sort by the metric
    const sortedData = [...data].sort((a, b) => (b.indicator[metric] as number) - (a.indicator[metric] as number));

    const getColor = (value: number) => {
        // Basic heatmap logic - needs refinement for specific metrics
        // Assuming for now higher is "hotter" or more extreme
        // This is just a visual demo
        return 'var(--bg-tertiary)';
    };

    return (
        <div className="panel">
            <div className="panel-header">Relative Value Map: {metric}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '4px' }}>
                {sortedData.map(({ country, indicator }) => {
                    const val = indicator[metric] as number;
                    return (
                        <div
                            key={country.id}
                            style={{
                                padding: '12px',
                                background: getColor(val),
                                border: '1px solid var(--bg-tertiary)',
                                textAlign: 'center'
                            }}
                        >
                            <div style={{ fontWeight: 700 }}>{country.id}</div>
                            <div className="text-sm">{val.toFixed(1)}</div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
