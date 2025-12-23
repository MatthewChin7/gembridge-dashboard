import { useEffect, useState } from 'react';
import { NewsEvent } from '../../types';
import { NewsService } from '../../services/api';
import { AlertTriangle, TrendingUp, Anchor } from 'lucide-react';

interface LatestIntelligenceProps {
    selectedCountries?: string[]; // Country IDs from the watchlist
    regionFilter?: string; // Region filter from the watchlist
}

export const LatestIntelligence = ({ selectedCountries = [], regionFilter = 'ALL' }: LatestIntelligenceProps) => {
    const [news, setNews] = useState<NewsEvent[]>([]);
    const [showAISummary, setShowAISummary] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const refreshNews = () => {
        setIsRefreshing(true);
        // Simulate network fetch
        setTimeout(() => {
            NewsService.getLatestNews().then(setNews);
            setIsRefreshing(false);
        }, 800);
    };

    useEffect(() => {
        refreshNews();
        // Auto-refresh every 60s
        const interval = setInterval(refreshNews, 60000);
        return () => clearInterval(interval);
    }, []);

    const getIcon = (tags: string[]) => {
        if (tags.includes('POLITICS')) return <AlertTriangle size={14} className="text-red" />;
        if (tags.includes('MONETARY_POLICY')) return <Anchor size={14} className="text-muted" />;
        return <TrendingUp size={14} className="text-green" />;
    };

    // Filter news based on selected countries from watchlist and region prop
    const filteredNews = news.filter(item => {
        // If specific countries are selected, only show news for those countries
        if (selectedCountries.length > 0 && !selectedCountries.includes(item.countryId)) {
            return false;
        }
        // Filter by region prop
        if (regionFilter !== 'ALL' && item.tags && !item.tags.includes(regionFilter)) {
            return false;
        }
        return true;
    });

    return (
        <div className="panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className="panel-header" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <span>Latest Intelligence</span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                            className="btn"
                            style={{ fontSize: '10px', padding: '2px 6px', opacity: isRefreshing ? 0.5 : 1 }}
                            onClick={refreshNews}
                        >
                            {isRefreshing ? 'UPDATING...' : 'REAL-TIME'}
                        </button>
                        <button
                            className="btn"
                            onClick={() => setShowAISummary(!showAISummary)}
                            style={{ fontSize: '10px', padding: '2px 6px', background: showAISummary ? 'var(--accent-purple)' : 'var(--bg-tertiary)' }}
                        >
                            {showAISummary ? 'Hide AI' : 'AI Brief'}
                        </button>
                    </div>
                </div>
                {selectedCountries.length > 0 && (
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                        Showing news for {selectedCountries.length} selected {selectedCountries.length === 1 ? 'country' : 'countries'}
                    </div>
                )}
            </div>

            {/* AI Summary Section */}
            {showAISummary && (
                <div style={{
                    padding: '12px', background: 'rgba(139, 92, 246, 0.1)', borderBottom: '1px solid var(--accent-purple)',
                    fontSize: '12px', marginBottom: '12px'
                }}>
                    <div style={{ fontWeight: '600', color: 'var(--accent-purple)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        ✨ AI Executive Summary
                    </div>
                    <div style={{ lineHeight: '1.6', color: 'var(--text-primary)' }}>
                        <strong>Key Developments in {regionFilter === 'ALL' ? 'Selected Markets' : regionFilter}:</strong>
                        <ul style={{ marginTop: '8px', marginBottom: 0, paddingLeft: '20px' }}>
                            {filteredNews.slice(0, 5).map(item => (
                                <li key={item.id} style={{ marginBottom: '6px' }}>
                                    <strong>{item.countryId}:</strong> {item.summary.slice(0, 80)}...
                                    {item.url && (
                                        <a
                                            href={item.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ marginLeft: '4px', color: 'var(--accent-blue)', textDecoration: 'none' }}
                                        >
                                            [Source]
                                        </a>
                                    )}
                                </li>
                            ))}
                        </ul>
                        {filteredNews.length === 0 && (
                            <p style={{ marginTop: '8px', color: 'var(--text-secondary)' }}>
                                No recent developments for selected filters.
                            </p>
                        )}
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', flex: 1 }}>
                {filteredNews.map(item => (
                    <div key={item.id} style={{ paddingBottom: '12px', borderBottom: '1px solid var(--bg-tertiary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <span className="text-mono text-muted" style={{ fontSize: '10px' }}>
                                {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span style={{
                                fontSize: '10px',
                                fontWeight: 700,
                                background: 'var(--bg-tertiary)',
                                padding: '1px 4px',
                                borderRadius: '2px'
                            }}>
                                {item.countryId}
                            </span>
                            {getIcon(item.tags)}
                        </div>
                        {item.url ? (
                            <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    fontSize: '13px',
                                    fontWeight: 500,
                                    marginBottom: '2px',
                                    color: 'var(--text-primary)',
                                    textDecoration: 'none',
                                    display: 'block',
                                    transition: 'color 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-blue)'}
                                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                            >
                                {item.headline} →
                            </a>
                        ) : (
                            <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '2px' }}>
                                {item.headline}
                            </div>
                        )}
                        <div className="text-muted" style={{ fontSize: '12px', lineHeight: '1.4' }}>
                            {item.summary}
                        </div>
                    </div>
                ))}
                {filteredNews.length === 0 && (
                    <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No news matching filters.
                    </div>
                )}
            </div>
        </div>
    );
};
