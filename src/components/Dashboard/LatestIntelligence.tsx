import { useEffect, useState } from 'react';
import { NewsEvent } from '../../types';
import { NewsService } from '../../services/api';
import { AlertTriangle, TrendingUp, Anchor } from 'lucide-react';

export const LatestIntelligence = () => {
    const [news, setNews] = useState<NewsEvent[]>([]);

    useEffect(() => {
        NewsService.getLatestNews().then(setNews);
    }, []);

    const getIcon = (tags: string[]) => {
        if (tags.includes('POLITICS')) return <AlertTriangle size={14} className="text-red" />;
        if (tags.includes('MONETARY_POLICY')) return <Anchor size={14} className="text-muted" />;
        return <TrendingUp size={14} className="text-green" />;
    };

    return (
        <div className="panel">
            <div className="panel-header">
                <span>Latest Intelligence</span>
                <button className="btn" style={{ fontSize: '10px', padding: '2px 6px' }}>REAL-TIME</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {news.map(item => (
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
            </div>
        </div>
    );
};
