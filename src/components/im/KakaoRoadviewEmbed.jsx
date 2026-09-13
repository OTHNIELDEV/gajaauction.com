import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { resolvePropertyCoordinates } from '../../constants/propertyCoordinates';

const KAKAO_KEY = '23e29b72b33388f59ca4668bce00c82d';
const KAKAO_SDK_URL = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_KEY}&libraries=services&autoload=false`;

export default function KakaoRoadviewEmbed({
    listingId,
    address,
    title,
    lat: propLat,
    lng: propLng,
    height = 420,
    caption
}) {
    const { isDark } = useTheme();
    const containerRef = useRef(null);
    const roadviewInstanceRef = useRef(null);
    const targetPositionRef = useRef(null);

    const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'no_pano' | 'fallback'
    const [panoInfo, setPanoInfo] = useState(null);

    // 주소 문자열 클렌징
    const sanitizedAddress = useMemo(() => {
        if (!address) return '';
        return address
            .replace(/[—–\-].*$/, '')
            .replace(/\(.*?\)/g, '')
            .replace(/입지\s*분석.*$/, '')
            .trim();
    }, [address]);

    // 공인 마스터 좌표 산출
    const resolvedCoords = useMemo(() => {
        return resolvePropertyCoordinates({
            listingId,
            address: sanitizedAddress || address,
            title,
            lat: propLat,
            lng: propLng
        });
    }, [listingId, sanitizedAddress, address, title, propLat, propLng]);

    const displayAddress = sanitizedAddress || address || title || '대한민국 주요 자산 입지';
    const displayTitle = caption || title || `${displayAddress} 현장 실사 로드뷰`;

    // 딥링크 URL
    const kakaoRoadviewUrl = resolvedCoords
        ? `https://map.kakao.com/link/roadview/${resolvedCoords.lat},${resolvedCoords.lng}`
        : `https://map.kakao.com`;
    const kakaoMapUrl = resolvedCoords
        ? `https://map.kakao.com/link/map/${encodeURIComponent(displayTitle)},${resolvedCoords.lat},${resolvedCoords.lng}`
        : `https://map.kakao.com/link/search/${encodeURIComponent(displayAddress)}`;
    const kakaoNaviUrl = resolvedCoords
        ? `https://map.kakao.com/link/to/${encodeURIComponent(displayTitle)},${resolvedCoords.lat},${resolvedCoords.lng}`
        : `https://map.kakao.com`;
    const naverMapUrl = `https://map.naver.com/v5/search/${encodeURIComponent(displayAddress)}`;

    // 카메라 건물 정면 재정렬 헬퍼
    const handleResetViewpoint = () => {
        const roadview = roadviewInstanceRef.current;
        const pos = targetPositionRef.current;
        if (!roadview || !pos || !window.kakao?.maps) return;

        try {
            const panoId = roadview.getPanoId();
            if (panoId && roadview.getViewpointWithPanoId) {
                const viewpoint = roadview.getViewpointWithPanoId(panoId, pos);
                if (viewpoint) {
                    roadview.setViewpoint(viewpoint);
                }
            }
        } catch (e) {
            console.warn('[KakaoRoadviewEmbed] Reset viewpoint error:', e);
        }
    };

    // 카카오 로드뷰 SDK 로드 및 인스턴스 초기화
    useEffect(() => {
        let isCancelled = false;
        let scriptTag = null;
        let fallbackTimer = null;
        let retryInterval = null;
        let resizeObserver = null;

        const initKakaoRoadview = () => {
            if (!containerRef.current) return;

            const setupRoadview = () => {
                if (!window.kakao?.maps?.load || !containerRef.current) return false;

                try {
                    window.kakao.maps.load(() => {
                        if (isCancelled || !containerRef.current) return;

                        const container = containerRef.current;
                        container.innerHTML = '';

                        const lat = resolvedCoords.lat;
                        const lng = resolvedCoords.lng;
                        const position = new window.kakao.maps.LatLng(lat, lng);
                        targetPositionRef.current = position;

                        // 1. Roadview 인스턴스 생성
                        const roadview = new window.kakao.maps.Roadview(container);
                        roadviewInstanceRef.current = roadview;

                        // 2. RoadviewClient로 가장 가까운 파노라마 ID 검색 (50m -> 150m -> 350m 단계적 확장)
                        const roadviewClient = new window.kakao.maps.RoadviewClient();

                        const tryFindPano = (radii, index = 0) => {
                            if (index >= radii.length) {
                                if (!isCancelled) {
                                    console.warn('[KakaoRoadviewEmbed] No pano found in radius');
                                    setStatus('no_pano');
                                }
                                return;
                            }

                            const radius = radii[index];
                            roadviewClient.getNearestPanoId(position, radius, (panoId) => {
                                if (isCancelled) return;

                                if (panoId) {
                                    setPanoInfo({ panoId, radius });

                                    // 로드뷰 초기화 완료 이벤트 리스너 등록
                                    window.kakao.maps.event.addListener(roadview, 'init', () => {
                                        if (isCancelled) return;

                                        // 대상 건물 위치에 로드뷰 마커 추가
                                        try {
                                            const rMarker = new window.kakao.maps.Marker({
                                                position: position,
                                                map: roadview
                                            });

                                            // 마커 위 정보창 (말풍선 오버레이)
                                            const rOverlay = new window.kakao.maps.CustomOverlay({
                                                position: position,
                                                content: `
                                                    <div style="
                                                        background: linear-gradient(135deg, #09101f 0%, #1e293b 100%);
                                                        border: 2px solid #fbbf24;
                                                        padding: 6px 14px;
                                                        border-radius: 20px;
                                                        box-shadow: 0 4px 16px rgba(0,0,0,0.6);
                                                        color: #ffffff;
                                                        font-size: 11px;
                                                        font-weight: 800;
                                                        white-space: nowrap;
                                                        display: flex;
                                                        align-items: center;
                                                        gap: 6px;
                                                    ">
                                                        <span style="color:#fbbf24;">📍</span>
                                                        <span>${displayTitle}</span>
                                                    </div>
                                                `,
                                                yAnchor: 1.8,
                                                map: roadview
                                            });
                                        } catch (err) {
                                            console.warn('[KakaoRoadviewEmbed] Marker error:', err);
                                        }

                                        // 카메라 각도를 대상 건물 정면으로 자동 전환
                                        try {
                                            if (roadview.getViewpointWithPanoId) {
                                                const viewpoint = roadview.getViewpointWithPanoId(panoId, position);
                                                if (viewpoint) {
                                                    roadview.setViewpoint(viewpoint);
                                                }
                                            }
                                        } catch (err) {
                                            console.warn('[KakaoRoadviewEmbed] Viewpoint error:', err);
                                        }

                                        setStatus('ready');
                                    });

                                    // 파노라마 ID와 중심 좌표 설정하여 로드뷰 시작
                                    roadview.setPanoId(panoId, position);
                                } else {
                                    tryFindPano(radii, index + 1);
                                }
                            });
                        };

                        tryFindPano([50, 150, 350, 600]);

                        // 다단계 relayout (0px 찌그러짐 원천 방지)
                        const doRelayout = () => {
                            if (!isCancelled && roadview && container) {
                                try {
                                    roadview.relayout();
                                } catch (e) {}
                            }
                        };

                        if (typeof ResizeObserver !== 'undefined' && container) {
                            resizeObserver = new ResizeObserver(() => {
                                if (container.offsetWidth > 0 && container.offsetHeight > 0) {
                                    doRelayout();
                                }
                            });
                            resizeObserver.observe(container);
                        }

                        requestAnimationFrame(doRelayout);
                        setTimeout(doRelayout, 100);
                        setTimeout(doRelayout, 300);
                        setTimeout(doRelayout, 800);
                        setTimeout(doRelayout, 1500);

                        window.addEventListener('resize', doRelayout);
                        window.addEventListener('gaja_tab_changed', doRelayout);
                    });
                    return true;
                } catch (err) {
                    console.warn('[KakaoRoadviewEmbed] Roadview init error:', err);
                    return false;
                }
            };

            if (setupRoadview()) return;

            let attempts = 0;
            retryInterval = setInterval(() => {
                attempts++;
                if (setupRoadview() || attempts >= 25) {
                    clearInterval(retryInterval);
                    if (attempts >= 25 && !isCancelled && status !== 'ready') {
                        setStatus('fallback');
                    }
                }
            }, 60);
        };

        // 타임아웃
        fallbackTimer = setTimeout(() => {
            if (!window.kakao?.maps?.load && !isCancelled) {
                console.warn('[KakaoRoadviewEmbed] SDK timeout, using fallback');
                setStatus('fallback');
            }
        }, 3500);

        if (window.kakao?.maps?.load) {
            clearTimeout(fallbackTimer);
            initKakaoRoadview();
            return;
        }

        // 스크립트 주입
        let existingScript = document.getElementById('kakao-maps-sdk');
        if (!existingScript) {
            scriptTag = document.createElement('script');
            scriptTag.id = 'kakao-maps-sdk';
            scriptTag.src = KAKAO_SDK_URL;
            scriptTag.async = true;
            scriptTag.onload = () => {
                clearTimeout(fallbackTimer);
                initKakaoRoadview();
            };
            scriptTag.onerror = () => {
                clearTimeout(fallbackTimer);
                if (!isCancelled) setStatus('fallback');
            };
            document.head.appendChild(scriptTag);
        } else {
            if (window.kakao?.maps?.load) {
                clearTimeout(fallbackTimer);
                initKakaoRoadview();
            } else {
                existingScript.addEventListener('load', () => {
                    clearTimeout(fallbackTimer);
                    initKakaoRoadview();
                }, { once: true });
                existingScript.addEventListener('error', () => {
                    clearTimeout(fallbackTimer);
                    if (!isCancelled) setStatus('fallback');
                }, { once: true });
            }
        }

        return () => {
            isCancelled = true;
            if (fallbackTimer) clearTimeout(fallbackTimer);
            if (retryInterval) clearInterval(retryInterval);
            if (resizeObserver) resizeObserver.disconnect();
        };
    }, [resolvedCoords, displayTitle]);

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
                        {displayTitle} (카카오 360° 로드뷰)
                    </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {/* 정면 리셋 버튼 */}
                    {status === 'ready' && (
                        <button
                            type="button"
                            onClick={handleResetViewpoint}
                            style={{
                                fontSize: '0.74rem',
                                padding: '4px 9px',
                                borderRadius: '6px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                border: `1px solid ${subCardBorder}`,
                                background: isDark ? 'rgba(255, 255, 255, 0.08)' : '#ffffff',
                                color: isDark ? '#cbd5e1' : '#334155',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}
                            title="카메라를 대상 건물 정면 방향으로 재정렬합니다."
                        >
                            <span>↺</span>
                            <span>정면 뷰 리셋</span>
                        </button>
                    )}

                    <span style={{
                        fontSize: '0.72rem',
                        padding: '4px 9px',
                        borderRadius: '6px',
                        fontWeight: '700',
                        background: status === 'ready' ? 'rgba(16, 185, 129, 0.15)' : status === 'no_pano' ? 'rgba(234, 179, 8, 0.15)' : 'rgba(14, 165, 233, 0.15)',
                        color: status === 'ready' ? '#10b981' : status === 'no_pano' ? '#eab308' : '#0ea5e9',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                    }}>
                        {status === 'ready' ? '🟢 360° Roadview Live' : status === 'no_pano' ? '⚠️ 인접 도로 뷰' : '⏳ 로드뷰 연결 중'}
                    </span>

                    <a
                        href={kakaoRoadviewUrl}
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
                        전체화면 로드뷰 ↗
                    </a>
                </div>
            </div>

            {/* 로드뷰 캔버스 영역 */}
            <div style={{
                position: 'relative',
                width: '100%',
                height: `${height}px`,
                minHeight: '340px',
                background: isDark ? '#0b1120' : '#f1f5f9',
                overflow: 'hidden'
            }}>
                {/* 카카오 로드뷰 DOM 컨테이너 */}
                <div
                    ref={containerRef}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        zIndex: 2
                    }}
                />

                {/* 로딩 인디케이터 */}
                {status === 'loading' && (
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        zIndex: 1,
                        background: isDark ? 'rgba(11, 17, 32, 0.9)' : 'rgba(241, 245, 249, 0.9)',
                        color: isDark ? '#cbd5e1' : '#475569',
                        fontSize: '0.88rem',
                        fontWeight: '600'
                    }}>
                        <div style={{
                            width: '36px',
                            height: '36px',
                            border: '3px solid rgba(2, 132, 199, 0.2)',
                            borderTop: '3px solid #0284c7',
                            borderRadius: '50%',
                            animation: 'spin 0.8s linear infinite'
                        }} />
                        <span>현장 360° 파노라마 로드뷰를 불러오고 있습니다...</span>
                    </div>
                )}

                {/* 파노라마 미지원 또는 오프라인 대체 카드 */}
                {(status === 'no_pano' || status === 'fallback') && (
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '30px',
                        textAlign: 'center',
                        gap: '14px',
                        zIndex: 3,
                        background: isDark ? 'linear-gradient(135deg, rgba(15,23,42,0.96), rgba(30,41,59,0.96))' : 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
                        color: isDark ? '#ffffff' : '#0f172a'
                    }}>
                        <div style={{ fontSize: '2.5rem' }}>👁️</div>
                        <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800' }}>
                            {displayTitle}
                        </h4>
                        <p style={{ margin: 0, maxWidth: '440px', fontSize: '0.88rem', color: isDark ? '#94a3b8' : '#64748b', lineHeight: '1.6' }}>
                            본 자산 인접 도로의 고해상도 360° 파노라마 로드뷰를 카카오맵 및 네이버 지도 포털에서 즉시 고화질로 확인하실 수 있습니다.
                        </p>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
                            <a
                                href={kakaoRoadviewUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    padding: '10px 18px',
                                    borderRadius: '8px',
                                    background: '#fee500',
                                    color: '#191919',
                                    fontSize: '0.86rem',
                                    fontWeight: '800',
                                    textDecoration: 'none',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                <span>👁️</span>
                                <span>카카오맵 360° 로드뷰 열기 ↗</span>
                            </a>
                            <a
                                href={naverMapUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    padding: '10px 18px',
                                    borderRadius: '8px',
                                    background: '#03c75a',
                                    color: '#ffffff',
                                    fontSize: '0.86rem',
                                    fontWeight: '800',
                                    textDecoration: 'none',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                <span>네이버 거리뷰 열기 ↗</span>
                            </a>
                        </div>
                    </div>
                )}

                {/* 하단 로드뷰 조작 안내 오버레이 */}
                {status === 'ready' && (
                    <div style={{
                        position: 'absolute',
                        bottom: '10px',
                        left: '10px',
                        zIndex: 10,
                        background: isDark ? 'rgba(15, 23, 42, 0.88)' : 'rgba(255, 255, 255, 0.92)',
                        backdropFilter: 'blur(6px)',
                        padding: '5px 12px',
                        borderRadius: '20px',
                        border: `1px solid ${subCardBorder}`,
                        fontSize: '0.72rem',
                        fontWeight: '600',
                        color: isDark ? '#94a3b8' : '#64748b',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        pointerEvents: 'none'
                    }}>
                        👁️ 드래그 360도 탐색 · 휠 줌 · 화살표 클릭 도로 이동
                    </div>
                )}
            </div>

            {/* 하단 주소 및 내비/지도 딥링크 정보 바 */}
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
                    <span style={{ color: '#0284c7', fontSize: '1rem' }}>👁️</span>
                    <strong style={{ color: isDark ? '#ffffff' : '#0f172a' }}>{displayAddress}</strong>
                    <span style={{ color: isDark ? '#64748b' : '#94a3b8', fontSize: '0.76rem' }}> (현장 로드뷰 실사)</span>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <a
                        href={kakaoRoadviewUrl}
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
                        카카오 로드뷰 ↗
                    </a>
                    <a
                        href={kakaoMapUrl}
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
                        지도 위치 ↗
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
                        네이버 거리뷰 ↗
                    </a>
                </div>
            </div>
        </div>
    );
}
