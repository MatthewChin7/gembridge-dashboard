import { useState } from 'react';
import { Sidebar } from './components/Layout/Sidebar';
import { CountryOverview } from './features/CountryOverview';
import { ComparativeAnalytics } from './features/ComparativeAnalytics';
import { TradeSignals } from './features/TradeSignals';
import { EventCalendar } from './features/EventCalendar';
import { CrisisMonitor } from './features/CrisisMonitor';

function App() {
    const [activeView, setActiveView] = useState('OVERVIEW');

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
                                className={`btn ${activeView === mode.toLowerCase() ? 'btn-primary' : ''}`}
                                onClick={() => setActiveView(mode.toLowerCase())}
                            >
                                {mode} DESK
                            </button>
                        ))}
                    </div>
                </header>

                {/* Dynamic Content Area */}
                <div style={{ padding: '24px', maxWidth: '1600px', margin: '0 auto' }}>

                    {activeView === 'dashboard' && <CountryOverview />}
                    {activeView === 'fx' && <CountryOverview desk="FX" />}
                    {activeView === 'rates' && <CountryOverview desk="RATES" />}
                    {activeView === 'em' && <CountryOverview desk="EM" />}

                    {activeView === 'analytics' && <ComparativeAnalytics />}
                    {activeView === 'signals' && <TradeSignals />}
                    {activeView === 'calendar' && <EventCalendar />}
                    {activeView === 'crisis' && <CrisisMonitor />}
                </div>
            </main>
        </div>
    )
}

export default App
