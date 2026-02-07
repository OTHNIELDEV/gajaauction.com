import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import ConsultingWizard from './wizard/ConsultingWizard';
import MarketTicker from './common/MarketTicker';
import AIConcierge from './concierge/AIConcierge';

const Layout = () => {
    const [isConsultingOpen, setIsConsultingOpen] = useState(false);
    const location = useLocation();

    // Helper to determine if we should show the layout
    // (In case we later have pages without navbar/footer, e.g. landing pages or admin login)
    // For now, all pages use the main layout.

    const openConsulting = (e) => {
        if (e) e.preventDefault();
        setIsConsultingOpen(true);
    };

    return (
        <div className="app-layout">
            <MarketTicker />
            <Navbar onConsultingClick={openConsulting} />

            <main style={{ minHeight: 'calc(100vh - 350px)' }}>
                <Outlet context={{ openConsulting }} />
            </main>

            <Footer />

            <AIConcierge />
            <ConsultingWizard
                isOpen={isConsultingOpen}
                onClose={() => setIsConsultingOpen(false)}
            />
        </div>
    );
};

export default Layout;
