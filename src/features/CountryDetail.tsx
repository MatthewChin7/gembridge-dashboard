
import { useEffect, useState, Fragment } from 'react';
import { Country, MacroIndicator } from '../types';
import { MacroService } from '../services/api';
import { MarketService } from '../services/market';
import { MacroChart } from '../components/Charts/MacroChart';
import { ExternalLink } from 'lucide-react';
import { NewsTerminal } from '../components/Dashboard/NewsTerminal';
import { MarketSentimentCard } from '../components/Dashboard/MarketSentimentCard';
import { DetailedLegend } from '../components/Analytics/DetailedLegend';

interface CountryDetailProps {
    country: Country;
    onClose: () => void;
}

// Helper component for terminal data cells
const TerminalCell = ({ value, col, suffix = '', format = '1' }: { value: any, col: keyof MacroIndicator, suffix?: string, format?: string }) => {
    if (typeof value !== 'number') return <td style={{ padding: '4px 8px', textAlign: 'right', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>-</td>;

    let color = 'var(--text-primary)'; // Default Amber

    // Conditional coloring for specific metrics relative to zero
    if (['gdpGrowth', 'cpiYoY', 'currentAccountToGdp', 'fiscalBalance'].includes(col)) {
        if (value > 0) color = 'var(--accent-green)';
        if (value < 0) color = 'var(--accent-red)';
    }

    const displayValue = format === '0' ? value.toFixed(0) : value.toFixed(1);

    return (
        <td style={{ padding: '4px 8px', textAlign: 'right', color: color, fontFamily: 'var(--font-mono)' }}>
            {displayValue}{suffix}
        </td>
    );
};

const METRIC_GROUPS: {
    title: string;
    color: string;
    metrics: {
        key: keyof MacroIndicator;
        label: string;
        suffix?: string;
        format?: string;
        scale?: number;
    }[]
}[] = [
        {
            title: 'ACTIVITY',
            color: 'var(--text-secondary)', // Cyan
            metrics: [
                { key: 'gdpGrowth', label: 'GDP YoY', suffix: '%' },
                { key: 'nominalGdp', label: 'NOM GDP', format: '0' },
                { key: 'gdpPerCapita', label: 'GDP/CAP', suffix: 'k', format: '1', scale: 0.001 },
                { key: 'privateConsumption', label: 'PVT CONS', suffix: '%' },
                { key: 'fixedInvestment', label: 'FIX INV', suffix: '%' },
                { key: 'population', label: 'POP (M)' }
            ]
        },
        {
            title: 'EXTERNAL',
            color: 'var(--text-secondary)',
            metrics: [
                { key: 'currentAccountToGdp', label: 'CA/GDP', suffix: '%' },
                { key: 'tradeBalanceVal', label: 'TRD BAL' },
                { key: 'fdi', label: 'FDI %', suffix: '%' },
                { key: 'externalDebt', label: 'EXT DEBT', suffix: '%' },
                { key: 'fxReservesBillions', label: 'FX RES', format: '0' },
                { key: 'importCoverage', label: 'IMP COV' }
            ]
        },
        {
            title: 'FISCAL',
            color: 'var(--text-secondary)',
            metrics: [
                { key: 'fiscalBalance', label: 'FISC BAL', suffix: '%' },
                { key: 'govDebtToGdp', label: 'DEBT/GDP', suffix: '%', format: '0' },
                { key: 'oilGasRevenue', label: 'OIL REV', suffix: '%' }
            ]
        },
        {
            title: 'PRICES',
            color: 'var(--text-secondary)',
            metrics: [
                { key: 'cpiYoY', label: 'CPI', suffix: '%' },
                { key: 'exchangeRate', label: 'FX RATE' },
                { key: 'realInterestRate', label: 'REAL RATE', suffix: '%' }
            ]
        },
        {
            title: 'BANKING',
            color: 'var(--text-secondary)',
            metrics: [
                { key: 'bankCapitalToAssets', label: 'CAP/AST', suffix: '%' }
            ]
        }
    ];

export const CountryDetail = ({ country, onClose }: CountryDetailProps) => {
    const [activeTab, setActiveTab] = useState<'MACRO' | 'MARKET'>('MACRO');
    const [timeRange, setTimeRange] = useState<number>(120); // Default to 10 Years
    const [viewMode, setViewMode] = useState<'Monthly' | 'Annual'>('Annual');
    // Multi-metric selection state
    const [selectedMetrics, setSelectedMetrics] = useState<Set<keyof MacroIndicator>>(new Set(['gdpGrowth']));
    const [history, setHistory] = useState<MacroIndicator[]>([]); // Data source
    const [globalHistory, setGlobalHistory] = useState<MacroIndicator[]>([]);
    const [showGlobalAverage, setShowGlobalAverage] = useState(false);
    const [predictionMarkets, setPredictionMarkets] = useState<any[]>([]);

    // Terminal Colors for Chart Lines
    const CHART_COLORS = [
        '#FFFFFF', // White
        '#FFE600', // Yellow
        '#FF00FF', // Magenta
        '#00FFFF', // Cyan
        '#FF9900', // Orange
        '#00FF00', // Green
    ];

    useEffect(() => {
        MarketService.getPredictionMarkets(country.id).then(setPredictionMarkets);
    }, [country]);

    useEffect(() => {
        MacroService.getMacroData(country.id).then(setHistory);
    }, [country]);

    useEffect(() => {
        if (showGlobalAverage && globalHistory.length === 0) {
            MacroService.getGlobalMacroData(10).then(setGlobalHistory);
        }
    }, [showGlobalAverage, globalHistory]);

    const getCutoffDate = () => {
        const d = new Date();
        d.setMonth(d.getMonth() - timeRange);
        return d;
    };

    const cutoffDate = getCutoffDate();

    // Unified Data for the Chart: Include years from Global History if enabled
    const unifiedChartHistory = [...history];
    if (showGlobalAverage) {
        globalHistory.forEach(gRow => {
            const gYear = new Date(gRow.date).getFullYear();
            if (!unifiedChartHistory.some(h => new Date(h.date).getFullYear() === gYear)) {
                unifiedChartHistory.push({
                    countryId: country.id,
                    date: gRow.date,
                    source: 'Global Data Only'
                } as MacroIndicator);
            }
        });
    }

    const baseChartData = unifiedChartHistory
        .filter(d => new Date(d.date) >= cutoffDate)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Merge Global Average into Chart Data
    const chartData = baseChartData.map(row => {
        const year = new Date(row.date).getFullYear();
        const globalRow = globalHistory.find(g => new Date(g.date).getFullYear() === year);

        if (globalRow && showGlobalAverage) {
            const merged = { ...row };
            selectedMetrics.forEach(key => {
                if (globalRow[key] !== undefined) {
                    (merged as any)[`${key}_avg`] = globalRow[key];
                }
            });
            return merged;
        }
        return row;
    });

    // Unified Data for the Table: Include years from Global History if enabled
    const unifiedHistory = [...history];
    if (showGlobalAverage) {
        globalHistory.forEach(gRow => {
            const gYear = new Date(gRow.date).getFullYear();
            if (!unifiedHistory.some(h => new Date(h.date).getFullYear() === gYear)) {
                // Add placeholder row for years only present in global data
                unifiedHistory.push({
                    countryId: country.id,
                    date: gRow.date,
                    source: 'Global Data Only'
                } as MacroIndicator);
            }
        });
    }

    const tableData = unifiedHistory
        .filter(d => new Date(d.date) >= cutoffDate)
        .filter(row => {
            if (viewMode === 'Annual') {
                // Include Dec (Annual) or Forecast rows
                return new Date(row.date).getMonth() === 11 || row.source?.includes('Forecast');
            }
            return true;
        })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const handleRangeChange = (months: number, mode: 'Monthly' | 'Annual') => {
        setTimeRange(months);
        setViewMode(mode);
    };

    const toggleMetric = (key: keyof MacroIndicator) => {
        const newSet = new Set(selectedMetrics);
        if (newSet.has(key)) {
            if (newSet.size > 1) newSet.delete(key); // Prevent empty set
        } else {
            if (newSet.size < 6) newSet.add(key); // Limit to 6 metrics
        }
        setSelectedMetrics(newSet);
    };

    // Dynamic Column Visibility Logic
    const visibleMetrics = new Set<string>();
    METRIC_GROUPS.forEach(group => {
        group.metrics.forEach(m => {
            const hasData = tableData.some(row => {
                const val = row[m.key];
                return val !== undefined && val !== null;
            });
            if (hasData) visibleMetrics.add(m.key as string);
        });
    });

    // Prepare metrics configuration for the chart
    const activeMetricsList = Array.from(selectedMetrics).map((key, index) => {
        const meta = METRIC_GROUPS.flatMap(g => g.metrics).find(m => m.key === key);
        // Heuristic: If suffix is '%', put on LEFT axis. Otherwise RIGHT.
        const yAxisId = meta?.suffix === '%' ? 'left' : 'right';

        return {
            key,
            color: CHART_COLORS[index % CHART_COLORS.length],
            label: meta?.label || key,
            yAxisId: yAxisId as 'left' | 'right'
        };
    });

    const slug = country.name.toLowerCase().replace(/\s+/g, '-');

    return (
        <div style={{
            position: 'fixed', top: 0, right: 0, bottom: 0, width: '100%', maxWidth: '1200px',
            background: 'var(--bg-primary)', borderLeft: '1px solid var(--text-primary)',
            padding: '16px', zIndex: 100, overflowY: 'auto',
            boxShadow: 'none'
        }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--text-secondary)', paddingBottom: '8px' }}>
                <div>
                    <h2 className="text-xl" style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                        {country.name.toUpperCase()} <span style={{ color: 'var(--text-secondary)' }}>({country.id})</span>
                        {country.developmentStatus && (
                            <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', padding: '2px 8px', borderRadius: '100px', border: '1px solid var(--bg-tertiary)' }}>
                                {country.developmentStatus.toUpperCase()}
                            </span>
                        )}
                    </h2>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <a
                        href={`https://data.worldbank.org/country/${slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn"
                        style={{
                            background: '#000',
                            color: 'var(--text-secondary)',
                            border: '1px solid var(--text-secondary)',
                            textDecoration: 'none',
                            fontSize: '11px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}
                    >
                        WB DATA <ExternalLink size={12} />
                    </a>
                    <a
                        href={`https://www.imf.org/en/Countries/${country.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn"
                        style={{
                            background: '#000',
                            color: 'var(--text-secondary)',
                            border: '1px solid var(--text-secondary)',
                            textDecoration: 'none',
                            fontSize: '11px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}
                    >
                        IMF DATA <ExternalLink size={12} />
                    </a>
                    <button onClick={onClose} className="btn" style={{ background: 'var(--accent-red)', color: 'black', border: 'none', fontWeight: 'bold' }}>
                        CLOSE [X]
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0', borderBottom: '1px solid var(--bg-tertiary)', marginBottom: '16px' }}>
                <button
                    className="btn"
                    style={{
                        background: activeTab === 'MACRO' ? 'var(--text-primary)' : 'transparent',
                        color: activeTab === 'MACRO' ? 'black' : 'var(--text-primary)',
                        border: '1px solid var(--bg-tertiary)',
                        borderBottom: 'none',
                        marginRight: '4px',
                        fontWeight: 'bold'
                    }}
                    onClick={() => setActiveTab('MACRO')}
                >
                    MACRO FUNDAMENTALS
                </button>
                <button
                    className="btn"
                    style={{
                        background: activeTab === 'MARKET' ? 'var(--text-primary)' : 'transparent',
                        color: activeTab === 'MARKET' ? 'black' : 'var(--text-primary)',
                        border: '1px solid var(--bg-tertiary)',
                        borderBottom: 'none',
                        fontWeight: 'bold'
                    }}
                    onClick={() => setActiveTab('MARKET')}
                >
                    MARKET MONITOR
                </button>
            </div>

            {activeTab === 'MACRO' ? (
                <>
                    <div style={{ marginBottom: '16px', display: 'flex', gap: '4px' }}>
                        <button
                            className={`btn ${timeRange === 60 ? 'btn-primary' : ''}`}
                            onClick={() => handleRangeChange(60, 'Annual')}
                        >
                            5Y
                        </button>
                        <button
                            className={`btn ${timeRange === 120 ? 'btn-primary' : ''}`}
                            onClick={() => handleRangeChange(120, 'Annual')}
                        >
                            10Y
                        </button>
                        <div style={{ flex: 1 }}></div>
                        <button
                            className={`btn ${showGlobalAverage ? 'btn-primary' : ''}`}
                            onClick={() => setShowGlobalAverage(!showGlobalAverage)}
                            style={{
                                fontSize: '11px',
                                border: showGlobalAverage ? '1px solid var(--text-primary)' : '1px solid var(--bg-tertiary)',
                                color: showGlobalAverage ? '#000' : 'var(--text-secondary)'
                            }}
                        >
                            {showGlobalAverage ? 'HIDE GLOBAL AVERAGE' : 'SHOW GLOBAL AVERAGE'}
                        </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '32px' }}>

                        {/* Macro Charts Section */}
                        <div style={{ border: '1px solid var(--bg-tertiary)', padding: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', borderBottom: '1px solid var(--bg-tertiary)', paddingBottom: '4px' }}>
                                <div style={{ display: 'flex', gap: '16px' }}>
                                    <h3 className="text-lg" style={{ color: 'var(--text-secondary)' }}>MACRO ANALYSIS</h3>
                                </div>
                            </div>
                            <MacroChart
                                data={chartData}
                                metrics={activeMetricsList}
                                title="Comparative Performance"
                            />
                        </div>

                        {/* Detailed Analysis Table Section */}
                        <div>
                            <div style={{ marginBottom: '8px', borderTop: '2px solid var(--text-primary)', paddingTop: '4px' }}>
                                <h3 className="text-lg" style={{ color: 'var(--text-secondary)' }}>DETAILED ANALYSIS</h3>
                            </div>

                            <div className="panel" style={{ overflowX: 'auto', padding: 0, border: '1px solid var(--bg-tertiary)' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', whiteSpace: 'nowrap', fontFamily: 'var(--font-mono)' }}>
                                    <thead>
                                        {/* Group Headers */}
                                        <tr style={{ background: '#111' }}>
                                            <th style={{ padding: '4px 8px', textAlign: 'left', position: 'sticky', left: 0, background: '#111', zIndex: 2 }}></th>
                                            {METRIC_GROUPS.map(group => {
                                                const visibleInGroup = group.metrics.filter(m => visibleMetrics.has(m.key));
                                                if (visibleInGroup.length === 0) return null;
                                                return (
                                                    <th key={group.title} colSpan={visibleInGroup.length} style={{ padding: '4px 8px', textAlign: 'center', borderBottom: '1px solid var(--text-secondary)', fontWeight: 'bold', color: group.color }}>
                                                        {group.title}
                                                    </th>
                                                );
                                            })}
                                        </tr>
                                        {/* Metric Headers */}
                                        <tr style={{ background: '#000', borderBottom: '1px solid var(--bg-tertiary)' }}>
                                            <th style={{ padding: '4px 8px', textAlign: 'left', position: 'sticky', left: 0, background: '#000', zIndex: 1, borderTop: '1px solid var(--bg-tertiary)', color: 'var(--text-secondary)', width: '80px', minWidth: '80px' }}>DATE</th>
                                            {METRIC_GROUPS.flatMap(group => group.metrics).filter(m => visibleMetrics.has(m.key)).map(m => {
                                                const isSelected = selectedMetrics.has(m.key);
                                                const metricIndex = activeMetricsList.findIndex(am => am.key === m.key);
                                                // If selected, get its color, else default
                                                const headerColor = isSelected && metricIndex >= 0 ? activeMetricsList[metricIndex].color : 'var(--text-secondary)';

                                                return (
                                                    <th
                                                        key={m.key}
                                                        onClick={() => toggleMetric(m.key)}
                                                        style={{
                                                            cursor: 'pointer',
                                                            padding: '4px 8px',
                                                            color: headerColor,
                                                            textAlign: 'right',
                                                            background: isSelected ? '#222' : 'transparent',
                                                            borderBottom: isSelected ? `2px solid ${headerColor}` : '1px solid var(--bg-tertiary)'
                                                        }}
                                                    >
                                                        {m.label}
                                                    </th>
                                                );
                                            })}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tableData.map((row, i) => {
                                            const year = new Date(row.date).getFullYear();
                                            const globalRow = globalHistory.find(g => new Date(g.date).getFullYear() === year);

                                            return (
                                                <Fragment key={i}>
                                                    <tr style={{ borderBottom: '1px solid var(--bg-tertiary)' }}>
                                                        <td style={{ padding: '4px 8px', textAlign: 'left', position: 'sticky', left: 0, background: '#111', borderRight: '1px solid var(--bg-tertiary)', color: 'var(--text-tertiary)', width: '80px', minWidth: '80px' }}>
                                                            {viewMode === 'Annual'
                                                                ? `${new Date(row.date).getFullYear()}${row.source?.includes('Forecast') ? ' (E)' : ''}`
                                                                : new Date(row.date).toLocaleDateString(undefined, { month: 'short', year: '2-digit' }).toUpperCase()}
                                                        </td>
                                                        {METRIC_GROUPS.flatMap(group => group.metrics).filter(m => visibleMetrics.has(m.key)).map(m => {
                                                            const rawVal = row[m.key] as number | undefined;
                                                            const val = rawVal !== undefined && m.scale ? rawVal * m.scale : rawVal;
                                                            return (
                                                                <TerminalCell
                                                                    key={m.key}
                                                                    value={val}
                                                                    col={m.key}
                                                                    suffix={m.suffix}
                                                                    format={m.format}
                                                                />
                                                            );
                                                        })}
                                                    </tr>
                                                    {showGlobalAverage && globalRow && (
                                                        <tr style={{ borderBottom: '1px solid var(--bg-tertiary)', background: '#050505', opacity: 0.8 }}>
                                                            <td style={{ padding: '2px 8px', textAlign: 'left', position: 'sticky', left: 0, background: '#050505', borderRight: '1px solid var(--bg-tertiary)', color: 'var(--text-tertiary)', fontSize: '9px', fontStyle: 'italic' }}>
                                                                WORLD AVG
                                                            </td>
                                                            {METRIC_GROUPS.flatMap(group => group.metrics).filter(m => visibleMetrics.has(m.key)).map(m => {
                                                                const rawVal = globalRow[m.key] as number | undefined;
                                                                const val = rawVal !== undefined && m.scale ? rawVal * m.scale : rawVal;
                                                                return (
                                                                    <td key={`global-${m.key}`} style={{ padding: '2px 8px', textAlign: 'right', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', fontSize: '9px', fontStyle: 'italic' }}>
                                                                        {val !== undefined ? (m.format === '0' ? val.toFixed(0) : val.toFixed(1)) : '-'}{m.suffix}
                                                                    </td>
                                                                );
                                                            })}
                                                        </tr>
                                                    )}
                                                </Fragment>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            <DetailedLegend visibleMetrics={visibleMetrics} />
                        </div>

                        {/* News Terminal Section */}
                        <div>
                            <div style={{ marginBottom: '8px', borderTop: '2px solid var(--text-primary)', paddingTop: '4px' }}>
                                <h3 className="text-lg" style={{ color: 'var(--text-secondary)' }}>LATEST INTELLIGENCE</h3>
                            </div>
                            <div style={{ height: '400px', border: '1px solid var(--bg-tertiary)' }}>
                                <NewsTerminal selectedCountries={[country.id]} />
                            </div>
                        </div>

                        {/* Market Sentiment Section */}
                        {predictionMarkets.length > 0 && (
                            <div>
                                <div style={{ marginBottom: '8px', borderTop: '2px solid var(--text-primary)', paddingTop: '4px' }}>
                                    <h3 className="text-lg" style={{ color: 'var(--text-secondary)' }}>MARKET SENTIMENT</h3>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                                    {predictionMarkets.map(market => (
                                        <MarketSentimentCard key={market.id} market={market} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                    <div style={{ color: 'var(--text-secondary)' }}>Live Charting Coming Soon</div>

                </div>
            )}
        </div>
    );
};
