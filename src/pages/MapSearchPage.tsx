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

// 글로벌 파트너스 자산운용 및 해외 핵심 거점
const GLOBAL_HUBS = [
    {
        id: 'global-ny',
        name: '뉴욕 맨해튼 글로벌 데스크',
        city: 'New York, USA',
        coords: { lat: 40.7128, lng: -74.0060 },
        badge: '글로벌 파트너스',
        desc: '월스트리트 프라임 오피스 및 CRE 펀드 연계 네트워크',
        icon: '🗽'
    },
    {
        id: 'global-tokyo',
        name: '도쿄 마루노우치 자산운용 데스크',
        city: 'Tokyo, Japan',
        coords: { lat: 35.6812, lng: 139.7671 },
        badge: '글로벌 파트너스',
        desc: '아시아-태평양 상업용 부동산 및 호텔 자산 연계',
        icon: '🗼'
    },
    {
        id: 'global-sg',
        name: '싱가포르 마리나베이 웰스 허브',
        city: 'Singapore',
        coords: { lat: 1.2838, lng: 103.8591 },
        badge: '글로벌 파트너스',
        desc: '글로벌 패밀리오피스 및 프라이빗 펀드 협력 거점',
        icon: '🦁'
    },
    {
        id: 'global-london',
        name: '런던 시티 유럽 대체투자 데스크',
        city: 'London, UK',
        coords: { lat: 51.5138, lng: -0.0984 },
        badge: '글로벌 파트너스',
        desc: '유럽 프라임 부동산 및 글로벌 사모펀드(PE) 네트워크',
        icon: '🏰'
    }
];

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
    const [selectedHub, setSelectedHub] = useState<any>(null);

    // 기본 지도를 광활한 '글로벌 세계 지도(leaflet)'로 설정하여 협소함 원천 해소
    const [mapEngine, setMapEngine] = useState<'leaflet' | 'kakao'>('leaflet');
    const [selectedType, setSelectedType] = useState<string>('all');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [activePreset, setActivePreset] = useState<'global' | 'capital' | 'busan' | 'korea'>('korea');

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

    // 3. 브라우저 전체화면 감지
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().then(() => {
                setIsFullscreen(true);
            }).catch((err) => {
                console.error('Fullscreen error:', err);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen().then(() => {
                    setIsFullscreen(false);
                }).catch((err) => {
                    console.error('Exit fullscreen error:', err);
                });
            }
        }
    };

    // 4. 필터링 및 좌표 매핑
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

    // 5. Leaflet 마커 렌더링 함수
    const updateLeafletMarkers = (map: L.Map) => {
        leafletMarkersRef.current.forEach((m) => {
            try { m.remove(); } catch (e) { }
        });
        leafletMarkersRef.current = [];

        // A. 글로벌 해외 거점 허브 마커 렌더링
        GLOBAL_HUBS.forEach((hub) => {
            const hubHtml = `
                <div class="custom-hub-pin" style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer; transform: translate(-50%, -100%); z-index: 8;">
                    <div style="
                        background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);
                        border: 2px solid #818cf8;
                        border-radius: 14px;
                        padding: 6px 12px;
                        box-shadow: 0 4px 18px rgba(0,0,0,0.6), 0 0 14px rgba(129, 140, 248, 0.6);
                        color: #ffffff;
                        font-family: -apple-system, BlinkMacSystemFont, 'Pretendard', sans-serif;
                        display: flex;
                        align-items: center;
                        gap: 6px;
                        white-space: nowrap;
                    ">
                        <span style="font-size: 14px;">${hub.icon}</span>
                        <div style="display: flex; flex-direction: column; align-items: flex-start; line-height: 1.2;">
                            <span style="font-size: 11px; font-weight: 800; color: #e0e7ff;">${hub.name}</span>
                            <span style="font-size: 9px; font-weight: 700; color: #a5b4fc;">${hub.city}</span>
                        </div>
                    </div>
                    <div style="
                        width: 0;
                        height: 0;
                        border-left: 6px solid transparent;
                        border-right: 6px solid transparent;
                        border-top: 8px solid #818cf8;
                    "></div>
                    <div style="
                        width: 6px;
                        height: 6px;
                        border-radius: 50%;
                        background: #c7d2fe;
                        box-shadow: 0 0 8px #818cf8;
                        margin-top: -3px;
                    "></div>
                </div>
            `;

            const hubIcon = L.divIcon({
                html: hubHtml,
                className: 'custom-leaflet-hub-marker',
                iconSize: [0, 0],
                iconAnchor: [0, 0]
            });

            const marker = L.marker([hub.coords.lat, hub.coords.lng], { icon: hubIcon }).addTo(map);
            marker.on('click', () => {
                setSelectedListing(null);
                setSelectedHub(hub);
                map.flyTo([hub.coords.lat, hub.coords.lng], 11, { duration: 1.2 });
            });
            leafletMarkersRef.current.push(marker);
        });

        // B. 국내 자산 매물 마커 렌더링
        if (itemsWithCoords.length > 0) {
            itemsWithCoords.forEach((item: any) => {
                const style = getCategoryStyle(item.category, item.type);
                const displayPrice = item.salePrice || item.minPrice || item.targetPrice || '';
                const shortTitle = (item.title || '').length > 13 ? `${item.title.slice(0, 12)}…` : item.title;

                const customHtml = `
                    <div class="custom-property-pin" style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer; transform: translate(-50%, -100%); z-index: 10;">
                        <div style="
                            background: ${style.bg};
                            border: 2px solid ${style.border};
                            border-radius: 14px;
                            padding: 6px 12px;
                            box-shadow: 0 4px 16px rgba(0,0,0,0.5), 0 0 12px ${style.glow};
                            color: #ffffff;
                            font-family: -apple-system, BlinkMacSystemFont, 'Pretendard', sans-serif;
                            display: flex;
                            align-items: center;
                            gap: 6px;
                            white-space: nowrap;
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
                    setSelectedHub(null);
                    setSelectedListing(item);
                    map.flyTo([item.coords.lat, item.coords.lng], 13, { duration: 1.2 });
                });
                leafletMarkersRef.current.push(marker);
            });
        }
    };

    // 6. Leaflet (글로벌 세계 지도) 초기화
    const initLeafletMap = () => {
        if (!mapContainerRef.current) return;

        // 기존 Leaflet 정리
        if (leafletMapRef.current) {
            try {
                leafletMapRef.current.remove();
            } catch (e) { }
            leafletMapRef.current = null;
        }

        const container = mapContainerRef.current;
        container.innerHTML = '';

        // 기본 시야: 대한민국 및 동아시아를 한눈에 조망하는 시원한 뷰
        const map = L.map(container, {
            center: [36.5, 127.8],
            zoom: 7,
            zoomControl: false,
            minZoom: 2,
            maxZoom: 19
        });
        leafletMapRef.current = map;

        // 고품질 글로벌 지도 타일 (CartoDB Voyager / DarkMatter - 레티나 & 글로벌 지명 완벽 지원)
        const tileUrl = isDark
            ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
            : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

        L.tileLayer(tileUrl, {
            attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
            subdomains: 'abcd',
            maxZoom: 19
        }).addTo(map);

        L.control.scale({ imperial: false, position: 'bottomright' }).addTo(map);

        updateLeafletMarkers(map);

        // 첫 진입 시 전국 매물이 좁지 않게 여유 있는 패딩으로 피팅
        if (itemsWithCoords.length > 1) {
            const bounds = L.latLngBounds(itemsWithCoords.map((i: any) => [i.coords.lat, i.coords.lng]));
            map.fitBounds(bounds, { padding: [100, 100], maxZoom: 10 });
        }

        setTimeout(() => {
            try { map.invalidateSize(); } catch (e) { }
        }, 150);
    };

    // 7. 카카오 지도 렌더링 함수
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
            `;

            contentEl.addEventListener('click', (e) => {
                e.stopPropagation();
                setSelectedHub(null);
                setSelectedListing(item);
                map.panTo(position);
                if (map.getLevel() > 5) {
                    map.setLevel(4);
                }
            });

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

        if (itemsWithCoords.length > 1) {
            map.setBounds(bounds);
        } else if (itemsWithCoords.length === 1) {
            map.setCenter(new (window as any).kakao.maps.LatLng(itemsWithCoords[0].coords.lat, itemsWithCoords[0].coords.lng));
            map.setLevel(5);
        }
    };

    // 8. 카카오 지도 초기화
    const initKakaoMap = () => {
        if (!mapContainerRef.current) return;

        // 기존 Leaflet 정리
        if (leafletMapRef.current) {
            try { leafletMapRef.current.remove(); } catch (e) { }
            leafletMapRef.current = null;
        }

        const container = mapContainerRef.current;
        container.innerHTML = '';

        const setup = () => {
            try {
                (window as any).kakao.maps.load(() => {
                    const options = {
                        center: new (window as any).kakao.maps.LatLng(36.5, 127.8),
                        level: 11,
                        draggable: true,
                        scrollwheel: true
                    };

                    const map = new (window as any).kakao.maps.Map(container, options);
                    kakaoMapInstanceRef.current = map;

                    const mapTypeControl = new (window as any).kakao.maps.MapTypeControl();
                    map.addControl(mapTypeControl, (window as any).kakao.maps.ControlPosition.TOPRIGHT);

                    const zoomControl = new (window as any).kakao.maps.ZoomControl();
                    map.addControl(zoomControl, (window as any).kakao.maps.ControlPosition.RIGHT);

                    // 주요 투자 핫존
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

                    renderKakaoMarkers();
                });
            } catch (e) {
                console.error('[MapSearchPage] Kakao setup error, switching to Leaflet:', e);
                setMapEngine('leaflet');
            }
        };

        if ((window as any).kakao?.maps?.load) {
            setup();
        } else {
            const script = document.createElement('script');
            script.src = KAKAO_SDK_URL;
            script.onload = setup;
            script.onerror = () => {
                console.warn('Kakao SDK load failed, reverting to Leaflet');
                setMapEngine('leaflet');
            };
            document.head.appendChild(script);
        }
    };

    // 9. 지도 엔진 및 테마 전환 시 렌더링 트리거
    useEffect(() => {
        if (mapEngine === 'leaflet') {
            initLeafletMap();
        } else {
            initKakaoMap();
        }

        return () => {
            if (leafletMapRef.current) {
                try { leafletMapRef.current.remove(); } catch (e) { }
                leafletMapRef.current = null;
            }
            kakaoMapInstanceRef.current = null;
        };
    }, [mapEngine, isDark]);

    // 매물 데이터 변경 시 마커만 리프레시
    useEffect(() => {
        if (mapEngine === 'leaflet' && leafletMapRef.current) {
            updateLeafletMarkers(leafletMapRef.current);
        } else if (mapEngine === 'kakao' && kakaoMapInstanceRef.current) {
            renderKakaoMarkers();
        }
    }, [itemsWithCoords]);

    // 10. 스마트 뷰 프리셋 핸들러 (원클릭 시야 점프)
    const handleViewPreset = (preset: 'global' | 'capital' | 'busan' | 'korea') => {
        setActivePreset(preset);

        if (preset === 'global') {
            // 전 세계 글로벌 뷰는 Leaflet 엔진에서 가장 완벽하게 작동
            if (mapEngine !== 'leaflet') {
                setMapEngine('leaflet');
            }
            setTimeout(() => {
                if (leafletMapRef.current) {
                    leafletMapRef.current.flyTo([22.0, 115.0], 3, { duration: 1.5 });
                }
            }, 200);
            return;
        }

        if (mapEngine === 'leaflet' && leafletMapRef.current) {
            const map = leafletMapRef.current;
            if (preset === 'capital') {
                map.flyTo([37.54, 126.98], 11, { duration: 1.2 });
            } else if (preset === 'busan') {
                map.flyTo([35.16, 129.15], 13, { duration: 1.2 });
            } else if (preset === 'korea') {
                if (itemsWithCoords.length > 0) {
                    const bounds = L.latLngBounds(itemsWithCoords.map((i: any) => [i.coords.lat, i.coords.lng]));
                    map.fitBounds(bounds, { padding: [80, 80], maxZoom: 10 });
                } else {
                    map.flyTo([36.5, 127.8], 7, { duration: 1.2 });
                }
            }
        } else if (mapEngine === 'kakao' && kakaoMapInstanceRef.current && (window as any).kakao?.maps) {
            const map = kakaoMapInstanceRef.current;
            if (preset === 'capital') {
                map.panTo(new (window as any).kakao.maps.LatLng(37.54, 126.98));
                map.setLevel(8);
            } else if (preset === 'busan') {
                map.panTo(new (window as any).kakao.maps.LatLng(35.16, 129.15));
                map.setLevel(6);
            } else if (preset === 'korea') {
                if (itemsWithCoords.length > 0) {
                    const bounds = new (window as any).kakao.maps.LatLngBounds();
                    itemsWithCoords.forEach((i: any) => bounds.extend(new (window as any).kakao.maps.LatLng(i.coords.lat, i.coords.lng)));
                    map.setBounds(bounds);
                } else {
                    map.setCenter(new (window as any).kakao.maps.LatLng(36.5, 127.8));
                    map.setLevel(11);
                }
            }
        }
    };

    // 줌 인/아웃 핸들러
    const handleZoomIn = () => {
        if (mapEngine === 'leaflet' && leafletMapRef.current) {
            leafletMapRef.current.zoomIn();
        } else if (mapEngine === 'kakao' && kakaoMapInstanceRef.current) {
            kakaoMapInstanceRef.current.setLevel(kakaoMapInstanceRef.current.getLevel() - 1);
        }
    };

    const handleZoomOut = () => {
        if (mapEngine === 'leaflet' && leafletMapRef.current) {
            leafletMapRef.current.zoomOut();
        } else if (mapEngine === 'kakao' && kakaoMapInstanceRef.current) {
            kakaoMapInstanceRef.current.setLevel(kakaoMapInstanceRef.current.getLevel() + 1);
        }
    };

    return (
        <div style={{
            position: 'relative',
            width: '100%',
            height: isFullscreen ? '100vh' : 'calc(100vh - 72px)',
            marginTop: isFullscreen ? '0' : '72px',
            overflow: 'hidden',
            transition: 'all 0.3s ease'
        }}>
            <style>{`
                .custom-leaflet-marker, .custom-leaflet-hub-marker {
                    background: transparent !important;
                    border: none !important;
                }
                .custom-property-pin:hover, .custom-hub-pin:hover {
                    transform: translate(-50%, -105%) scale(1.08) !important;
                    z-index: 9999 !important;
                    transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
                }
            `}</style>

            {/* 상단 스마트 컨트롤 허브 (Floating Top Bar) */}
            <div style={{
                position: 'absolute',
                top: '16px',
                left: '16px',
                right: '16px',
                zIndex: 1100,
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                pointerEvents: 'none'
            }}>
                {/* 1행: 필터, 글로벌 엔진 스위처, 검색, 전체화면 */}
                <div style={{
                    display: 'flex',
                    gap: '10px',
                    flexWrap: 'wrap',
                    alignItems: 'center'
                }}>
                    {/* 1. 거래 유형 탭 필터 (전체, 일반매물, NPL, 경매) */}
                    <div style={{
                        display: 'flex',
                        background: isDark ? 'rgba(15, 23, 42, 0.92)' : 'rgba(255, 255, 255, 0.95)',
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
                                    padding: '8px 12px',
                                    borderRadius: '12px',
                                    border: 'none',
                                    background: selectedType === tab.key
                                        ? 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)'
                                        : 'transparent',
                                    color: selectedType === tab.key ? '#000000' : (isDark ? '#cbd5e1' : '#475569'),
                                    fontWeight: selectedType === tab.key ? '800' : '600',
                                    fontSize: '0.8rem',
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
                        background: isDark ? 'rgba(15, 23, 42, 0.92)' : 'rgba(255, 255, 255, 0.95)',
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
                                    padding: '6px 10px',
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

                    {/* 3. [핵심] 글로벌 세계 지도 <-> 국내 정밀 지도 엔진 스위처 */}
                    <div style={{
                        display: 'flex',
                        background: isDark ? 'rgba(15, 23, 42, 0.92)' : 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(16px)',
                        border: isDark ? '1px solid rgba(251, 191, 36, 0.4)' : '1px solid rgba(217, 119, 6, 0.3)',
                        borderRadius: '16px',
                        padding: '4px',
                        boxShadow: '0 8px 32px rgba(251, 191, 36, 0.15)',
                        pointerEvents: 'auto'
                    }}>
                        <button
                            onClick={() => setMapEngine('leaflet')}
                            title="전 세계를 조망하는 프리미엄 글로벌 세계 지도"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px',
                                padding: '6px 12px',
                                borderRadius: '12px',
                                border: 'none',
                                background: mapEngine === 'leaflet'
                                    ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
                                    : 'transparent',
                                color: mapEngine === 'leaflet' ? '#ffffff' : (isDark ? '#94a3b8' : '#64748b'),
                                fontWeight: '800',
                                fontSize: '0.78rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                whiteSpace: 'nowrap',
                                boxShadow: mapEngine === 'leaflet' ? '0 2px 10px rgba(59, 130, 246, 0.4)' : 'none'
                            }}
                        >
                            <span>🌐</span>
                            <span>글로벌 세계 지도</span>
                        </button>
                        <button
                            onClick={() => setMapEngine('kakao')}
                            title="국토지리정보원 기반 대한민국 정밀 지도"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px',
                                padding: '6px 12px',
                                borderRadius: '12px',
                                border: 'none',
                                background: mapEngine === 'kakao'
                                    ? 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)'
                                    : 'transparent',
                                color: mapEngine === 'kakao' ? '#000000' : (isDark ? '#94a3b8' : '#64748b'),
                                fontWeight: '800',
                                fontSize: '0.78rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                whiteSpace: 'nowrap',
                                boxShadow: mapEngine === 'kakao' ? '0 2px 10px rgba(251, 191, 36, 0.4)' : 'none'
                            }}
                        >
                            <span>🇰🇷</span>
                            <span>국내 정밀 지도</span>
                        </button>
                    </div>

                    {/* 4. 검색창 & 우측 도구 */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginLeft: 'auto',
                        pointerEvents: 'auto'
                    }}>
                        {/* 검색 인풋 */}
                        <div style={{
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center',
                            background: isDark ? 'rgba(15, 23, 42, 0.92)' : 'rgba(255, 255, 255, 0.95)',
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
                                placeholder="매물명, 지역(테헤란로, 해운대 등)..."
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    outline: 'none',
                                    color: isDark ? '#ffffff' : '#0f172a',
                                    fontSize: '0.82rem',
                                    width: '150px'
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

                        {/* 전체화면(Full Screen) 토글 버튼 */}
                        <button
                            onClick={toggleFullscreen}
                            title={isFullscreen ? '창 모드로 복귀' : '전체화면으로 시원하게 보기'}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                background: isFullscreen ? '#3b82f6' : (isDark ? 'rgba(15, 23, 42, 0.92)' : 'rgba(255, 255, 255, 0.95)'),
                                backdropFilter: 'blur(16px)',
                                border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(0, 0, 0, 0.08)',
                                borderRadius: '16px',
                                padding: '8px 12px',
                                color: isFullscreen ? '#ffffff' : (isDark ? '#f8fafc' : '#0f172a'),
                                fontSize: '0.82rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)',
                                transition: 'all 0.2s'
                            }}
                        >
                            <i className={`fas ${isFullscreen ? 'fa-compress' : 'fa-expand'}`} style={{ color: isFullscreen ? '#ffffff' : '#38bdf8' }}></i>
                            <span>{isFullscreen ? '전체화면 종료' : '전체화면'}</span>
                        </button>

                        {/* 테마 토글 버튼 */}
                        <button
                            onClick={toggleTheme}
                            title={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
                            style={{
                                background: isDark ? 'rgba(15, 23, 42, 0.92)' : 'rgba(255, 255, 255, 0.95)',
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

                {/* 2행: 원클릭 스마트 뷰 프리셋 바 (글로벌 뷰 / 수도권 / 부산 / 전국) */}
                <div style={{
                    alignSelf: 'flex-start',
                    display: 'flex',
                    gap: '8px',
                    background: isDark ? 'rgba(15, 23, 42, 0.88)' : 'rgba(255, 255, 255, 0.92)',
                    backdropFilter: 'blur(16px)',
                    border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.06)',
                    borderRadius: '14px',
                    padding: '4px 6px',
                    boxShadow: '0 6px 24px rgba(0, 0, 0, 0.2)',
                    pointerEvents: 'auto',
                    overflowX: 'auto',
                    maxWidth: '100%'
                }}>
                    <span style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 6px',
                        fontSize: '0.74rem',
                        fontWeight: '800',
                        color: isDark ? '#94a3b8' : '#64748b'
                    }}>
                        시야 선택:
                    </span>
                    {[
                        { key: 'global', label: '🌐 글로벌 뷰 (세계)', icon: 'fas fa-globe-americas' },
                        { key: 'capital', label: '🏙️ 수도권 프라임', icon: 'fas fa-building' },
                        { key: 'busan', label: '🌊 부산 랜드마크', icon: 'fas fa-water' },
                        { key: 'korea', label: '🇰🇷 전국 전경', icon: 'fas fa-map-marked-alt' }
                    ].map(preset => (
                        <button
                            key={preset.key}
                            onClick={() => handleViewPreset(preset.key as any)}
                            style={{
                                padding: '6px 11px',
                                borderRadius: '10px',
                                border: activePreset === preset.key ? '1px solid #fbbf24' : '1px solid transparent',
                                background: activePreset === preset.key
                                    ? (isDark ? 'rgba(251, 191, 36, 0.2)' : 'rgba(251, 191, 36, 0.15)')
                                    : 'transparent',
                                color: activePreset === preset.key ? (isDark ? '#fbbf24' : '#b45309') : (isDark ? '#cbd5e1' : '#475569'),
                                fontWeight: '700',
                                fontSize: '0.75rem',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {preset.label}
                        </button>
                    ))}
                </div>
            </div>
            {/* 우측 줌 인/아웃 플로팅 버튼 (Leaflet/Kakao 통합 컨트롤) */}
            <div style={{
                position: 'absolute',
                top: '130px',
                right: '16px',
                zIndex: 1050,
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
            }}>
                <button
                    onClick={handleZoomIn}
                    title="확대"
                    style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '12px',
                        border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(0, 0, 0, 0.1)',
                        background: isDark ? 'rgba(15, 23, 42, 0.92)' : 'rgba(255, 255, 255, 0.95)',
                        color: isDark ? '#ffffff' : '#0f172a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                        fontSize: '1rem',
                        fontWeight: 'bold'
                    }}
                >
                    <i className="fas fa-plus"></i>
                </button>
                <button
                    onClick={handleZoomOut}
                    title="축소"
                    style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '12px',
                        border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(0, 0, 0, 0.1)',
                        background: isDark ? 'rgba(15, 23, 42, 0.92)' : 'rgba(255, 255, 255, 0.95)',
                        color: isDark ? '#ffffff' : '#0f172a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                        fontSize: '1rem',
                        fontWeight: 'bold'
                    }}
                >
                    <i className="fas fa-minus"></i>
                </button>
            </div>

            {/* 좌측 하단: 글로벌 거점 허브 상세 카드 */}
            <AnimatePresence>
                {selectedHub && (
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
                            background: isDark ? 'rgba(15, 23, 42, 0.94)' : 'rgba(255, 255, 255, 0.96)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid #818cf8',
                            borderRadius: '24px',
                            overflow: 'hidden',
                            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
                            pointerEvents: 'auto'
                        }}
                    >
                        <div style={{ padding: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                <span style={{
                                    background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
                                    border: '1px solid #818cf8',
                                    color: '#c7d2fe',
                                    padding: '4px 10px',
                                    borderRadius: '8px',
                                    fontSize: '0.75rem',
                                    fontWeight: '800'
                                }}>
                                    {selectedHub.badge}
                                </span>
                                <button
                                    onClick={() => setSelectedHub(null)}
                                    style={{
                                        width: '28px',
                                        height: '28px',
                                        borderRadius: '50%',
                                        background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
                                        border: 'none',
                                        color: isDark ? '#ffffff' : '#0f172a',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <span style={{ fontSize: '1.6rem' }}>{selectedHub.icon}</span>
                                <div>
                                    <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: isDark ? '#ffffff' : '#0f172a', margin: 0 }}>
                                        {selectedHub.name}
                                    </h3>
                                    <span style={{ fontSize: '0.8rem', color: '#818cf8', fontWeight: '700' }}>{selectedHub.city}</span>
                                </div>
                            </div>

                            <p style={{ fontSize: '0.85rem', color: isDark ? '#cbd5e1' : '#475569', lineHeight: 1.5, margin: '12px 0 16px' }}>
                                {selectedHub.desc}
                            </p>

                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    onClick={() => handleViewPreset('korea')}
                                    style={{
                                        flex: 1,
                                        padding: '10px',
                                        borderRadius: '12px',
                                        background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)',
                                        color: '#000000',
                                        fontWeight: '800',
                                        fontSize: '0.85rem',
                                        border: 'none',
                                        cursor: 'pointer'
                                    }}
                                >
                                    한국 매물 보기
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 좌측 하단: 선택 매물 상세 카드 (Selected Listing Card) */}
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

            {/* 메인 지도 컨테이너 */}
            <div
                ref={mapContainerRef}
                style={{
                    width: '100%',
                    height: '100%',
                    background: isDark ? '#0b1329' : '#f1f5f9'
                }}
            />
        </div>
    );
};

export default MapSearchPage;
