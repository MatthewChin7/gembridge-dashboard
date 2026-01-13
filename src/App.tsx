import { useState } from 'react';
import { Sidebar } from './components/Layout/Sidebar';
import { CountryOverview } from './features/CountryOverview';
import { CreditDashboard } from './features/CreditDashboard';
import { ComparativeAnalytics } from './features/ComparativeAnalytics';
import { TradeSignals } from './features/TradeSignals';
import { EventCalendar } from './features/EventCalendar';
import { CrisisMonitor } from './features/CrisisMonitor';

function App() {
    const [activeView, setActiveView] = useState('OVERVIEW');
    const [overviewKey, setOverviewKey] = useState(0);

    const handleNavigate = (view: string) => {
        if (view === 'OVERVIEW' && activeView === 'OVERVIEW') {
            setOverviewKey(prev => prev + 1);
        }
        setActiveView(view);
    };

    return (
        <div className="layout-grid">
            <Sidebar activeView={activeView} onNavigate={handleNavigate} />

            <main className="main-content">
                <header style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', borderBottom: '1px solid var(--text-primary)', alignItems: 'center' }}>
                    <div>
                        <h1 className="text-xl">Global Macro Overview</h1>
                    </div>
                </header>

                {/* Dynamic Content Area */}
                <div style={{ padding: '4px', height: '100%' }}>

                    {activeView === 'OVERVIEW' && <CountryOverview key={overviewKey} />}
                    {activeView === 'CREDIT' && <CreditDashboard />}

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
