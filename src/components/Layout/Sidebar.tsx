import { LayoutDashboard, BarChart2, Zap, Globe, Radio } from 'lucide-react';

interface SidebarProps {
    activeView: string;
    onNavigate: (view: string) => void;
}

export const Sidebar = ({ activeView, onNavigate }: SidebarProps) => {
    const menuItems = [
        { id: 'OVERVIEW', icon: LayoutDashboard, label: 'Overview' },
        { id: 'COMPARATIVE', icon: BarChart2, label: 'Comparative' },
        { id: 'SIGNALS', icon: Zap, label: 'Signals' },
        { id: 'CALENDAR', icon: Globe, label: 'Calendar' },
        { id: 'CRISIS', icon: Radio, label: 'Crisis Monitor' },
    ];

    return (
        <aside className="sidebar">
            <div style={{ padding: '20px', borderBottom: '1px solid var(--bg-tertiary)' }}>
                <div className="text-xl" style={{ fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                    ANTIGRAVITY
                </div>
                <div className="text-sm text-muted" style={{ marginTop: '4px' }}>
                    MACRO TRADER
                </div>
            </div>

            <nav style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {menuItems.map((item) => (
                    <div
                        key={item.id}
                        onClick={() => onNavigate(item.id)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '10px 12px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            background: activeView === item.id ? 'var(--bg-tertiary)' : 'transparent',
                            color: activeView === item.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                            transition: 'all 0.2s ease',
                            borderLeft: activeView === item.id ? '3px solid var(--accent-blue)' : '3px solid transparent'
                        }}
                    >
                        <item.icon size={16} />
                        <span style={{ fontSize: '13px', fontWeight: 500 }}>{item.label}</span>
                    </div>
                ))}
            </nav>

            <div style={{ marginTop: 'auto', padding: '20px', borderTop: '1px solid var(--bg-tertiary)' }}>
                <div className="text-sm text-muted">System Status</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--status-safe)' }}></div>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Connected (14ms)</span>
                </div>
            </div>
        </aside>
    );
};
