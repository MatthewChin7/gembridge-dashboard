import { useEffect, useState } from 'react';
import { Country, MacroIndicator } from '../types';
import { MacroService } from '../services/api';
import { IMFService } from '../services/imf';
import { X } from 'lucide-react';
import { MacroChart } from '../components/Charts/MacroChart';

interface CountryDetailProps {
    country: Country;
    onClose: () => void;
}

// Helper component for heatmap cells
const HeatmapCell = ({ value, col, data, suffix = '', format = '1' }: { value: any, col: keyof MacroIndicator, data: MacroIndicator[], suffix?: string, format?: string }) => {
    if (typeof value !== 'number') return <td style={{ padding: '8px', textAlign: 'right' }}>-</td>;

    // Calculate min/max for this column (memoization would be better in prod but this is small)
    const values = data.map(d => d[col] as number).filter(v => typeof v === 'number');
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;

    // Normalize 0-1
    let intensity = 0;
    if (range > 0) {
        intensity = (value - min) / range;
    }

    // Blue scale: var(--accent-blue) usually is #3b82f6. Let's use rgba.
    // Low values = transparent/dark bg, High values = more blue opacity
    const bg = `rgba(59, 130, 246, ${0.1 + (intensity * 0.4)})`; // 0.1 to 0.5 opacity

    return (
        <td style={{ padding: '8px', textAlign: 'right', background: bg }}>
            {format === '0' ? value.toFixed(0) : value.toFixed(1)}{suffix}
        </td>
    );
};

