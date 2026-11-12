
import { useTheme } from './context/ThemeContext';
import { Sun, Moon, Monitor, ArrowUpRight, BrainCircuit } from 'lucide-react';
import { useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import SplashScreen from './components/SplashScreen';
import Sidebar from './components/Sidebar';
import Overview from './components/Overview';
import CareerAssessment from './components/CareerAssessment';
import Predictions from './components/Predictions';
import CareerInsights from './components/CareerInsights';
import History from './components/History';

export default function App() {
    const { theme, activeTheme, setTheme } = useTheme();
    const [showSplash, setShowSplash] = useState(true);
    const [activeItem, setActiveItem] = useState('Overview');

    const finishSplash = useCallback(() => {
        setShowSplash(false);
    }, []);

    return (
        <AnimatePresence mode="wait">
            {showSplash ? (
                <SplashScreen key="splash" onComplete={finishSplash} />
            ) : (
                <div className="app-layout" key="main-app">
                    <Sidebar
                        activeItem={activeItem}
                        onNavigate={setActiveItem}
                    />
                    <main className="app-main">
                        {activeItem === 'Overview' ? (
                            <Overview />
                        ) : activeItem === 'Career Assessment' ? (
                            <CareerAssessment />
                        ) : activeItem === 'Predictions' ? (
                            <Predictions />
                        ) : activeItem === 'Career Insights' ? (
                            <CareerInsights />
                        ) : activeItem === 'History' ? (
                            <History />
                        ) : (
                            <div className="dashboard-panel">
                                <p className="eyebrow">CAREER NAVIGATOR / WORKSPACE</p>
                                <h2>{activeItem}</h2>
                                <p>This section will be implemented in the next development stage.</p>
                            </div>
                        )}
                    </main>
                </div>
            )}
        </AnimatePresence>
    );
}
