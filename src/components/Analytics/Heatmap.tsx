import { Country, MacroIndicator } from '../../types';

interface HeatmapProps {
    data: { country: Country; indicator: MacroIndicator }[];
    metric: keyof MacroIndicator;
}

export const Heatmap = ({ data, metric }: HeatmapProps) => {
    // Sort by the metric
    const sortedData = [...data].sort((a, b) => (b.indicator[metric] as number) - (a.indicator[metric] as number));

    const getColor = (value: number) => {
        // Heatmap color scale logic
        // Higher values = RED (Risk)
        // Lower values = GREEN (Safe/Growth) depending on metric

        // Normalize roughly 0-10 scale for demo
        if (value > 8) return '#da3633'; // Red
        if (value > 5) return '#d29922'; // Orange
        if (value > 2) return '#238636'; // Green
        return '#388bfd'; // Blue/Neutral
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
