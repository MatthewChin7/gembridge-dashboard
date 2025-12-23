import { useEffect, useState } from 'react';
import { NewsEvent } from '../../types';
import { NewsService } from '../../services/api';
import { AlertTriangle, TrendingUp, Anchor } from 'lucide-react';

export const LatestIntelligence = () => {
    const [news, setNews] = useState<NewsEvent[]>([]);
    const [filterRegion, setFilterRegion] = useState('ALL');
    const [selectedCountries, setSelectedCountries] = useState<string[]>([]); // Multi-select
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

    const filteredNews = news.filter(item => {
        if (filterRegion !== 'ALL' && item.tags && !item.tags.includes(filterRegion)) return false; // Assuming Region is a tag for now, or we map Country->Region
        if (selectedCountries.length > 0 && !selectedCountries.includes(item.countryId)) return false;
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
                    </div>
                </div>

                {/* Filters */}
                <div style={{ display: 'flex', gap: '4px', width: '100%' }}>
                    <select
                        className="input"
                        style={{ fontSize: '11px', padding: '2px' }}
                        value={filterRegion}
                        onChange={(e) => setFilterRegion(e.target.value)}
                    >
                        <option value="ALL">All Regions</option>
                        <option value="LATAM">LATAM</option>
                        <option value="EMEA">EMEA</option>
                        <option value="ASIA">ASIA</option>
                    </select>
                    <button
                        className="btn"
                        onClick={() => setShowAISummary(!showAISummary)}
                        style={{ fontSize: '11px', flex: 1, background: showAISummary ? 'var(--accent-purple)' : 'var(--bg-tertiary)' }}
                    >
                        {showAISummary ? 'Hide AI Brief' : 'Gen AI Brief'}
                    </button>
                </div>
            </div>

            {/* AI Summary Section */}
            {showAISummary && (
                <div style={{
                    padding: '12px', background: 'rgba(139, 92, 246, 0.1)', borderBottom: '1px solid var(--accent-purple)',
                    fontSize: '12px', marginBottom: '12px'
                }}>
                    <div style={{ fontWeight: '600', color: 'var(--accent-purple)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        ✨ AI Executive Summary
                    </div>
                    <p style={{ lineHeight: '1.4' }}>
                        Key developments in <strong>{filterRegion === 'ALL' ? 'Global EM' : filterRegion}</strong> markets:
                        Political noise in LATAM remains elevated with Brazil fiscal concerns.
                        In EMEA, Turkey's pivot to orthodoxy is showing mixed results.
                        Asia remains resilient despite China slowdown.
                    </p>
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
                        <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '2px' }}>
                            {item.headline}
                        </div>
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
