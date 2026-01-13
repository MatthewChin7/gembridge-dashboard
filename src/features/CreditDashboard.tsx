import React, { useState, useEffect, useMemo } from 'react';
import {
    Scatter, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Cell, ComposedChart, Label
} from 'recharts';

interface Bond {
    isin: string;
    ticker: string;
    maturity: number;
    yield: number;
    z_spread: number;
    price: number;
    coupon: number;
    bid_ask: number;
    fitted_yield: number;
    residual: number;
    z_score: number;
}

interface CurvePoint {
    x: number;
    y: number;
}

export const CreditDashboard: React.FC = () => {
    const [bonds, setBonds] = useState<Bond[]>([]);
    const [curve, setCurve] = useState<CurvePoint[]>([]);
    const [curveType, setCurveType] = useState<'NSS' | 'CDS'>('NSS');
    const [isLoading, setIsLoading] = useState(true);
    const [isMockData, setIsMockData] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState('BRAZIL');

    const fetchCreditData = async () => {
        setIsLoading(true);
        try {
            const [bondsRes, curveRes] = await Promise.all([
                fetch(`http://localhost:8000/credit/bonds/${selectedCountry}`),
                fetch(`http://localhost:8000/credit/curve/${selectedCountry}?type=${curveType}`)
            ]);

            const bData = await bondsRes.json();
            const cData = await curveRes.json();

            setBonds(bData);
            setCurve(cData.points || []);
            setIsMockData(cData.is_mock || false);
        } catch (error) {
            console.error("Error fetching credit data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCreditData();
        const interval = setInterval(fetchCreditData, 60000); // Poll every 60s
        return () => clearInterval(interval);
    }, [selectedCountry, curveType]);

    const cheapestBonds = useMemo(() => {
        return [...bonds].sort((a, b) => b.residual - a.residual).slice(0, 5);
    }, [bonds]);

    const COLORS = {
        bg: '#000000',
        text: '#ffffff',
        textSecondary: '#94a3b8',
        cheap: '#3b82f6', // Bright Blue
        rich: '#f43f5e',  // Bright Red
        neutral: '#64748b',
        border: 'rgba(255, 255, 255, 0.1)',
        amber: '#ffb000',
        cyan: '#00ffff'
    };

    const styles = {
        container: {
            background: COLORS.bg,
            color: COLORS.text,
            padding: '16px',
            fontFamily: 'monospace',
            height: '100%',
            overflow: 'auto'
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
            borderBottom: `2px solid ${COLORS.amber}`,
            paddingBottom: '8px'
        },
        toggleGroup: {
            display: 'flex',
            gap: '1px',
            background: '#1e293b',
            padding: '1px',
            borderRadius: '2px'
        },
        toggleBtn: (active: boolean) => ({
            padding: '4px 12px',
            fontSize: '11px',
            border: 'none',
            background: active ? COLORS.cyan : '#000',
            color: active ? '#000' : COLORS.textSecondary,
            cursor: 'pointer',
            fontWeight: 'bold',
            textTransform: 'uppercase' as const
        }),
        chartBox: {
            height: '400px',
            background: '#0a0a0a',
            border: '1px solid #1e293b',
            borderRadius: '4px',
            padding: '16px',
            marginBottom: '24px'
        },
        table: {
            width: '100%',
            borderCollapse: 'collapse' as const,
            fontSize: '11px',
            marginTop: '16px'
        },
        th: {
            textAlign: 'left' as const,
            padding: '8px',
            borderBottom: '1px solid #1e293b',
            color: COLORS.amber,
            textTransform: 'uppercase' as const
        },
        td: {
            padding: '8px',
            borderBottom: '1px solid #0a0a0a'
        },
        cheapHighlight: {
            color: COLORS.cheap,
            fontWeight: 'bold'
        },
        richHighlight: {
            color: COLORS.rich,
            fontWeight: 'bold'
        }
    };

    const getZColor = (z: number) => {
        if (z > 2) return COLORS.cheap;
        if (z < -2) return COLORS.rich;
        return COLORS.neutral;
    };

    return (
        <div style={styles.container}>
            {isMockData && (
                <div style={{
                    background: COLORS.amber,
                    color: '#000',
                    padding: '4px 12px',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    marginBottom: '12px',
                    borderRadius: '2px',
                    letterSpacing: '0.1em'
                }}>
                    DEMO MODE: USING SYNTHETIC GENERATED DATA (B-PIPE OFFLINE)
                </div>
            )}
            <div style={styles.header}>
                <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                    <h1 style={{ color: COLORS.amber, margin: 0, fontSize: '18px' }}>SOVEREIGN BOND RV INTELLIGENCE</h1>

                    <select
                        value={selectedCountry}
                        onChange={(e) => setSelectedCountry(e.target.value)}
                        style={{
                            background: '#000',
                            color: COLORS.cyan,
                            border: `1px solid ${COLORS.border}`,
                            fontSize: '11px',
                            padding: '4px 8px',
                            borderRadius: '2px',
                            fontWeight: 'bold',
                            fontFamily: 'monospace'
                        }}
                    >
                        <option value="BRAZIL">BRAZIL</option>
                        <option value="MEXICO">MEXICO</option>
                        <option value="TURKEY">TURKEY</option>
                        <option value="ARGENTINA">ARGENTINA</option>
                    </select>

                    <div style={styles.toggleGroup}>
                        <button onClick={() => setCurveType('NSS')} style={styles.toggleBtn(curveType === 'NSS')}>NSS FITTED</button>
                        <button onClick={() => setCurveType('CDS')} style={styles.toggleBtn(curveType === 'CDS')}>PAR CDS</button>
                    </div>
                </div>
                <div style={{ color: COLORS.cyan, fontSize: '12px' }}>
                    LIVE B-PIPE CONNECTION: {isLoading ? 'SYNCING...' : 'STABLE'}
                </div>
            </div>

            <div style={styles.chartBox}>
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis
                            type="number"
                            dataKey="maturity"
                            name="Maturity"
                            unit="Y"
                            stroke="#475569"
                            tick={{ fontSize: 10 }}
                            domain={[0, 30]}
                        >
                            <Label value="MATURITY (YEARS)" offset={0} position="insideBottom" fill="#475569" style={{ fontSize: '10px' }} />
                        </XAxis>
                        <YAxis
                            type="number"
                            dataKey="yield"
                            name="Yield"
                            unit="%"
                            stroke="#475569"
                            tick={{ fontSize: 10 }}
                            domain={['auto', 'auto']}
                        >
                            <Label value="YIELD (%)" angle={-90} position="insideLeft" fill="#475569" style={{ fontSize: '10px' }} />
                        </YAxis>
                        <Tooltip
                            contentStyle={{ background: '#000', border: '1px solid #1e293b', fontSize: '10px' }}
                            itemStyle={{ color: COLORS.cyan }}
                            cursor={{ strokeDasharray: '3 3' }}
                        />

                        {/* The Fitted Curve */}
                        <Line
                            data={curve}
                            type="monotone"
                            dataKey="y"
                            stroke={COLORS.cyan}
                            dot={false}
                            strokeWidth={2}
                            isAnimationActive={false}
                        />

                        {/* The Bonds */}
                        <Scatter name="Bonds" data={bonds} fill="#3b82f6">
                            {bonds.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={getZColor(entry.z_score)} />
                            ))}
                        </Scatter>
                    </ComposedChart>
                </ResponsiveContainer>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div>
                    <h3 style={{ color: COLORS.cyan, margin: '0 0 8px 0', fontSize: '14px' }}>"THE FLY" SCANNER (CHEAPEST RESIDUALS)</h3>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Ticker</th>
                                <th style={styles.th}>ISIN</th>
                                <th style={styles.th}>Residual (bps)</th>
                                <th style={styles.th}>Z-Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cheapestBonds.map(b => (
                                <tr key={b.isin}>
                                    <td style={styles.td}>{b.ticker}</td>
                                    <td style={{ ...styles.td, color: COLORS.textSecondary }}>{b.isin}</td>
                                    <td style={{ ...styles.td, ...styles.cheapHighlight }}>+{b.residual}</td>
                                    <td style={{ ...styles.td, color: getZColor(b.z_score) }}>{b.z_score}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div>
                    <h3 style={{ color: COLORS.cyan, margin: '0 0 8px 0', fontSize: '14px' }}>UNIVERSE SUMMARY</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        {[
                            { label: 'Avg Liquidity (B/A)', value: '0.12 bps' },
                            { label: 'Curve Model', value: curveType === 'NSS' ? 'Nelson-Siegel-Svensson' : 'Par CDS Proxy' },
                            { label: 'Bonds in Curve', value: bonds.length.toString() },
                            { label: 'Fitted RMSE', value: '0.045' }
                        ].map(item => (
                            <div key={item.label} style={{ background: '#0a0a0a', padding: '12px', border: '1px solid #1e293b' }}>
                                <div style={{ fontSize: '10px', color: COLORS.textSecondary, marginBottom: '4px' }}>{item.label}</div>
                                <div style={{ fontSize: '14px', fontWeight: 'bold', color: COLORS.amber }}>{item.value}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