export const CountryDetail = ({ country, onClose }: CountryDetailProps) => {
    const [timeRange, setTimeRange] = useState<number>(12); // Months
    const [viewMode, setViewMode] = useState<'Monthly' | 'Annual'>('Monthly');
    const [selectedMetric, setSelectedMetric] = useState<keyof MacroIndicator>('gdpGrowth');
    const [history, setHistory] = useState<MacroIndicator[]>([]); // Data source
    const [imfProgram, setImfProgram] = useState<any>(null);

    useEffect(() => {
        MacroService.getMacroData(country.id).then(setHistory);
        IMFService.getActiveProgram(country.id).then(setImfProgram);
    }, [country]);

    // Data for the Chart: Depends only on timeRange, IGNORE viewMode (always show granular data)
    // We also reverse it so it goes Left->Right in time for the chart if needed, 
    // but Recharts usually handles data order if XAxis is set up. 
    // Usually 'history' is sorted descending (newest first). Recharts likes ascending (oldest first).
    const chartData = [...history]
        .slice(0, timeRange) // Take last N months/years
        .reverse(); // Now oldest to newest

    // Data for the Table: Depends on timeRange AND viewMode
    // We keep this Descending (Newest at left/top)
    const tableData = history
        .slice(0, timeRange)
        .filter(row => {
            if (viewMode === 'Annual') {
                return new Date(row.date).getMonth() === 11;
            }
            return true;
        });

    const handleRangeChange = (months: number, mode: 'Monthly' | 'Annual') => {
        setTimeRange(months);
        setViewMode(mode);
    };

    return (
        <div style={{
            position: 'fixed', top: 0, right: 0, bottom: 0, width: '900px',
            // ... (rest is same)

            background: 'var(--bg-secondary)', borderLeft: '1px solid var(--bg-tertiary)',
            padding: '24px', zIndex: 100, overflowY: 'auto',
            boxShadow: '-10px 0 30px rgba(0,0,0,0.5)'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h2 className="text-xl" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img
                            src={`https://flagcdn.com/32x24/${country.id.toLowerCase().slice(0, 2)}.png`}
                            alt={country.id}
                            style={{ borderRadius: '2px' }}
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                        />
                        {country.name} ({country.id})
                    </h2>
                    <div className="text-sm text-muted">Sovereign Analysis Desk</div>
                </div>
                <button onClick={onClose} className="btn" style={{ border: 'none', background: 'transparent' }}>
                    <X size={24} />
                </button>
            </div>

            <div style={{ marginBottom: '24px', display: 'flex', gap: '8px' }}>
                <button
                    className={`btn ${timeRange === 12 && viewMode === 'Monthly' ? 'btn-primary' : ''}`}
                    onClick={() => handleRangeChange(12, 'Monthly')}
                >
                    Last 12M
                </button>
                <button
                    className={`btn ${timeRange === 24 && viewMode === 'Monthly' ? 'btn-primary' : ''}`}
                    onClick={() => handleRangeChange(24, 'Monthly')}
                >
                    Last 24M
                </button>
                <div style={{ width: '1px', background: 'var(--bg-tertiary)', margin: '0 8px' }} />
                <button
                    className={`btn ${timeRange === 60 && viewMode === 'Annual' ? 'btn-primary' : ''}`}
                    onClick={() => handleRangeChange(60, 'Annual')}
                >
                    5 Years (Annual)
                </button>
                <button
                    className={`btn ${timeRange === 120 && viewMode === 'Annual' ? 'btn-primary' : ''}`}
                    onClick={() => handleRangeChange(120, 'Annual')}
                >
                    10 Years (Annual)
                </button>
            </div>

            <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h3 className="text-lg">Historical Performace</h3>
                    <select
                        className="input"
                        style={{ width: '200px' }}
                        value={selectedMetric}
                        onChange={(e) => setSelectedMetric(e.target.value as keyof MacroIndicator)}
                    >
                        <option value="gdpGrowth">Real GDP Growth</option>
                        <option value="cpiYoY">Inflation (CPI)</option>
                        <option value="policyRate">Policy Rate</option>
                        <option value="govDebtToGdp">Gov Debt % GDP</option>
                        <option value="currentAccountToGdp">Current Account % GDP</option>
                        <option value="fxReservesBillions">FX Reserves ($B)</option>
                        <option value="exchangeRate">Exchange Rate</option>
                    </select>
                </div>
                <MacroChart
                    data={filteredHistory}
                    dataKey={selectedMetric}
                    title={selectedMetric === 'gdpGrowth' ? 'GDP Growth %' : selectedMetric}
                />
            </div>

            {/* IMF Section */}
            <h3 className="text-lg" style={{ marginBottom: '16px' }}>IMF Engagement</h3>
            <div className="panel" style={{ marginBottom: '24px', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                        <tr style={{ background: 'var(--bg-secondary)', borderBottom: '2px solid var(--accent-blue)', color: 'var(--text-primary)' }}>
                            <th style={{ padding: '12px', textAlign: 'left' }}>Country</th>
                            <th style={{ padding: '12px', textAlign: 'right' }}>Access (bn USD)*</th>
                            <th style={{ padding: '12px', textAlign: 'center' }}>Program type</th>
                            <th style={{ padding: '12px', textAlign: 'right' }}>Approved</th>
                            <th style={{ padding: '12px', textAlign: 'right' }}>End</th>
                            <th style={{ padding: '12px', textAlign: 'right' }}>% of quota</th>
                        </tr>
                    </thead>
                    <tbody>
                        {imfProgram ? (
                            <tr style={{ borderBottom: '1px solid var(--bg-tertiary)' }}>
                                <td style={{ padding: '12px', textAlign: 'left', fontWeight: '500' }}>{country.name}</td>
                                <td style={{ padding: '12px', textAlign: 'right' }}>{imfProgram.accessAmountBn.toFixed(1)}</td>
                                <td style={{ padding: '12px', textAlign: 'center' }}>
                                    <span style={{
                                        padding: '4px 8px', borderRadius: '4px',
                                        background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', fontSize: '12px'
                                    }}>
                                        {imfProgram.programType}
                                    </span>
                                </td>
                                <td style={{ padding: '12px', textAlign: 'right' }}>{new Date(imfProgram.approvalDate).toLocaleDateString()}</td>
                                <td style={{ padding: '12px', textAlign: 'right' }}>{new Date(imfProgram.endDate).toLocaleDateString()}</td>
                                <td style={{ padding: '12px', textAlign: 'right', fontWeight: '500' }}>{imfProgram.quotaPercent}%</td>
                            </tr>
                        ) : (
                            <tr>
                                <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                    No Active Fund Engagement
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <h3 className="text-lg" style={{ marginBottom: '16px' }}>Detailed Macro Analysis</h3>
            <div className="panel" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', whiteSpace: 'nowrap' }}>
                    <thead>
                        {/* Group Headers */}
                        <tr style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                            <th style={{ padding: '8px', textAlign: 'left', position: 'sticky', left: 0, background: 'var(--bg-secondary)', zIndex: 2 }}></th>
                            <th colSpan={8} style={{ padding: '8px', textAlign: 'center', borderBottom: '1px solid var(--bg-tertiary)', fontWeight: '600', color: 'var(--accent-blue)' }}>Activity & Output</th>
                            <th colSpan={10} style={{ padding: '8px', textAlign: 'center', borderBottom: '1px solid var(--bg-tertiary)', fontWeight: '600', color: 'var(--accent-purple)' }}>External Sector</th>
                            <th colSpan={6} style={{ padding: '8px', textAlign: 'center', borderBottom: '1px solid var(--bg-tertiary)', fontWeight: '600', color: 'var(--accent-amber)' }}>Public Sector (Fiscal)</th>
                            <th colSpan={5} style={{ padding: '8px', textAlign: 'center', borderBottom: '1px solid var(--bg-tertiary)', fontWeight: '600', color: 'var(--accent-mint)' }}>Prices & Monetary</th>
                            <th colSpan={5} style={{ padding: '8px', textAlign: 'center', borderBottom: '1px solid var(--bg-tertiary)', fontWeight: '600', color: 'var(--accent-red)' }}>Banking & Risk</th>
                        </tr>
                        {/* Metric Headers */}
                        <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                            <th style={{ padding: '8px', textAlign: 'left', position: 'sticky', left: 0, background: 'var(--bg-secondary)', zIndex: 1, borderTop: '1px solid var(--bg-tertiary)' }}>Date</th>

                            {/* Activity */}
                            <th style={{ padding: '8px' }}>Real GDP</th>
                            <th style={{ padding: '8px' }}>Nom. GDP</th>
                            <th style={{ padding: '8px' }}>GDP/Cap</th>
                            <th style={{ padding: '8px' }}>Dom. Demand</th>
                            <th style={{ padding: '8px' }}>Priv. Cons.</th>
                            <th style={{ padding: '8px' }}>Fixed Inv.</th>
                            <th style={{ padding: '8px' }}>Net Exp.</th>
                            <th style={{ padding: '8px' }}>Pop (M)</th>

                            {/* External */}
                            <th style={{ padding: '8px' }}>CA %</th>
                            <th style={{ padding: '8px' }}>Trade Bal</th>
                            <th style={{ padding: '8px' }}>FDI %</th>
                            <th style={{ padding: '8px' }}>Ext. Debt</th>
                            <th style={{ padding: '8px' }}>FX Res ($B)</th>
                            <th style={{ padding: '8px' }}>Net IIP</th>
                            <th style={{ padding: '8px' }}>Imp. Cov</th>
                            <th style={{ padding: '8px' }}>ARA %</th>
                            <th style={{ padding: '8px' }}>Net Fuel</th>
                            <th style={{ padding: '8px' }}>Oil Break(CA)</th>

                            {/* Fiscal */}
                            <th style={{ padding: '8px' }}>Fisc. Bal</th>
                            <th style={{ padding: '8px' }}>Prim. Bal</th>
                            <th style={{ padding: '8px' }}>Gov Debt</th>
                            <th style={{ padding: '8px' }}>Oil Rev %</th>
                            <th style={{ padding: '8px' }}>Subsidies</th>
                            <th style={{ padding: '8px' }}>Oil Break(Fisc)</th>

                            {/* Monetary */}
                            <th style={{ padding: '8px' }}>CPI %</th>
                            <th style={{ padding: '8px' }}>Eng in CPI</th>
                            <th style={{ padding: '8px' }}>FX Rate</th>
                            <th style={{ padding: '8px' }}>Pol. Rate</th>
                            <th style={{ padding: '8px' }}>Real Rate</th>

                            {/* Banking */}
                            <th style={{ padding: '8px' }}>Cap/Ast</th>
                            <th style={{ padding: '8px' }}>Loan/Dep</th>
                            <th style={{ padding: '8px' }}>Cred. Gro</th>
                            <th style={{ padding: '8px' }}>Rating</th>
                            <th style={{ padding: '8px' }}>Outlook</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tbody>
                            {tableData.map((row, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid var(--bg-tertiary)' }}>
                                    <td style={{ padding: '8px', textAlign: 'left', position: 'sticky', left: 0, background: 'var(--bg-secondary)', borderRight: '1px solid var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                                        {viewMode === 'Annual'
                                            ? new Date(row.date).getFullYear()
                                            : new Date(row.date).toLocaleDateString(undefined, { month: 'short', year: '2-digit' })}
                                    </td>

                                    {/* Activity */}
                                    <HeatmapCell value={row.gdpGrowth} col="gdpGrowth" data={tableData} suffix="%" />
                                    <HeatmapCell value={row.nominalGdp} col="nominalGdp" data={tableData} format="0" />
                                    <HeatmapCell value={row.gdpPerCapita ? row.gdpPerCapita / 1000 : undefined} col="gdpPerCapita" data={tableData} suffix="k" format="1" />
                                    <HeatmapCell value={row.domesticDemandContribution} col="domesticDemandContribution" data={tableData} />
                                    <HeatmapCell value={row.privateConsumption} col="privateConsumption" data={tableData} suffix="%" />
                                    <HeatmapCell value={row.fixedInvestment} col="fixedInvestment" data={tableData} suffix="%" />
                                    <HeatmapCell value={row.netExportsContribution} col="netExportsContribution" data={tableData} />
                                    <HeatmapCell value={row.population} col="population" data={tableData} />

                                    {/* External */}
                                    <HeatmapCell value={row.currentAccountToGdp} col="currentAccountToGdp" data={tableData} suffix="%" />
                                    <HeatmapCell value={row.tradeBalanceVal} col="tradeBalanceVal" data={tableData} />
                                    <HeatmapCell value={row.fdi} col="fdi" data={tableData} suffix="%" />
                                    <HeatmapCell value={row.externalDebt} col="externalDebt" data={tableData} suffix="%" />
                                    <HeatmapCell value={row.fxReservesBillions} col="fxReservesBillions" data={tableData} format="0" />
                                    <HeatmapCell value={row.netIip} col="netIip" data={tableData} suffix="%" format="0" />
                                    <HeatmapCell value={row.importCoverage} col="importCoverage" data={tableData} />
                                    <HeatmapCell value={row.araMetric} col="araMetric" data={tableData} suffix="%" format="0" />
                                    <HeatmapCell value={row.netFuelExports} col="netFuelExports" data={tableData} suffix="%" />
                                    <HeatmapCell value={row.breakevenOilCa} col="breakevenOilCa" data={tableData} format="0" />

                                    {/* Fiscal */}
                                    <HeatmapCell value={row.fiscalBalance} col="fiscalBalance" data={tableData} suffix="%" />
                                    <HeatmapCell value={row.primaryBalance} col="primaryBalance" data={tableData} suffix="%" />
                                    <HeatmapCell value={row.govDebtToGdp} col="govDebtToGdp" data={tableData} suffix="%" format="0" />
                                    <HeatmapCell value={row.oilGasRevenue} col="oilGasRevenue" data={tableData} suffix="%" />
                                    <HeatmapCell value={row.energySubsidies} col="energySubsidies" data={tableData} suffix="%" />
                                    <HeatmapCell value={row.breakevenOilFiscal} col="breakevenOilFiscal" data={tableData} format="0" />

                                    {/* Monetary */}
                                    <HeatmapCell value={row.cpiYoY} col="cpiYoY" data={tableData} suffix="%" />
                                    <HeatmapCell value={row.energyInCpi} col="energyInCpi" data={tableData} suffix="%" format="0" />
                                    <HeatmapCell value={row.exchangeRate} col="exchangeRate" data={tableData} />
                                    <HeatmapCell value={row.policyRate} col="policyRate" data={tableData} suffix="%" />
                                    <HeatmapCell value={row.realInterestRate} col="realInterestRate" data={tableData} suffix="%" />

                                    {/* Banking - some text, some number */}
                                    <HeatmapCell value={row.bankCapitalToAssets} col="bankCapitalToAssets" data={tableData} suffix="%" />
                                    <HeatmapCell value={row.loansToDeposits} col="loansToDeposits" data={tableData} suffix="%" format="0" />
                                    <HeatmapCell value={row.creditGrowth} col="creditGrowth" data={tableData} suffix="%" />
                                    <td style={{ padding: '8px', textAlign: 'right' }}>{row.creditRating}</td>
                                    <td style={{ padding: '8px', textAlign: 'right' }}>{row.ratingOutlook}</td>
                                </tr>
                            ))}
                        </tbody>
                </table>
            </div>
        </div>
    );
};
