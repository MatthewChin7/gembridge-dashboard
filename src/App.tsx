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
                <header style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', borderBottom: '1px solid var(--text-primary)', alignItems: 'center' }}>
                    <div>
                        <div className="text-sm text-secondary" style={{ fontWeight: 600, letterSpacing: '0.05em' }}>MARKET REGIME: VOLATILE</div>
                        <h1 className="text-xl">Global Macro Overview</h1>
                    </div>
                </header>

                {/* Dynamic Content Area */}
                <div style={{ padding: '4px', height: '100%' }}>

                    {activeView === 'OVERVIEW' && <CountryOverview />}

                    {activeView === 'COMPARATIVE' && <ComparativeAnalytics />}
                    {activeView === 'SIGNALS' && <TradeSignals />}
                    {activeView === 'CALENDAR' && <EventCalendar />}
                    {activeView === 'CRISIS' && <CrisisMonitor />}
                </div>
            </main>
        </div>
    )
}

export default App
