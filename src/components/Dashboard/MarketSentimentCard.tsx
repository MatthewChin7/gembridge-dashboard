import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';
// No icons needed

interface Market {
    id: string;
    source: 'Polymarket' | 'Kalshi' | string;
    question: string;
    probability: number;
    outcomes?: string;
    slug?: string;
    price_change_24h?: number;
    last_updated?: string;
}

interface MarketSentimentCardProps {
    market: Market;
}

export const MarketSentimentCard: React.FC<MarketSentimentCardProps> = ({ market }) => {
    const [timeRange, setTimeRange] = useState<'1M' | 'ALL'>('ALL');

    const parsedOutcomes = React.useMemo(() => {
        try {
            if (market.outcomes) {
                const sanitized = market.outcomes.replace(/'/g, '"');
                return JSON.parse(sanitized) as string[];
            }
        } catch (e) {
            console.error("Error parsing outcomes:", e);
        }
        return ["Yes", "No"];
    }, [market.outcomes]);

    const isBinary = parsedOutcomes.length === 2 && (parsedOutcomes.includes("Yes") || parsedOutcomes.includes("No"));

    const [history, setHistory] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchHistory = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`http://localhost:8000/history/${market.id}`);
                const data = await response.json();
                if (data && data.length > 0) {
                    // Enrich data with numeric fields if needed
                    const enriched = data.map((d: any) => {
                        const point = { ...d, timestamp: new Date(d.timestamp).getTime() };
                        return point;
                    });
                    setHistory(enriched);
                } else {
                    setHistory([]);
                }
            } catch (error) {
                console.error("Error fetching market history:", error);
                setHistory([]);
            } finally {
                setIsLoading(false);
            }
        };

        if (market.id.startsWith('poly_')) {
            fetchHistory();
        } else {
            setIsLoading(false);
        }
    }, [market.id]);

    const generateChartData = () => {
        // ... (Seeded random walk as fallback only)
        const points = 100;
        const data = [];
        const now = new Date();
        const intervalMs = (1000 * 60 * 60 * 24) / points; // 1 day window

        // Use market ID to seed randomness for a consistent but unique look
        const seedValue = market.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const seededRandom = (s: number) => {
            const x = Math.sin(s) * 10000;
            return x - Math.floor(x);
        };

        if (isBinary) {
            let currentVal = market.probability;
            for (let i = points - 1; i >= 0; i--) {
                const timestamp = new Date(now.getTime() - (points - 1 - i) * intervalMs);
                data.unshift({
                    timestamp: timestamp.getTime(),
                    "Yes": Number(currentVal.toFixed(2))
                });

                // Random walk step
                const step = (seededRandom(seedValue + i) - 0.5) * 1.5;
                currentVal = Math.max(0, Math.min(100, currentVal + step));
            }
        } else {
            const outcomesState = parsedOutcomes.map((label, idx) => ({
                label,
                current: idx === 0 ? market.probability : (100 - market.probability) / (parsedOutcomes.length - 1)
            }));

            for (let i = points - 1; i >= 0; i--) {
                const timestamp = new Date(now.getTime() - (points - 1 - i) * intervalMs);
                const entry: any = { timestamp: timestamp.getTime() };

                outcomesState.forEach((outcome, idx) => {
                    entry[outcome.label] = Number(outcome.current.toFixed(2));
                    const step = (seededRandom(seedValue + i + idx * 50) - 0.5) * 2;
                    outcome.current = Math.max(0, Math.min(100, outcome.current + step));
                });
                data.unshift(entry);
            }
        }
        return data;
    };

    const filteredHistory = React.useMemo(() => {
        if (!history.length) return [];
        if (timeRange === 'ALL') return history;

        const now = Date.now();
        let cutoff = 0;
        switch (timeRange) {
            case '1M': cutoff = now - 30 * 24 * 60 * 60 * 1000; break;
            default: return history;
        }
        return history.filter(d => d.timestamp >= cutoff);
    }, [history, timeRange]);

    const stats = React.useMemo(() => {
        if (!history.length) return { mav: 0, yav: 0, start: null };
        const now = Date.now();
        const mPts = history.filter(d => d.timestamp >= now - 30 * 24 * 60 * 60 * 1000 && d.Yes !== undefined);
        const yPts = history.filter(d => d.timestamp >= now - 365 * 24 * 60 * 60 * 1000 && d.Yes !== undefined);
        const avg = (p: any[]) => p.length ? p.reduce((s, x) => s + x.Yes, 0) / p.length : market.probability;
        const start = new Date(history[0].timestamp);
        return { mav: avg(mPts), yav: avg(yPts), start };
    }, [history, market.probability]);

    const chartData = filteredHistory.length > 0 ? filteredHistory : generateChartData();
    console.log(`Rendering MarketCard ${market.id}: history=${history.length}, totalData=${chartData.length}`);

    const outcomeColors = ['#3b82f6', '#eab308', '#22d3ee', '#a855f7', '#10b981', '#f43f5e'];

    const COLORS = {
        bg: '#101625',
        text: '#ffffff',
        textSecondary: '#94a3b8',
        border: 'rgba(255, 255, 255, 0.1)',
        bluePrimary: '#3b82f6',
        blueSecondary: '#60a5fa',
        yellow: '#eab308',
        cyan: '#22d3ee',
        grid: '#1e293b'
    };

    const styles = {
        container: {
            backgroundColor: COLORS.bg,
            color: COLORS.text,
            padding: '12px',
            borderRadius: '12px',
            border: `1px solid ${COLORS.border}`,
            marginBottom: '12px',
            fontFamily: 'sans-serif',
            boxShadow: '0 10px 20px -5px rgba(0, 0, 0, 0.5)'
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '8px'
        },
        question: {
            fontSize: '16px',
            fontWeight: '700',
            lineHeight: '1.2',
            margin: '0',
            color: '#fff',
            minHeight: '40px', // Ensure alignment
            display: '-webkit-box',
            WebkitLineClamp: '2',
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            transition: 'color 0.2s ease'
        } as any,
        stats: {
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginTop: '4px',
            marginBottom: '12px'
        },
        chance: {
            fontSize: '24px',
            fontWeight: '700',
            color: '#3b82f6',
            display: 'flex',
            alignItems: 'baseline',
            gap: '6px'
        },
        legend: {
            display: 'flex',
            gap: '16px',
            marginTop: '24px',
            marginBottom: '32px',
            flexWrap: 'wrap' as 'wrap'
        },
        legendItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            color: '#94a3b8',
            fontWeight: '500'
        },
        indicator: (color: string) => ({
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: color
        }),
        chartWrapper: {
            height: '180px',
            width: '100%',
            position: 'relative' as 'relative',
            marginTop: '12px'
        },
        footer: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '16px',
            paddingTop: '12px',
            borderTop: `1px solid ${COLORS.border}`
        },
        timeBox: {
            display: 'flex',
            gap: '4px',
            backgroundColor: 'rgba(30, 41, 59, 0.5)',
            padding: '4px',
            borderRadius: '8px'
        },
        timeBtn: (active: boolean) => ({
            padding: '6px 12px',
            fontSize: '12px',
            fontWeight: '700',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: active ? '#334155' : 'transparent',
            color: active ? '#fff' : '#64748b',
            cursor: 'pointer'
        })
    };

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '4px', overflow: 'hidden', flexShrink: 0, backgroundColor: '#fff', padding: '2px' }}>
                        <img
                            src={market.source === 'Polymarket' ? "https://polymarket.com/favicon.ico" : "https://kalshi.com/favicon.ico"}
                            alt={market.source}
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                    </div>
                    <span style={{ color: COLORS.textSecondary, fontSize: '12px', fontWeight: '600' }}>{market.source.toUpperCase()}</span>
                </div>
            </div>

            <a
                href={market.source === 'Polymarket' ? `https://polymarket.com/event/${market.slug || ''}` : `https://kalshi.com/markets/${market.slug || ''}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none', display: 'block' }}
            >
                <h2 style={{ ...styles.question, marginBottom: '8px', cursor: 'pointer' }}>{market.question}</h2>
            </a>

            {/* Main Prob & Stats */}
            <div style={styles.stats}>
                <div style={styles.chance}>
                    {market.probability.toFixed(0)}% chance
                </div>
                <div style={{ display: 'flex', gap: '12px', marginLeft: '12px', borderLeft: '1px solid #1e293b', paddingLeft: '12px' }}>
                    <div>
                        <div style={{ fontSize: '10px', color: COLORS.textSecondary, textTransform: 'uppercase' }}>30D Avg</div>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: COLORS.blueSecondary }}>{stats.mav.toFixed(1)}%</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '10px', color: COLORS.textSecondary, textTransform: 'uppercase' }}>365D Avg</div>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: COLORS.blueSecondary }}>{stats.yav.toFixed(1)}%</div>
                    </div>
                </div>
            </div>

            {/* Legend */}
            {!isBinary && (
                <div style={styles.legend}>
                    {parsedOutcomes.map((label, idx) => (
                        <div key={label} style={styles.legendItem}>
                            <div style={styles.indicator(outcomeColors[idx % outcomeColors.length])}></div>
                            <span>{label} {idx === 0 ? market.probability.toFixed(1) : ((100 - market.probability) / (parsedOutcomes.length - 1)).toFixed(1)}%</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Chart */}
            <div style={styles.chartWrapper}>
                {isLoading && (
                    <div style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backgroundColor: 'rgba(16, 22, 37, 0.5)',
                        zIndex: 10,
                        borderRadius: '8px'
                    }}>
                        <div className="animate-pulse" style={{ color: COLORS.bluePrimary, fontSize: '10px', fontWeight: '600' }}>LOADING REAL-TIME DATA...</div>
                    </div>
                )}
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 40, left: 0, bottom: 0 }}>
                        <CartesianGrid vertical={false} stroke="#1e293b" strokeDasharray="3 3" />
                        <XAxis
                            dataKey="timestamp"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#475569', fontSize: 10 }}
                            minTickGap={30}
                            tickFormatter={(val) => {
                                const d = new Date(val);
                                const isLongRange = timeRange === 'ALL';
                                return d.toLocaleDateString([], {
                                    month: 'short',
                                    day: 'numeric',
                                    year: isLongRange ? '2-digit' : undefined
                                });
                            }}
                        />
                        <YAxis
                            orientation="right"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#475569', fontSize: 11 }}
                            domain={[0, 100]}
                            tickFormatter={(val) => `${val}%`}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                            labelStyle={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}
                            labelFormatter={(label) => {
                                const d = new Date(label);
                                return d.toLocaleString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: 'numeric',
                                    minute: '2-digit'
                                });
                            }}
                        />
                        {isBinary ? (
                            <Line
                                type="monotone"
                                dataKey="Yes"
                                stroke="#3b82f6"
                                strokeWidth={3}
                                dot={false}
                                connectNulls={true}
                                activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
                            />
                        ) : (
                            parsedOutcomes.map((label, idx) => (
                                <Line
                                    key={label}
                                    type="monotone"
                                    dataKey={label}
                                    stroke={outcomeColors[idx % outcomeColors.length]}
                                    strokeWidth={2}
                                    dot={false}
                                    connectNulls={true}
                                />
                            ))
                        )}
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div style={styles.footer}>
                <div style={styles.timeBox}>
                    {(['1M', 'ALL'] as const).map((r) => (
                        <button key={r} onClick={() => setTimeRange(r)} style={styles.timeBtn(timeRange === r)}>
                            {r}
                        </button>
                    ))}
                </div>
                {stats.start && (
                    <div style={{ fontSize: '10px', color: '#475569', fontFamily: 'var(--font-mono)' }}>
                        DATA SINCE {stats.start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
                    </div>
                )}
            </div>
        </div>
    );
};
