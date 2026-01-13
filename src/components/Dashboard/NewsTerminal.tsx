
import { useEffect, useState, useMemo } from 'react';
import { ChevronDown, Search, ChevronRight } from 'lucide-react';

interface NewsItem {
    title: string;
    link: string;
    pubDate: string;
    source: string;
    guid: string;
    description?: string;
}

interface NewsTerminalProps {
    selectedCountries?: string[];
}

type ViewMode = 'TOP' | 'FIRST_WORD' | 'DAYBREAK' | 'CN';
type AssetClass = 'ALL' | 'EQUITY' | 'FX' | 'RATES' | 'COMM';

export const NewsTerminal = ({ selectedCountries = [] }: NewsTerminalProps) => {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    // Interactive State
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<ViewMode>('TOP');
    const [assetFilter, setAssetFilter] = useState<AssetClass>('ALL');
    const [showActionsMenu, setShowActionsMenu] = useState(false);
    const [showRegionMenu, setShowRegionMenu] = useState(false);

    // Fetch Logic
    const fetchNews = async () => {
        setLoading(true);
        try {
            let query = '("Emerging Markets" AND (Economy OR Finance OR "Central Bank"))';

            if (selectedCountries.length > 0) {
                // Focus on high-impact keywords to avoid generic section pages
                const countryQuery = selectedCountries.map(c =>
                    `(${c} AND ("breaking news" OR "central bank" OR "bond market" OR "fiscal policy" OR "inflation"))`
                ).join(' OR ');
                query = countryQuery;
            }

            // Public RSS to JSON Proxy
            const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
            const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;

            const res = await fetch(apiUrl);
            const data = await res.json();

            if (data.status === 'ok' && data.items) {
                const items = data.items
                    .map((item: any) => ({
                        title: item.title,
                        link: item.link,
                        pubDate: item.pubDate,
                        source: item.author || 'News',
                        guid: item.guid,
                        description: item.description
                    }))
                    // Filter out generic section headers (common Google News behavior for broad queries)
                    .filter((item: any) => {
                        const titleLower = item.title.toLowerCase();
                        const isGenericSection =
                            titleLower.endsWith(' - the guardian') && (titleLower.includes('economy') || titleLower.includes('business')) ||
                            titleLower.includes('latest news') && item.title.split(' ').length < 5 ||
                            titleLower.includes('google news') ||
                            item.title.length < 15; // Too short to be a real headline
                        return !isGenericSection;
                    });

                setNews(items);
                setLastUpdated(new Date());
            }
        } catch (error) {
            console.error("Failed to fetch news", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNews();
        const interval = setInterval(fetchNews, 60000);
        return () => clearInterval(interval);
    }, [selectedCountries]); // Re-fetch when country context changes

    // Filtering Logic
    const filteredNews = useMemo(() => {
        let result = news;

        // 1. Text Search
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(item =>
                item.title.toLowerCase().includes(q) ||
                item.source.toLowerCase().includes(q)
            );
        }

        // 2. Asset Class Filter (Keyword heuristics)
        if (assetFilter !== 'ALL') {
            const keywords: Record<string, string[]> = {
                'EQUITY': ['stock', 'equity', 'market', 'share', 'ipo', 'dow', 's&p', 'nasdaq'],
                'FX': ['dollar', 'euro', 'currency', 'fx', 'rate', 'central bank', 'policy'],
                'RATES': ['bond', 'yield', 'treasury', 'sovereign', 'debt'],
                'COMM': ['oil', 'gas', 'gold', 'commodity', 'energy', 'mining']
            };
            const terms = keywords[assetFilter];
            result = result.filter(item =>
                terms.some(t => item.title.toLowerCase().includes(t))
            );
        }

        return result;
    }, [news, searchQuery, assetFilter]);

    // View Mode Logic
    const topNews = filteredNews.slice(0, 3);
    const timeNews = filteredNews.slice(3);

    // Styling Constants
    const TERMINAL_BG = '#000000';
    const ACTION_BAR_BG = '#1a1a1a';
    const TEXT_AMBER = '#ff9900';
    const TEXT_WHITE = '#e0e0e0';
    const TEXT_BLUE = '#66ccff';
    const SEPARATOR = '#444';

    // Helper for Asset Buttons
    const AssetBtn = ({ type, color, label }: { type: AssetClass, color: string, label: string }) => (
        <button
            onClick={() => setAssetFilter(type)}
            style={{
                background: assetFilter === type ? color : '#333',
                color: assetFilter === type ? 'black' : color,
                border: 'none',
                padding: '2px 8px',
                fontSize: '10px',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontFamily: 'inherit',
                marginRight: '1px'
            }}
        >
            {label}
        </button>
    );

    return (
        <div style={{
            background: TERMINAL_BG,
            color: TEXT_WHITE,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: "'Inconsolata', 'Courier New', monospace",
            border: '1px solid #333',
            overflow: 'hidden',
            position: 'relative'
        }}>
            {/* Top Command Bar */}
            <div style={{
                background: ACTION_BAR_BG,
                padding: '4px 8px',
                borderBottom: `1px solid ${SEPARATOR}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div style={{ background: '#0033cc', padding: '0 4px', fontSize: '12px', fontWeight: 'bold' }}>N {viewMode}</div>
                    <div style={{ color: TEXT_AMBER, fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                        {selectedCountries.length > 0 ? selectedCountries.join(' | ') : 'GLOBAL'}
                        <ChevronDown size={12} style={{ marginLeft: 4, cursor: 'pointer' }} onClick={() => setShowRegionMenu(!showRegionMenu)} />
                    </div>
                </div>
                <div style={{ fontSize: '11px', color: '#666' }}>
                    {lastUpdated.toLocaleTimeString()}
                </div>
            </div>

            {/* Region/Context Menu (Mockup) */}
            {showRegionMenu && (
                <div style={{
                    position: 'absolute', top: '28px', left: '60px', background: '#222',
                    border: '1px solid #555', zIndex: 50, padding: '4px', fontSize: '11px'
                }}>
                    <div style={{ padding: '4px', cursor: 'pointer', color: 'white' }}>North America</div>
                    <div style={{ padding: '4px', cursor: 'pointer', color: 'white' }}>EMEA</div>
                    <div style={{ padding: '4px', cursor: 'pointer', color: 'white' }}>APAC</div>
                    <div style={{ padding: '4px', cursor: 'pointer', color: 'white' }}>LATAM</div>
                </div>
            )}

            {/* Red Bar Menu (Functions) */}
            <div style={{
                background: '#800000',
                color: 'white',
                padding: '2px 8px',
                fontSize: '11px',
                fontWeight: 'bold',
                display: 'flex',
                gap: '12px',
                alignItems: 'center'
            }}>
                <div
                    onClick={() => setShowActionsMenu(!showActionsMenu)}
                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                    Actions <ChevronDown size={10} />
                </div>
                <span style={{ opacity: 0.5 }}>|</span>
                <span onClick={() => setViewMode('TOP')} style={{ cursor: 'pointer', textDecoration: viewMode === 'TOP' ? 'underline' : '' }}>TOP</span>
                <span onClick={() => setViewMode('FIRST_WORD')} style={{ cursor: 'pointer', textDecoration: viewMode === 'FIRST_WORD' ? 'underline' : '' }}>FrtWrd</span>
                <span onClick={() => setViewMode('DAYBREAK')} style={{ cursor: 'pointer', textDecoration: viewMode === 'DAYBREAK' ? 'underline' : '' }}>DayBrk</span>
                <span onClick={() => setViewMode('CN')} style={{ cursor: 'pointer', textDecoration: viewMode === 'CN' ? 'underline' : '' }}>CN</span>
                <span style={{ opacity: 0.5 }}>|</span>
                <div style={{ display: 'flex' }}>
                    <AssetBtn type="EQUITY" color="#FFE600" label="EQTY" />
                    <AssetBtn type="FX" color="#bd00ff" label="FX" />
                    <AssetBtn type="RATES" color="#00ccff" label="RATES" />
                    <AssetBtn type="COMM" color="#FFA500" label="CMDTY" />
                    <button onClick={() => { setAssetFilter('ALL'); setSearchQuery(''); }} style={{ background: '#333', color: '#fff', border: 'none', fontSize: '10px', marginLeft: '2px', cursor: 'pointer' }}>CLR</button>
                </div>
            </div>

            {/* Actions Menu (Mockup) */}
            {showActionsMenu && (
                <div style={{
                    position: 'absolute', top: '50px', left: '8px', background: '#222',
                    border: '1px solid #555', zIndex: 50, padding: '4px', minWidth: '150px'
                }}>
                    <div style={{ padding: '4px', borderBottom: '1px solid #444', fontSize: '11px' }}>Advanced Search...</div>
                    <div style={{ padding: '4px', borderBottom: '1px solid #444', fontSize: '11px' }}>Set Alerts</div>
                    <div style={{ padding: '4px', fontSize: '11px' }}>Export to Excel</div>
                </div>
            )}

            {/* Search Input Line */}
            <div style={{
                background: TEXT_AMBER,
                color: 'black',
                padding: '2px 8px',
                fontSize: '12px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
            }}>
                <Search size={12} color="black" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="<SEARCH NEWS>"
                    style={{
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        color: 'black',
                        fontWeight: 'bold',
                        fontSize: '12px',
                        fontFamily: 'inherit',
                        flex: 1,
                        textTransform: 'uppercase',
                        placeholderColor: '#444'
                    } as any}
                />
                <span style={{ fontSize: '10px' }}>95) Headlines</span>
            </div>

            {/* Content Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>

                {/* View Mode: TOP (Default) */}
                {viewMode === 'TOP' && (
                    <>
                        <div style={{ marginBottom: '16px' }}>
                            <div style={{ borderBottom: `1px solid ${SEPARATOR}`, marginBottom: '4px', color: TEXT_BLUE, fontSize: '13px', fontWeight: 'bold' }}>
                                Top Ranked News | More »
                            </div>
                            {topNews.map((item, idx) => (
                                <div key={idx} style={{ display: 'flex', fontSize: '13px', marginBottom: '4px', lineHeight: '1.4' }}>
                                    <span style={{ color: '#888', marginRight: '8px', width: '20px' }}>{idx + 1})</span>
                                    <a href={item.link} target="_blank" rel="noreferrer" style={{ color: TEXT_WHITE, textDecoration: 'none', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {item.title}
                                    </a>
                                    <span style={{ color: TEXT_BLUE, marginLeft: '8px', fontSize: '10px' }}>DJ</span>
                                </div>
                            ))}
                        </div>
                        <div>
                            <div style={{ borderBottom: `1px solid ${SEPARATOR}`, marginBottom: '4px', color: TEXT_WHITE, fontSize: '13px', fontWeight: 'bold' }}>
                                Time Ordered News
                            </div>
                            {timeNews.map((item, idx) => (
                                <div key={idx} style={{ display: 'flex', fontSize: '13px', marginBottom: '2px', lineHeight: '1.4' }}>
                                    <span style={{ color: TEXT_BLUE, marginRight: '8px', width: '30px' }}>{900 - idx})</span>
                                    <a href={item.link} target="_blank" rel="noreferrer" style={{ color: TEXT_AMBER, textDecoration: 'none', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {item.title}
                                    </a>
                                    <span style={{ color: TEXT_AMBER, marginLeft: '8px', fontSize: '11px' }}>{new Date(item.pubDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* View Mode: FIRST WORD (Bullets) */}
                {viewMode === 'FIRST_WORD' && (
                    <div>
                        <div style={{ borderBottom: `1px solid ${SEPARATOR}`, marginBottom: '8px', color: 'var(--accent-red)', fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                            First Word | Breaking
                        </div>
                        {filteredNews.map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', fontSize: '12px', marginBottom: '6px', lineHeight: '1.4', alignItems: 'flex-start' }}>
                                <ChevronRight size={12} color={TEXT_AMBER} style={{ marginTop: 2, marginRight: 4 }} />
                                <a href={item.link} target="_blank" rel="noreferrer" style={{ color: TEXT_WHITE, textDecoration: 'none', flex: 1 }}>
                                    <span style={{ color: TEXT_AMBER, fontWeight: 'bold' }}>{new Date(item.pubDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}: </span>
                                    {item.title}
                                </a>
                            </div>
                        ))}
                    </div>
                )}

                {/* View Mode: DAYBREAK (Summary) */}
                {viewMode === 'DAYBREAK' && (
                    <div>
                        <div style={{ background: '#222', padding: '8px', marginBottom: '12px', borderLeft: `4px solid ${TEXT_BLUE}` }}>
                            <h4 style={{ margin: 0, color: TEXT_WHITE, fontSize: '14px' }}>Morning Briefing</h4>
                            <p style={{ margin: '4px 0 0 0', color: '#888', fontSize: '11px' }}>Markets awaiting Central Bank decisions.</p>
                        </div>
                        {filteredNews.map((item, idx) => (
                            <div key={idx} style={{ marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid #222' }}>
                                <a href={item.link} target="_blank" rel="noreferrer" style={{ color: TEXT_AMBER, textDecoration: 'none', fontSize: '13px', display: 'block', fontWeight: 'bold' }}>
                                    {item.title}
                                </a>
                                <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>Source: {item.source} • {new Date(item.pubDate).toLocaleTimeString()}</div>
                            </div>
                        ))}
                    </div>
                )}

                {/* View Mode: CN (Company News) */}
                {viewMode === 'CN' && (
                    <div>
                        <div style={{ borderBottom: `1px solid ${SEPARATOR}`, marginBottom: '4px', color: TEXT_AMBER, fontSize: '13px', fontWeight: 'bold' }}>
                            Company News & Research
                        </div>
                        {/* CN is basically just the feed but implies stricter entity filtering, which is handled up top */}
                        {filteredNews.map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', fontSize: '13px', marginBottom: '2px', lineHeight: '1.4' }}>
                                <span style={{ color: '#666', marginRight: '8px', width: '20px' }}>{idx + 1})</span>
                                <a href={item.link} target="_blank" rel="noreferrer" style={{ color: TEXT_WHITE, textDecoration: 'none', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {item.title}
                                </a>
                            </div>
                        ))}
                    </div>
                )}

                {loading && <div style={{ fontSize: '12px', color: '#666', padding: '8px' }}>Loading Feed...</div>}
                {!loading && filteredNews.length === 0 && <div style={{ fontSize: '12px', color: '#666', padding: '8px' }}>No headlines found.</div>}
            </div>
        </div>
    );
};
