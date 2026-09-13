import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import DataManager from '../utils/DataManager';
import { useTheme } from '../context/ThemeContext';
import { resolvePropertyCoordinates } from '../constants/propertyCoordinates';

const KAKAO_KEY = '23e29b72b33388f59ca4668bce00c82d';
const KAKAO_SDK_URL = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_KEY}&libraries=services&autoload=false`;

// 자산 카테고리별 마커 테마 설정
const getCategoryStyle = (category: string = '', type: string = '') => {
    if (category === '호텔' || category.includes('호텔')) {
        return {
            bg: 'linear-gradient(135deg, #0369a1 0%, #0284c7 100%)',
            border: '#38bdf8',
            icon: '🏨',
            badge: '호텔',
            glow: 'rgba(56, 189, 248, 0.5)'
        };
    }
    if (type === 'npl' || category.includes('NPL')) {
        return {
            bg: 'linear-gradient(135deg, #6b21a8 0%, #9333ea 100%)',
            border: '#c084fc',
            icon: '⚡',
            badge: 'NPL',
            glow: 'rgba(192, 132, 252, 0.5)'
        };
    }
    if (type === 'auction') {
        return {
            bg: 'linear-gradient(135deg, #92400e 0%, #d97706 100%)',
            border: '#fbbf24',
            icon: '⚖️',
            badge: '경매',
            glow: 'rgba(251, 191, 36, 0.5)'
        };
    }
    if (category.includes('공장') || category.includes('제조')) {
        return {
            bg: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
            border: '#60a5fa',
            icon: '🏭',
            badge: '공장',
            glow: 'rgba(96, 165, 250, 0.5)'
        };
    }
    // 기본 일반매물/오피스
    return {
        bg: 'linear-gradient(135deg, #065f46 0%, #059669 100%)',
        border: '#34d399',
        icon: '🏢',
        badge: '일반매물',
        glow: 'rgba(52, 211, 153, 0.5)'
    };
};

const MapSearchPage = () => {
    const { theme, toggleTheme, isDark } = useTheme();

    // 1. 단일 진실 공급원(Single Source of Truth): DataManager 매물 목록
    const [listings, setListings] = useState(() => DataManager.getListings());
    const [selectedListing, setSelectedListing] = useState<any>(null);
    const [mapEngine, setMapEngine] = useState<'kakao' | 'leaflet'>('kakao');
    const [selectedType, setSelectedType] = useState<string>('all');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState<string>('');

    // Refs
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const kakaoMapInstanceRef = useRef<any>(null);
    const kakaoOverlaysRef = useRef<any[]>([]);
    const leafletMapRef = useRef<L.Map | null>(null);
    const leafletMarkersRef = useRef<L.Marker[]>([]);

    // 2. 신규 매물 등록 및 동기화 실시간 감지 (Live Real-Time Sync)
    useEffect(() => {
        const handleListingsUpdate = (e: any) => {
            const fresh = e?.detail?.listings || DataManager.getListings();
            console.log('[MapSearchPage] Real-time listings updated:', fresh.length);
            setListings([...fresh]);
        };

        window.addEventListener('gaja_listings_updated', handleListingsUpdate as EventListener);
        window.addEventListener('storage', handleListingsUpdate);

        return () => {
            window.removeEventListener('gaja_listings_updated', handleListingsUpdate as EventListener);
            window.removeEventListener('storage', handleListingsUpdate);
        };
    }, []);

    // 3. 필터링 및 공인 마스터 좌표 매핑
    const filteredListings = useMemo(() => {
        return listings.filter((item: any) => {
            // 거래유형 필터
            if (selectedType === 'general' && item.type !== 'general') return false;
            if (selectedType === 'npl' && item.type !== 'npl') return false;
            if (selectedType === 'auction' && item.type !== 'auction' && item.type) return false;

            // 카테고리 필터
            if (selectedCategory !== 'all') {
                if (selectedCategory === '호텔' && item.category !== '호텔') return false;
                if (selectedCategory === '오피스빌딩' && item.category !== '오피스빌딩') return false;
                if (selectedCategory === '공장/제조' && !item.category?.includes('공장') && !item.category?.includes('제조')) return false;
                if (selectedCategory === '아파트/주택' && !item.category?.includes('아파트') && !item.category?.includes('주택')) return false;
            }

            // 검색어 필터
            if (searchTerm.trim()) {
                const q = searchTerm.toLowerCase();
                const title = (item.title || '').toLowerCase();
                const loc = (item.location || '').toLowerCase();
                const cat = (item.category || '').toLowerCase();
                if (!title.includes(q) && !loc.includes(q) && !cat.includes(q)) return false;
            }

            return true;
        });
    }, [listings, selectedType, selectedCategory, searchTerm]);

    // 각 매물에 정확한 GPS 좌표 부여 (일직선 더미 좌표 원천 제거)
    const itemsWithCoords = useMemo(() => {
        return filteredListings.map((item: any) => {
            const coords = resolvePropertyCoordinates({
                listingId: item.id,
                address: item.location,
                title: item.title,
                lat: item.lat || item.locationCoords?.lat,
                lng: item.lng || item.locationCoords?.lng
            });
            return {
                ...item,
                coords: coords || { lat: 37.5665, lng: 126.9780 }
            };
        });
    }, [filteredListings]);

    // 거래유형별 매물 카운트
    const counts = useMemo(() => {
        return {
            all: listings.length,
            general: listings.filter((i: any) => i.type === 'general').length,
            npl: listings.filter((i: any) => i.type === 'npl').length,
            auction: listings.filter((i: any) => i.type === 'auction' || !i.type).length
        };
    }, [listings]);

    // 4. 지도 초기화 및 마커 렌더링 (카카오맵 기본 + Leaflet 안정 폴백)
    useEffect(() => {
        let isCancelled = false;
        let retryInterval: any = null;
        let fallbackTimer: any = null;

        // Leaflet 마커 갱신 (카카오와 동일한 커스텀 핀 UI 렌더링)
        const updateLeafletMarkers = (map: any) => {
            leafletMarkersRef.current.forEach((m: any) => {
                try { m.remove(); } catch (e) { }
            });
            leafletMarkersRef.current = [];

            if (itemsWithCoords.length === 0) return;

            const boundsGroup: any[] = [];
            itemsWithCoords.forEach((item: any) => {
                const style = getCategoryStyle(item.category, item.type);
                const displayPrice = item.salePrice || item.minPrice || item.targetPrice || '';
                const shortTitle = (item.title || '').length > 13 ? `${item.title.slice(0, 12)}…` : item.title;

                const customHtml = `
                    <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer; transform: translate(-50%, -100%);">
                        <div style="
                            background: ${style.bg};
                            border: 2px solid ${style.border};
                            border-radius: 14px;
                            padding: 6px 12px;
                            box-shadow: 0 4px 16px rgba(0,0,0,0.5), 0 0 10px ${style.glow};
                            color: #ffffff;
                            font-family: -apple-system, BlinkMacSystemFont, 'Pretendard', sans-serif;
                            display: flex;
                            align-items: center;
                            gap: 6px;
                            white-space: nowrap;
                            pointer-events: auto;
                        ">
                            <span style="font-size: 13px;">${style.icon}</span>
                            <div style="display: flex; flex-direction: column; align-items: flex-start; line-height: 1.2;">
                                <span style="font-size: 11px; font-weight: 800; color: #ffffff;">${shortTitle}</span>
                                <span style="font-size: 10px; font-weight: 700; color: #fef08a;">${displayPrice}</span>
                            </div>
                        </div>
                        <div style="
                            width: 0;
                            height: 0;
                            border-left: 6px solid transparent;
                            border-right: 6px solid transparent;
                            border-top: 9px solid ${style.border};
                            filter: drop-shadow(0 2px 3px rgba(0,0,0,0.4));
                        "></div>
                        <div style="
                            width: 6px;
                            height: 6px;
                            border-radius: 50%;
                            background: #ffffff;
                            border: 1.5px solid ${style.border};
                            margin-top: -3px;
                        "></div>
                    </div>
                `;

                const customIcon = L.divIcon({
                    html: customHtml,
                    className: 'custom-leaflet-marker',
                    iconSize: [0, 0],
                    iconAnchor: [0, 0]
                });

                const marker = L.marker([item.coords.lat, item.coords.lng], { icon: customIcon }).addTo(map);
                marker.on('click', () => {
                    setSelectedListing(item);
                    map.flyTo([item.coords.lat, item.coords.lng], 13, { duration: 1.2 });
                });
                leafletMarkersRef.current.push(marker);
                boundsGroup.push([item.coords.lat, item.coords.lng]);
            });

            if (boundsGroup.length > 1) {
                map.fitBounds(L.latLngBounds(boundsGroup), { padding: [50, 50] });
            } else if (boundsGroup.length === 1) {
                map.setView(boundsGroup[0], 13);
            }
        };

        // Leaflet 폴백 지도 초기화
        const initLeafletFallback = () => {
            if (!mapContainerRef.current) return;
            if (retryInterval) { clearInterval(retryInterval); retryInterval = null; }
            if (fallbackTimer) { clearTimeout(fallbackTimer); fallbackTimer = null; }

            if (leafletMapRef.current) {
                updateLeafletMarkers(leafletMapRef.current);
                return;
            }

            setMapEngine('leaflet');

            const container = mapContainerRef.current;
            container.innerHTML = '';

            const map = L.map(container).setView([36.5, 127.8], 7);
            leafletMapRef.current = map;

            const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

            L.tileLayer(tileUrl, {
                attribution: '&copy; OpenStreetMap contributors',
                maxZoom: 19,
                className: isDark ? 'dark-leaflet-tiles' : ''
            }).addTo(map);

            updateLeafletMarkers(map);
            setTimeout(() => {
                try { map.invalidateSize(); } catch (e) { }
            }, 120);
        };

        // 카카오 지도 커스텀 마커 렌더링
        const renderKakaoMarkers = () => {
            const map = kakaoMapInstanceRef.current;
            if (!map || !(window as any).kakao?.maps) return;

            // 기존 마커 오버레이 정리
            kakaoOverlaysRef.current.forEach(overlay => {
                try { overlay.setMap(null); } catch (e) { }
            });
            kakaoOverlaysRef.current = [];

            if (itemsWithCoords.length === 0) return;

            const bounds = new (window as any).kakao.maps.LatLngBounds();

            itemsWithCoords.forEach((item: any) => {
                const { lat, lng } = item.coords;
                const position = new (window as any).kakao.maps.LatLng(lat, lng);
                bounds.extend(position);

                const style = getCategoryStyle(item.category, item.type);
                const displayPrice = item.salePrice || item.minPrice || item.targetPrice || '';
                const shortTitle = (item.title || '').length > 13 ? `${item.title.slice(0, 12)}…` : item.title;

                // 세련된 인터랙티브 커스텀 핀 DOM 생성
                const contentEl = document.createElement('div');
                contentEl.style.cssText = 'position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer; z-index: 10;';
                contentEl.innerHTML = `
                    <div style="
                        background: ${style.bg};
                        border: 2px solid ${style.border};
                        border-radius: 14px;
                        padding: 6px 12px;
                        box-shadow: 0 4px 16px rgba(0,0,0,0.5), 0 0 10px ${style.glow};
                        color: #ffffff;
                        font-family: -apple-system, BlinkMacSystemFont, 'Pretendard', sans-serif;
                        display: flex;
                        align-items: center;
                        gap: 6px;
                        white-space: nowrap;
                        pointer-events: auto;
                        transition: transform 0.2s ease, box-shadow 0.2s ease;
                    ">
                        <span style="font-size: 13px;">${style.icon}</span>
                        <div style="display: flex; flex-direction: column; align-items: flex-start; line-height: 1.2;">
                            <span style="font-size: 11px; font-weight: 800; color: #ffffff;">${shortTitle}</span>
                            <span style="font-size: 10px; font-weight: 700; color: #fef08a;">${displayPrice}</span>
                        </div>
                    </div>
                    <!-- 하단 정밀 지침 침 -->
                    <div style="
                        width: 0;
                        height: 0;
                        border-left: 6px solid transparent;
                        border-right: 6px solid transparent;
                        border-top: 9px solid ${style.border};
                        filter: drop-shadow(0 2px 3px rgba(0,0,0,0.4));
                    "></div>
                    <!-- 필지 앵커 닷 -->
                    <div style="
                        width: 6px;
                        height: 6px;
                        border-radius: 50%;
                        background: #ffffff;
                        border: 1.5px solid ${style.border};
                        margin-top: -3px;
                    "></div>
                `;

                // 마커 클릭 시 선택 및 지도 중심 부드러운 이동
                contentEl.addEventListener('click', (e) => {
                    e.stopPropagation();
                    setSelectedListing(item);
                    map.panTo(position);
                    if (map.getLevel() > 5) {
                        map.setLevel(4);
                    }
                });

                // 호버 애니메이션
                contentEl.addEventListener('mouseenter', () => {
                    contentEl.style.transform = 'translateY(-4px) scale(1.06)';
                    contentEl.style.zIndex = '999';
                });
                contentEl.addEventListener('mouseleave', () => {
                    contentEl.style.transform = 'none';
                    contentEl.style.zIndex = '10';
                });

                const customOverlay = new (window as any).kakao.maps.CustomOverlay({
                    position: position,
                    content: contentEl,
                    yAnchor: 1.0,
                    zIndex: 10
                });

                customOverlay.setMap(map);
                kakaoOverlaysRef.current.push(customOverlay);
            });

            // 필터링된 매물이 모두 보이도록 자동 범위 설정
            if (itemsWithCoords.length > 1) {
                map.setBounds(bounds);
            } else if (itemsWithCoords.length === 1) {
                map.setCenter(new (window as any).kakao.maps.LatLng(itemsWithCoords[0].coords.lat, itemsWithCoords[0].coords.lng));
                map.setLevel(5);
            }
        };

        // 카카오 지도 셋업 시도
        const setupKakaoMap = () => {
            if (!(window as any).kakao?.maps?.load || !mapContainerRef.current) return false;

            try {
                (window as any).kakao.maps.load(() => {
                    if (isCancelled || !mapContainerRef.current) return;

                    if (fallbackTimer) {
                        clearTimeout(fallbackTimer);
                        fallbackTimer = null;
                    }
                    if (retryInterval) {
                        clearInterval(retryInterval);
                        retryInterval = null;
                    }

                    if (!kakaoMapInstanceRef.current) {
                        const container = mapContainerRef.current;
                        container.innerHTML = '';

                        const options = {
                            center: new (window as any).kakao.maps.LatLng(36.5, 127.8),
                            level: 12,
                            draggable: true,
                            scrollwheel: true
                        };

                        const map = new (window as any).kakao.maps.Map(container, options);
                        kakaoMapInstanceRef.current = map;

                        const mapTypeControl = new (window as any).kakao.maps.MapTypeControl();
                        map.addControl(mapTypeControl, (window as any).kakao.maps.ControlPosition.TOPRIGHT);

                        const zoomControl = new (window as any).kakao.maps.ZoomControl();
                        map.addControl(zoomControl, (window as any).kakao.maps.ControlPosition.RIGHT);

                        // 주요 투자 핫존(Hot Zones) 시각화 원
                        const hotZones = [
                            { name: '종로/광화문', lat: 37.5707, lng: 126.9754, radius: 1500 },
                            { name: '강남 테헤란로', lat: 37.4979, lng: 127.0276, radius: 1800 },
                            { name: '판교 테크노밸리', lat: 37.3948, lng: 127.1111, radius: 1400 },
                            { name: '해운대 마린시티', lat: 35.1587, lng: 129.1604, radius: 2200 }
                        ];

                        hotZones.forEach(hz => {
                            new (window as any).kakao.maps.Circle({
                                map: map,
                                center: new (window as any).kakao.maps.LatLng(hz.lat, hz.lng),
                                radius: hz.radius,
                                strokeWeight: 1,
                                strokeColor: '#f59e0b',
                                strokeOpacity: 0.6,
                                strokeStyle: 'dashed',
                                fillColor: '#f59e0b',
                                fillOpacity: 0.12
                            });
                        });
                    }

                    renderKakaoMarkers();
                    setMapEngine('kakao');
                });
                return true;
            } catch (e) {
                console.error('[MapSearchPage] Kakao setup error:', e);
                return false;
            }
        };

        // 1) 이미 카카오 인스턴스가 활성화되어 있으면 마커만 즉시 갱신
        if (kakaoMapInstanceRef.current && (window as any).kakao?.maps) {
            renderKakaoMarkers();
            return;
        }

        // 2) 이미 Leaflet 인스턴스가 활성화되어 있으면 마커만 즉시 갱신
        if (leafletMapRef.current && mapEngine === 'leaflet') {
            updateLeafletMarkers(leafletMapRef.current);
            return;
        }

        // 3) 최초 지도 인스턴스 초기화:
        // 도메인 미인증 환경이나 네트워크 지연 시에도 1.5초 내 Leaflet 자동 전환 보장
        fallbackTimer = setTimeout(() => {
            if (!kakaoMapInstanceRef.current && !isCancelled) {
                console.warn('[MapSearchPage] Kakao timeout, using Leaflet fallback with real coords');
                initLeafletFallback();
            }
        }, 1500);

        if (!setupKakaoMap()) {
            let attempts = 0;
            retryInterval = setInterval(() => {
                attempts++;
                if (setupKakaoMap() || attempts >= 15) {
                    clearInterval(retryInterval);
                    if (attempts >= 15 && !isCancelled && !kakaoMapInstanceRef.current) {
                        initLeafletFallback();
                    }
                }
            }, 80);
        }

        return () => {
            isCancelled = true;
            if (retryInterval) clearInterval(retryInterval);
            if (fallbackTimer) clearTimeout(fallbackTimer);
        };
    }, [itemsWithCoords, isDark]);

    // 전국 전경 뷰 복귀
    const handleResetMapView = () => {
        if (kakaoMapInstanceRef.current && (window as any).kakao?.maps && itemsWithCoords.length > 0) {
            const bounds = new (window as any).kakao.maps.LatLngBounds();
            itemsWithCoords.forEach((i: any) => bounds.extend(new (window as any).kakao.maps.LatLng(i.coords.lat, i.coords.lng)));
            kakaoMapInstanceRef.current.setBounds(bounds);
        } else if (leafletMapRef.current && itemsWithCoords.length > 0) {
            const bounds = L.latLngBounds(itemsWithCoords.map((i: any) => [i.coords.lat, i.coords.lng]));
            leafletMapRef.current.fitBounds(bounds, { padding: [50, 50] });
        }
    };

    return (
        <div style={{ position: 'relative', width: '100%', height: 'calc(100vh - 72px)', minHeight: '650px', marginTop: '72px', overflow: 'hidden' }}>
            <style>{`
                .dark-leaflet-tiles {
                    filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%) !important;
                }
                .custom-leaflet-marker {
                    background: transparent !important;
                    border: none !important;
                }
            `}</style>

            {/* 상단 스마트 필터 및 검색 허브 (Floating Controls) */}
            <div style={{
                position: 'absolute',
                top: '16px',
                left: '16px',
                right: '16px',
                zIndex: 1100,
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap',
                alignItems: 'center',
                pointerEvents: 'none'
            }}>
                {/* 1. 거래 유형 탭 필터 (전체, 일반매물, NPL, 경매) */}
                <div style={{
                    display: 'flex',
                    background: isDark ? 'rgba(15, 23, 42, 0.88)' : 'rgba(255, 255, 255, 0.92)',
                    backdropFilter: 'blur(16px)',
                    border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(0, 0, 0, 0.08)',
                    borderRadius: '16px',
                    padding: '4px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)',
                    pointerEvents: 'auto'
                }}>
                    {[
                        { key: 'all', label: `전체 (${counts.all})` },
                        { key: 'general', label: `일반매물 (${counts.general})` },
                        { key: 'npl', label: `NPL (${counts.npl})` },
                        { key: 'auction', label: `경매 (${counts.auction})` }
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setSelectedType(tab.key)}
                            style={{
                                padding: '8px 14px',
                                borderRadius: '12px',
                                border: 'none',
                                background: selectedType === tab.key
                                    ? 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)'
                                    : 'transparent',
                                color: selectedType === tab.key ? '#000000' : (isDark ? '#cbd5e1' : '#475569'),
                                fontWeight: selectedType === tab.key ? '800' : '600',
                                fontSize: '0.82rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* 2. 자산 용도 칩 (호텔, 오피스, 공장, 주택) */}
                <div style={{
                    display: 'flex',
                    gap: '6px',
                    background: isDark ? 'rgba(15, 23, 42, 0.88)' : 'rgba(255, 255, 255, 0.92)',
                    backdropFilter: 'blur(16px)',
                    border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(0, 0, 0, 0.08)',
                    borderRadius: '16px',
                    padding: '4px 8px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)',
                    pointerEvents: 'auto',
                    overflowX: 'auto'
                }}>
                    {[
                        { key: 'all', label: '모든 용도' },
                        { key: '호텔', label: '🏨 호텔' },
                        { key: '오피스빌딩', label: '🏢 오피스' },
                        { key: '공장/제조', label: '🏭 공장/물류' },
                        { key: '아파트/주택', label: '🏠 주거/주택' }
                    ].map(cat => (
                        <button
                            key={cat.key}
                            onClick={() => setSelectedCategory(cat.key)}
                            style={{
                                padding: '6px 12px',
                                borderRadius: '10px',
                                border: selectedCategory === cat.key ? '1px solid #fbbf24' : '1px solid transparent',
                                background: selectedCategory === cat.key
                                    ? (isDark ? 'rgba(251, 191, 36, 0.2)' : 'rgba(251, 191, 36, 0.15)')
                                    : 'transparent',
                                color: selectedCategory === cat.key ? (isDark ? '#fbbf24' : '#b45309') : (isDark ? '#94a3b8' : '#64748b'),
                                fontWeight: '700',
                                fontSize: '0.78rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* 3. 검색창 & 전국 리셋 버튼 */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginLeft: 'auto',
                    pointerEvents: 'auto'
                }}>
                    <div style={{
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        background: isDark ? 'rgba(15, 23, 42, 0.88)' : 'rgba(255, 255, 255, 0.92)',
                        backdropFilter: 'blur(16px)',
                        border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(0, 0, 0, 0.08)',
                        borderRadius: '16px',
                        padding: '4px 12px',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)'
                    }}>
                        <i className="fas fa-search" style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.85rem', marginRight: '8px' }}></i>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="매물명, 지역(종로, 해운대 등)..."
                            style={{
                                background: 'transparent',
                                border: 'none',
                                outline: 'none',
                                color: isDark ? '#ffffff' : '#0f172a',
                                fontSize: '0.82rem',
                                width: '160px'
                            }}
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                style={{ background: 'none', border: 'none', color: isDark ? '#94a3b8' : '#64748b', cursor: 'pointer', padding: '2px 4px' }}
                            >
                                <i className="fas fa-times-circle"></i>
                            </button>
                        )}
                    </div>

                    {/* 전국 뷰 리셋 버튼 */}
                    <button
                        onClick={handleResetMapView}
                        title="전체 매물 보기 (전국 지도 리셋)"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: isDark ? 'rgba(15, 23, 42, 0.88)' : 'rgba(255, 255, 255, 0.92)',
                            backdropFilter: 'blur(16px)',
                            border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(0, 0, 0, 0.08)',
                            borderRadius: '16px',
                            padding: '8px 14px',
                            color: isDark ? '#f8fafc' : '#0f172a',
                            fontSize: '0.82rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)',
                            transition: 'all 0.2s'
                        }}
                    >
                        <i className="fas fa-crosshairs" style={{ color: '#fbbf24' }}></i>
                        <span>전국 뷰</span>
                    </button>

                    {/* 테마 토글 버튼 */}
                    <button
                        onClick={toggleTheme}
                        style={{
                            background: isDark ? 'rgba(15, 23, 42, 0.88)' : 'rgba(255, 255, 255, 0.92)',
                            backdropFilter: 'blur(16px)',
                            border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(0, 0, 0, 0.08)',
                            borderRadius: '16px',
                            padding: '8px 12px',
                            color: isDark ? '#f8fafc' : '#0f172a',
                            cursor: 'pointer',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)'
                        }}
                    >
                        {isDark ? <i className="fas fa-sun" style={{ color: '#fbbf24' }}></i> : <i className="fas fa-moon" style={{ color: '#475569' }}></i>}
                    </button>
                </div>
            </div>

            {/* 좌측 하단 선택 매물 상세 카드 (Selected Listing Card) */}
            <AnimatePresence>
                {selectedListing && (
                    <motion.div
                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 30, scale: 0.95 }}
                        transition={{ duration: 0.25 }}
                        style={{
                            position: 'absolute',
                            bottom: '24px',
                            left: '24px',
                            zIndex: 1200,
                            width: '360px',
                            maxWidth: 'calc(100vw - 48px)',
                            background: isDark ? 'rgba(15, 23, 42, 0.92)' : 'rgba(255, 255, 255, 0.96)',
                            backdropFilter: 'blur(20px)',
                            border: isDark ? '1px solid rgba(251, 191, 36, 0.35)' : '1px solid rgba(0, 0, 0, 0.1)',
                            borderRadius: '24px',
                            overflow: 'hidden',
                            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.45)',
                            pointerEvents: 'auto'
                        }}
                    >
                        {/* 이미지 영역 */}
                        <div style={{ height: '170px', position: 'relative', overflow: 'hidden' }}>
                            <img
                                src={selectedListing.img}
                                alt={selectedListing.title}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            <div style={{
                                position: 'absolute',
                                inset: 0,
                                background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 40%, rgba(0,0,0,0.8) 100%)'
                            }} />

                            {/* 뱃지들 */}
                            <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '6px' }}>
                                <span style={{
                                    background: selectedListing.type === 'npl' ? '#9333ea' : (selectedListing.type === 'auction' ? '#d97706' : '#10b981'),
                                    color: '#ffffff',
                                    padding: '4px 8px',
                                    borderRadius: '6px',
                                    fontSize: '0.72rem',
                                    fontWeight: '800'
                                }}>
                                    {selectedListing.type === 'npl' ? 'NPL' : (selectedListing.type === 'auction' ? '경매' : '일반매물')}
                                </span>
                                <span style={{
                                    background: 'rgba(0, 0, 0, 0.65)',
                                    backdropFilter: 'blur(4px)',
                                    color: '#ffffff',
                                    padding: '4px 8px',
                                    borderRadius: '6px',
                                    fontSize: '0.72rem',
                                    fontWeight: '700'
                                }}>
                                    {selectedListing.category}
                                </span>
                            </div>

                            {/* 닫기 버튼 */}
                            <button
                                onClick={() => setSelectedListing(null)}
                                style={{
                                    position: 'absolute',
                                    top: '12px',
                                    right: '12px',
                                    width: '30px',
                                    height: '30px',
                                    borderRadius: '50%',
                                    background: 'rgba(0,0,0,0.6)',
                                    border: 'none',
                                    color: '#ffffff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer'
                                }}
                            >
                                <i className="fas fa-times" style={{ fontSize: '0.85rem' }}></i>
                            </button>

                            {/* 위치 오버레이 */}
                            <div style={{
                                position: 'absolute',
                                bottom: '10px',
                                left: '14px',
                                right: '14px',
                                color: '#ffffff',
                                fontSize: '0.8rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                textShadow: '0 1px 3px rgba(0,0,0,0.8)'
                            }}>
                                <i className="fas fa-map-marker-alt" style={{ color: '#fbbf24' }}></i>
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {selectedListing.location}
                                </span>
                            </div>
                        </div>

                        {/* 정보 영역 */}
                        <div style={{ padding: '18px 20px' }}>
                            <h3 style={{
                                fontSize: '1.1rem',
                                fontWeight: '800',
                                color: isDark ? '#ffffff' : '#0f172a',
                                marginBottom: '12px',
                                lineHeight: '1.4'
                            }}>
                                {selectedListing.title}
                            </h3>

                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'baseline',
                                marginBottom: '6px',
                                paddingBottom: '8px',
                                borderBottom: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #f1f5f9'
                            }}>
                                <span style={{ fontSize: '0.82rem', color: isDark ? '#94a3b8' : '#64748b' }}>희망 매매가</span>
                                <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#10b981' }}>
                                    {selectedListing.salePrice || selectedListing.minPrice || '협의'}
                                </span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '16px' }}>
                                <span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>예상 수익률 / 제원</span>
                                <span style={{ color: '#fbbf24', fontWeight: '700' }}>
                                    {selectedListing.roi || '실사 확인'} {selectedListing.tags?.[0] ? `(${selectedListing.tags[0]})` : ''}
                                </span>
                            </div>

                            <Link
                                to={`/listings/${selectedListing.id}`}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '12px',
                                    background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)',
                                    color: '#000000',
                                    fontWeight: '800',
                                    fontSize: '0.9rem',
                                    textDecoration: 'none',
                                    boxShadow: '0 4px 16px rgba(251, 191, 36, 0.3)',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <span>상세 분석 보고서 보기</span>
                                <i className="fas fa-arrow-right"></i>
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 메인 지도 컨테이너 (카카오 SDK 주입 타겟) */}
            <div
                ref={mapContainerRef}
                style={{
                    width: '100%',
                    height: '100%',
                    background: isDark ? '#09101f' : '#f1f5f9'
                }}
            />
        </div>
    );
};

export default MapSearchPage;
