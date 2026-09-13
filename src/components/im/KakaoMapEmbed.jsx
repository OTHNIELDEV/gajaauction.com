import React, { useEffect, useRef, useState, useMemo } from 'react';
import 'leaflet/dist/leaflet.css';
import { useTheme } from '../../context/ThemeContext';
import { resolvePropertyCoordinates, PROPERTY_MASTER_COORDINATES } from '../../constants/propertyCoordinates';

const KAKAO_KEY = '23e29b72b33388f59ca4668bce00c82d';
const KAKAO_SDK_URL = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_KEY}&libraries=services&autoload=false`;

export default function KakaoMapEmbed({
    listingId,
    address,
    title,
    lat: propLat,
    lng: propLng,
    zoom = 3, // 상세 건물 및 도로 입지가 선명히 보이는 황금 배율 (3 레벨)
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

    // 주소 문자열 클렌징 (예: '서울 강남구 도곡로 429 — 입지 분석' -> '서울 강남구 도곡로 429')
    const sanitizedAddress = useMemo(() => {
        if (!address) return '';
        return address
            .replace(/[—–\-].*$/, '') // 대시 뒤 부가설명 제거
            .replace(/\(.*?\)/g, '')   // 괄호 내용 제거
            .replace(/입지\s*분석.*$/, '') // '입지 분석' 수식어 제거
            .trim();
    }, [address]);

    // 공인 마스터 좌표 해석 엔진 연동 (1픽셀 오차 없는 정밀 좌표 산출)
    const [resolvedCoords, setResolvedCoords] = useState(() => {
        return resolvePropertyCoordinates({
            listingId,
            address: sanitizedAddress || address,
            title,
            lat: propLat,
            lng: propLng
        });
    });

    // props 또는 주소 변경 시 좌표 동기화
    useEffect(() => {
        const nextCoords = resolvePropertyCoordinates({
            listingId,
            address: sanitizedAddress || address,
            title,
            lat: propLat,
            lng: propLng
        });
        setResolvedCoords(nextCoords);
        currentCoordsRef.current = nextCoords;
    }, [listingId, sanitizedAddress, address, title, propLat, propLng]);

    // 클로저 캡처 버그 원천 차단을 위한 최신 값 Ref
    const currentCoordsRef = useRef(resolvedCoords);
    currentCoordsRef.current = resolvedCoords;
    const targetZoomLevel = (zoom && zoom >= 1 && zoom <= 14) ? zoom : 3;
    const currentLevelRef = useRef(targetZoomLevel);
    currentLevelRef.current = targetZoomLevel;

    const displayAddress = sanitizedAddress || address || title || '대한민국 주요 자산 입지';
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
        let resizeObserver = null;

        const initKakaoMap = () => {
            if (!containerRef.current) return;

            const setupMapInstance = () => {
                if (!window.kakao?.maps?.load || !containerRef.current) return false;

                try {
                    window.kakao.maps.load(() => {
                        if (isCancelled || !containerRef.current) return;

                        const container = containerRef.current;
                        container.innerHTML = '';

                        const initialCoords = currentCoordsRef.current;
                        const initialCenter = new window.kakao.maps.LatLng(initialCoords.lat, initialCoords.lng);
                        const mapOptions = {
                            center: initialCenter,
                            level: targetZoomLevel, // 3레벨 (상세 골목/건물 입지)
                            draggable: true,
                            scrollwheel: true,
                            disableDoubleClickZoom: false
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

                        // 마커와 500m 원형 오버레이 인스턴스 보존
                        let currentOverlay = null;
                        let currentCircle = null;

                        const renderMarkerAndCircle = (lat, lng, locTitle) => {
                            const position = new window.kakao.maps.LatLng(lat, lng);
                            
                            // 중요: 지도 중심 및 줌 레벨을 항상 강제 재설정 (전국 지도 축소 버그 원천 방지)
                            map.setLevel(targetZoomLevel);
                            map.setCenter(position);

                            if (currentOverlay) {
                                currentOverlay.setMap(null);
                            }
                            if (currentCircle) {
                                currentCircle.setMap(null);
                            }

                            // 커스텀 프리미엄 펄스 핀 마커 (바닥 중앙 끝점이 정확히 좌표에 100% 일치)
                            const markerContent = document.createElement('div');
                            markerContent.style.cssText = 'position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer; z-index: 100; pointer-events: auto;';
                            markerContent.innerHTML = `
                                <div style="
                                    background: linear-gradient(135deg, #09101f 0%, #1e293b 100%);
                                    border: 2px solid #fbbf24;
                                    padding: 7px 16px;
                                    border-radius: 20px;
                                    box-shadow: 0 6px 20px rgba(0,0,0,0.55), 0 0 12px rgba(251,191,36,0.4);
                                    color: #ffffff;
                                    font-size: 12px;
                                    font-weight: 800;
                                    white-space: nowrap;
                                    display: flex;
                                    align-items: center;
                                    gap: 7px;
                                    letter-spacing: -0.01em;
                                ">
                                    <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#ef4444; box-shadow:0 0 8px #ef4444; border: 1.5px solid #ffffff;"></span>
                                    <span style="color:#fbbf24; font-weight:900;">📍</span>
                                    <span>${locTitle || '현재 매물'}</span>
                                </div>
                                <!-- 아래쪽을 뾰족하게 가리키는 정밀 골드 지침 화살표 -->
                                <div style="
                                    width: 0;
                                    height: 0;
                                    border-left: 8px solid transparent;
                                    border-right: 8px solid transparent;
                                    border-top: 14px solid #fbbf24;
                                    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
                                "></div>
                                <!-- 건물 옥상/필지 정확한 지점에 꽂히는 정밀 앵커 타겟 링 (지침 끝점) -->
                                <div style="
                                    width: 8px;
                                    height: 8px;
                                    border-radius: 50%;
                                    background: #ef4444;
                                    border: 1.5px solid #ffffff;
                                    box-shadow: 0 0 8px #ef4444;
                                    margin-top: -3px;
                                "></div>
                            `;

                            markerContent.addEventListener('click', () => {
                                const link = `https://map.kakao.com/link/map/${encodeURIComponent(locTitle)},${lat},${lng}`;
                                window.open(link, '_blank', 'noopener,noreferrer');
                            });

                            // xAnchor: 0.5, yAnchor: 1.0 -> 마커 컨텐츠의 맨 밑바닥 중앙(핀포인트 점)이 정확히 좌표에 꽂힘
                            currentOverlay = new window.kakao.maps.CustomOverlay({
                                map: map,
                                position: position,
                                content: markerContent,
                                xAnchor: 0.5,
                                yAnchor: 1.0,
                                zIndex: 20
                            });

                            // 500m 반경 역세권 분석 서클
                            currentCircle = new window.kakao.maps.Circle({
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

                        // 주소 정제 후 지오코딩 시도
                        const searchTargetAddress = sanitizedAddress || address;
                        if (searchTargetAddress && window.kakao.maps.services?.Geocoder) {
                            const geocoder = new window.kakao.maps.services.Geocoder();
                            geocoder.addressSearch(searchTargetAddress, (result, searchStatus) => {
                                if (isCancelled) return;
                                if (searchStatus === window.kakao.maps.services.Status.OK && result[0]) {
                                    const lat = parseFloat(result[0].y);
                                    const lng = parseFloat(result[0].x);
                                    currentCoordsRef.current = { lat, lng };
                                    setResolvedCoords({ lat, lng });
                                    renderMarkerAndCircle(lat, lng, displayTitle);
                                } else {
                                    // 주소 실패 시 키워드 장소 검색 2차 시도
                                    if (window.kakao.maps.services?.Places) {
                                        const places = new window.kakao.maps.services.Places();
                                        places.keywordSearch(searchTargetAddress, (pResult, pStatus) => {
                                            if (isCancelled) return;
                                            if (pStatus === window.kakao.maps.services.Status.OK && pResult[0]) {
                                                const lat = parseFloat(pResult[0].y);
                                                const lng = parseFloat(pResult[0].x);
                                                currentCoordsRef.current = { lat, lng };
                                                setResolvedCoords({ lat, lng });
                                                renderMarkerAndCircle(lat, lng, displayTitle);
                                            } else {
                                                renderMarkerAndCircle(currentCoordsRef.current.lat, currentCoordsRef.current.lng, displayTitle);
                                            }
                                        });
                                    } else {
                                        renderMarkerAndCircle(currentCoordsRef.current.lat, currentCoordsRef.current.lng, displayTitle);
                                    }
                                }
                                if (!isCancelled) setStatus('ready');
                            });
                        } else {
                            renderMarkerAndCircle(currentCoordsRef.current.lat, currentCoordsRef.current.lng, displayTitle);
                            if (!isCancelled) setStatus('ready');
                        }

                        // 다단계 relayout & 줌/중심 강제 고정 (0px 축소 및 전국 지도 버그 완전 박멸)
                        const doRelayout = () => {
                            if (!isCancelled && map && container) {
                                try {
                                    map.relayout();
                                    const coords = currentCoordsRef.current;
                                    const center = new window.kakao.maps.LatLng(coords.lat, coords.lng);
                                    map.setLevel(currentLevelRef.current || 3);
                                    map.setCenter(center);
                                } catch (e) {}
                            }
                        };

                        // 컨테이너 크기 변화를 실시간 감지하는 ResizeObserver 연동
                        if (typeof ResizeObserver !== 'undefined' && container) {
                            resizeObserver = new ResizeObserver(() => {
                                if (container.offsetWidth > 0 && container.offsetHeight > 0) {
                                    doRelayout();
                                }
                            });
                            resizeObserver.observe(container);
                        }

                        requestAnimationFrame(doRelayout);
                        setTimeout(doRelayout, 60);
                        setTimeout(doRelayout, 150);
                        setTimeout(doRelayout, 300);
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

            // SDK 바인딩 안전 폴링
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
            if (resizeObserver) resizeObserver.disconnect();
        };
    }, [sanitizedAddress, address, displayTitle, zoom, propLat, propLng]);

    // 2. Leaflet Fallback 렌더링 (카카오 SDK 장애 시 차단 없는 고해상도 타일 사용)
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

            // 안정적이고 빠른 고해상도 CartoDB Voyager 타일
            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                maxZoom: 19,
                subdomains: 'abcd',
                attribution: '&copy; CARTO &copy; OpenStreetMap'
            }).addTo(map);

            // 커스텀 프리미엄 정밀 골드 펄스 핀 마커
            const customIcon = L.divIcon({
                className: 'custom-leaflet-marker-clean',
                html: `
                    <div style="position:relative; transform: translate(-50%, -100%); cursor:pointer; display:flex; flex-direction:column; align-items:center;">
                        <div style="
                            background: linear-gradient(135deg, #09101f 0%, #1e293b 100%);
                            border: 2px solid #fbbf24;
                            color: #ffffff;
                            padding: 6px 14px;
                            border-radius: 20px;
                            font-weight: 800;
                            font-size: 11.5px;
                            white-space: nowrap;
                            box-shadow: 0 6px 20px rgba(0,0,0,0.55), 0 0 10px rgba(251,191,36,0.4);
                            display: flex;
                            align-items: center;
                            gap: 6px;
                            letter-spacing: -0.01em;
                        ">
                            <span style="display:inline-block; width:7px; height:7px; border-radius:50%; background:#ef4444; box-shadow:0 0 6px #ef4444; border: 1px solid #fff;"></span>
                            <span style="color:#fbbf24; font-weight:900;">📍</span>
                            <span>${displayTitle}</span>
                        </div>
                        <div style="
                            width: 0;
                            height: 0;
                            border-left: 8px solid transparent;
                            border-right: 8px solid transparent;
                            border-top: 13px solid #fbbf24;
                            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
                        "></div>
                        <div style="
                            width: 8px;
                            height: 8px;
                            border-radius: 50%;
                            background: #ef4444;
                            border: 1.5px solid #ffffff;
                            box-shadow: 0 0 8px #ef4444;
                            margin-top: -3px;
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

            // 다단계 리사이즈 통보
            const handleInvalidate = () => {
                try { map.invalidateSize(); } catch (e) {}
            };
            requestAnimationFrame(handleInvalidate);
            setTimeout(handleInvalidate, 80);
            setTimeout(handleInvalidate, 250);
            setTimeout(handleInvalidate, 600);

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
            gap: '10px',
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
                padding: '12px 16px',
                borderBottom: `1px solid ${subCardBorder}`,
                background: isDark ? 'rgba(255, 255, 255, 0.02)' : '#f8fafc',
                flexWrap: 'wrap',
                gap: '10px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '200px', flex: '1 1 auto' }}>
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
                        flexShrink: 0,
                        boxShadow: '0 2px 5px rgba(0,0,0,0.15)'
                    }}>
                        K
                    </span>
                    <span style={{ fontSize: '0.92rem', fontWeight: '800', color: isDark ? '#f1f5f9' : '#0f172a', wordBreak: 'keep-all' }}>
                        {displayTitle} 카카오 실시간 지도
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
                                padding: '4px 9px',
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
                            <span>교통정보 {showTraffic ? 'ON' : 'OFF'}</span>
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
                        {status === 'ready' ? '⚡ Kakao Map Live' : status === 'fallback_leaflet' ? '🗺️ High-Res Map' : '⏳ 지도 연결 중'}
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
                            gap: '3px',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: isDark ? 'rgba(2, 132, 199, 0.12)' : 'rgba(2, 132, 199, 0.08)'
                        }}
                    >
                        카카오맵 크게보기 ↗
                    </a>
                </div>
            </div>

            {/* 지도 캔버스 영역 (실측 높이 100% 상시 유지) */}
            <div style={{
                position: 'relative',
                width: '100%',
                height: `${height}px`,
                minHeight: '340px',
                background: isDark ? '#0b1120' : '#f1f5f9',
                overflow: 'hidden'
            }}>
                {/* 카카오 지도 컨테이너 (실제 DOM 항상 유지) */}
                <div
                    ref={containerRef}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        zIndex: status === 'ready' ? 2 : 1
                    }}
                />

                {/* Leaflet 폴백 컨테이너 */}
                <div
                    ref={leafletContainerRef}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        display: status === 'fallback_leaflet' ? 'block' : 'none',
                        zIndex: status === 'fallback_leaflet' ? 3 : 0
                    }}
                />

                {/* 하단 지도 조작 팁 오버레이 */}
                {status === 'ready' && (
                    <div style={{
                        position: 'absolute',
                        bottom: '10px',
                        left: '10px',
                        zIndex: 10,
                        background: isDark ? 'rgba(15, 23, 42, 0.88)' : 'rgba(255, 255, 255, 0.92)',
                        backdropFilter: 'blur(6px)',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        border: `1px solid ${subCardBorder}`,
                        fontSize: '0.7rem',
                        fontWeight: '600',
                        color: isDark ? '#94a3b8' : '#64748b',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        pointerEvents: 'none'
                    }}>
                        📍 드래그 탐색 · 휠/핀치 확대 · 스카이뷰 지원
                    </div>
                )}
            </div>

            {/* 하단 주소 및 대중교통/네비게이션/로드뷰 정보 바 */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderTop: `1px solid ${subCardBorder}`,
                background: isDark ? 'rgba(255, 255, 255, 0.02)' : '#fafafa',
                flexWrap: 'wrap',
                gap: '10px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', flex: '1 1 220px' }}>
                    <span style={{ color: '#0284c7', fontSize: '1rem' }}>📍</span>
                    <strong style={{ color: isDark ? '#ffffff' : '#0f172a' }}>{displayAddress}</strong>
                    <span style={{ color: isDark ? '#64748b' : '#94a3b8', fontSize: '0.76rem' }}> (반경 500m 분석)</span>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <a
                        href={kakaoRoadviewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            padding: '6px 11px',
                            borderRadius: '6px',
                            background: isDark ? 'rgba(255, 255, 255, 0.08)' : '#f1f5f9',
                            color: isDark ? '#cbd5e1' : '#334155',
                            border: `1px solid ${subCardBorder}`,
                            fontSize: '0.78rem',
                            fontWeight: '700',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}
                    >
                        👁️ 로드뷰 ↗
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
