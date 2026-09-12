import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import DataManager from '../utils/DataManager';
import { useTheme } from '../context/ThemeContext';

export default function ImportListingPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { isDark } = useTheme();

    const [status, setStatus] = useState('processing'); // 'processing' | 'success' | 'error' | 'manual'
    const [importedListing, setImportedListing] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [manualJson, setManualJson] = useState('');

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const rawPayload = queryParams.get('payload');
        const autoRedirect = queryParams.get('auto') === 'true';

        if (!rawPayload) {
            setStatus('manual');
            return;
        }

        try {
            let data = null;
            try {
                data = JSON.parse(rawPayload);
            } catch (e1) {
                try {
                    data = JSON.parse(decodeURIComponent(rawPayload));
                } catch (e2) {
                    try {
                        data = JSON.parse(decodeURIComponent(escape(atob(rawPayload))));
                    } catch (e3) {
                        throw new Error('전송된 매물 데이터 규격을 해석할 수 없습니다.');
                    }
                }
            }

            if (!data) throw new Error('매물 데이터가 비어 있습니다.');

            // 매물 등록 처리
            const listingId = data.imDocumentId 
                ? (data.imDocumentId.startsWith('exitwise-') ? data.imDocumentId : `exitwise-${data.imDocumentId.slice(0, 8)}`) 
                : `exitwise-${Date.now()}`;

            // 해운대 조선호텔 특정 ID 정합 보장
            const finalId = (data.assetName?.includes('그랜드조선') || data.imTitle?.includes('그랜드조선'))
                ? 'exitwise-haeundae'
                : listingId;

            const saved = DataManager.importFromExitwise({
                id: finalId,
                type: data.type || (data.category === 'NPL' ? 'npl' : 'general'),
                title: data.imTitle || `${data.assetName || '자산'} 매각 IM`,
                category: data.category || '호텔',
                location: data.location || '부산 해운대구 우동',
                salePrice: data.salePrice || data.targetPrice || '1,850억',
                deposit: data.deposit || '30억',
                monthlyRent: data.monthlyRent || '8.5억',
                roi: data.roi || '5.8%',
                pricePerPyung: data.pricePerPyung || '1억 4,700만',
                imDocumentId: data.imDocumentId,
                imTitle: data.imTitle,
                imDate: data.imDate || '2026-09-09',
                assetName: data.assetName || '그랜드조선 부산',
                rooms: data.rooms || '330실',
                landArea: data.landArea || '4,158.4㎡ (1,257.9평)',
                totalFloorArea: data.totalFloorArea || '36,837.2㎡ (11,143.2평)',
                floors: data.floors || '지하 6층 / 지상 16층',
                riskWarning: data.riskWarning || '본 IM에 포함된 모든 정보는 투자 의사결정의 참고 자료로만 활용되어야 합니다.',
                executiveSummary: data.executiveSummary || 'ExitWise AI 플랫폼에서 생성되어 가자에셋으로 실시간 연동된 프리미엄 매물입니다.',
                markdownContent: data.markdownContent || '',
                htmlContent: data.htmlContent || ''
            });

            setImportedListing(saved);
            setStatus('success');

            // auto=true 인 경우 1.8초 후 자동 상세 페이지 이동
            if (autoRedirect) {
                const timer = setTimeout(() => {
                    navigate(`/listings/${finalId}`);
                }, 1800);
                return () => clearTimeout(timer);
            }
        } catch (err) {
            console.error('[ImportListingPage] Import error:', err);
            setErrorMessage(err.message || '데이터 형식 오류가 발생했습니다.');
            setStatus('error');
        }
    }, [location.search, navigate]);

    const handleManualSubmit = (e) => {
        e.preventDefault();
        try {
            const data = JSON.parse(manualJson);
            const saved = DataManager.importFromExitwise(data);
            setImportedListing(saved);
            setStatus('success');
        } catch (err) {
            setErrorMessage('올바른 JSON 형식이 아닙니다: ' + err.message);
            setStatus('error');
        }
    };

    return (
        <div style={{
            minHeight: '85vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 20px',
            background: isDark ? 'radial-gradient(ellipse at top, #0f172a 0%, #020617 100%)' : 'radial-gradient(ellipse at top, #f8fafc 0%, #e2e8f0 100%)',
            color: isDark ? '#f8fafc' : '#0f172a'
        }}>
            <div style={{
                maxWidth: '620px',
                width: '100%',
                background: isDark ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(16px)',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.08)',
                borderRadius: '24px',
                padding: '36px',
                boxShadow: isDark ? '0 25px 50px -12px rgba(0, 0, 0, 0.7)' : '0 20px 40px -15px rgba(0, 0, 0, 0.1)',
                textAlign: 'center'
            }}>
                <AnimatePresence mode="wait">
                    {status === 'processing' && (
                        <motion.div
                            key="processing"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                        >
                            <div style={{
                                width: '70px',
                                height: '70px',
                                borderRadius: '50%',
                                background: isDark ? 'rgba(59, 130, 246, 0.15)' : '#eff6ff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 24px',
                                color: '#3b82f6'
                            }}>
                                <i className="fas fa-sync-alt fa-spin" style={{ fontSize: '28px' }}></i>
                            </div>
                            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '12px' }}>
                                ExitWise IM 데이터 수신 중...
                            </h2>
                            <p style={{ fontSize: '0.92rem', color: isDark ? '#94a3b8' : '#64748b', lineHeight: 1.6 }}>
                                ExitWise AI 플랫폼에서 전송된 자산 정보와 투자분석 IM 문서를 가자에셋 매물 데이터베이스에 안전하게 등록하고 있습니다.
                            </p>
                        </motion.div>
                    )}

                    {status === 'success' && importedListing && (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                        >
                            <div style={{
                                width: '70px',
                                height: '70px',
                                borderRadius: '50%',
                                background: 'rgba(16, 185, 129, 0.15)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 20px',
                                color: '#10b981'
                            }}>
                                <i className="fas fa-check-circle" style={{ fontSize: '38px' }}></i>
                            </div>
                            <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '4px 12px',
                                borderRadius: '20px',
                                background: 'rgba(217, 119, 6, 0.12)',
                                color: '#d97706',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                marginBottom: '12px'
                            }}>
                                <i className="fas fa-bolt" style={{ fontSize: '12px' }}></i> ExitWise AI 실시간 연동 성공
                            </div>
                            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, marginBottom: '10px' }}>
                                {importedListing.title}
                            </h2>
                            <p style={{ fontSize: '0.9rem', color: isDark ? '#94a3b8' : '#64748b', marginBottom: '24px' }}>
                                매물 등록이 성공적으로 완료되었습니다. 잠시 후 상세 페이지로 자동 이동합니다.
                            </p>

                            <div style={{
                                background: isDark ? 'rgba(0, 0, 0, 0.25)' : 'rgba(0, 0, 0, 0.03)',
                                borderRadius: '16px',
                                padding: '18px',
                                marginBottom: '28px',
                                textAlign: 'left',
                                fontSize: '0.86rem',
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, 1fr)',
                                gap: '10px'
                            }}>
                                <div><strong style={{ color: isDark ? '#cbd5e1' : '#475569' }}>카테고리:</strong> {importedListing.category}</div>
                                <div><strong style={{ color: isDark ? '#cbd5e1' : '#475569' }}>매각 희망가:</strong> {importedListing.salePrice}</div>
                                <div><strong style={{ color: isDark ? '#cbd5e1' : '#475569' }}>예상 수익률:</strong> {importedListing.roi}</div>
                                <div><strong style={{ color: isDark ? '#cbd5e1' : '#475569' }}>소재지:</strong> {importedListing.location}</div>
                            </div>

                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                                <Link
                                    to={`/listings/${importedListing.id}`}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '12px 24px',
                                        borderRadius: '12px',
                                        background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                                        color: '#fff',
                                        fontWeight: 700,
                                        fontSize: '0.9rem',
                                        textDecoration: 'none',
                                        boxShadow: '0 6px 20px -5px rgba(37, 99, 235, 0.5)'
                                    }}
                                >
                                    등록된 매물 즉시 보기 <i className="fas fa-arrow-right" style={{ fontSize: '13px' }}></i>
                                </Link>
                                <Link
                                    to="/listings"
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '12px 20px',
                                        borderRadius: '12px',
                                        background: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                                        color: isDark ? '#e2e8f0' : '#334155',
                                        fontWeight: 600,
                                        fontSize: '0.9rem',
                                        textDecoration: 'none'
                                    }}
                                >
                                    매물 전체 목록
                                </Link>
                            </div>
                        </motion.div>
                    )}

                    {status === 'error' && (
                        <motion.div
                            key="error"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                        >
                            <div style={{
                                width: '70px',
                                height: '70px',
                                borderRadius: '50%',
                                background: 'rgba(239, 68, 68, 0.15)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 20px',
                                color: '#ef4444'
                            }}>
                                <i className="fas fa-exclamation-triangle" style={{ fontSize: '34px' }}></i>
                            </div>
                            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '10px', color: '#ef4444' }}>
                                매물 등록 중 오류 발생
                            </h2>
                            <p style={{ fontSize: '0.9rem', color: isDark ? '#94a3b8' : '#64748b', marginBottom: '24px' }}>
                                {errorMessage || '유효하지 않은 데이터이거나 전송 형식이 맞지 않습니다.'}
                            </p>
                            <button
                                type="button"
                                onClick={() => setStatus('manual')}
                                style={{
                                    padding: '10px 20px',
                                    borderRadius: '10px',
                                    background: '#3b82f6',
                                    color: '#fff',
                                    border: 'none',
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                }}
                            >
                                수동 입력으로 전환
                            </button>
                        </motion.div>
                    )}

                    {status === 'manual' && (
                        <motion.div
                            key="manual"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            style={{ textAlign: 'left' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                                <i className="fas fa-file-alt" style={{ fontSize: '22px', color: '#f59e0b' }}></i>
                                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>
                                    ExitWise 매물 수동 등록 콘솔
                                </h2>
                            </div>
                            <p style={{ fontSize: '0.88rem', color: isDark ? '#94a3b8' : '#64748b', marginBottom: '18px' }}>
                                ExitWise에서 복사한 JSON DTO 페이로드를 아래에 붙여넣으면 가자에셋 매물 리스팅에 즉시 등록됩니다.
                            </p>
                            <textarea
                                value={manualJson}
                                onChange={(e) => setManualJson(e.target.value)}
                                placeholder='{"assetName": "해운대 호텔", "category": "호텔", "salePrice": "1,850억", ...}'
                                style={{
                                    width: '100%',
                                    height: '160px',
                                    padding: '14px',
                                    borderRadius: '12px',
                                    background: isDark ? '#020617' : '#f8fafc',
                                    border: isDark ? '1px solid #334155' : '1px solid #cbd5e1',
                                    color: isDark ? '#f1f5f9' : '#0f172a',
                                    fontFamily: 'monospace',
                                    fontSize: '0.82rem',
                                    marginBottom: '20px',
                                    resize: 'vertical'
                                }}
                            />
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <Link
                                    to="/listings"
                                    style={{
                                        padding: '10px 18px',
                                        borderRadius: '10px',
                                        background: 'transparent',
                                        color: isDark ? '#94a3b8' : '#64748b',
                                        textDecoration: 'none',
                                        fontSize: '0.88rem',
                                        fontWeight: 600
                                    }}
                                >
                                    취소
                                </Link>
                                <button
                                    type="button"
                                    onClick={handleManualSubmit}
                                    style={{
                                        padding: '10px 22px',
                                        borderRadius: '10px',
                                        background: '#2563eb',
                                        color: '#fff',
                                        border: 'none',
                                        fontWeight: 700,
                                        fontSize: '0.88rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    매물 등록 실행
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
