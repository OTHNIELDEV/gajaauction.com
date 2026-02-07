import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import Hero from '../components/Hero';
import Stats from '../components/Stats';
import AITech from '../components/AITech';
import Process from '../components/Process';
import Services from '../components/Services';
import SuccessStories from '../components/SuccessStories';
import FeaturedListings from '../components/FeaturedListings';
import PartnersBanner from '../components/PartnersBanner';
import SEO from '../components/SEO';
import GRASModal from '../components/GRASModal';

const Home = () => {
    const [isGrasModalOpen, setIsGrasModalOpen] = useState(false);
    const [grasSearchQuery, setGrasSearchQuery] = useState("");
    const { openConsulting } = useOutletContext();

    const handleGrasSearch = (query) => {
        setGrasSearchQuery(query);
        setIsGrasModalOpen(true);
    };

    return (
        <div className="home-page">
            <Hero onConsultingClick={openConsulting} />
            <Stats />
            <AITech onSearch={handleGrasSearch} />
            <Process />
            <Services />
            <SuccessStories />
            <FeaturedListings />
            <PartnersBanner />

            <GRASModal
                isOpen={isGrasModalOpen}
                onClose={() => setIsGrasModalOpen(false)}
                searchTerm={grasSearchQuery}
            />
        </div>
    );
};

export default Home;
