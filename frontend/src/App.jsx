
import { useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from './context/AuthContext';
import SplashScreen from './components/SplashScreen';
import AuthScreen from './components/AuthScreen';
import Sidebar from './components/Sidebar';
import Overview from './components/Overview';
import CareerAssessment from './components/CareerAssessment';
import Predictions from './components/Predictions';
import CareerInsights from './components/CareerInsights';
import History from './components/History';
import Profile from './components/Profile';

export default function App() {
    const { loading, isAuthenticated } = useAuth();
    const [showSplash, setShowSplash] = useState(true);
    const [activeItem, setActiveItem] = useState('Overview');

    const finishSplash = useCallback(() => {
        setShowSplash(false);
    }, []);

    if (loading) {
        return <div className="app-loading">Loading Career Navigator...</div>;
    }

    if (!isAuthenticated) {
        return <AuthScreen />;
    }

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
                            <Overview onNavigate={setActiveItem} />
                        ) : activeItem === 'Career Assessment' ? (
                            <CareerAssessment />
                        ) : activeItem === 'Predictions' ? (
                            <Predictions />
                        ) : activeItem === 'Career Insights' ? (
                            <CareerInsights />
                        ) : activeItem === 'History' ? (
                            <History />
                        ) : activeItem === 'Profile' ? (
                            <Profile />
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
