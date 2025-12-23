import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MacroIndicator } from '../../types';

interface MacroChartProps {
    data: MacroIndicator[];
    dataKey: keyof MacroIndicator;
    color?: string;
    title: string;
}

export const MacroChart = ({ data, dataKey, color = '#58a6ff', title }: MacroChartProps) => {
    // Sort data by date
    const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Format dates for XAxis
    const formattedData = sortedData.map(d => ({
        ...d,
        displayDate: new Date(d.date).toLocaleDateString(undefined, { month: 'short', year: '2-digit' })
    }));

    return (
        <div className="panel" style={{ height: '300px', display: 'flex', flexDirection: 'column' }}>
            <div className="panel-header">{title}</div>
            <div style={{ flex: 1, minHeight: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={formattedData}>
                        <defs>
                            <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={color} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--bg-tertiary)" vertical={false} />
                        <XAxis
                            dataKey="displayDate"
                            tick={{ fill: 'var(--text-secondary)', fontSize: 10 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            tick={{ fill: 'var(--text-secondary)', fontSize: 10 }}
                            axisLine={false}
                            tickLine={false}
                            orientation="right"
                        />
                        <Tooltip
                            contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--bg-tertiary)', fontSize: '12px' }}
                            itemStyle={{ color: 'var(--text-primary)' }}
                        />
                        <Area
                            type="monotone"
                            dataKey={dataKey}
                            stroke={color}
                            fill={`url(#gradient-${dataKey})`}
                            strokeWidth={2}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
