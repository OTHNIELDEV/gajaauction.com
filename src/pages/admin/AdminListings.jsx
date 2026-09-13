import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import DataManager from '../../utils/DataManager';

const EXITWISE_AVAILABLE_DOCS = [
    {
        id: 'exitwise-yangju',
        type: 'general',
        category: '공장/제조',
        location: '경기 양주시 남면 상수리 일반공업지역',
        title: '경기 양주시 남면 상수리 일반공업지역 공장 자산 매각',
        salePrice: '480억',
        deposit: '20억',
        monthlyRent: '2.8억',
        roi: '6.5%',
        pricePerPyung: '3,200만',
        imDocumentId: 'cda6733f-78b1-4a42-b7ae-3a9b1c1bc707',
        imTitle: '경기 양주시 남면 상수리 일반공업지역 공장 자산 매각 IM',
        img: '/assets/listings/yangju_factory.jpg',
        landArea: '16,528.9㎡ (5,000평)',
        totalFloorArea: '23,140.5㎡ (7,000평)',
        floors: '지상 3층 (공장동 2개동 및 복합사무동)',
        parking: '총 120대 (대형 화물 트레일러 15대)',
        riskWarning: '본 IM에 포함된 모든 정보는 투자 의사결정의 참고 자료로만 활용되어야 합니다.',
        executiveSummary: '수도권 제2순환고속도로 개통 수혜지 양주시 남면 상수리 일반공업지역 대규모 최신식 스마트 플랜트입니다.'
    },
    {
        id: 'exitwise-fki',
        type: 'general',
        category: '오피스빌딩',
        location: '서울 영등포구 여의대로 24 (여의도동)',
        title: '여의도 FKI타워 프라임 오피스 자산 매각',
        salePrice: '2,850억',
        deposit: '120억',
        monthlyRent: '12.5억',
        roi: '5.4%',
        pricePerPyung: '3,800만',
        imDocumentId: 'cda6733f-78b1-4a42-b7ae-3a9b1c1bc808',
        imTitle: '여의도 FKI타워 프라임 오피스 자산 매각 IM',
        img: '/assets/listings/yeouido_fki_tower.jpg',
        landArea: '3,305.8㎡ (1,000평)',
        totalFloorArea: '52,890.0㎡ (16,000평)',
        floors: '지하 7층 / 지상 50층',
        parking: '총 450대 (자주식 380대)',
        riskWarning: '본 IM에 포함된 모든 정보는 투자 의사결정의 참고 자료로만 활용되어야 합니다.',
        executiveSummary: '대한민국 금융 중심지 여의도(YBD) 랜드마크 프라임 빌딩 통매각 물건입니다.'
    },
    {
        id: 'exitwise-haeundae',
        type: 'general',
        category: '호텔',
        location: '부산 해운대구 우동',
        title: '해운대 그랜드조선 부산 관광호텔 자산 매각',
        salePrice: '1,850억',
        deposit: '30억',
        monthlyRent: '8.5억',
        roi: '5.8%',
        pricePerPyung: '1억 4,700만',
        imDocumentId: 'cda6733f-78b1-4a42-b7ae-3a9b1c1bc606',
        imTitle: '해운대 그랜드조선 부산 관광호텔 자산 매각 IM',
        rooms: '330실',
        landArea: '4,158.4㎡ (1,257.9평)',
        totalFloorArea: '36,837.2㎡ (11,143.2평)',
        floors: '지하 6층 / 지상 16층',
        parking: '총 240대 (자주식 180대)',
        riskWarning: '본 IM에 포함된 모든 정보는 투자 의사결정의 참고 자료로만 활용되어야 하며...',
        executiveSummary: '해운대 백사장 바로 앞에 위치한 5성급 럭셔리 관광호텔 자산 매각 IM입니다.'
    },
    {
        id: 'exitwise-yeouido-finance',
        type: 'general',
        category: '오피스빌딩',
        location: '서울 영등포구 여의도동',
        title: '여의도 금융타운 프라임 오피스 사옥 통매각',
        salePrice: '920억',
        deposit: '45억',
        monthlyRent: '4.1억',
        roi: '5.6%',
        pricePerPyung: '1억 8,000만',
        imDocumentId: 'efd9210a-3312-4211-9a11-54b12c8a2091',
        imTitle: '여의도 금융타운 프라임 오피스 통매각 IM',
        executiveSummary: '여의도 금융중심가 소재 랜드마크 프라임 빌딩 통매각 물건입니다.'
    },
    {
        id: 'exitwise-icheon-logistics',
        type: 'general',
        category: '물류센터',
        location: '경기 이천시 마장면 스마트 물류단지',
        title: '이천 스마트 풀필먼트 복합 물류센터 매각',
        salePrice: '750억',
        deposit: '35억',
        monthlyRent: '3.9억',
        roi: '6.2%',
        pricePerPyung: '2,600만',
        imDocumentId: 'logis-2026-ew-icheon-01',
        imTitle: '이천 스마트 복합 물류센터 자산 매각 IM',
        executiveSummary: '영동고속도로 덕평IC 인근 수도권 남부 핵심 물류 거점 복합 센터입니다.'
    }
];

