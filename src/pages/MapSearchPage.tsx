import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import * as L from 'leaflet';
import { mockListings } from '../data/mockListings';

// No assets for now

const MapSearchPage = () => {
    const mapRef = useRef<L.Map | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const [selectedListing, setSelectedListing] = useState<any>(null);
    const [mapStyle, setMapStyle] = useState<'dark' | 'light'>('dark');
    const tileLayerRef = useRef<L.TileLayer | null>(null);

    // Toggle Map Style
    useEffect(() => {
        if (!tileLayerRef.current) return;
        if (mapStyle === 'dark') {
            tileLayerRef.current.setUrl('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png');
        } else {
            tileLayerRef.current.setUrl('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
        }
    }, [mapStyle]);

    useEffect(() => {
        if (!mapContainerRef.current || mapRef.current) return;

        console.log("Map initializing...");
        try {
            // Fix Icons safely using CDN
            const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
            const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
            const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

            delete (L.Icon.Default.prototype as any)._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: iconRetinaUrl,
                iconUrl: iconUrl,
                shadowUrl: shadowUrl,
            });

            // Initialize Map
            const map = L.map(mapContainerRef.current).setView([37.5665, 126.9780], 7);
            mapRef.current = map;

            // Initial Tile Layer
            const darkUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
            const lightUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
            const initialUrl = mapStyle === 'dark' ? darkUrl : lightUrl;

            const tileLayer = L.tileLayer(initialUrl, {
                attribution: '&copy; OpenStreetMap contributors',
                maxZoom: 19
            }).addTo(map);
            tileLayerRef.current = tileLayer;

            // ... rest of logic (Heatmap, Markers) ...(Hot Zones)
            const hotZones = [
                { lat: 37.4979, lng: 127.0276, radius: 1500 }, // Gangnam
                { lat: 37.3948, lng: 127.1111, radius: 1200 }, // Pangyo
                { lat: 35.1587, lng: 129.1604, radius: 2000 }  // Haeundae
            ];

            hotZones.forEach(zone => {
                L.circle([zone.lat, zone.lng], {
                    color: 'red',
                    fillColor: '#f03',
                    fillOpacity: 0.3,
                    radius: zone.radius,
                    stroke: false
                }).addTo(map);
            });

            // Markers
            mockListings.forEach((listing, idx) => {
                // Mock Coords
                const pos: [number, number] = idx === 0 ? [37.4979, 127.0276] : // Gangnam
                    idx === 1 ? [37.3948, 127.1111] : // Pangyo
                        idx === 2 ? [35.1587, 129.1604] : // Busan
                            [37.5 + idx * 0.1, 127.0 + idx * 0.1];

                const marker = L.marker(pos).addTo(map);

                // Click Handler
                marker.on('click', () => {
                    setSelectedListing(listing);
                    map.flyTo(pos, 12, { duration: 1.5 });
                });
            });

            console.log("Map initialized successfully with markers");
        } catch (e) {
            console.error("Map initialization failed", e);
        }

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        }
    }, []);

    return (
        <div style={{ position: 'relative', width: '100%', height: 'calc(100vh - 80px)', marginTop: '80px', overflow: 'hidden' }}>

            {/* Sidebar / Overlay */}
            <div style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                zIndex: 1000,
                width: '350px',
                maxWidth: 'calc(100vw - 40px)',
                pointerEvents: 'none'
            }}>
                <div className="glass-card" style={{ padding: '20px', pointerEvents: 'auto' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
                        <i className="fas fa-map-marked-alt text-gold" style={{ marginRight: '10px' }}></i>
                        NPL Map Search
                    </h2>
                    <p style={{ color: '#aaa', fontSize: '0.9rem' }}>
                        붉은색 영역은 최근 경매 낙찰가율이 급상승 중인 <strong>Hot Investment Zone</strong>입니다.
                    </p>
                </div>

                <AnimatePresence>
                    {selectedListing && (
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="glass-card"
                            style={{ marginTop: '20px', padding: '0', overflow: 'hidden', pointerEvents: 'auto' }}
                        >
                            <div style={{ height: '150px', overflow: 'hidden', position: 'relative' }}>
                                <img src={selectedListing.img} alt={selectedListing.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <div className="badge" style={{ position: 'absolute', top: '10px', left: '10px' }}>{selectedListing.category}</div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedListing(null);
                                    }}
                                    style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                            <div style={{ padding: '20px' }}>
                                <h3 style={{ fontSize: '1.2rem', marginBottom: '5px' }}>{selectedListing.title}</h3>
                                <div style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '15px' }}>{selectedListing.location}</div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                    <span>감정가</span>
                                    <span style={{ textDecoration: 'line-through', color: '#888' }}>{selectedListing.appraisal}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                                    <span>최저가</span>
                                    <span className="text-gold" style={{ fontWeight: 'bold' }}>{selectedListing.minPrice}</span>
                                </div>

                                <Link to={`/listings/${selectedListing.id}`} className="btn-primary" style={{ display: 'block', textAlign: 'center', width: '100%' }}>
                                    상세 분석 보기
                                </Link>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Map Style Toggle */}
            <button
                onClick={() => setMapStyle(prev => prev === 'dark' ? 'light' : 'dark')}
                style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    zIndex: 1000,
                    padding: '10px 15px',
                    borderRadius: '20px',
                    border: 'none',
                    background: mapStyle === 'dark' ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.8)',
                    color: mapStyle === 'dark' ? '#000' : '#fff',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                    transition: 'all 0.3s ease'
                }}
            >
                {mapStyle === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </button>

            {/* Map Container */}
            <div ref={mapContainerRef} style={{ width: '100%', height: '100%', background: '#0a192f' }} />
        </div>
    );
};

export default MapSearchPage;
