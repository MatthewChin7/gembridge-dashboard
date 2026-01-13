import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MacroIndicator } from '../../types';

interface MetricConfig {
    key: keyof MacroIndicator | string;
    color: string;
    label: string;
    yAxisId?: 'left' | 'right';
}

interface MacroChartProps {
    data: MacroIndicator[];
    metrics?: MetricConfig[]; // New multi-metric prop
    dataKey?: keyof MacroIndicator; // Backward compatibility
    color?: string; // Backward compatibility
    title: string;
}

export const MacroChart = ({ data, metrics, dataKey, color = '#ff9900', title }: MacroChartProps) => {
    // Sort data by date
    const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Normalize metrics: Use provided list or fallback to single
    const activeMetrics: MetricConfig[] = metrics || (dataKey ? [{ key: dataKey, color, label: dataKey, yAxisId: 'right' }] : []);

    // Check if we need both axes
    const hasLeftAxis = activeMetrics.some(m => m.yAxisId === 'left');
    const hasRightAxis = activeMetrics.some(m => m.yAxisId === 'right' || !m.yAxisId);

    const formattedData = sortedData.map((d) => {
        const displayDate = new Date(d.date).toLocaleDateString(undefined, { month: 'short', year: '2-digit' }).toUpperCase();
        const year = new Date(d.date).getFullYear();
        // Heuristic: IMF WEO forecasts or years >= 2025 (adjust as needed for current date)
        // Adjusting logic: IMF data often labels source as 'IMF WEO Forecast'. 
        // We'll treat anything >= 2025 as forecast if source isn't explicit, just to be safe visually.
        const isForecast = d.source?.includes('Forecast') || year >= 2025;

        return {
            ...d,
            displayDate,
            isForecast,
            timestamp: new Date(d.date).getTime()
        };
    });

    // Second pass to populate historical vs projected fields and ensure connectivity
    // We need to iterate and modify the objects to split the metrics
    const chartData = formattedData.map((row) => {
        const newRow: any = { ...row };

        activeMetrics.forEach(m => {
            const key = m.key as string;
            const val = row[key as keyof MacroIndicator];

            if (val === null || val === undefined) return;

            if (row.isForecast) {
                // It's a projection value
                newRow[`${key}_proj`] = val;
                newRow[key] = null; // Don't show in historical line

                // CONNECTIVITY:
                // If the PREVIOUS point was Historical, we need that point to ALSO be the start of this projection line
                // to draw the segment joining them.
                // We modify the PREVIOUS row in the `formattedData` array (reference) ? 
                // No, map returns new objects. We should look back at the *source* or processed array.
                // Mutating the array we are building is tricky in .map.

                // Better approach: Mutate `formattedData` in place or use a for loop.
                // Let's use a for loop for clarity and correctness.
            } else {
                // Historical
                newRow[key] = val;
                newRow[`${key}_proj`] = null;
            }
        });
        return newRow;
    });

    // Fix Connectivity: If index i is Projection and i-1 was Historical, copy i-1 Value to i-1 Projection
    for (let i = 1; i < chartData.length; i++) {
        const row = chartData[i];
        const prevRow = chartData[i - 1];

        // If current row is start of forecast (or just is forecast), and prev row has valid historical data
        if (row.isForecast) {
            activeMetrics.forEach(m => {
                const key = m.key as string;
                // If we have a projection value at current...
                if (row[`${key}_proj`] != null) {
                    // Check if previous row has historical value
                    if (prevRow[key] != null) {
                        // Copy historical value to previous row's projection field
                        // This makes the dotted line start at the last solid point
                        prevRow[`${key}_proj`] = prevRow[key];
                    }
                }
            });
        }
    }

    return (
        <div style={{ height: '350px', display: 'flex', flexDirection: 'column', background: '#000', border: '1px solid #333', position: 'relative' }}>
            {/* Bloomberg Header Bar */}
            <div style={{
                background: '#1a1a1a',
                color: '#ff9900',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                padding: '4px 8px',
                display: 'flex',
                justifyContent: 'space-between',
                borderBottom: '1px solid #333'
            }}>
                <span>{title.toUpperCase()}</span>
            </div>

            {/* Custom Legend Overlay (Top Left inside grid) */}
            <div style={{ position: 'absolute', top: '40px', left: '60px', zIndex: 10, pointerEvents: 'none', background: 'rgba(0,0,0,0.7)', padding: '4px' }}>
                {activeMetrics.map(m => (
                    <div key={m.key as string} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                        <div style={{ width: '8px', height: '8px', background: m.color }}></div>
                        <span style={{ color: '#fff', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                            {m.label.toUpperCase()}
                            <span style={{ color: m.color, marginLeft: '8px' }}>
                                {/* Show last value if available */}
                                {chartData.length > 0 ?
                                    (Number(chartData[chartData.length - 1][`${m.key}_proj`] ?? chartData[chartData.length - 1][m.key as string]))?.toFixed(2)
                                    : ''}
                            </span>
                        </span>
                    </div>
                ))}
            </div>

            <div style={{ flex: 1, minHeight: 0, paddingRight: '16px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="1 1" stroke="#333" vertical={true} horizontal={true} />
                        <XAxis
                            dataKey="displayDate"
                            tick={{ fill: '#999', fontSize: 10, fontFamily: 'var(--font-mono)' }}
                            axisLine={{ stroke: '#333' }}
                            tickLine={{ stroke: '#333' }}
                            interval="preserveStartEnd"
                        />

                        {/* Left Axis (Percentages usually) */}
                        {hasLeftAxis && (
                            <YAxis
                                yAxisId="left"
                                tick={{ fill: '#999', fontSize: 10, fontFamily: 'var(--font-mono)' }}
                                axisLine={false}
                                tickLine={{ stroke: '#333' }}
                                orientation="left"
                                width={40}
                                domain={['auto', 'auto']}
                            />
                        )}

                        {/* Right Axis (Absolute values) */}
                        {hasRightAxis && (
                            <YAxis
                                yAxisId="right"
                                tick={{ fill: '#999', fontSize: 10, fontFamily: 'var(--font-mono)' }}
                                axisLine={false}
                                tickLine={{ stroke: '#333' }}
                                orientation="right"
                                width={40}
                                domain={['auto', 'auto']}
                            />
                        )}

                        <Tooltip
                            contentStyle={{
                                background: '#000',
                                border: '1px solid #666',
                                borderRadius: 0,
                                padding: '4px',
                            }}
                            itemStyle={{ fontSize: '11px', fontFamily: 'var(--font-mono)', padding: 0 }}
                            labelStyle={{ color: '#66ccff', fontSize: '11px', marginBottom: '4px', borderBottom: '1px solid #333' }}
                            cursor={{ stroke: '#fff', strokeWidth: 1, strokeDasharray: '2 2' }}
                            // Custom formatter to show consolidated value
                            formatter={(value: any, name: string) => {
                                // Filter out "duplicate" entries if both lines are hovered?
                                // Recharts usually shows all lines.
                                // We can strip "_proj" from name if we want cleaner display, 
                                // but we might want to indicate it's an estimate.
                                const cleanName = name.replace('_proj', ' (E)');
                                return [typeof value === 'number' ? value.toFixed(2) : value, cleanName];
                            }}
                        />

                        {activeMetrics.map(m => (
                            <Line
                                key={m.key as string}
                                yAxisId={m.yAxisId || 'right'}
                                type="linear"
                                dataKey={m.key as string}
                                stroke={m.color}
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 4, fill: m.color, stroke: '#fff' }}
                                isAnimationActive={false}
                            />
                        ))}

                        {/* Render Projected Lines (Dotted) */}
                        {activeMetrics.map(m => (
                            <Line
                                key={`${m.key}_proj`}
                                yAxisId={m.yAxisId || 'right'}
                                type="linear"
                                dataKey={`${m.key}_proj`}
                                stroke={m.color}
                                strokeWidth={2}
                                strokeDasharray="3 3" // Dotted effect
                                dot={false}
                                activeDot={{ r: 4, fill: m.color, stroke: '#fff' }}
                                isAnimationActive={false}
                                name={`${m.label} (E)`} // Label for tooltip
                                legendType="none" // Don't duplicate in legend (we use custom legend anyway)
                            />
                        ))}

                        {/* Render Global Average Lines (Dotted and Thinner) */}
                        {activeMetrics.map(m => (
                            <Line
                                key={`${m.key}_avg`}
                                yAxisId={m.yAxisId || 'right'}
                                type="linear"
                                dataKey={`${m.key}_avg`}
                                stroke={m.color}
                                strokeWidth={1}
                                strokeDasharray="2 2"
                                dot={false}
                                isAnimationActive={false}
                                name={`Global ${m.label}`}
                                legendType="none"
                            />
                        ))}
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
