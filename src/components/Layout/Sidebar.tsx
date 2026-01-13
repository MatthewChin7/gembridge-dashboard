import { useState } from 'react';
import { LayoutDashboard, BarChart2, Zap, Globe, Radio, CreditCard } from 'lucide-react';
import logo from '../../assets/logo.png';

interface SidebarProps {
    activeView: string;
    onNavigate: (view: string) => void;
}

export const Sidebar = ({ activeView, onNavigate }: SidebarProps) => {
    const [trialExpanded, setTrialExpanded] = useState(true);

    const mainItems = [
        { id: 'OVERVIEW', icon: LayoutDashboard, label: 'Overview' },
    ];

    const trialItems = [
        { id: 'CREDIT', icon: CreditCard, label: 'Credit (BETA)' },
        { id: 'COMPARATIVE', icon: BarChart2, label: 'Comparative (BETA)' },
        { id: 'SIGNALS', icon: Zap, label: 'Signals (BETA)' },
        { id: 'CALENDAR', icon: Globe, label: 'Calendar (BETA)' },
        { id: 'CRISIS', icon: Radio, label: 'Crisis Monitor (BETA)' },
    ];

    const SidebarItem = ({ item, isSubtab = false }: { item: any, isSubtab?: boolean }) => (
        <div
            onClick={() => onNavigate(item.id)}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: isSubtab ? '6px 16px 6px 32px' : '8px 16px',
                cursor: 'pointer',
                background: activeView === item.id ? 'var(--text-primary)' : 'transparent',
                color: activeView === item.id ? '#000' : 'var(--text-secondary)',
                fontWeight: activeView === item.id ? 'bold' : 'normal',
                transition: 'none',
            }}
        >
            <item.icon size={12} />
            <span style={{ fontSize: isSubtab ? '10px' : '11px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>{item.label}</span>
        </div>
    );

    return (
        <aside className="sidebar">
            <div
                onClick={() => onNavigate('OVERVIEW')}
                style={{
                    padding: '16px',
                    borderBottom: '1px solid var(--bg-tertiary)',
                    cursor: 'pointer'
                }}
            >
                <img
                    src={logo}
                    alt="Gembridge"
                    style={{ height: '24px', marginBottom: '8px', filter: 'grayscale(100%) contrast(1000%) brightness(100%) sepia(100%) hue-rotate(30deg) saturate(500%)' }}
                />
                <div className="text-sm" style={{ color: 'var(--text-primary)', fontWeight: 'bold', letterSpacing: '0.1em' }}>
                    TERMINAL
                </div>
            </div>

            <nav style={{ padding: '8px 0', display: 'flex', flexDirection: 'column', gap: '1px' }}>
                {mainItems.map((item) => (
                    <SidebarItem key={item.id} item={item} />
                ))}

                {/* Trial Group Header */}
                <div
                    onClick={() => setTrialExpanded(!trialExpanded)}
                    style={{
                        padding: '12px 16px 4px 16px',
                        fontSize: '10px',
                        color: 'var(--text-tertiary)',
                        fontWeight: 'bold',
                        letterSpacing: '0.1em',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}
                >
                    TRIAL
                    <span style={{ fontSize: '8px' }}>{trialExpanded ? '▼' : '▶'}</span>
                </div>

                {trialExpanded && trialItems.map((item) => (
                    <SidebarItem key={item.id} item={item} isSubtab />
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
