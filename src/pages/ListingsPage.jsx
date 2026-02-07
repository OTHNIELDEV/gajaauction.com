import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import FilterBar from '../components/listings/FilterBar';
import ListingCard from '../components/listings/ListingCard';
import SEO from '../components/SEO';
import { filterCategories } from '../data/mockListings';
import DataManager from '../utils/DataManager';

const ListingsPage = () => {
    const [selectedFilter, setSelectedFilter] = useState("전체");
    const [listings, setListings] = useState([]);

    useEffect(() => {
        DataManager.init();
        setListings(DataManager.getListings());
    }, []);

    const filteredListings = selectedFilter === "전체"
        ? listings
        : listings.filter(item => item.category === selectedFilter || (item.tags && item.tags.includes(selectedFilter)));

    return (
        <div className="listings-page">
            <SEO title="Exclusive Listings" description="가자경매가 엄선한 프리미엄 NPL/경매 물건을 확인하세요." />

            <section className="listings-header" style={{ paddingTop: '150px', paddingBottom: '50px', textAlign: 'center' }}>
                <div className="container">
                    <motion.h2
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-gold"
                    >
                        Exclusive NPL Portfolio
                    </motion.h2>
                    <p style={{ color: 'var(--text-gray)', marginTop: '15px' }}>
                        상위 1%를 위한 가자경매만의 엄선된 투자 포트폴리오입니다.
                    </p>
                </div>
            </section>

            <section className="listings-content" style={{ paddingBottom: '120px' }}>
                <div className="container">
                    <FilterBar
                        categories={filterCategories}
                        selectedFilter={selectedFilter}
                        onSelect={setSelectedFilter}
                    />

                    <motion.div layout className="grid-3" style={{ minHeight: '500px' }}>
                        <AnimatePresence>
                            {filteredListings.map((item) => (
                                <ListingCard key={item.id} item={item} />
                            ))}
                        </AnimatePresence>
                    </motion.div>

                    {filteredListings.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-gray)' }}>
                            해당하는 매물이 없습니다.
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default ListingsPage;
