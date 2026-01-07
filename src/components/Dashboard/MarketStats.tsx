import { TrendingUp, TrendingDown } from 'lucide-react';

interface MarketStatsProps {
    currency: string;
    rate: number | null;
    ytdChange: number | null;
}

export const MarketStats = ({ currency, rate, ytdChange }: MarketStatsProps) => {
    if (!rate) return null;

    const isPositive = (ytdChange || 0) > 0; // For USD/XXX, positive means depreciation of local currency (bad usually)
    const color = isPositive ? 'var(--accent-red)' : 'var(--accent-green)'; // High USD/TRY is bad for TRY

    return (
        <div className="panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px' }}>
            <div>
                <div className="text-sm text-muted">USD/{currency} Rate</div>
                <div className="text-2xl" style={{ fontWeight: 700, fontFamily: 'monospace' }}>
                    {rate.toFixed(4)}
                </div>
            </div>

            {ytdChange !== null && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ textAlign: 'right' }}>
                        <div className="text-sm text-muted">YTD Change</div>
                        <div style={{ color, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                            {Math.abs(ytdChange).toFixed(2)}%
                            {ytdChange > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