const AdminListings = () => {
    const [listings, setListings] = useState([]);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'edit'
    const [editingItem, setEditingItem] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('all'); // 'all' | 'general' | 'npl' | 'auction' | 'exitwise'
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [showExitwiseModal, setShowExitwiseModal] = useState(false);
    const [exitwiseModalTab, setExitwiseModalTab] = useState('list'); // 'list' | 'manual'
    const [manualPayloadJson, setManualPayloadJson] = useState('');

    useEffect(() => {
        // Initialize and load data
        DataManager.init();
        setListings(DataManager.getListings());
    }, []);

    const handleEdit = (item) => {
        setEditingItem({
            ...item,
            type: item.type || 'auction',
            status: item.status || 'Active',
            tags: item.tags || []
        });
        setViewMode('edit');
    };

    const handleCreate = (type = 'general') => {
        setEditingItem({
            id: Date.now(),
            type: type,
            title: '',
            location: '',
            category: type === 'general' ? '호텔/숙박' : '빌딩/오피스',
            status: 'Active',
            tags: [],
            img: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop&q=60',
            // 일반매물 필드
            salePrice: '',
            deposit: '',
            monthlyRent: '',
            roi: '',
            pricePerPyung: '',
            // NPL 필드
            opb: '',
            claimMax: '',
            nplTargetPrice: '',
            collateralValue: '',
            expectedDividend: '',
            // 경매 필드
            appraisal: '',
            minPrice: '',
            rate: '',
            caseNumber: '',
            auctionDate: '',
            court: '',
            // ExitWise 연동 필드
            isExitwiseLinked: false
        });
        setViewMode('edit');
    };

    const handleDelete = (id) => {
        if (window.confirm('정말 이 매물을 삭제하시겠습니까?')) {
            const updated = DataManager.deleteListing(id);
            setListings(updated);
        }
    };

    const handleSave = (item) => {
        const updatedListings = DataManager.saveListing(item);
        setListings(updatedListings);
        setViewMode('list');
    };

    const handleImportExitwisePreset = (imPreset) => {
        DataManager.importFromExitwise(imPreset);
        setListings(DataManager.getListings());
        setShowExitwiseModal(false);
        alert(`[ExitWise 연동 성공]\n'${imPreset.title}' 매물이 가자에셋 리스팅에 성공적으로 등록되었습니다.`);
    };

    const handleSyncAllExitwise = () => {
        EXITWISE_AVAILABLE_DOCS.forEach(doc => {
            DataManager.importFromExitwise(doc);
        });
        const updated = DataManager.revalidateAllListingsIM(true);
        setListings(updated || DataManager.getListings());
        setShowExitwiseModal(false);
        alert(`[ExitWise 일괄 동기화 & 정본 IM 재생성 완료]\n전체 매물이 최신 ExitWise 정본 IM 규격(서문·지도·도표·감사보고서)으로 완벽하게 동기화 및 재생성되었습니다.`);
    };

    const handleImportManualJson = (e) => {
        e.preventDefault();
        try {
            const parsed = JSON.parse(manualPayloadJson);
            DataManager.importFromExitwise(parsed);
            setListings(DataManager.getListings());
            setShowExitwiseModal(false);
            setManualPayloadJson('');
            alert(`[ExitWise 수동 연동 성공]\n'${parsed.title || parsed.imTitle || '매물'}'이 성공적으로 등록되었습니다.`);
        } catch (err) {
            alert('유효한 JSON 형식이 아닙니다: ' + err.message);
        }
    };

    const filteredListings = listings.filter(item => {
        const matchesSearch = (item.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.location || '').toLowerCase().includes(searchTerm.toLowerCase());

        let matchesType = true;
        if (selectedType === 'exitwise') {
            matchesType = Boolean(item.isExitwiseLinked);
        } else if (selectedType !== 'all') {
            matchesType = item.type === selectedType;
        }

        const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
        return matchesSearch && matchesType && matchesCategory;
    });

    const getTypeBadge = (type, isExitwise) => {
        if (isExitwise) {
            return <span style={{ padding: '4px 8px', borderRadius: '4px', background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', color: 'white', fontSize: '0.75rem', fontWeight: 'bold' }}>ExitWise IM</span>;
        }
        switch (type) {
            case 'general':
                return <span style={{ padding: '4px 8px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.4)', fontSize: '0.75rem', fontWeight: 'bold' }}>일반매물</span>;
            case 'npl':
                return <span style={{ padding: '4px 8px', borderRadius: '4px', background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.4)', fontSize: '0.75rem', fontWeight: 'bold' }}>NPL</span>;
            case 'auction':
            default:
                return <span style={{ padding: '4px 8px', borderRadius: '4px', background: 'rgba(212, 175, 55, 0.2)', color: '#d4af37', border: '1px solid rgba(212, 175, 55, 0.4)', fontSize: '0.75rem', fontWeight: 'bold' }}>경매</span>;
        }
    };

    return (
        <div className="admin-listings" style={{ padding: '20px' }}>
            {viewMode === 'list' ? (
                <div className="list-view">
                    {/* Top Action Bar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
                        <div>
                            <h2 style={{ color: 'var(--admin-text-main)', margin: 0, fontSize: '1.6rem' }}>매물 통합 관리 (Listings Management)</h2>
                            <p style={{ color: 'var(--admin-text-sub)', margin: '5px 0 0', fontSize: '0.9rem' }}>경매, 일반매물(급매), NPL 및 ExitWise IM 연동 매물을 통합 관리합니다.</p>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <button
                                onClick={() => setShowExitwiseModal(true)}
                                style={{
                                    padding: '10px 18px',
                                    borderRadius: '8px',
                                    background: 'linear-gradient(135deg, #0ea5e9, #3b82f6)',
                                    color: 'white',
                                    border: 'none',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    boxShadow: '0 4px 14px rgba(14, 165, 233, 0.4)'
                                }}
                            >
                                <i className="fas fa-file-import"></i> ExitWise IM 가져오기
                            </button>
                            <button
                                onClick={handleSyncAllExitwise}
                                style={{
                                    padding: '10px 16px',
                                    borderRadius: '8px',
                                    background: 'linear-gradient(135deg, #10b981, #059669)',
                                    color: 'white',
                                    border: 'none',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)'
                                }}
                                title="ExitWise에서 생성된 최신 5대 핵심 매물(양주 공장, 여의도 FKI, 해운대 호텔 등)을 한 번에 동기화합니다"
                            >
                                <i className="fas fa-sync-alt"></i> ExitWise 동기화
                            </button>
                            <Link
                                to="/exitwise-bridge"
                                target="_blank"
                                style={{
                                    padding: '10px 18px',
                                    borderRadius: '8px',
                                    background: 'var(--admin-btn-secondary-bg)',
                                    color: 'var(--admin-btn-secondary-text)',
                                    border: '1px solid var(--admin-btn-secondary-border)',
                                    textDecoration: 'none',
                                    fontWeight: '600',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                <i className="fas fa-desktop"></i> 연동 시뮬레이터 열기
                            </Link>
                            <button className="btn-primary" onClick={() => handleCreate('general')} style={{ padding: '10px 20px' }}>
                                + 매물 직접 등록
                            </button>
                        </div>
                    </div>

                    {/* Type Tabs */}
                    <div className="admin-tabs-scroll">
                        {[
                            { key: 'all', label: '전체 매물', count: listings.length },
                            { key: 'general', label: '일반매물', count: listings.filter(i => i.type === 'general').length },
                            { key: 'npl', label: 'NPL(부실채권)', count: listings.filter(i => i.type === 'npl').length },
                            { key: 'auction', label: '경매 물건', count: listings.filter(i => i.type === 'auction' || !i.type).length },
                            { key: 'exitwise', label: '⚡ ExitWise 연동', count: listings.filter(i => i.isExitwiseLinked).length }
                        ].map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setSelectedType(tab.key)}
                                style={{
                                    padding: '8px 16px',
                                    background: selectedType === tab.key ? 'rgba(212, 175, 55, 0.15)' : 'transparent',
                                    border: 'none',
                                    borderBottom: selectedType === tab.key ? '2px solid var(--accent-gold)' : '2px solid transparent',
                                    color: selectedType === tab.key ? 'var(--accent-gold)' : 'var(--admin-text-sub)',
                                    fontWeight: selectedType === tab.key ? '700' : '400',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    borderRadius: '6px 6px 0 0',
                                    fontSize: '0.92rem',
                                    flexShrink: 0
                                }}
                            >
                                {tab.label}
                                <span style={{
                                    fontSize: '0.75rem',
                                    padding: '2px 6px',
                                    borderRadius: '10px',
                                    background: selectedType === tab.key ? 'var(--accent-gold)' : 'var(--admin-pill-inactive-bg)',
                                    color: selectedType === tab.key ? '#000' : 'var(--admin-pill-inactive-text)'
                                }}>
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Filter & Search Bar */}
                    <div className="admin-filter-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '15px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', width: '100%', maxWidth: '500px' }}>
                            <div className="search-box" style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
                                <i className="fas fa-search" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-muted)' }}></i>
                                <input
                                    type="text"
                                    placeholder="매물명 또는 지역 검색..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="admin-input"
                                    style={{
                                        padding: '10px 10px 10px 40px',
                                        width: '100%'
                                    }}
                                />
                            </div>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="admin-select"
                                style={{ minWidth: '130px' }}
                            >
                                <option value="All">전체 카테고리</option>
                                <option value="빌딩/오피스">빌딩/오피스</option>
                                <option value="호텔/숙박">호텔/숙박</option>
                                <option value="아파트/주택">아파트/주택</option>
                                <option value="상가">상가</option>
                                <option value="토지">토지</option>
                            </select>
                        </div>
                        <div style={{ color: 'var(--admin-text-muted)', fontSize: '0.9rem' }}>
                            총 <strong style={{ color: 'var(--accent-gold)' }}>{filteredListings.length}</strong>개 매물 표시 중
                        </div>
                    </div>

                    {/* Table View */}
                    <div className="admin-card admin-table-responsive">
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '850px' }}>
                            <thead style={{ background: 'var(--admin-table-header-bg)' }}>
                                <tr>
                                    <th style={{ padding: '16px', textAlign: 'left', color: 'var(--admin-text-sub)', fontWeight: '600' }}>구분</th>
                                    <th style={{ padding: '16px', textAlign: 'left', color: 'var(--admin-text-sub)', fontWeight: '600' }}>매물 정보</th>
                                    <th style={{ padding: '16px', textAlign: 'left', color: 'var(--admin-text-sub)', fontWeight: '600' }}>가격 및 주요 지표</th>
                                    <th style={{ padding: '16px', textAlign: 'left', color: 'var(--admin-text-sub)', fontWeight: '600' }}>용도</th>
                                    <th style={{ padding: '16px', textAlign: 'left', color: 'var(--admin-text-sub)', fontWeight: '600' }}>상태</th>
                                    <th style={{ padding: '16px', textAlign: 'right', color: 'var(--admin-text-sub)', fontWeight: '600' }}>관리</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredListings.map(item => (
                                    <tr key={item.id} style={{ borderBottom: '1px solid var(--admin-table-row-border)', transition: 'background 0.2s' }}>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                                                {getTypeBadge(item.type, item.isExitwiseLinked)}
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px', display: 'flex', gap: '15px', alignItems: 'center' }}>
                                            <img
                                                src={item.img}
                                                alt=""
                                                style={{ width: '70px', height: '50px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--admin-border)' }}
                                            />
                                            <div>
                                                <div style={{ fontWeight: '600', color: 'var(--admin-text-main)', fontSize: '0.98rem' }}>
                                                    <Link to={`/listings/${item.id}`} target="_blank" style={{ color: 'var(--admin-text-main)', textDecoration: 'none' }}>
                                                        {item.title} <i className="fas fa-external-link-alt" style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}></i>
                                                    </Link>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--admin-text-muted)', marginTop: '3px' }}>
                                                    <span><i className="fas fa-map-marker-alt" style={{ color: 'var(--accent-gold)', marginRight: '3px' }}></i>{item.location}</span>
                                                    {item.isExitwiseLinked && (
                                                        <Link
                                                            to={`/im-raw-viewer?id=${item.id}`}
                                                            target="_blank"
                                                            style={{
                                                                color: '#0ea5e9',
                                                                textDecoration: 'none',
                                                                fontWeight: '600',
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: '3px'
                                                            }}
                                                        >
                                                            <i className="fas fa-file-alt"></i> IM 전문 보기 ↗
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            {item.type === 'general' && (
                                                <div>
                                                    <div style={{ color: '#10b981', fontWeight: 'bold', fontSize: '1rem' }}>
                                                        매매 {item.salePrice || item.minPrice}
                                                    </div>
                                                    <div style={{ fontSize: '0.82rem', color: 'var(--admin-text-muted)' }}>
                                                        {item.roi && `수익률: ${item.roi}`} {item.monthlyRent && `| 월세: ${item.monthlyRent}`}
                                                    </div>
                                                </div>
                                            )}
                                            {item.type === 'npl' && (
                                                <div>
                                                    <div style={{ color: '#c084fc', fontWeight: 'bold', fontSize: '1rem' }}>
                                                        매각희망 {item.nplTargetPrice || item.minPrice}
                                                    </div>
                                                    <div style={{ fontSize: '0.82rem', color: 'var(--admin-text-muted)' }}>
                                                        채권최고액: {item.claimMax || item.appraisal} (OPB: {item.opb || '-'})
                                                    </div>
                                                </div>
                                            )}
                                            {(item.type === 'auction' || !item.type) && (
                                                <div>
                                                    <div style={{ color: 'var(--accent-gold)', fontWeight: 'bold', fontSize: '1rem' }}>
                                                        최저가 {item.minPrice}
                                                    </div>
                                                    <div style={{ fontSize: '0.82rem', color: 'var(--admin-text-muted)' }}>
                                                        감정가: {item.appraisal} ({item.rate || '70%'})
                                                    </div>
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <span style={{
                                                padding: '4px 10px',
                                                borderRadius: '20px',
                                                background: 'var(--admin-tag-bg)',
                                                fontSize: '0.85rem',
                                                color: 'var(--admin-tag-text)'
                                            }}>{item.category}</span>
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <span style={{
                                                color: item.status === 'Sold' ? '#ff6b6b' : item.status === 'Under Contract' ? '#f59e0b' : '#10b981',
                                                fontWeight: 'bold',
                                                fontSize: '0.88rem'
                                            }}>
                                                ● {item.status || 'Active'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px', textAlign: 'right' }}>
                                            <button
                                                onClick={() => handleEdit(item)}
                                                style={{ marginRight: '10px', background: 'var(--admin-btn-secondary-bg)', border: '1px solid var(--admin-btn-secondary-border)', color: '#0284c7', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}
                                                title="수정"
                                            >
                                                <i className="fas fa-edit"></i> 수정
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}
                                                title="삭제"
                                            >
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredListings.length === 0 && (
                            <div style={{ padding: '50px', textAlign: 'center', color: 'var(--admin-text-muted)' }}>
                                해당 조건에 일치하는 매물이 없습니다.
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <ListingEditor item={editingItem} onSave={handleSave} onCancel={() => setViewMode('list')} />
            )}

            {/* ExitWise Import Modal */}
            {showExitwiseModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'var(--admin-modal-overlay)',
                    backdropFilter: 'blur(6px)',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="admin-modal-content"
                        style={{
                            background: 'var(--admin-modal-bg)',
                            border: '1px solid var(--admin-border)',
                            borderRadius: '16px',
                            maxWidth: '820px',
                            width: '100%',
                            maxHeight: '90vh',
                            display: 'flex',
                            flexDirection: 'column',
                            padding: '24px',
                            boxShadow: 'var(--admin-modal-shadow)',
                            overflow: 'hidden'
                        }}
                    >
                        {/* Modal Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', color: 'white', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold' }}>ExitWise Cloud Sync</span>
                                <h3 style={{ margin: 0, color: 'var(--admin-text-main)', fontSize: '1.35rem', fontWeight: 800 }}>ExitWise IM 신규 매물 연동 및 동기화</h3>
                            </div>
                            <button onClick={() => setShowExitwiseModal(false)} style={{ background: 'none', border: 'none', color: 'var(--admin-text-muted)', fontSize: '1.4rem', cursor: 'pointer', lineHeight: 1 }}>×</button>
                        </div>

                        {/* Description & Action Bar */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    onClick={() => setExitwiseModalTab('list')}
                                    style={{
                                        padding: '6px 14px',
                                        borderRadius: '6px',
                                        border: 'none',
                                        fontSize: '0.86rem',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        background: exitwiseModalTab === 'list' ? 'rgba(14, 165, 233, 0.2)' : 'transparent',
                                        color: exitwiseModalTab === 'list' ? '#0ea5e9' : 'var(--admin-text-sub)'
                                    }}
                                >
                                    <i className="fas fa-list"></i> ExitWise 생성 매물 목록 ({EXITWISE_AVAILABLE_DOCS.length})
                                </button>
                                <button
                                    onClick={() => setExitwiseModalTab('manual')}
                                    style={{
                                        padding: '6px 14px',
                                        borderRadius: '6px',
                                        border: 'none',
                                        fontSize: '0.86rem',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        background: exitwiseModalTab === 'manual' ? 'rgba(14, 165, 233, 0.2)' : 'transparent',
                                        color: exitwiseModalTab === 'manual' ? '#0ea5e9' : 'var(--admin-text-sub)'
                                    }}
                                >
                                    <i className="fas fa-code"></i> JSON 직접 등록
                                </button>
                            </div>

                            <button
                                onClick={handleSyncAllExitwise}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    background: 'linear-gradient(135deg, #10b981, #059669)',
                                    color: 'white',
                                    border: 'none',
                                    fontSize: '0.85rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)'
                                }}
                            >
                                <i className="fas fa-sync-alt"></i> ExitWise 전체 일괄 동기화 (Sync All)
                            </button>
                        </div>

                        {/* Tab 1: Available Docs List */}
                        {exitwiseModalTab === 'list' && (
                            <div style={{
                                overflowY: 'auto',
                                maxHeight: '55vh',
                                paddingRight: '6px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '14px',
                                marginBottom: '20px'
                            }}>
                                {EXITWISE_AVAILABLE_DOCS.map(doc => {
                                    const isImported = listings.some(l => String(l.id) === String(doc.id) || l.exitwiseData?.imDocumentId === doc.imDocumentId);
                                    return (
                                        <div
                                            key={doc.id}
                                            style={{
                                                padding: '16px',
                                                borderRadius: '12px',
                                                background: 'var(--admin-card-bg)',
                                                border: isImported ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--admin-border)',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                gap: '16px'
                                            }}
                                        >
                                            {/* Thumbnail if available */}
                                            {doc.img && (
                                                <div style={{ width: '80px', height: '64px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, border: '1px solid var(--admin-border)' }}>
                                                    <img src={doc.img} alt={doc.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                </div>
                                            )}
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px', flexWrap: 'wrap' }}>
                                                    <span style={{
                                                        background: isImported ? 'rgba(16, 185, 129, 0.2)' : 'rgba(14, 165, 233, 0.2)',
                                                        color: isImported ? '#10b981' : '#0ea5e9',
                                                        fontSize: '0.72rem',
                                                        padding: '2px 8px',
                                                        borderRadius: '4px',
                                                        fontWeight: 'bold'
                                                    }}>
                                                        {isImported ? '✓ 가자에셋 등록됨' : 'ExitWise IM'}
                                                    </span>
                                                    <span style={{ background: 'rgba(255, 255, 255, 0.08)', color: 'var(--admin-text-sub)', fontSize: '0.72rem', padding: '2px 6px', borderRadius: '4px' }}>
                                                        {doc.category}
                                                    </span>
                                                    <strong style={{ color: 'var(--admin-text-main)', fontSize: '0.98rem' }}>
                                                        {doc.title}
                                                    </strong>
                                                </div>
                                                <div style={{ fontSize: '0.84rem', color: 'var(--admin-text-sub)', marginBottom: '3px' }}>
                                                    <span style={{ color: '#10b981', fontWeight: 700 }}>매각가: {doc.salePrice}</span>
                                                    <span style={{ margin: '0 8px', opacity: 0.5 }}>|</span>
                                                    <span>위치: {doc.location}</span>
                                                    {doc.roi && (
                                                        <>
                                                            <span style={{ margin: '0 8px', opacity: 0.5 }}>|</span>
                                                            <span>수익률: {doc.roi}</span>
                                                        </>
                                                    )}
                                                </div>
                                                <div style={{ fontSize: '0.74rem', color: 'var(--admin-text-muted)' }}>
                                                    문서 ID: {doc.imDocumentId}
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => handleImportExitwisePreset(doc)}
                                                style={{
                                                    padding: '9px 18px',
                                                    borderRadius: '8px',
                                                    background: isImported 
                                                        ? 'rgba(16, 185, 129, 0.15)' 
                                                        : 'linear-gradient(135deg, #0ea5e9, #3b82f6)',
                                                    color: isImported ? '#10b981' : 'white',
                                                    border: isImported ? '1px solid rgba(16, 185, 129, 0.4)' : 'none',
                                                    fontWeight: 700,
                                                    fontSize: '0.84rem',
                                                    cursor: 'pointer',
                                                    whiteSpace: 'nowrap',
                                                    flexShrink: 0,
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                {isImported ? '최신 갱신' : '+ 등록하기'}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Tab 2: Manual JSON Payload */}
                        {exitwiseModalTab === 'manual' && (
                            <form onSubmit={handleImportManualJson} style={{ marginBottom: '20px' }}>
                                <p style={{ color: 'var(--admin-text-sub)', fontSize: '0.88rem', marginBottom: '12px' }}>
                                    ExitWise 플랫폼에서 발급받은 JSON 데이터 규격을 아래에 붙여넣으면 가자에셋 리스팅에 즉시 등록됩니다.
                                </p>
                                <textarea
                                    value={manualPayloadJson}
                                    onChange={(e) => setManualPayloadJson(e.target.value)}
                                    placeholder='{"title": "여의도 프라임 오피스", "category": "오피스빌딩", "salePrice": "2,850억", "location": "서울 영등포구 여의대로 24", ...}'
                                    rows={8}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        background: 'var(--admin-input-bg)',
                                        border: '1px solid var(--admin-input-border)',
                                        color: 'var(--admin-input-text)',
                                        fontFamily: 'monospace',
                                        fontSize: '0.82rem',
                                        marginBottom: '16px',
                                        resize: 'vertical'
                                    }}
                                />
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                    <button
                                        type="button"
                                        onClick={() => setManualPayloadJson('')}
                                        className="btn-outline"
                                        style={{ padding: '8px 16px' }}
                                    >
                                        초기화
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn-primary"
                                        style={{ padding: '8px 20px', fontWeight: 700 }}
                                    >
                                        매물 등록 실행
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Modal Footer */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--admin-border)' }}>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <Link to="/exitwise-bridge" target="_blank" style={{ color: '#0ea5e9', fontSize: '0.85rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <i className="fas fa-desktop"></i> 연동 시뮬레이터 열기 ↗
                                </Link>
                                <Link to="/listings" target="_blank" style={{ color: 'var(--admin-text-sub)', fontSize: '0.85rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <i className="fas fa-external-link-alt"></i> 사용자 매물 목록 보기 ↗
                                </Link>
                            </div>
                            <button onClick={() => setShowExitwiseModal(false)} className="btn-outline" style={{ padding: '8px 20px' }}>
                                닫기
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

const ListingEditor = ({ item, onSave, onCancel }) => {
    const [formData, setFormData] = useState({ ...item });
    const [activeTab, setActiveTab] = useState('basic');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleTypeChange = (type) => {
        setFormData({
            ...formData,
            type,
            // 기본 카테고리 재조정
            category: type === 'general' && !formData.category ? '호텔/숙박' : formData.category
        });
    };

    const handleTagsChange = (e) => {
        const tags = e.target.value.split(',').map(tag => tag.trim());
        setFormData({ ...formData, tags });
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="editor-container"
            style={{ maxWidth: '1000px', margin: '0 auto' }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
                <div>
                    <h2 style={{ color: 'var(--admin-text-main)', fontSize: '1.6rem', margin: 0 }}>
                        {item.title ? `매물 수정: ${item.title}` : '신규 매물 등록'}
                    </h2>
                    <p style={{ color: 'var(--admin-text-sub)', margin: '5px 0 0', fontSize: '0.9rem' }}>
                        매물 거래 유형을 선택하면 입력 항목이 지능적으로 최적화됩니다.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={onCancel} className="btn-outline">취소</button>
                    <button onClick={() => onSave(formData)} className="btn-primary" style={{ padding: '10px 24px' }}>저장 및 즉시 반영</button>
                </div>
            </div>

            {/* Transaction Type Selector Bar */}
            <div style={{
                background: 'var(--admin-card-bg)',
                border: '1px solid var(--admin-border)',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '25px',
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                flexWrap: 'wrap'
            }}>
                <span style={{ color: 'var(--admin-text-sub)', fontWeight: '600', fontSize: '0.95rem' }}>거래 유형 선택 :</span>
                <div style={{ display: 'flex', gap: '10px' }}>
                    {[
                        { key: 'general', label: '일반매물 (매매/급매)', color: '#10b981' },
                        { key: 'npl', label: 'NPL (부실채권)', color: '#c084fc' },
                        { key: 'auction', label: '경매 물건', color: 'var(--accent-gold)' }
                    ].map(t => (
                        <button
                            key={t.key}
                            type="button"
                            onClick={() => handleTypeChange(t.key)}
                            style={{
                                padding: '10px 20px',
                                borderRadius: '8px',
                                border: formData.type === t.key ? `2px solid ${t.color}` : '1px solid var(--admin-border)',
                                background: formData.type === t.key ? 'var(--admin-pill-inactive-bg)' : 'transparent',
                                color: formData.type === t.key ? t.color : 'var(--admin-text-sub)',
                                fontWeight: formData.type === t.key ? '700' : '400',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
                {formData.isExitwiseLinked && (
                    <span style={{ marginLeft: 'auto', background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', color: 'white', padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                        ⚡ ExitWise IM 연동 매물
                    </span>
                )}
            </div>

            <div className="admin-card" style={{ padding: '30px', borderRadius: '12px' }}>
                {/* Navigation Tabs */}
                <div className="admin-tabs-scroll">
                    {[
                        { id: 'basic', label: '기본 정보' },
                        { id: 'price', label: formData.type === 'general' ? '매매가 및 수익률' : formData.type === 'npl' ? '채권/담보 조건' : '경매/입찰 정보' },
                        { id: 'exitwise', label: 'ExitWise IM 연동 정보' },
                        { id: 'media', label: '이미지 및 미디어' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                padding: '10px 20px',
                                background: 'none',
                                border: 'none',
                                borderBottom: activeTab === tab.id ? '2px solid var(--accent-gold)' : '2px solid transparent',
                                color: activeTab === tab.id ? 'var(--accent-gold)' : 'var(--admin-text-sub)',
                                cursor: 'pointer',
                                fontSize: '0.96rem',
                                fontWeight: '600',
                                flexShrink: 0
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab 1: Basic Info */}
                {activeTab === 'basic' && (
                    <div className="admin-form-grid-2col">
                        <InputField label="매물명 (Title)" name="title" value={formData.title} onChange={handleChange} placeholder="예: 해운대 그랜드조선 부산 호텔 자산 매각" />
                        <InputField label="소재지 (Location)" name="location" value={formData.location} onChange={handleChange} placeholder="예: 부산 해운대구 우동" />

                        <div className="form-group">
                            <label style={{ display: 'block', color: 'var(--admin-text-sub)', marginBottom: '8px', fontSize: '0.9rem' }}>부동산 용도 (Category)</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="admin-select"
                                style={{ width: '100%' }}
                            >
                                <option value="빌딩/오피스">빌딩/오피스</option>
                                <option value="호텔/숙박">호텔/숙박</option>
                                <option value="아파트/주택">아파트/주택</option>
                                <option value="상가">상가</option>
                                <option value="토지">토지</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label style={{ display: 'block', color: 'var(--admin-text-sub)', marginBottom: '8px', fontSize: '0.9rem' }}>게시 상태 (Status)</label>
                            <select
                                name="status"
                                value={formData.status || 'Active'}
                                onChange={handleChange}
                                className="admin-select"
                                style={{ width: '100%' }}
                            >
                                <option value="Active">Active (공개 진행 중)</option>
                                <option value="Under Contract">Under Contract (협상/계약 진행)</option>
                                <option value="Sold">Sold (매각 완료)</option>
                            </select>
                        </div>

                        <div style={{ gridColumn: '1 / -1' }}>
                            <InputField
                                label="태그 (쉼표로 구분)"
                                name="tags"
                                value={Array.isArray(formData.tags) ? formData.tags.join(', ') : ''}
                                onChange={handleTagsChange}
                                placeholder="예: ExitWise 연동, 특급호텔, 오션뷰, 수익률 5.8%↑"
                            />
                        </div>
                    </div>
                )}

                {/* Tab 2: Pricing & Financials (Dynamic by Type) */}
                {activeTab === 'price' && (
                    <div>
                        {formData.type === 'general' && (
                            <div className="admin-form-grid-2col">
                                <div style={{ gridColumn: '1 / -1', padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', color: '#10b981', fontSize: '0.9rem' }}>
                                    <i className="fas fa-info-circle"></i> 일반매물(매매/급매) 전용 항목입니다. 매매가 및 예상 임대수익률을 입력하세요.
                                </div>
                                <InputField label="매매 희망가" name="salePrice" value={formData.salePrice || ''} onChange={handleChange} placeholder="예: 1,850억" />
                                <InputField label="연 예상 수익률 (ROI)" name="roi" value={formData.roi || ''} onChange={handleChange} placeholder="예: 5.8%" />
                                <InputField label="임대 보증금" name="deposit" value={formData.deposit || ''} onChange={handleChange} placeholder="예: 30억" />
                                <InputField label="월 임대료" name="monthlyRent" value={formData.monthlyRent || ''} onChange={handleChange} placeholder="예: 8.5억" />
                                <InputField label="평당가" name="pricePerPyung" value={formData.pricePerPyung || ''} onChange={handleChange} placeholder="예: 1억 4,700만" />
                            </div>
                        )}

                        {formData.type === 'npl' && (
                            <div className="admin-form-grid-2col">
                                <div style={{ gridColumn: '1 / -1', padding: '12px', background: 'rgba(168, 85, 247, 0.1)', borderRadius: '8px', color: '#c084fc', fontSize: '0.9rem' }}>
                                    <i className="fas fa-info-circle"></i> NPL(부실채권) 전용 항목입니다. 채권최고액, OPB 및 목표 매각가를 입력하세요.
                                </div>
                                <InputField label="채권최고액" name="claimMax" value={formData.claimMax || ''} onChange={handleChange} placeholder="예: 156억" />
                                <InputField label="채권원금 (OPB)" name="opb" value={formData.opb || ''} onChange={handleChange} placeholder="예: 120억" />
                                <InputField label="NPL 매각 희망가" name="nplTargetPrice" value={formData.nplTargetPrice || ''} onChange={handleChange} placeholder="예: 95억" />
                                <InputField label="담보 감정평가액" name="collateralValue" value={formData.collateralValue || ''} onChange={handleChange} placeholder="예: 145억" />
                                <InputField label="예상 배당금 / 회수율" name="expectedDividend" value={formData.expectedDividend || ''} onChange={handleChange} placeholder="예: 118억 (수익률 24%↑)" />
                            </div>
                        )}

                        {(formData.type === 'auction' || !formData.type) && (
                            <div className="admin-form-grid-2col">
                                <div style={{ gridColumn: '1 / -1', padding: '12px', background: 'rgba(212, 175, 55, 0.1)', borderRadius: '8px', color: 'var(--accent-gold)', fontSize: '0.9rem' }}>
                                    <i className="fas fa-info-circle"></i> 법원 경매 물건 전용 항목입니다. 감정가 및 최저입찰가를 입력하세요.
                                </div>
                                <InputField label="감정가" name="appraisal" value={formData.appraisal || ''} onChange={handleChange} placeholder="예: 150억" />
                                <InputField label="최저입찰가" name="minPrice" value={formData.minPrice || ''} onChange={handleChange} placeholder="예: 105억" />
                                <InputField label="최저가율" name="rate" value={formData.rate || ''} onChange={handleChange} placeholder="예: 70%" />
                                <InputField label="법원 사건번호" name="caseNumber" value={formData.caseNumber || ''} onChange={handleChange} placeholder="예: 2025타경10482" />
                                <InputField label="입찰기일" name="auctionDate" value={formData.auctionDate || ''} onChange={handleChange} placeholder="예: 2026-10-22" />
                                <InputField label="관할법원" name="court" value={formData.court || ''} onChange={handleChange} placeholder="예: 서울중앙지방법원" />
                            </div>
                        )}
                    </div>
                )}

                {/* Tab 3: ExitWise IM Integration */}
                {activeTab === 'exitwise' && (
                    <div>
                        <div style={{ padding: '16px', background: 'rgba(14, 165, 233, 0.1)', border: '1px solid rgba(14, 165, 233, 0.3)', borderRadius: '8px', marginBottom: '25px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                <i className="fas fa-bolt" style={{ color: '#0ea5e9' }}></i>
                                <strong style={{ color: 'white' }}>ExitWise.io 연동 상태</strong>
                            </div>
                            <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
                                ExitWise의 생성된 IM 데이터와 연계되어 상세 페이지에 투자 위험 경고 및 결정론 검증 리포트가 함께 제공됩니다.
                            </p>
                        </div>

                        <div className="admin-form-grid-2col">
                            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <input
                                    type="checkbox"
                                    id="isExitwiseLinked"
                                    checked={formData.isExitwiseLinked || false}
                                    onChange={(e) => setFormData({ ...formData, isExitwiseLinked: e.target.checked })}
                                    style={{ width: '20px', height: '20px' }}
                                />
                                <label htmlFor="isExitwiseLinked" style={{ color: 'white', fontWeight: '600', cursor: 'pointer' }}>
                                    ExitWise IM 연동 매물로 지정 (IM 뱃지 및 심층 분석 리포트 노출)
                                </label>
                            </div>

                            <InputField
                                label="ExitWise IM 문서 ID"
                                name="imDocumentId"
                                value={formData.exitwiseData?.imDocumentId || formData.imDocumentId || ''}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    isExitwiseLinked: true,
                                    exitwiseData: { ...(formData.exitwiseData || {}), imDocumentId: e.target.value }
                                })}
                                placeholder="예: cda6733f-78b1-4a42-b7ae-3a9b1c1bc606"
                            />

                            <div style={{ gridColumn: '1 / -1' }}>
                                <InputField
                                    label="ExitWise IM 문서 제목"
                                    name="imTitle"
                                    value={formData.exitwiseData?.imTitle || formData.imTitle || ''}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        exitwiseData: { ...(formData.exitwiseData || {}), imTitle: e.target.value }
                                    })}
                                    placeholder="예: 해운대 그랜드조선 부산 관광호텔 자산 매각 IM"
                                />
                            </div>

                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ display: 'block', color: '#a8b2d1', marginBottom: '8px', fontSize: '0.9rem' }}>
                                    IM 투자 위험 경고 및 전문가 의견 요약
                                </label>
                                <textarea
                                    className="admin-input"
                                    rows="4"
                                    value={formData.exitwiseData?.riskWarning || ''}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        exitwiseData: { ...(formData.exitwiseData || {}), riskWarning: e.target.value }
                                    })}
                                    placeholder="본 IM에 포함된 모든 정보는 투자 의사결정의 참고 자료로만 활용되어야 하며..."
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab 4: Media */}
                {activeTab === 'media' && (
                    <div>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', color: '#a8b2d1', marginBottom: '8px', fontSize: '0.9rem' }}>이미지 파일 업로드</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                            setFormData({ ...formData, img: reader.result });
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                }}
                                style={{
                                    padding: '12px',
                                    background: 'var(--admin-input-bg)',
                                    border: '1px dashed var(--admin-input-border)',
                                    borderRadius: '8px',
                                    color: 'var(--admin-input-text)',
                                    width: '100%',
                                    cursor: 'pointer'
                                }}
                            />
                            <div style={{ margin: '15px 0', textAlign: 'center', color: 'var(--admin-text-muted)', fontSize: '0.85rem' }}>또는 이미지 URL 직접 입력</div>
                            <InputField label="이미지 URL" name="img" value={formData.img || ''} onChange={handleChange} placeholder="https://..." />
                        </div>

                        <div style={{ marginTop: '20px' }}>
                            <label style={{ display: 'block', color: 'var(--admin-text-sub)', marginBottom: '10px' }}>미리보기</label>
                            <div style={{
                                width: '100%',
                                height: '280px',
                                background: 'var(--admin-input-bg)',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden',
                                border: '1px solid var(--admin-border)'
                            }}>
                                <img
                                    src={formData.img}
                                    alt="Preview"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.parentNode.innerHTML = '<span style="color:var(--admin-text-muted)">이미지를 불러올 수 없습니다</span>';
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

const InputField = ({ label, name, value, onChange, placeholder }) => (
    <div className="form-group">
        <label style={{ display: 'block', color: 'var(--admin-text-sub)', marginBottom: '8px', fontSize: '0.9rem' }}>{label}</label>
        <input
            type="text"
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="admin-input"
            style={{ width: '100%' }}
        />
    </div>
);

export default AdminListings;
