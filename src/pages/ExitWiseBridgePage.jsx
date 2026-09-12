import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import DataManager from '../utils/DataManager';
import { useTheme } from '../context/ThemeContext';

const ExitWiseBridgePage = () => {
    const navigate = useNavigate();
    const { isDark, toggleTheme } = useTheme();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [activeTab, setActiveTab] = useState('browser'); // 'browser' or 'logic'

    // ExitWise IM 데이터 페이로드 (첨부 이미지의 자산 데이터)
    const [imData, setImData] = useState({
        imDocumentId: "cda6733f-78b1-4a42-b7ae-3a9b1c1bc606",
        imTitle: "해운대 그랜드조선 부산 관광호텔 자산 매각 IM",
        assetName: "그랜드조선 부산",
        category: "호텔",
        type: "general", // 'general' | 'npl'
        location: "부산 해운대구 우동",
        targetPrice: "1,850억",
        deposit: "30억",
        monthlyRent: "8.5억",
        roi: "5.8%",
        pricePerPyung: "1억 4,700만",
        rooms: "330실",
        landArea: "4,158.4㎡ (1,257.9평)",
        totalFloorArea: "36,837.2㎡ (11,143.2평)",
        floors: "지하 6층 / 지상 16층",
        date: "2026년 9월 9일",
        riskWarning: "본 IM에 포함된 모든 정보는 투자 의사결정의 참고 자료로만 활용되어야 하며, 투자 권유 또는 확정적 수익을 보장하지 않습니다. 호텔 투자에는 운영 리스크 및 원금 손실 리스크가 수반되며, 최종 투자 결정은 투자자 본인의 책임 하에 이루어져야 합니다."
    });

    
    const openRawImWindow = () => {
        const width = 980;
        const height = 960;
        const left = (window.screen.width - width) / 2;
        const top = (window.screen.height - height) / 2;
        window.open(
            '/im-raw-viewer',
            'ExitWiseRawIM',
            `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
        );
    };

    const handleOpenSubmitModal = () => {
        setIsModalOpen(true);
        setIsSuccess(false);
    };

    const handleConfirmPublish = () => {
        setIsSubmitting(true);

        // 실제 가자에셋 DataManager로 매물 등록 로직 실행
        setTimeout(() => {
            DataManager.importFromExitwise({
                id: 'exitwise-haeundae',
                type: imData.type,
                title: imData.imTitle,
                category: imData.category,
                location: imData.location,
                salePrice: imData.targetPrice,
                deposit: imData.deposit,
                monthlyRent: imData.monthlyRent,
                roi: imData.roi,
                pricePerPyung: imData.pricePerPyung,
                imDocumentId: imData.imDocumentId,
                imTitle: imData.imTitle,
                assetName: imData.assetName,
                rooms: imData.rooms,
                landArea: imData.landArea,
                totalFloorArea: imData.totalFloorArea,
                floors: imData.floors,
                riskWarning: imData.riskWarning,
                executiveSummary: "해운대 백사장 바로 앞에 위치한 5성급 럭셔리 관광호텔로 안정적인 객실 점유율(OCC 78%)과 식음(F&B) 매출을 보유하고 있으며, 향후 브랜드 리뉴얼 및 웰니스 복합 리조트 확장 가능성이 높은 국내 최정상급 밸류애드 호텔 자산입니다."
            });

            setIsSubmitting(false);
            setIsSuccess(true);
        }, 800);
    };

    const handleNavigateToGajaListing = () => {
        navigate('/listings/exitwise-haeundae');
    };

    return (
        <div style={{
            background: isDark ? '#0b0f17' : '#f1f5f9',
            minHeight: '100vh',
            color: isDark ? '#e2e8f0' : '#0f172a',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            transition: 'background-color 0.25s ease, color 0.25s ease'
        }}>
            {/* Top Global Switcher Bar */}
            <div style={{
                background: isDark ? '#0f172a' : '#ffffff',
                borderBottom: isDark ? '1px solid #1e293b' : '1px solid #e2e8f0',
                padding: '12px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '15px',
                boxShadow: isDark ? 'none' : '0 2px 10px rgba(0,0,0,0.04)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }}></span>
                        <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b' }}></span>
                        <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }}></span>
                    </div>
                    <strong style={{ color: isDark ? '#38bdf8' : '#0284c7', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <i className="fas fa-magic"></i> ExitWise ↔ 가자에셋(gajaasset.com) 연동 인터랙티브 목업
                    </strong>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {/* Theme Toggle Button */}
                    <button
                        onClick={toggleTheme}
                        style={{
                            padding: '6px 14px',
                            borderRadius: '6px',
                            background: isDark ? 'rgba(212, 175, 55, 0.15)' : 'rgba(212, 175, 55, 0.18)',
                            color: isDark ? '#fbbf24' : '#92400e',
                            border: isDark ? '1px solid rgba(212, 175, 55, 0.4)' : '1px solid rgba(184, 134, 11, 0.4)',
                            fontWeight: '600',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                        title={isDark ? '라이트 모드로 전환 (원창 동기화)' : '다크 모드로 전환 (원창 동기화)'}
                    >
                        <i className={`fas ${isDark ? 'fa-sun' : 'fa-moon'}`}></i>
                        {isDark ? '라이트 모드' : '다크 모드'}
                    </button>

                    <button
                        onClick={() => setActiveTab('browser')}
                        style={{
                            padding: '6px 14px',
                            borderRadius: '6px',
                            background: activeTab === 'browser' ? (isDark ? '#38bdf8' : '#0284c7') : (isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0'),
                            color: activeTab === 'browser' ? (isDark ? '#0f172a' : '#ffffff') : (isDark ? '#94a3b8' : '#475569'),
                            border: 'none',
                            fontWeight: '600',
                            fontSize: '0.85rem',
                            cursor: 'pointer'
                        }}
                    >
                        <i className="fas fa-desktop"></i> ExitWise 화면 목업
                    </button>
                    <button
                        onClick={() => setActiveTab('logic')}
                        style={{
                            padding: '6px 14px',
                            borderRadius: '6px',
                            background: activeTab === 'logic' ? (isDark ? '#38bdf8' : '#0284c7') : (isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0'),
                            color: activeTab === 'logic' ? (isDark ? '#0f172a' : '#ffffff') : (isDark ? '#94a3b8' : '#475569'),
                            border: 'none',
                            fontWeight: '600',
                            fontSize: '0.85rem',
                            cursor: 'pointer'
                        }}
                    >
                        <i className="fas fa-code-branch"></i> 연동 로직 프로세스 명세
                    </button>
                    <Link
                        to="/listings"
                        style={{
                            padding: '6px 14px',
                            borderRadius: '6px',
                            background: 'rgba(212, 175, 55, 0.2)',
                            color: 'var(--accent-gold)',
                            border: '1px solid rgba(212, 175, 55, 0.4)',
                            textDecoration: 'none',
                            fontWeight: '600',
                            fontSize: '0.85rem'
                        }}
                    >
                        가자에셋 리스팅으로 이동 →
                    </Link>
                </div>
            </div>

            {/* TAB 1: BROWSER VIEW (첨부 사진 완벽 재현 화면) */}
            {activeTab === 'browser' && (
                <div style={{ maxWidth: '1440px', margin: '20px auto', padding: '0 20px' }}>
                    {/* Simulated Browser Window Frame */}
                    <div style={{
                        background: '#18181b',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        border: '1px solid #27272a',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
                    }}>
                        {/* Browser Tab Bar */}
                        <div style={{
                            background: '#09090b',
                            padding: '8px 12px 0',
                            display: 'flex',
                            gap: '6px',
                            alignItems: 'center',
                            overflowX: 'auto'
                        }}>
                            <div style={{ padding: '6px 14px', borderRadius: '8px 8px 0 0', background: '#27272a', color: '#f4f4f5', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '8px', minWidth: '180px' }}>
                                <span style={{ color: '#38bdf8' }}>●</span>
                                <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>대시보드 | ExitWise</span>
                                <span style={{ marginLeft: 'auto', color: '#71717a' }}>×</span>
                            </div>
                            <div style={{ padding: '6px 14px', borderRadius: '8px 8px 0 0', background: 'transparent', color: '#a1a1aa', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span>Exclusive Listings | 가...</span>
                            </div>
                            <div style={{ padding: '6px 14px', borderRadius: '8px 8px 0 0', background: 'transparent', color: '#a1a1aa', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span>역삼동 고급 빌딩 경매 | 가...</span>
                            </div>
                        </div>

                        {/* Browser Address Bar */}
                        <div style={{
                            background: '#18181b',
                            padding: '8px 16px',
                            borderBottom: '1px solid #27272a',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}>
                            <div style={{ display: 'flex', gap: '8px', color: '#71717a', fontSize: '0.85rem' }}>
                                <i className="fas fa-arrow-left"></i>
                                <i className="fas fa-arrow-right"></i>
                                <i className="fas fa-redo"></i>
                            </div>
                            <div style={{
                                flex: 1,
                                background: '#09090b',
                                borderRadius: '6px',
                                padding: '6px 14px',
                                fontSize: '0.82rem',
                                color: '#a1a1aa',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                border: '1px solid #27272a'
                            }}>
                                <i className="fas fa-lock" style={{ color: '#10b981', fontSize: '0.75rem' }}></i>
                                <span>https://www.exitwise.io/dashboard?p=im-studio&chat=cda6733f-78b1-4a42-b7ae-3a9b1c1bc606</span>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', color: '#71717a', fontSize: '0.9rem' }}>
                                <i className="fas fa-bookmark"></i>
                                <i className="fas fa-ellipsis-v"></i>
                            </div>
                        </div>

                        {/* Main ExitWise Application Area */}
                        <div style={{ display: 'flex', minHeight: '750px', background: '#ffffff', color: '#18181b' }}>
                            {/* Left Chat & Document History Sidebar */}
                            <div style={{
                                width: '260px',
                                background: '#f8fafc',
                                borderRight: '1px solid #e2e8f0',
                                padding: '16px 12px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '12px',
                                flexShrink: 0
                            }}>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                    <button style={{ flex: 1, padding: '8px 12px', background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '6px', color: '#92400e', fontWeight: 'bold', fontSize: '0.82rem', cursor: 'pointer' }}>
                                        + 새 대화
                                    </button>
                                    <button style={{ padding: '8px 12px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '6px', color: '#64748b', fontSize: '0.82rem' }}>
                                        선택
                                    </button>
                                </div>

                                <div style={{ background: '#f1f5f9', borderRadius: '6px', padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#94a3b8' }}>
                                    <i className="fas fa-search"></i>
                                    <span>대화 검색...</span>
                                </div>

                                <div style={{ display: 'flex', gap: '6px' }}>
                                    <span style={{ padding: '4px 10px', borderRadius: '20px', background: '#e0f2fe', color: '#0284c7', fontSize: '0.75rem', fontWeight: 'bold' }}>IM 문서 30</span>
                                    <span style={{ padding: '4px 10px', borderRadius: '20px', background: '#f1f5f9', color: '#64748b', fontSize: '0.75rem' }}>AI 상담 0</span>
                                </div>

                                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '10px', fontWeight: '600' }}>이전 30건</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
                                    <div style={{ padding: '8px 10px', borderRadius: '6px', background: '#e2e8f0', color: '#0f172a', fontSize: '0.8rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span style={{ color: '#10b981' }}>[Auto]</span> 부산 해운대구 해운대비치...
                                    </div>
                                    <div style={{ padding: '8px 10px', borderRadius: '6px', color: '#475569', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span style={{ color: '#10b981' }}>[Auto]</span> 여의도 FKI타워 오피스 통...
                                    </div>
                                    <div style={{ padding: '8px 10px', borderRadius: '6px', color: '#475569', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span style={{ color: '#10b981' }}>[Auto]</span> 제주특별자치도 제주시 외...
                                    </div>
                                    <div style={{ padding: '8px 10px', borderRadius: '6px', color: '#475569', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span style={{ color: '#64748b' }}>[NPL]</span> 서초동 법조타운 상가 채권...
                                    </div>
                                </div>
                            </div>

                            {/* Main Right Content Panel */}
                            <div style={{ flex: 1, padding: '30px 40px', overflowY: 'auto' }}>
                                {/* Top Linked Property Header */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                                    <div style={{ padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <i className="fas fa-building"></i>
                                        <span>매물을 선택하세요 (선택사항)</span>
                                        <i className="fas fa-chevron-down" style={{ fontSize: '0.7rem' }}></i>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#0f172a' }}>
                                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span>
                                        <strong>그랜드조선 부산</strong>
                                        <span style={{ fontSize: '0.75rem', color: '#64748b', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>연결됨</span>
                                        <span style={{ color: '#0ea5e9', cursor: 'pointer', marginLeft: '4px' }}>매물 페이지 →</span>
                                    </div>
                                </div>

                                {/* Investment Risk Warning Block (첨부 이미지의 텍스트 그대로) */}
                                <div style={{ marginBottom: '30px' }}>
                                    <h4 style={{ color: '#0f172a', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '12px' }}>
                                        투자 위험 경고
                                    </h4>
                                    <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: '1.7', margin: 0 }}>
                                        본 IM에 포함된 모든 정보는 투자 의사결정의 참고 자료로만 활용되어야 하며, 투자 권유 또는 확정적 수익을 보장하지 않습니다.<br />
                                        호텔 투자에는 운영 리스크 및 원금 손실 리스크가 수반되며, 최종 투자 결정은 투자자 본인의 책임 하에 이루어져야 합니다.<br />
                                        본 문서는 투자·법률·세무 자문이 아닌 의사결정 보조 자료이며, 「자본시장과 금융투자업에 관한 법률」 상 투자권유·투자자문에 해당하지 않습니다. 수치·전망·판정 항목은 작성 시점 추정이며 관련 전문가의 확인과 자체 실사(Due Diligence)를 거쳐야 합니다.<br />
                                        특히 본건은 (i) 물건명이 필지 점유자 조회에 근거한 추정치이며, (ii) 객실 수·OCC·ADR·RevPAR·EBITDA 등 핵심 운영 재무지표가 공공데이터 및 사용자 제공 자료로 확인되지 않아 § 3~§ 6의 정량 결론이 제한적입니다. 매각·인수 검토 전 반드시 매도인 측 실사 자료 확보 및 전문 감정평가를 진행하시기 바랍니다.
                                    </p>
                                </div>

                                {/* Generated IM Document Box (첨부 이미지의 핵심 박스) */}
                                <div style={{
                                    border: '1px solid #bfdbfe',
                                    background: '#f8fafc',
                                    borderRadius: '16px',
                                    padding: '24px 28px',
                                    marginBottom: '30px',
                                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
                                }}>
                                    {/* Document Header Line */}
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '20px' }}>
                                        <div style={{
                                            width: '50px',
                                            height: '50px',
                                            borderRadius: '10px',
                                            background: '#eff6ff',
                                            border: '1px solid #bfdbfe',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#2563eb',
                                            fontSize: '1.4rem'
                                        }}>
                                            <i className="far fa-file-alt"></i>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
                                                <span style={{ fontSize: '0.78rem', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                                                    ● 문서 생성 완료
                                                </span>
                                                <span style={{ fontSize: '0.78rem', background: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: '4px' }}>
                                                    초안
                                                </span>
                                                <span style={{ fontSize: '0.78rem', background: '#fee2e2', color: '#b91c1c', padding: '2px 8px', borderRadius: '4px' }}>
                                                    편집기 새 버전
                                                </span>
                                            </div>
                                            <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', margin: '4px 0' }}>
                                                해운대 그랜드조선 부산 관광호텔 자산 매각 IM
                                            </h3>
                                            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>2026년 9월 9일</span>
                                        </div>
                                    </div>

                                    {/* Action Buttons Bar - 사용자가 빨간 네모 친 곳에 가자에셋 매물 올리기 버튼 배치! */}
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        flexWrap: 'wrap',
                                        paddingTop: '15px',
                                        borderTop: '1px solid #e2e8f0'
                                    }}>
                                        <button
                                            onClick={openRawImWindow}
                                            style={{
                                                padding: '10px 16px',
                                                borderRadius: '8px',
                                                background: 'linear-gradient(135deg, #10b981, #059669)',
                                                color: 'white',
                                                border: 'none',
                                                fontSize: '0.9rem',
                                                fontWeight: 'bold',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                                            }}
                                            title="채팅창의 IM 생성 원문 전문을 별도 팝업 창으로 띄워 확인합니다."
                                        >
                                            <i className="fas fa-external-link-alt"></i> IM 원문 별도창 보기
                                        </button>
                                        <button
                                            onClick={openRawImWindow}
                                            style={{ padding: '10px 16px', borderRadius: '8px', background: '#2563eb', color: 'white', border: 'none', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                                        >
                                            <i className="fas fa-print"></i> 인쇄 미리보기
                                        </button>
                                        <button style={{ padding: '10px 16px', borderRadius: '8px', background: 'white', color: '#2563eb', border: '1px solid #bfdbfe', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <i className="fas fa-edit"></i> 편집기 열기
                                        </button>
                                        <button style={{ padding: '10px 16px', borderRadius: '8px', background: 'white', color: '#475569', border: '1px solid #cbd5e1', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <i className="fas fa-columns"></i> 옆에서 열기
                                        </button>
                                        <button style={{ padding: '10px 16px', borderRadius: '8px', background: 'white', color: '#475569', border: '1px solid #cbd5e1', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <i className="fas fa-folder"></i> 문서센터에서 관리
                                        </button>

                                        {/* ⭐⭐⭐ 사용자가 지정한 바로 그 위치 (빨간 테두리 박스 위치)! ⭐⭐⭐ */}
                                        <div style={{ position: 'relative' }}>
                                            <motion.button
                                                whileHover={{ scale: 1.04 }}
                                                whileTap={{ scale: 0.98 }}
                                                animate={{
                                                    boxShadow: [
                                                        '0 0 0 0 rgba(239, 68, 68, 0.4)',
                                                        '0 0 0 10px rgba(239, 68, 68, 0)',
                                                        '0 0 0 0 rgba(239, 68, 68, 0.4)'
                                                    ]
                                                }}
                                                transition={{ repeat: Infinity, duration: 2 }}
                                                onClick={handleOpenSubmitModal}
                                                style={{
                                                    padding: '10px 20px',
                                                    borderRadius: '8px',
                                                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                                                    color: 'white',
                                                    border: '2px solid #b91c1c',
                                                    fontSize: '0.92rem',
                                                    fontWeight: 'bold',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    letterSpacing: '-0.2px'
                                                }}
                                            >
                                                <i className="fas fa-paper-plane"></i>
                                                <span>가자에셋 매물 올리기</span>
                                            </motion.button>
                                            {/* Pointer Tooltip */}
                                            <div style={{
                                                position: 'absolute',
                                                top: '-32px',
                                                left: '50%',
                                                transform: 'translateX(-50%)',
                                                background: '#1e293b',
                                                color: '#f8fafc',
                                                fontSize: '0.72rem',
                                                padding: '2px 8px',
                                                borderRadius: '4px',
                                                whiteSpace: 'nowrap',
                                                pointerEvents: 'none'
                                            }}>
                                                👈 첨부 스크린샷 요청 위치!
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Sub Feature Bar (IM 인텔리전스 & 결정론 검증) */}
                                <div style={{
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '12px',
                                    padding: '16px 20px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '20px',
                                    background: '#ffffff'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <i className="fas fa-brain" style={{ fontSize: '0.85rem' }}></i>
                                        </span>
                                        <div>
                                            <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>IM 인텔리전스</strong>
                                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>전문가 매칭 가능 · 미디어/출처 검색 가능</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button style={{ padding: '6px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.82rem', color: '#475569' }}>
                                            <i className="fas fa-user-friends"></i> 전문가 매칭
                                        </button>
                                        <button style={{ padding: '6px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.82rem', color: '#475569' }}>
                                            <i className="fas fa-newspaper"></i> 미디어 증빙
                                        </button>
                                        <button style={{ padding: '6px 12px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '6px', fontSize: '0.82rem', color: '#059669', fontWeight: '600' }}>
                                            <i className="fas fa-link"></i> 실행 연결
                                        </button>
                                    </div>
                                </div>

                                <div style={{
                                    border: '1px solid #fecaca',
                                    borderRadius: '12px',
                                    padding: '16px 20px',
                                    background: '#fef2f2'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                        <strong style={{ color: '#991b1b', fontSize: '0.9rem' }}>
                                            <i className="fas fa-shield-alt"></i> 결정론 검증
                                        </strong>
                                        <div style={{ display: 'flex', gap: '6px', fontSize: '0.75rem' }}>
                                            <span style={{ padding: '2px 6px', background: '#fee2e2', color: '#b91c1c', borderRadius: '4px', fontWeight: 'bold' }}>오류 2</span>
                                            <span style={{ padding: '2px 6px', background: '#fef3c7', color: '#b45309', borderRadius: '4px', fontWeight: 'bold' }}>주의 2</span>
                                            <span style={{ padding: '2px 6px', background: '#dcfce7', color: '#15803d', borderRadius: '4px', fontWeight: 'bold' }}>확인 4</span>
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: '#7f1d1d' }}>
                                        [오류] 면적 환산 불일치 검증 완료 (공부상 연면적 36,837.2㎡와 실측 지표 간 대조 완료)
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: LOGIC SPECIFICATION VIEW */}
            {activeTab === 'logic' && (
                <div style={{ maxWidth: '1000px', margin: '30px auto', padding: '0 20px' }}>
                    <div style={{
                        background: isDark ? '#0f172a' : '#ffffff',
                        border: isDark ? '1px solid #1e293b' : '1px solid #e2e8f0',
                        borderRadius: '16px',
                        padding: '35px',
                        boxShadow: isDark ? 'none' : '0 10px 25px rgba(0,0,0,0.05)'
                    }}>
                        <h2 style={{ color: isDark ? 'white' : '#0f172a', fontSize: '1.6rem', marginBottom: '15px' }}>
                            <i className="fas fa-network-wired" style={{ color: isDark ? '#38bdf8' : '#0284c7', marginRight: '10px' }}></i>
                            ExitWise ↔ 가자에셋 실시간 매물 연동 아키텍처 및 로직 프로세스
                        </h2>
                        <p style={{ color: isDark ? '#94a3b8' : '#64748b', lineHeight: '1.6', marginBottom: '30px' }}>
                            ExitWise IM 스튜디오에서 생성된 투자설명서(IM) 문서를 클릭 한 번으로 가자에셋 플랫폼의 공식 리스팅으로 안전하게 배포하고, 매물 상세 보기와 양방향 동기화하는 전체 파이프라인입니다.
                        </p>

                        <div style={{ display: 'grid', gap: '20px' }}>
                            <div style={{ background: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc', border: isDark ? 'none' : '1px solid #e2e8f0', padding: '20px', borderRadius: '10px', borderLeft: '4px solid #38bdf8' }}>
                                <h4 style={{ color: isDark ? '#38bdf8' : '#0284c7', margin: '0 0 8px' }}>1단계. IM 문서 데이터 자동 추출 (Data Parsing & Mapping)</h4>
                                <p style={{ fontSize: '0.9rem', color: isDark ? '#cbd5e1' : '#334155', margin: 0, lineHeight: '1.6' }}>
                                    ExitWise IM 스튜디오 내 자산명(그랜드조선 부산), 소재지(부산 해운대), 매각희망가(1,850억), 대지/연면적, 객실 수(330실), 투자 위험 경고 및 요약문을 가자에셋 Listing 데이터 스키마로 표준화 변환합니다.
                                </p>
                            </div>

                            <div style={{ background: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc', border: isDark ? 'none' : '1px solid #e2e8f0', padding: '20px', borderRadius: '10px', borderLeft: '4px solid #10b981' }}>
                                <h4 style={{ color: isDark ? '#10b981' : '#059669', margin: '0 0 8px' }}>2단계. 가자에셋 수신 API 호출 (POST /api/listings/import)</h4>
                                <p style={{ fontSize: '0.9rem', color: isDark ? '#cbd5e1' : '#334155', margin: 0, lineHeight: '1.6' }}>
                                    인증 토큰(API Key)과 함께 JSON 페이로드를 가자에셋 엔드포인트로 전송합니다. Supabase DB의 listings 테이블에 저장되며 거래 구분(일반매물 - 호텔), 게시 상태(Active), ExitWise 연동 식별자(cda6733f-...)가 안전하게 바인딩됩니다.
                                </p>
                            </div>

                            <div style={{ background: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc', border: isDark ? 'none' : '1px solid #e2e8f0', padding: '20px', borderRadius: '10px', borderLeft: '4px solid var(--accent-gold)' }}>
                                <h4 style={{ color: 'var(--accent-gold)', margin: '0 0 8px' }}>3단계. 즉시 게시 및 전용 상세 페이지 생성 (/listings/exitwise-haeundae)</h4>
                                <p style={{ fontSize: '0.9rem', color: isDark ? '#cbd5e1' : '#334155', margin: 0, lineHeight: '1.6' }}>
                                    가자에셋 리스팅 페이지(`gajaasset.com/listings`)의 '호텔' 및 '일반매물' 탭에 실시간 자동 노출되며, 상세 페이지에서는 "⚡ ExitWise IM 리포트" 탭을 통해 원본 위험 경고 및 결정론 검증 요약이 완벽하게 렌더링됩니다.
                                </p>
                            </div>
                        </div>

                        <div style={{ marginTop: '30px', textAlign: 'center' }}>
                            <button
                                onClick={() => setActiveTab('browser')}
                                className="btn-primary"
                                style={{ padding: '12px 28px', fontSize: '1rem' }}
                            >
                                직접 화면에서 [매물 올리기] 버튼 눌러보기
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* INTERACTIVE MODAL: [가자에셋 매물 올리기] 클릭 시 뜨는 팝업 */}
            <AnimatePresence>
                {isModalOpen && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'rgba(0,0,0,0.75)',
                        backdropFilter: 'blur(8px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 99999,
                        padding: '20px'
                    }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            style={{
                                background: isDark ? '#0f172a' : '#ffffff',
                                border: isDark ? '1px solid rgba(14, 165, 233, 0.5)' : '1px solid #cbd5e1',
                                borderRadius: '20px',
                                maxWidth: '640px',
                                width: '100%',
                                padding: '32px',
                                boxShadow: isDark ? '0 25px 50px -12px rgba(0, 0, 0, 0.8)' : '0 20px 40px rgba(0, 0, 0, 0.15)',
                                color: isDark ? 'white' : '#0f172a'
                            }}
                        >
                            {!isSuccess ? (
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <span style={{ padding: '4px 10px', background: '#ef4444', color: 'white', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                                ExitWise ➔ 가자에셋
                                            </span>
                                            <h3 style={{ margin: 0, fontSize: '1.35rem' }}>가자에셋 리스팅으로 매물 등록</h3>
                                        </div>
                                        <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.4rem', cursor: 'pointer' }}>×</button>
                                    </div>

                                    <p style={{ color: '#94a3b8', fontSize: '0.92rem', marginBottom: '20px', lineHeight: '1.6' }}>
                                        현재 IM 문서(<strong>{imData.imTitle}</strong>)의 데이터가 가자에셋 매물 리스팅 양식으로 자동 변환되었습니다. 확인 후 아래 등록 버튼을 눌러주세요.
                                    </p>

                                    {/* Mapped Data Card */}
                                    <div style={{ background: isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc', borderRadius: '12px', padding: '20px', marginBottom: '25px', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', fontSize: '0.9rem' }}>
                                            <div>
                                                <span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>매물명: </span>
                                                <strong style={{ color: isDark ? 'white' : '#0f172a' }}>{imData.imTitle}</strong>
                                            </div>
                                            <div>
                                                <span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>거래 구분: </span>
                                                <strong style={{ color: '#10b981' }}>일반매물 ({imData.category})</strong>
                                            </div>
                                            <div>
                                                <span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>희망 매매가: </span>
                                                <strong style={{ color: 'var(--accent-gold)' }}>{imData.targetPrice}</strong>
                                            </div>
                                            <div>
                                                <span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>소재지: </span>
                                                <strong style={{ color: isDark ? 'white' : '#0f172a' }}>{imData.location}</strong>
                                            </div>
                                            <div>
                                                <span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>객실 수 / 규모: </span>
                                                <strong style={{ color: isDark ? 'white' : '#0f172a' }}>{imData.rooms} ({imData.floors})</strong>
                                            </div>
                                            <div>
                                                <span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>연면적: </span>
                                                <strong style={{ color: isDark ? 'white' : '#0f172a' }}>{imData.totalFloorArea}</strong>
                                            </div>
                                        </div>

                                        <div style={{ marginTop: '15px', paddingTop: '12px', borderTop: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e2e8f0', fontSize: '0.8rem', color: isDark ? '#38bdf8' : '#0284c7' }}>
                                            <i className="fas fa-check-circle" style={{ marginRight: '6px' }}></i>
                                            ExitWise IM 문서 식별자 연동: {imData.imDocumentId}
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                        <button onClick={() => setIsModalOpen(false)} className="btn-outline">
                                            취소
                                        </button>
                                        <button
                                            onClick={handleConfirmPublish}
                                            disabled={isSubmitting}
                                            style={{
                                                padding: '12px 24px',
                                                borderRadius: '8px',
                                                background: '#ef4444',
                                                color: 'white',
                                                border: 'none',
                                                fontWeight: 'bold',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px'
                                            }}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <i className="fas fa-spinner fa-spin"></i> 가자에셋 DB 등록 중...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fas fa-upload"></i> 가자에셋에 즉시 게시하기
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                /* Success State */
                                <div style={{ textAlign: 'center', padding: '20px 10px' }}>
                                    <div style={{
                                        width: '70px',
                                        height: '70px',
                                        borderRadius: '50%',
                                        background: 'rgba(16, 185, 129, 0.15)',
                                        border: '2px solid #10b981',
                                        color: '#10b981',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '2rem',
                                        margin: '0 auto 20px'
                                    }}>
                                        <i className="fas fa-check"></i>
                                    </div>

                                    <h3 style={{ fontSize: '1.5rem', marginBottom: '10px', color: isDark ? 'white' : '#0f172a' }}>
                                        가자에셋 매물 등록이 완료되었습니다!
                                    </h3>
                                    <p style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.95rem', marginBottom: '25px', lineHeight: '1.6' }}>
                                        <strong>[해운대 그랜드조선 부산 관광호텔 자산 매각]</strong> 매물이<br />
                                        가자에셋 메인 리스팅 및 상세 페이지에 실시간 반영되었습니다.
                                    </p>

                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                                        <button onClick={() => setIsModalOpen(false)} className="btn-outline">
                                            닫기
                                        </button>
                                        <button
                                            onClick={handleNavigateToGajaListing}
                                            className="btn-primary"
                                            style={{
                                                padding: '12px 28px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            <span>가자에셋 매물 상세 페이지 바로보기</span>
                                            <i className="fas fa-arrow-right"></i>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ExitWiseBridgePage;
