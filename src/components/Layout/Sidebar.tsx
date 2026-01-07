import { LayoutDashboard, BarChart2, Zap, Globe, Radio } from 'lucide-react';

interface SidebarProps {
    activeView: string;
    onNavigate: (view: string) => void;
}

export const Sidebar = ({ activeView, onNavigate }: SidebarProps) => {
    const menuItems = [
        { id: 'OVERVIEW', icon: LayoutDashboard, label: 'Overview' },
        { id: 'COMPARATIVE', icon: BarChart2, label: 'Comparative (BETA)' },
        { id: 'SIGNALS', icon: Zap, label: 'Signals (BETA)' },
        { id: 'CALENDAR', icon: Globe, label: 'Calendar (BETA)' },
        { id: 'CRISIS', icon: Radio, label: 'Crisis Monitor (BETA)' },
    ];

    return (
        <aside className="sidebar">
            <div style={{ padding: '16px', borderBottom: '1px solid var(--bg-tertiary)' }}>
                <img
                    src="/src/assets/logo.png"
                    alt="Gembridge"
                    style={{ height: '24px', marginBottom: '8px', filter: 'grayscale(100%) contrast(1000%) brightness(100%) sepia(100%) hue-rotate(30deg) saturate(500%)' }} // Attempt to make logo amber-ish
                />
                <div className="text-sm" style={{ color: 'var(--text-primary)', fontWeight: 'bold', letterSpacing: '0.1em' }}>
                    TERMINAL
                </div>
            </div>

            <nav style={{ padding: '8px 0', display: 'flex', flexDirection: 'column', gap: '1px' }}>
                {menuItems.map((item) => (
                    <div
                        key={item.id}
                        onClick={() => onNavigate(item.id)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '8px 16px',
                            borderRadius: '0',
                            cursor: 'pointer',
                            background: activeView === item.id ? 'var(--text-primary)' : 'transparent',
                            color: activeView === item.id ? '#000' : 'var(--text-secondary)',
                            fontWeight: activeView === item.id ? 'bold' : 'normal',
                            transition: 'none', // Instant transition
                        }}
                    >
                        <item.icon size={14} />
                        <span style={{ fontSize: '11px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>{item.label}</span>
                    </div>
                ))}
            </nav>

            <div style={{ marginTop: 'auto', padding: '16px', borderTop: '1px solid var(--bg-tertiary)' }}>
                <div className="text-sm text-secondary">SYSTEM</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '0', background: 'var(--status-safe)' }}></div>
                    <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>ONLINE</span>
                </div>
            </div>
        </aside>
    );
};
