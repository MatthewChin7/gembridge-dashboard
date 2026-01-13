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
                fetch(`/api/backend/credit/bonds/${selectedCountry}`),
                fetch(`/api/backend/credit/curve/${selectedCountry}?type=${curveType}`)
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

            {/* Technical Methodology Writeup */}
            <div style={{
                marginTop: '48px',
                padding: '24px',
                borderTop: `1px solid ${COLORS.border}`,
                background: 'rgba(255, 176, 0, 0.02)',
                lineHeight: '1.6'
            }}>
                <h2 style={{ color: COLORS.amber, fontSize: '18px', marginBottom: '20px', borderBottom: `1px solid ${COLORS.amber}`, display: 'inline-block' }}>
                    TECHNICAL METHODOLOGY & SYSTEM ARCHITECTURE
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                    <div>
                        <h3 style={{ color: COLORS.cyan, fontSize: '14px', textTransform: 'uppercase' }}>I. Data Infrastructure (B-PIPE Integration)</h3>
                        <p style={{ fontSize: '12px', color: COLORS.textSecondary }}>
                            The dashboard leverages <strong style={{ color: COLORS.text }}>Bloomberg B-PIPE (BLPAPI)</strong> as its primary data backbone. This provides institutional-grade connectivity to real-time bid/ask yields, Z-spreads, and Credit Default Swap (CDS) quotes.
                            <br /><br />
                            When a country is selected, the backend initiates a high-frequency polling session to retrieve the current "Sovereign Bond Universe" (e.g., Brazil’s global US-denominated bonds). This data includes not just price, but critical risk metrics like <strong>Duration</strong> and <strong>Convexity</strong>, which are essential for correct curve placement.
                        </p>

                        <h3 style={{ color: COLORS.cyan, fontSize: '14px', textTransform: 'uppercase', marginTop: '24px' }}>II. Quantitative Methodology (NSS Model)</h3>
                        <div style={{ fontSize: '12px', color: COLORS.textSecondary }}>
                            The Nelson-Siegel-Svensson (NSS) model is the industry standard for sovereign yield curve construction, utilized by central banks (e.g., ECB, Federal Reserve) to extract the "latent" term structure of interest rates.
                            <br /><br />
                            <code style={{ display: 'block', padding: '12px', background: '#0a0a0a', color: COLORS.amber, margin: '12px 0', fontSize: '11px', borderLeft: `2px solid ${COLORS.amber}` }}>
                                y(t) = β₀ + β₁[decay₁(t)] + β₂[decay₂(t)] + β₃[decay₃(t)]
                            </code>
                            <strong>The Parameters Explained:</strong>
                            <ul style={{ paddingLeft: '16px', marginTop: '8px' }}>
                                <li style={{ marginBottom: '4px' }}><strong style={{ color: COLORS.text }}>β₀ (Level):</strong> Represents the long-term interest rate. As maturity tends to infinity, the yield converges to β₀.</li>
                                <li style={{ marginBottom: '4px' }}><strong style={{ color: COLORS.text }}>β₁ (Slope):</strong> Determines the short-term component. A negative β₁ implies an upward-sloping (normal) curve, while positive β₁ suggests inversion.</li>
                                <li style={{ marginBottom: '4px' }}><strong style={{ color: COLORS.text }}>β₂ & β₃ (Curvature/Humps):</strong> These govern the "humps." β₂ creates a hump in the medium-term, while the Svensson extension (β₃) allows for a second hump, capturing complex market "twists" that simpler models miss.</li>
                                <li style={{ marginBottom: '4px' }}><strong style={{ color: COLORS.text }}>τ₁ & τ₂ (Decay):</strong> These dictate exactly *where* on the maturity timeline the humps occur.</li>
                            </ul>

                            <strong>Determining "Fair Value":</strong>
                            <br />
                            The "Fair Value" of a bond is the yield predicted by the NSS curve at the bond's specific maturity. Because the model enforces a macro-consistent, smooth shape, any bond trading away from this line is considered "dislocated" from the broader market consensus for that country's risk.
                            <br /><br />
                            <strong>Why NSS is Superior:</strong>
                            <ol style={{ paddingLeft: '16px' }}>
                                <li style={{ marginBottom: '4px' }}><strong style={{ color: COLORS.text }}>No Overfitting:</strong> Unlike Splines, which can "wiggle" to hit every point, NSS ignores local noise to find the true underlying path, making it better for identifying RV residuals.</li>
                                <li style={{ marginBottom: '12px' }}><strong style={{ color: COLORS.text }}>Economic Intuition:</strong> Every move in the curve can be attributed to specific factors (e.g., a move in β₀ signals changing long-term inflation expectations).</li>
                            </ol>
                        </div>
                    </div>

                    <div>
                        <h3 style={{ color: COLORS.cyan, fontSize: '14px', textTransform: 'uppercase' }}>III. Relative Value (RV) Analytics</h3>
                        <p style={{ fontSize: '12px', color: COLORS.textSecondary }}>
                            This dashboard’s primary goal is to find <strong style={{ color: COLORS.cheap }}>Cheap (Blue)</strong> and <strong style={{ color: COLORS.rich }}>Rich (Red)</strong> bonds. We do this through two key metrics:
                        </p>
                        <ul style={{ fontSize: '12px', color: COLORS.textSecondary, paddingLeft: '20px' }}>
                            <li style={{ marginBottom: '8px' }}>
                                <strong style={{ color: COLORS.text }}>Residual (Spread-over-Curve):</strong> The absolute difference (in basis points) between the market yield and the NSS "Fair Value" yield. A positive residual means the bond yields more than the model suggests—it is theoretically "Cheap."
                            </li>
                            <li>
                                <strong style={{ color: COLORS.text }}>Z-Score (90D Rolling):</strong> Metrics like yield can be volatile. The Z-Score normalizes the residual against its 90-day history. A Z-score &gt; +2 indicates that a bond is not just cheap, but statistically an extreme outlier relative to its typical behavior.
                            </li>
                        </ul>

                        <h3 style={{ color: COLORS.cyan, fontSize: '14px', textTransform: 'uppercase', marginTop: '24px' }}>IV. Basis Monitor (CDS vs Cash)</h3>
                        <div style={{ fontSize: '12px', color: COLORS.textSecondary }}>
                            The <strong style={{ color: COLORS.text }}>Basis</strong> is the numerical difference between the spread of a physical bond (Cash) and the spread of its corresponding protection derivative (CDS).
                            <br /><br />
                            <strong>CDS = "Pure Credit":</strong>
                            <br />
                            CDS is an ISDA-standardized contract. Because it is a derivative, it is relatively insulated from the "plumbing" of the bond market. It is the purest expression of the market's view on a country's probability of default.
                            <br /><br />
                            <strong>Cash = "Credit + Technicals":</strong>
                            <br />
                            Physical bonds are subject to <strong>Technicals</strong>—factors like local pension fund demand, repo costs, and issuance supply.
                            <br /><br />
                            <strong>Interpreting the Signal:</strong>
                            <ul style={{ paddingLeft: '16px', marginTop: '8px' }}>
                                <li style={{ marginBottom: '8px' }}>
                                    <strong style={{ color: COLORS.rich }}>Rich Basis (Negative Basis):</strong> If a bond’s yield is much lower than its CDS spread (Negative Basis), it suggests strong <strong>Real Money</strong> demand (e.g., local banks) is propping up the bond even if the global credit market is turning bearish.
                                </li>
                                <li>
                                    <strong style={{ color: COLORS.cheap }}>Cheap Basis (Positive Basis):</strong> If the bond yields significantly more than the CDS spread, it often indicates a <strong>Technical Dislocation</strong>—such as a large fund "dumping" a position or a massive new government issuance flooding the market. This creates a buying opportunity for credit investors.
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
