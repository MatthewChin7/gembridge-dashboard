import { Country, MacroIndicator } from '../../types';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface MacroSnapshotProps {
    country: Country;
    data: MacroIndicator;
}

export const MacroSnapshot = ({ country, data }: MacroSnapshotProps) => {
    const getTrafficLight = (value: number, type: 'GDP' | 'CPI' | 'FX') => {
        // Simple logic for demo
        if (type === 'CPI') return value > 10 ? 'red' : value > 5 ? 'orange' : 'green';
        if (type === 'GDP') return value < 0 ? 'red' : value < 2 ? 'orange' : 'green';
        return 'green';
    };

    const formatNumber = (num: number, digits = 1) => num.toFixed(digits);

    return (
        <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <div className="text-lg" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <img
                            src={`https://flagcdn.com/24x18/${country.id.toLowerCase().slice(0, 2)}.png`}
                            alt={country.id}
                            style={{ borderRadius: '2px' }}
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                        />
                        {country.name}
                    </div>
                    <div className="text-sm text-muted">{country.region} • {country.currency}</div>
                </div>
                <div
                    style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: country.riskScore > 80 ? 'rgba(218, 54, 51, 0.2)' : 'rgba(35, 134, 54, 0.2)',
                        color: country.riskScore > 80 ? 'var(--status-critical)' : 'var(--status-safe)',
                        fontSize: '11px',
                        fontWeight: 700
                    }}
                >
                    RISK: {country.riskScore}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <Metric
                    label="GDP Growth"
                    value={`${formatNumber(data.gdpGrowth)}%`}
                    trend={data.gdpGrowth > 0 ? 'up' : 'down'}
                    color={getTrafficLight(data.gdpGrowth, 'GDP')}
                />
                <Metric
                    label="Inflation (CPI)"
                    value={`${formatNumber(data.cpiYoY)}%`}
                    trend={data.cpiYoY > 5 ? 'up' : 'down'} // Inflation up is usually bad
                    // Inverted logic for color: High inflation is red
                    color={getTrafficLight(data.cpiYoY, 'CPI') === 'red' ? 'var(--accent-red)' : 'var(--accent-green)'}
                />
                <Metric
                    label="Real Rates"
                    value={`${formatNumber(data.policyRate - data.cpiYoY)}%`}
                    trend="flat"
                />
                <Metric
                    label="FX Reserves"
                    value={`$${formatNumber(data.fxReservesBillions, 0)}B`}
                    trend="down"
                />
            </div>
        </div>
    );
};

const Metric = ({ label, value, trend, color }: { label: string, value: string, trend: 'up' | 'down' | 'flat', color?: string }) => {
    return (
        <div>
            <div className="text-sm text-muted" style={{ fontSize: '11px', marginBottom: '2px' }}>{label}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span className="text-mono" style={{ fontSize: '15px', fontWeight: 600, color: color || 'var(--text-primary)' }}>
                    {value}
                </span>
                {trend === 'up' && <ArrowUpRight size={12} color={color || "var(--text-tertiary)"} />}
                {trend === 'down' && <ArrowDownRight size={12} color={color || "var(--text-tertiary)"} />}
                {trend === 'flat' && <Minus size={12} color="var(--text-tertiary)" />}
            </div>
        </div>
    )
}
