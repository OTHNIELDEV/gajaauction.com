import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import ConsultingWizard from './wizard/ConsultingWizard';


import ChatWidget from './ChatWidget';

const Layout = () => {
    const [isConsultingOpen, setIsConsultingOpen] = useState(false);

    // Helper to determine if we should show the layout
    // (In case we later have pages without navbar/footer, e.g. landing pages or admin login)
    // For now, all pages use the main layout.

    const openConsulting = (e) => {
        if (e) e.preventDefault();
        setIsConsultingOpen(true);
    };

    return (
        <div className="app-layout">

            <Navbar onConsultingClick={openConsulting} />

            <main style={{ minHeight: 'calc(100vh - 350px)' }}>
                <Outlet context={{ openConsulting }} />
            </main>

            <Footer />


            <ConsultingWizard
                isOpen={isConsultingOpen}
                onClose={() => setIsConsultingOpen(false)}
            />
            <ChatWidget />
        </div>
    );
};

export default Layout;
