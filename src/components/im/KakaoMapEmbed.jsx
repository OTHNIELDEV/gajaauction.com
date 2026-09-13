import React, { useEffect, useRef, useState, useMemo } from 'react';
import 'leaflet/dist/leaflet.css';
import { useTheme } from '../../context/ThemeContext';

const KAKAO_KEY = '23e29b72b33388f59ca4668bce00c82d';
const KAKAO_SDK_URL = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_KEY}&libraries=services&autoload=false`;

const KNOWN_COORDINATES = {
    '해운대': { lat: 35.1578, lng: 129.1444, name: '해운대 두산위브더제니스' },
    '마린시티': { lat: 35.1578, lng: 129.1444, name: '해운대 두산위브더제니스' },
    '그랜드조선': { lat: 35.1598, lng: 129.1620, name: '그랜드조선 부산' },
    '양주': { lat: 37.8812, lng: 126.9856, name: '양주시 남면 스마트 팩토리' },
    '상수리': { lat: 37.8812, lng: 126.9856, name: '양주시 남면 스마트 팩토리' },
    '여의도': { lat: 37.5218, lng: 126.9242, name: '여의도 FKI타워' },
    'FKI': { lat: 37.5218, lng: 126.9242, name: '여의도 FKI타워' },
    '테헤란': { lat: 37.5000, lng: 127.0360, name: '강남 테헤란로 타워' },
    '역삼': { lat: 37.5000, lng: 127.0360, name: '강남 역삼동 빌딩' },
    '강남': { lat: 37.5000, lng: 127.0360, name: '강남 테헤란로 타워' },
    '한남': { lat: 37.5348, lng: 127.0115, name: '한남동 유엔빌리지' },
    '유엔빌리지': { lat: 37.5348, lng: 127.0115, name: '한남동 유엔빌리지' },
    '서초': { lat: 37.4935, lng: 127.0135, name: '서초 법조타운' },
    '법조타운': { lat: 37.4935, lng: 127.0135, name: '서초 법조타운' },
    '반포': { lat: 37.5045, lng: 127.0080, name: '서초 반포자이' },
    '애월': { lat: 33.4655, lng: 126.3195, name: '제주 애월 리조트' },
    '제주': { lat: 33.4655, lng: 126.3195, name: '제주 애월 리조트' },
    '판교': { lat: 37.3947, lng: 127.1112, name: '판교테크노밸리' },
    '정자': { lat: 37.3665, lng: 127.1082, name: '분당 정자동 카페거리' },
    '분당': { lat: 37.3665, lng: 127.1082, name: '분당 정자동 카페거리' }
};

export default function KakaoMapEmbed({
    address,
    title,
    lat: propLat,
    lng: propLng,
    zoom = 4,
    height = 420,
    caption
}) {
    const { isDark } = useTheme();
    const containerRef = useRef(null);
    const leafletContainerRef = useRef(null);
    const leafletInstanceRef = useRef(null);

    // 카카오 지도 SDK 1순위 우선 로드 (gajaasset.com 등록 완료)
    const [status, setStatus] = useState('loading');
    const [showTraffic, setShowTraffic] = useState(false);
    const kakaoMapInstanceRef = useRef(null);

    const [resolvedCoords, setResolvedCoords] = useState(() => {
        if (propLat && propLng) return { lat: parseFloat(propLat), lng: parseFloat(propLng) };
        // 사전 매핑 좌표 우선 확인
        if (address || title) {
            const query = `${address || ''} ${title || ''}`;
            for (const [key, val] of Object.entries(KNOWN_COORDINATES)) {
                if (query.includes(key)) {
                    return { lat: val.lat, lng: val.lng };
                }
            }
        }
        return { lat: 37.5218, lng: 126.9242 }; // 기본 여의도
    });

    const displayAddress = address || title || '대한민국 주요 자산 입지';
    const displayTitle = title || caption || displayAddress;

    // 카카오맵 및 네이버 지도 딥링크 URL
    const kakaoMapUrl = resolvedCoords
        ? `https://map.kakao.com/link/map/${encodeURIComponent(displayTitle)},${resolvedCoords.lat},${resolvedCoords.lng}`
        : `https://map.kakao.com/link/search/${encodeURIComponent(displayAddress)}`;
    const kakaoNaviUrl = resolvedCoords
        ? `https://map.kakao.com/link/to/${encodeURIComponent(displayTitle)},${resolvedCoords.lat},${resolvedCoords.lng}`
        : `https://map.kakao.com`;
    const kakaoRoadviewUrl = resolvedCoords
        ? `https://map.kakao.com/link/roadview/${resolvedCoords.lat},${resolvedCoords.lng}`
        : kakaoMapUrl;
    const naverMapUrl = `https://map.naver.com/v5/search/${encodeURIComponent(displayAddress)}`;

    // 교통정보 오버레이 토글 반응
    useEffect(() => {
        if (kakaoMapInstanceRef.current && window.kakao?.maps?.MapTypeId) {
            try {
                if (showTraffic) {
                    kakaoMapInstanceRef.current.addOverlayMapTypeId(window.kakao.maps.MapTypeId.TRAFFIC);
                } else {
                    kakaoMapInstanceRef.current.removeOverlayMapTypeId(window.kakao.maps.MapTypeId.TRAFFIC);
                }
            } catch (err) {
                console.warn('[KakaoMapEmbed] Traffic overlay toggle error:', err);
            }
        }
    }, [showTraffic]);

    // 1. 카카오 공식 지도 SDK 로드 및 완전한 동적 인터랙티브 지도 생성
    useEffect(() => {
        let isCancelled = false;
        let scriptTag = null;
        let fallbackTimer = null;
        let retryInterval = null;

        const initKakaoMap = () => {
            if (!containerRef.current) return;

            const setupMapInstance = () => {
                if (!window.kakao?.maps?.load || !containerRef.current) return false;

                try {
                    window.kakao.maps.load(() => {
                        if (isCancelled || !containerRef.current) return;

                        const container = containerRef.current;
                        container.innerHTML = '';

                        const initialCenter = new window.kakao.maps.LatLng(resolvedCoords.lat, resolvedCoords.lng);
                        const mapOptions = {
                            center: initialCenter,
                            level: zoom || 4, // 1~14 레벨
                            draggable: true, // 드래그 패닝 활성화
                            scrollwheel: true, // 마우스 휠 줌 활성화
                            disableDoubleClickZoom: false // 더블클릭 확대 활성화
                        };

                        const map = new window.kakao.maps.Map(container, mapOptions);
                        kakaoMapInstanceRef.current = map;

                        // 1) 지도 타입 컨트롤러 (일반 지도 ↔ 스카이뷰 토글)
                        const mapTypeControl = new window.kakao.maps.MapTypeControl();
                        map.addControl(mapTypeControl, window.kakao.maps.ControlPosition.TOPRIGHT);

                        // 2) 줌 컨트롤러 (+ / - 슬라이더)
                        const zoomControl = new window.kakao.maps.ZoomControl();
                        map.addControl(zoomControl, window.kakao.maps.ControlPosition.RIGHT);

                        // 3) 실시간 교통정보 적용
                        if (showTraffic && window.kakao.maps.MapTypeId?.TRAFFIC) {
                            map.addOverlayMapTypeId(window.kakao.maps.MapTypeId.TRAFFIC);
                        }

                        const renderMarkerAndCircle = (lat, lng, locTitle) => {
                            const position = new window.kakao.maps.LatLng(lat, lng);
                            map.setCenter(position);

                            // 커스텀 프리미엄 펄스 핀 마커
                            const markerContent = document.createElement('div');
                            markerContent.style.cssText = 'position:relative; transform:translate(-50%, -100%); cursor:pointer; z-index:100;';
                            markerContent.innerHTML = `
                                <div style="
                                    background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
                                    border: 2.5px solid #ffffff;
                                    padding: 7px 14px;
                                    border-radius: 24px;
                                    box-shadow: 0 6px 20px rgba(0,0,0,0.4), 0 0 12px rgba(14,165,233,0.5);
                                    color: #ffffff;
                                    font-size: 12px;
                                    font-weight: 800;
                                    white-space: nowrap;
                                    display: flex;
                                    align-items: center;
                                    gap: 6px;
                                    letter-spacing: -0.01em;
                                ">
                                    <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#fbbf24; box-shadow:0 0 8px #fbbf24;"></span>
                                    <span>📍 ${locTitle || '현재 매물'}</span>
                                </div>
                                <div style="
                                    width: 0;
                                    height: 0;
                                    border-left: 7px solid transparent;
                                    border-right: 7px solid transparent;
                                    border-top: 9px solid #0369a1;
                                    margin: 0 auto;
                                "></div>
                            `;

                            markerContent.addEventListener('click', () => {
                                const link = `https://map.kakao.com/link/map/${encodeURIComponent(locTitle)},${lat},${lng}`;
                                window.open(link, '_blank', 'noopener,noreferrer');
                            });

                            new window.kakao.maps.CustomOverlay({
                                map: map,
                                position: position,
                                content: markerContent,
                                yAnchor: 1.15,
                                zIndex: 20
                            });

                            // 500m 반경 역세권 분석 서클
                            new window.kakao.maps.Circle({
                                map: map,
                                center: position,
                                radius: 500,
                                strokeWeight: 2,
                                strokeColor: '#0ea5e9',
                                strokeOpacity: 0.85,
                                strokeStyle: 'dashed',
                                fillColor: '#0ea5e9',
                                fillOpacity: 0.15
                            });
                        };

                        // 주소 지오코딩 시도
                        if (address && window.kakao.maps.services?.Geocoder) {
                            const geocoder = new window.kakao.maps.services.Geocoder();
                            geocoder.addressSearch(address, (result, searchStatus) => {
                                if (isCancelled) return;
                                if (searchStatus === window.kakao.maps.services.Status.OK && result[0]) {
                                    const lat = parseFloat(result[0].y);
                                    const lng = parseFloat(result[0].x);
                                    setResolvedCoords({ lat, lng });
                                    renderMarkerAndCircle(lat, lng, displayTitle);
                                } else {
                                    renderMarkerAndCircle(resolvedCoords.lat, resolvedCoords.lng, displayTitle);
                                }
                                if (!isCancelled) setStatus('ready');
                            });
                        } else {
                            renderMarkerAndCircle(resolvedCoords.lat, resolvedCoords.lng, displayTitle);
                            if (!isCancelled) setStatus('ready');
                        }

                        // 다단계 relayout (0px 축소 버그 원천 차단)
                        const doRelayout = () => {
                            if (!isCancelled && map) {
                                try {
                                    map.relayout();
                                    const center = new window.kakao.maps.LatLng(resolvedCoords.lat, resolvedCoords.lng);
                                    map.setCenter(center);
                                } catch (e) {}
                            }
                        };

                        requestAnimationFrame(doRelayout);
                        setTimeout(doRelayout, 80);
                        setTimeout(doRelayout, 250);
                        setTimeout(doRelayout, 600);
                        setTimeout(doRelayout, 1200);

                        window.addEventListener('resize', doRelayout);
                        window.addEventListener('gaja_tab_changed', doRelayout);
                    });
                    return true;
                } catch (err) {
                    console.warn('[KakaoMapEmbed] Kakao map init error:', err);
                    return false;
                }
            };

            if (setupMapInstance()) return;

            // SDK 바인딩 안전 폴링 (최대 1.5초간 대기)
            let attempts = 0;
            retryInterval = setInterval(() => {
                attempts++;
                if (setupMapInstance() || attempts >= 25) {
                    clearInterval(retryInterval);
                    if (attempts >= 25 && !isCancelled && status !== 'ready') {
                        setStatus('fallback_leaflet');
                    }
                }
            }, 60);
        };

        // 타임아웃(3500ms): 카카오 SDK 네트워크 장애 발생 시에만 Leaflet 폴백
        fallbackTimer = setTimeout(() => {
            if (!window.kakao?.maps?.load && !isCancelled) {
                console.warn('[KakaoMapEmbed] SDK timeout, using Leaflet fallback');
                setStatus('fallback_leaflet');
            }
        }, 3500);

        // 이미 로드된 경우
        if (window.kakao?.maps?.load) {
            clearTimeout(fallbackTimer);
            initKakaoMap();
            return;
        }

        // 스크립트 동적 주입
        let existingScript = document.getElementById('kakao-maps-sdk');
        if (!existingScript) {
            scriptTag = document.createElement('script');
            scriptTag.id = 'kakao-maps-sdk';
            scriptTag.src = KAKAO_SDK_URL;
            scriptTag.async = true;

            scriptTag.onload = () => {
                clearTimeout(fallbackTimer);
                initKakaoMap();
            };

            scriptTag.onerror = () => {
                clearTimeout(fallbackTimer);
                if (!isCancelled) setStatus('fallback_leaflet');
            };

            document.head.appendChild(scriptTag);
        } else {
            if (window.kakao?.maps?.load) {
                clearTimeout(fallbackTimer);
                initKakaoMap();
            } else {
                existingScript.addEventListener('load', () => {
                    clearTimeout(fallbackTimer);
                    initKakaoMap();
                }, { once: true });
                existingScript.addEventListener('error', () => {
                    clearTimeout(fallbackTimer);
                    if (!isCancelled) setStatus('fallback_leaflet');
                }, { once: true });
            }
        }

        return () => {
            isCancelled = true;
            if (fallbackTimer) clearTimeout(fallbackTimer);
            if (retryInterval) clearInterval(retryInterval);
        };
    }, [address, displayTitle, zoom, propLat, propLng]);

    // 2. Leaflet Fallback 렌더링 (카카오 SDK 미등록/오류 시 즉각 고해상도 무중단 작동 보장)
    useEffect(() => {
        if (status !== 'fallback_leaflet') return;
        let isMounted = true;

        const loadAndInit = async () => {
            let L = window.L;
            if (!L) {
                try {
                    const mod = await import('leaflet');
                    L = mod.default || mod;
                } catch (e) {
                    console.warn('[KakaoMapEmbed] Leaflet load error:', e);
                    return;
                }
            }
            if (!isMounted || !leafletContainerRef.current) return;
            initLeaflet(L);
        };

        loadAndInit();

        function initLeaflet(L) {
            if (leafletInstanceRef.current) {
                try {
                    leafletInstanceRef.current.remove();
                } catch (e) {}
                leafletInstanceRef.current = null;
            }

            const container = leafletContainerRef.current;
            if (!container) return;

            const lat = resolvedCoords.lat;
            const lng = resolvedCoords.lng;

            const map = L.map(container, {
                center: [lat, lng],
                zoom: 15,
                zoomControl: true,
                attributionControl: false
            });
            leafletInstanceRef.current = map;

            // 고해상도 OpenStreetMap 타일
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '&copy; OpenStreetMap'
            }).addTo(map);

            // 커스텀 프리미엄 펄스 핀 마커
            const customIcon = L.divIcon({
                className: 'custom-leaflet-marker-clean',
                html: `
                    <div style="position:relative; transform: translate(-50%, -100%); cursor:pointer; pointer-events:auto;">
                        <div style="
                            background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
                            border: 2px solid #ffffff;
                            color: #ffffff;
                            padding: 6px 14px;
                            border-radius: 20px;
                            font-weight: 800;
                            font-size: 12px;
                            white-space: nowrap;
                            box-shadow: 0 4px 16px rgba(0,0,0,0.35);
                            display: flex;
                            align-items: center;
                            gap: 6px;
                            letter-spacing: -0.02em;
                        ">
                            <span style="color:#fbbf24; font-size: 13px;">📍</span> ${displayTitle}
                        </div>
                        <div style="
                            width: 0;
                            height: 0;
                            border-left: 6px solid transparent;
                            border-right: 6px solid transparent;
                            border-top: 8px solid #0369a1;
                            margin: 0 auto;
                        "></div>
                        <div style="
                            position: absolute;
                            bottom: -5px;
                            left: 50%;
                            transform: translateX(-50%);
                            width: 8px;
                            height: 8px;
                            background: #38bdf8;
                            border-radius: 50%;
                            box-shadow: 0 0 10px #0284c7;
                        "></div>
                    </div>
                `,
                iconSize: [0, 0],
                iconAnchor: [0, 0]
            });

            L.marker([lat, lng], { icon: customIcon }).addTo(map);

            // 500m 반경 역세권/상권 서클
            L.circle([lat, lng], {
                radius: 500,
                color: '#0ea5e9',
                fillColor: '#0ea5e9',
                fillOpacity: 0.12,
                weight: 1.8,
                dashArray: '5, 5'
            }).addTo(map);

            // 다단계 리사이즈 통보 (0px 축소 버그 원천 박멸)
            const handleInvalidate = () => {
                try { map.invalidateSize(); } catch (e) {}
            };
            requestAnimationFrame(handleInvalidate);
            setTimeout(handleInvalidate, 80);
            setTimeout(handleInvalidate, 250);
            setTimeout(handleInvalidate, 600);
            setTimeout(handleInvalidate, 1200);

            window.addEventListener('resize', handleInvalidate);
        }

        return () => {
            isMounted = false;
            if (leafletInstanceRef.current) {
                try {
                    leafletInstanceRef.current.remove();
                } catch (e) {}
                leafletInstanceRef.current = null;
            }
        };
    }, [status, resolvedCoords, displayTitle]);

    const subCardBorder = isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0';
    const subCardBg = isDark ? 'rgba(15, 23, 42, 0.85)' : '#ffffff';

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            margin: '20px 0',
            borderRadius: '16px',
            overflow: 'hidden',
            border: `1px solid ${subCardBorder}`,
            background: subCardBg,
            boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.35)' : '0 8px 24px rgba(0,0,0,0.06)'
        }}>
            {/* 상단 툴바 & 상태 뱃지 & 동적 컨트롤 */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 18px',
                borderBottom: `1px solid ${subCardBorder}`,
                background: isDark ? 'rgba(255, 255, 255, 0.02)' : '#f8fafc',
                flexWrap: 'wrap',
                gap: '8px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '7px',
                        background: '#fee500',
                        color: '#000000',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '900',
                        fontSize: '0.8rem',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.15)'
                    }}>
                        K
                    </span>
                    <span style={{ fontSize: '0.92rem', fontWeight: '800', color: isDark ? '#f1f5f9' : '#0f172a' }}>
                        {displayTitle} 카카오 실시간 동적 지도
                    </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {/* 실시간 교통정보 토글 버튼 */}
                    {status === 'ready' && (
                        <button
                            type="button"
                            onClick={() => setShowTraffic(prev => !prev)}
                            style={{
                                fontSize: '0.74rem',
                                padding: '4px 10px',
                                borderRadius: '6px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                border: showTraffic ? '1px solid #10b981' : `1px solid ${subCardBorder}`,
                                background: showTraffic ? (isDark ? 'rgba(16, 185, 129, 0.25)' : '#d1fae5') : (isDark ? 'rgba(255, 255, 255, 0.06)' : '#ffffff'),
                                color: showTraffic ? (isDark ? '#34d399' : '#065f46') : (isDark ? '#94a3b8' : '#64748b'),
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}
                        >
                            <span>{showTraffic ? '🟢' : '⚪'}</span>
                            <span>실시간 교통정보 {showTraffic ? 'ON' : 'OFF'}</span>
                        </button>
                    )}

                    <span style={{
                        fontSize: '0.72rem',
                        padding: '4px 9px',
                        borderRadius: '6px',
                        fontWeight: '700',
                        background: status === 'ready' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(14, 165, 233, 0.15)',
                        color: status === 'ready' ? '#10b981' : '#0ea5e9',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                    }}>
                        {status === 'ready' ? '⚡ Kakao Map Live (동적)' : '🗺️ Interactive Map (OpenStreetMap)'}
                    </span>

                    <a
                        href={kakaoMapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            fontSize: '0.78rem',
                            fontWeight: '700',
                            color: '#0284c7',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            marginLeft: '4px'
                        }}
                    >
                        카카오맵 크게보기 ↗
                    </a>
                </div>
            </div>

            {/* 지도 캔버스 영역 (항상 420px 실측 크기 유지) */}
            <div style={{ position: 'relative', width: '100%', height: `${height}px`, background: isDark ? '#0b1120' : '#e2e8f0', overflow: 'hidden' }}>
                {/* 카카오 지도 컨테이너 */}
                <div
                    ref={containerRef}
                    style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        opacity: status === 'ready' ? 1 : 0,
                        pointerEvents: status === 'ready' ? 'auto' : 'none',
                        zIndex: status === 'ready' ? 2 : 0
                    }}
                />

                {/* Leaflet 폴백 컨테이너 (실측 크기 항상 보존) */}
                <div
                    ref={leafletContainerRef}
                    style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        opacity: status === 'fallback_leaflet' ? 1 : 0,
                        pointerEvents: status === 'fallback_leaflet' ? 'auto' : 'none',
                        zIndex: status === 'fallback_leaflet' ? 2 : 0
                    }}
                />

                {/* 하단 동적 지도 조작 팁 오버레이 */}
                {status === 'ready' && (
                    <div style={{
                        position: 'absolute',
                        bottom: '12px',
                        left: '12px',
                        zIndex: 10,
                        background: isDark ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(6px)',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        border: `1px solid ${subCardBorder}`,
                        fontSize: '0.72rem',
                        fontWeight: '600',
                        color: isDark ? '#94a3b8' : '#64748b',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        pointerEvents: 'none'
                    }}>
                        🖱️ 휠 확대/축소 · 드래그 이동 · 우상단 스카이뷰 전환 지원
                    </div>
                )}

                {/* 로딩 인디케이터 */}
                {status === 'loading' && (
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: isDark ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                        color: isDark ? '#94a3b8' : '#64748b',
                        gap: '10px',
                        zIndex: 10
                    }}>
                        <div style={{
                            width: '28px',
                            height: '28px',
                            border: '3px solid #0ea5e9',
                            borderTopColor: 'transparent',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                        }} />
                        <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>고정밀 카카오 지리정보 로딩 중...</span>
                    </div>
                )}
            </div>

            {/* 하단 주소 및 대중교통/네비게이션/로드뷰 정보 바 */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 18px',
                borderTop: `1px solid ${subCardBorder}`,
                background: isDark ? 'rgba(255, 255, 255, 0.02)' : '#fafafa',
                flexWrap: 'wrap',
                gap: '10px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                    <span style={{ color: '#0284c7' }}>📍</span>
                    <strong style={{ color: isDark ? '#ffffff' : '#0f172a' }}>{displayAddress}</strong>
                    <span style={{ color: isDark ? '#64748b' : '#94a3b8', fontSize: '0.78rem' }}> (반경 500m 핵심 역세권 및 상권)</span>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <a
                        href={kakaoRoadviewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            background: isDark ? 'rgba(255, 255, 255, 0.08)' : '#f1f5f9',
                            color: isDark ? '#cbd5e1' : '#334155',
                            border: `1px solid ${subCardBorder}`,
                            fontSize: '0.78rem',
                            fontWeight: '800',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}
                    >
                        👁️ 카카오 로드뷰 ↗
                    </a>
                    <a
                        href={kakaoNaviUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            background: '#fee500',
                            color: '#191919',
                            fontSize: '0.78rem',
                            fontWeight: '800',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                        }}
                    >
                        카카오 길찾기 ↗
                    </a>
                    <a
                        href={naverMapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            background: '#03c75a',
                            color: '#ffffff',
                            fontSize: '0.78rem',
                            fontWeight: '800',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                        }}
                    >
                        네이버 지도 ↗
                    </a>
                </div>
            </div>
        </div>
    );
}
