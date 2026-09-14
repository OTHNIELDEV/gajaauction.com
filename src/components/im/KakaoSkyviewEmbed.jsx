import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { resolvePropertyCoordinates } from '../../constants/propertyCoordinates.js';

const KAKAO_KEY = '23e29b72b33388f59ca4668bce00c82d';
const KAKAO_SDK_URL = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_KEY}&libraries=services&autoload=false`;

export default function KakaoSkyviewEmbed({
    listingId,
    address,
    title,
    lat: propLat,
    lng: propLng,
    height = 480,
    caption
}) {
    const { isDark } = useTheme();
    const containerRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'fallback'

    // 공인 마스터 좌표 산출
    const resolvedCoords = useMemo(() => {
        return resolvePropertyCoordinates({
            listingId,
            address,
            title,
            lat: propLat,
            lng: propLng
        });
    }, [listingId, address, title, propLat, propLng]);

    const displayAddress = address || title || '대한민국 주요 자산 입지';
    const displayTitle = caption || title || `${displayAddress} 카카오 항공 스카이뷰`;

    const kakaoMapUrl = resolvedCoords
        ? `https://map.kakao.com/link/map/${encodeURIComponent(displayTitle)},${resolvedCoords.lat},${resolvedCoords.lng}`
        : `https://map.kakao.com`;

    useEffect(() => {
        let isCancelled = false;
        let scriptTag = null;
        let fallbackTimer = null;
        let resizeObserver = null;

        const initKakaoSkyview = () => {
            if (!containerRef.current) return;

            const setupMap = () => {
                if (!window.kakao?.maps?.load || !containerRef.current) return false;

                try {
                    window.kakao.maps.load(() => {
                        if (isCancelled || !containerRef.current) return;

                        const container = containerRef.current;
                        container.innerHTML = '';

                        const lat = resolvedCoords.lat;
                        const lng = resolvedCoords.lng;
                        const center = new window.kakao.maps.LatLng(lat, lng);

                        // 1. 카카오 지도 생성 (초기 스카이뷰 모드)
                        const mapOptions = {
                            center: center,
                            level: 3, // 항공 정밀 레벨
                            mapTypeId: window.kakao.maps.MapTypeId.SKYVIEW // 카카오 위성 항공 뷰!
                        };

                        const map = new window.kakao.maps.Map(container, mapOptions);
                        mapInstanceRef.current = map;

                        // 2. 지도 컨트롤 추가 (줌 컨트롤 & 맵타입 컨트롤)
                        const mapTypeControl = new window.kakao.maps.MapTypeControl();
                        map.addControl(mapTypeControl, window.kakao.maps.ControlPosition.TOPRIGHT);

                        const zoomControl = new window.kakao.maps.ZoomControl();
                        map.addControl(zoomControl, window.kakao.maps.ControlPosition.RIGHT);

                        // 3. 자산 위치 핀 마커 및 정보 오버레이 추가
                        const marker = new window.kakao.maps.Marker({
                            position: center,
                            map: map
                        });

                        const overlay = new window.kakao.maps.CustomOverlay({
                            position: center,
                            content: `
                                <div style="
                                    background: linear-gradient(135deg, #09101f 0%, #1e293b 100%);
                                    border: 2px solid #38bdf8;
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
                                    <span style="color:#38bdf8;">🛰️</span>
                                    <span>${displayTitle}</span>
                                </div>
                            `,
                            yAnchor: 1.8,
                            map: map
                        });

                        setStatus('ready');

                        // 다단계 relayout
                        const doRelayout = () => {
                            if (!isCancelled && map && container) {
                                map.relayout();
                                map.setCenter(center);
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

                        setTimeout(doRelayout, 100);
                        setTimeout(doRelayout, 400);
                    });
                    return true;
                } catch (e) {
                    console.warn('[KakaoSkyviewEmbed] init error:', e);
                    return false;
                }
            };

            if (setupMap()) return;
        };

        if (window.kakao?.maps?.load) {
            initKakaoSkyview();
            return;
        }

        let existingScript = document.getElementById('kakao-maps-sdk');
        if (!existingScript) {
            scriptTag = document.createElement('script');
            scriptTag.id = 'kakao-maps-sdk';
            scriptTag.src = KAKAO_SDK_URL;
            scriptTag.async = true;
            scriptTag.onload = () => initKakaoSkyview();
            scriptTag.onerror = () => setStatus('fallback');
            document.head.appendChild(scriptTag);
        } else {
            existingScript.addEventListener('load', () => initKakaoSkyview(), { once: true });
        }

        return () => {
            isCancelled = true;
            if (fallbackTimer) clearTimeout(fallbackTimer);
            if (resizeObserver) resizeObserver.disconnect();
        };
    }, [resolvedCoords, displayTitle]);

    return (
        <div style={{ position: 'relative', width: '100%', height: `${height}px`, background: '#0b1120', borderRadius: '12px', overflow: 'hidden' }}>
            <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

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
                    gap: '10px',
                    background: 'rgba(11, 17, 32, 0.85)',
                    color: '#38bdf8',
                    fontSize: '0.9rem',
                    fontWeight: '700',
                    zIndex: 2
                }}>
                    <div style={{
                        width: '32px',
                        height: '32px',
                        border: '3px solid rgba(56, 189, 248, 0.2)',
                        borderTop: '3px solid #38bdf8',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite'
                    }} />
                    <span>카카오 초고해상도 항공 스카이뷰(위성 타일)를 불러오고 있습니다...</span>
                </div>
            )}

            {/* 하단 안내 뱃지 */}
            <div style={{
                position: 'absolute',
                bottom: '12px',
                left: '12px',
                zIndex: 10,
                background: 'rgba(15, 23, 42, 0.88)',
                backdropFilter: 'blur(6px)',
                padding: '6px 14px',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                fontSize: '0.75rem',
                fontWeight: '700',
                color: '#e2e8f0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
            }}>
                <span>🛰️ 상공 500m 실시간 위성 조망 · 마우스 드래그 이동 · 휠 줌</span>
            </div>
        </div>
    );
}
