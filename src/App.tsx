import { useState } from 'react';
import { Sidebar } from './components/Layout/Sidebar';
import { CountryOverview } from './features/CountryOverview';
import { ComparativeAnalytics } from './features/ComparativeAnalytics';
import { TradeSignals } from './features/TradeSignals';
import { EventCalendar } from './features/EventCalendar';
import { CrisisMonitor } from './features/CrisisMonitor';

function App() {
    const [activeMode, setActiveMode] = useState<'FX' | 'RATES' | 'EM'>('FX');
    const [activeView, setActiveView] = useState('OVERVIEW');

    const renderContent = () => {
        switch (activeView) {
            case 'OVERVIEW': return <CountryOverview />;
            case 'COMPARATIVE': return <ComparativeAnalytics />;
            case 'SIGNALS': return <TradeSignals />;
            case 'CALENDAR': return <EventCalendar />;
            case 'CRISIS': return <CrisisMonitor />;
            default: return <CountryOverview />;
        }
    };

    return (
        <div className="layout-grid">
            <Sidebar activeView={activeView} onNavigate={setActiveView} />

            <main className="main-content">
                <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', alignItems: 'center' }}>
                    <div>
                        <div className="text-sm text-muted" style={{ fontWeight: 600, letterSpacing: '0.05em' }}>MARKET REGIME: VOLATILE</div>
                        <h1 className="text-xl">Global Macro Overview</h1>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                        {['FX', 'RATES', 'EM'].map((mode) => (
                            <button
                                key={mode}
                                className={`btn ${activeMode === mode ? 'btn-primary' : ''}`}
                                onClick={() => setActiveMode(mode as any)}
                            >
                                {mode} DESK
                            </button>
                        ))}
                    </div>
                </header>

                {renderContent()}
            </main>
        </div>
    )
}

export default App
