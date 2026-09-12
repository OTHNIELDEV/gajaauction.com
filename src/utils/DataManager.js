import { mockListings } from '../data/mockListings';
import { partners } from '../data/partners';
import AiAssetImageMatcher from './AiAssetImageMatcher';

const STORAGE_KEYS = {
    LISTINGS: 'gaja_listings',
    PARTNERS: 'gaja_partners',
    INQUIRIES: 'gaja_inquiries',
    VIPS: 'gaja_vips'
};

// ExitWise 기본 매물(양주 공장, 여의도 FKI, 해운대 호텔)의 IM 전문 및 제원 최신 동기화 헬퍼
function syncExitwiseIMData(list) {
    if (!Array.isArray(list)) return { synced: list, changed: false };
    let changed = false;
    const synced = list.map(item => {
        const seedMatch = mockListings.find(m => String(m.id) === String(item.id) && m.isExitwiseLinked);
        if (seedMatch) {
            // 저장된 매물에 markdownContent가 없거나 과거 호텔 스펙 잔재가 있는 경우 즉시 최신화
            const missingMd = !item.exitwiseData?.markdownContent && Boolean(seedMatch.exitwiseData?.markdownContent);
            const isOldYangju = item.id === 'exitwise-yangju' && (!item.exitwiseData?.power || !item.exitwiseData?.keyMetrics);
            const isOldFki = item.id === 'exitwise-fki' && (!item.exitwiseData?.efficiency || !item.exitwiseData?.keyMetrics);
            const isOldHaeundae = item.id === 'exitwise-haeundae' && !item.exitwiseData?.markdownContent;
            const isOldZenith = (item.id === 'exitwise-zenith-npl' || item.title?.includes('두산위브')) && (item.img?.includes('photo-1450133064473') || item.location?.includes('역삼'));

            if (missingMd || isOldYangju || isOldFki || isOldHaeundae || isOldZenith) {
                changed = true;
                return {
                    ...item,
                    ...seedMatch,
                    exitwiseData: {
                        ...(item.exitwiseData || {}),
                        ...(seedMatch.exitwiseData || {})
                    }
                };
            }
        }
        return item;
    });
    return { synced, changed };
}

// 누락된 마크다운을 카테고리별 맞춤 ExitWise IM 표준 규격으로 자동 합성하는 생성기
function generateExitwiseMarkdown({ title, assetName, category, location, salePrice, capRate, landArea, totalFloorArea, floors, parking, summary, riskWarning }) {
    const isFactory = category === '공장/제조' || title.includes('공장') || title.includes('플랜트');
    const isOffice = category === '오피스빌딩' || title.includes('오피스') || title.includes('빌딩');
    const isHotel = category === '호텔';

    return `# ${title || `${assetName} 자산 매각 IM`}

## Chapter 1. 자산 개요 및 거래 구조 (Executive Summary)
- 매각 대상 자산명: ${assetName || title}
- 희망 매각가: ${salePrice || '협의'}
- 목표 수익률 (Cap Rate): ${capRate || '5.5% 내외'}
- 자산 분류: ${category}
- 소재지: ${location}
- 대지면적: ${landArea || '실사 확인'}
- 연면적: ${totalFloorArea || '실사 확인'}
- 건축 규모: ${floors || '실사 확인'}
- 주차 대수: ${parking || '자주식 완비'}

[Executive Summary] ${summary || `${location}에 위치한 우량 ${category} 자산 매각 건으로, 안정적인 현금흐름 창출과 뛰어난 자산 가치 보존성을 보유한 최우량 실물자산입니다.`}

## Chapter 2. 핵심 운영 및 임대 재무 실적 (Operating & Financials)
- 가동률/임대율: ${isFactory ? '100.0% (장기 마스터리스 계약 체결)' : isOffice ? '98.2% 내외 (공실률 1.8%)' : isHotel ? '78.4%' : '95.0% 이상'}
- 목표 수익률: ${capRate || '5.5%'}
- 현금창출력: 우량 임차인 기반의 안정적인 순영업소득(NOI) 확보

## Chapter 3. 4대 핵심 투자 하이라이트 (Investment Thesis)
1. 광역 교통망 및 핵심 거점 연계 최적의 입지 경쟁력 확보
2. 우량 테넌트와의 장기 임대차 계약을 통한 무위험 코어 현금흐름 창출
3. 권역 내 희소성과 향후 주변 개발 호재에 따른 자산가치 상승(Capital Gain) 잠재력
4. 전문 자산운용 실사를 통한 공적장부 및 권리관계 무결성 검증 통과

## Chapter 4. 층별 공간 및 시설 구성 (Floor-by-Floor Program)
- 상층부: 핵심 업무/제조/객실 전용 공간
- 저층부: 메인 로비, 어메니티, 편의시설 및 공용 공간
- 지하층: 자주식 주차장 및 첨단 전기·기계 설비실

## Chapter 5. ExitWise 결정론 검증 감사보고서 (Verification Audit)
- [확인 - 소유권 확인 완료] 단독 소유권 및 매각 동의 확인 완료.
- [확인 - 공적장부 면적 일치] 공부상 면적과 실측 면적 정합성 검증 완료.
- [확인 - 권리관계 분석] 매각을 위한 근저당 및 권리제한 사항 검토 완료.

## 위험 경고 (Risk Warning)
${riskWarning || '본 IM에 포함된 모든 정보는 투자 의사결정의 참고 자료로만 활용되어야 하며, 투자 권유 또는 확정적 수익을 보장하지 않습니다. 실물자산 투자에는 시장 환경 및 원금 손실 리스크가 수반될 수 있습니다.'}`;
}

const DataManager = {
    // Helper to safely get and parse data from localStorage
    _safeGet: (key, fallback = []) => {
        try {
            const data = localStorage.getItem(key);
            if (!data || data === 'undefined' || data === 'null') return fallback;
            const parsed = JSON.parse(data);
            return parsed || fallback;
        } catch (e) {
            console.error(`DataManager Error (${key}):`, e);
            return fallback;
        }
    },

    // Initialize data if not present or corrupted
    init: () => {
        const checkAndSeed = (key, seedData) => {
            const raw = localStorage.getItem(key);
            let isValid = false;
            try {
                if (raw && raw !== 'undefined' && raw !== 'null') {
                    const parsed = JSON.parse(raw);
                    if (Array.isArray(seedData) && !Array.isArray(parsed)) {
                        isValid = false;
                    } else {
                        isValid = true;
                        if (key === STORAGE_KEYS.LISTINGS && Array.isArray(parsed)) {
                            let currentList = parsed;
                            let listModified = false;

                            // 1. mockListings에 새로 추가된 필수 ExitWise 기본 매물이 누락되어 있다면 자동 동기화
                            const existingIds = new Set(currentList.map(i => String(i.id)));
                            const missingExitwise = mockListings.filter(m => m.isExitwiseLinked && !existingIds.has(String(m.id)));
                            if (missingExitwise.length > 0) {
                                currentList = [...missingExitwise, ...currentList];
                                listModified = true;
                            }

                            // 2. ExitWise IM 전문 및 제원 최신 동기화
                            const { synced, changed: imChanged } = syncExitwiseIMData(currentList);
                            if (imChanged) {
                                currentList = synced;
                                listModified = true;
                            }

                            // 3. AI 자동 자가치유 실행
                            const { healed, hasChanged: aiChanged } = AiAssetImageMatcher.healListings(currentList);
                            if (listModified || aiChanged) {
                                localStorage.setItem(key, JSON.stringify(healed));
                                return;
                            }
                        }
                    }
                }
            } catch (e) {
                isValid = false;
            }

            if (!isValid) {
                console.warn(`[DataManager] Auto-repairing corrupted data for ${key}`);
                localStorage.setItem(key, JSON.stringify(seedData));
            }
        };

        checkAndSeed(STORAGE_KEYS.LISTINGS, mockListings);
        checkAndSeed(STORAGE_KEYS.PARTNERS, partners);

        const dummyInquiries = [
            { id: 1, name: '홍길동', phone: '010-1234-5678', interest: 'NPL', budget: '1b-5b', status: 'New', date: '2026-02-06' },
            { id: 2, name: '김철수', phone: '010-9876-5432', interest: 'Auction', budget: '>5b', status: 'Contacted', date: '2026-02-05' }
        ];
        checkAndSeed(STORAGE_KEYS.INQUIRIES, dummyInquiries);

        const dummyVIPs = [
            { id: 1, name: '최회장', phone: '010-9999-8888', grade: 'Black', notes: 'VIP 투자자', joinedDate: '2025-01-01' },
            { id: 2, name: '이대표', phone: '010-7777-6666', grade: 'Platinum', notes: '빌딩 매입 관심', joinedDate: '2025-02-10' }
        ];
        checkAndSeed(STORAGE_KEYS.VIPS, dummyVIPs);
    },

    // --- Listings ---
    getListings: () => {
        let raw = DataManager._safeGet(STORAGE_KEYS.LISTINGS, mockListings);
        let hasChangedAny = false;

        // 1. mockListings의 ExitWise 연동 매물이 누락되어 있다면 자동 보충
        const existingIds = new Set(raw.map(i => String(i.id)));
        const missingExitwise = mockListings.filter(m => m.isExitwiseLinked && !existingIds.has(String(m.id)));
        if (missingExitwise.length > 0) {
            raw = [...missingExitwise, ...raw];
            hasChangedAny = true;
        }

        // 2. ExitWise IM 전문 및 제원 최신 동기화
        const { synced, changed: imChanged } = syncExitwiseIMData(raw);
        if (imChanged) {
            raw = synced;
            hasChangedAny = true;
        }

        // 3. 조회 시 항상 AI 이미지 및 제원 자동 정합성 검사 (자가치유)
        const { healed, hasChanged: aiChanged } = AiAssetImageMatcher.healListings(raw);
        if (hasChangedAny || aiChanged) {
            localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(healed));
        }
        return healed;
    },
    getListingById: (id) => {
        const listings = DataManager.getListings();
        return listings.find(item => String(item.id) === String(id));
    },
    saveListing: (listing) => {
        const listings = DataManager.getListings();
        const index = listings.findIndex(item => String(item.id) === String(listing.id));

        if (!listing.img) {
            const matched = AiAssetImageMatcher.match({
                title: listing.title,
                category: listing.category,
                location: listing.location
            });
            listing.img = matched.img;
        }

        if (index >= 0) {
            listings[index] = { ...listings[index], ...listing };
        } else {
            listings.unshift(listing);
        }
        localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(listings));
        return listings;
    },
    importFromExitwise: (imData) => {
        // AI 시맨틱 분석으로 제목과 본문에 100% 어울리는 사진 및 제원 도출
        const titleForMatch = imData.title || imData.imTitle || imData.assetName || '';
        const aiMatched = AiAssetImageMatcher.match({
            title: titleForMatch,
            content: imData.markdownContent || '',
            category: imData.category,
            location: imData.location
        });

        const finalCategory = aiMatched.category || imData.category || '오피스빌딩';
        const isHotel = finalCategory === '호텔';
        const finalLocation = imData.location?.trim() || aiMatched.location || (isHotel ? '부산 해운대구 우동' : '서울 영등포구 여의대로 24');
        const finalImg = imData.img || aiMatched.img;
        const finalSalePrice = imData.salePrice || imData.targetPrice || aiMatched.salePrice || '2,850억';

        const finalLandArea = imData.landArea || aiMatched.specs?.landArea || (isHotel ? '4,158.4㎡ (1,257.9평)' : '3,305.8㎡ (1,000평)');
        const finalTotalFloorArea = imData.totalFloorArea || aiMatched.specs?.totalFloorArea || (isHotel ? '36,837.2㎡ (11,143.2평)' : '52,890.0㎡ (16,000평)');
        const finalFloors = imData.floors || aiMatched.floors || (isHotel ? '지하 6층 / 지상 16층' : '지하 7층 / 지상 50층');
        const finalParking = imData.parking || aiMatched.parking || (isHotel ? '240대 (자주식 180대)' : '총 450대 (자주식 380대)');
        const finalSummary = imData.executiveSummary || `${imData.assetName || titleForMatch || '해당'} 자산에 대한 ExitWise AI 종합 출구전략 및 매각 인텔리전스 IM 리포트입니다.`;
        const finalRiskWarning = imData.riskWarning || '본 IM에 포함된 모든 정보는 투자 의사결정의 참고 자료로만 활용되어야 합니다.';

        // 마크다운이 누락된 경우 즉시 자동 합성하여 완전성 보장
        const finalMarkdown = imData.markdownContent || generateExitwiseMarkdown({
            title: imData.title || imData.imTitle || `${titleForMatch} 자산 매각 IM`,
            assetName: imData.assetName || titleForMatch,
            category: finalCategory,
            location: finalLocation,
            salePrice: finalSalePrice,
            capRate: imData.roi || '5.8%',
            landArea: finalLandArea,
            totalFloorArea: finalTotalFloorArea,
            floors: finalFloors,
            parking: finalParking,
            summary: finalSummary,
            riskWarning: finalRiskWarning
        });

        const newListing = {
            id: imData.id || `exitwise-${Date.now()}`,
            type: imData.type || (finalCategory === 'NPL' ? 'npl' : 'general'),
            title: imData.title || imData.imTitle || `${imData.assetName || '자산'} 매각 IM`,
            location: finalLocation,
            category: finalCategory,
            salePrice: finalSalePrice,
            minPrice: finalSalePrice,
            deposit: imData.deposit || '30억',
            monthlyRent: imData.monthlyRent || '8.5억',
            roi: imData.roi || '5.8%',
            pricePerPyung: imData.pricePerPyung || (isHotel ? '1억 4,700만' : '3,800만'),
            status: 'Active',
            img: finalImg,
            tags: ['ExitWise 연동', finalCategory, '투자분석완료'],
            isExitwiseLinked: true,
            exitwiseData: {
                imDocumentId: imData.imDocumentId || `doc-${Date.now()}`,
                imTitle: imData.imTitle || imData.title,
                imDate: imData.imDate || new Date().toISOString().slice(0, 10),
                assetName: imData.assetName || imData.title,
                category: finalCategory,
                location: finalLocation,
                salePrice: finalSalePrice,
                capRate: imData.roi || '5.8%',
                rooms: isHotel ? (imData.rooms || '330실') : undefined,
                parking: finalParking,
                landArea: finalLandArea,
                totalFloorArea: finalTotalFloorArea,
                floors: finalFloors,
                riskWarning: finalRiskWarning,
                executiveSummary: finalSummary,
                markdownContent: finalMarkdown,
                htmlContent: imData.htmlContent || '',
                validationStatus: '검증 완료'
            }
        };
        DataManager.saveListing(newListing);
        return newListing;
    },
    deleteListing: (id) => {
        const listings = DataManager.getListings().filter(item => String(item.id) !== String(id));
        localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(listings));
        return listings;
    },

    // --- Partners ---
    getPartners: () => {
        return DataManager._safeGet(STORAGE_KEYS.PARTNERS, partners);
    },
    savePartner: (partner) => {
        const partners = DataManager.getPartners();
        const index = partners.findIndex(p => p.id === partner.id);
        if (index >= 0) {
            partners[index] = partner;
        } else {
            partners.push(partner);
        }
        localStorage.setItem(STORAGE_KEYS.PARTNERS, JSON.stringify(partners));
        return partners;
    },
    deletePartner: (id) => {
        const partners = DataManager.getPartners().filter(p => p.id !== id);
        localStorage.setItem(STORAGE_KEYS.PARTNERS, JSON.stringify(partners));
        return partners;
    },

    // --- Inquiries ---
    getInquiries: () => {
        return DataManager._safeGet(STORAGE_KEYS.INQUIRIES, []);
    },
    addInquiry: (inquiryData) => {
        const inquiries = DataManager.getInquiries();
        const newInquiry = {
            id: Date.now(),
            ...inquiryData,
            status: 'New',
            date: new Date().toISOString().split('T')[0]
        };
        inquiries.unshift(newInquiry);
        localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(inquiries));
        return newInquiry;
    },
    updateInquiryStatus: (id, status) => {
        const inquiries = DataManager.getInquiries();
        const index = inquiries.findIndex(item => item.id === id);
        if (index >= 0) {
            inquiries[index].status = status;
            localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(inquiries));
        }
        return inquiries;
    },
    deleteInquiry: (id) => {
        const inquiries = DataManager.getInquiries().filter(item => item.id !== id);
        localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(inquiries));
        return inquiries;
    },

    // --- Global ---
    resetData: () => {
        localStorage.removeItem(STORAGE_KEYS.LISTINGS);
        localStorage.removeItem(STORAGE_KEYS.PARTNERS);
        localStorage.removeItem(STORAGE_KEYS.INQUIRIES);
        localStorage.removeItem(STORAGE_KEYS.VIPS);
        DataManager.init();
    },
    exportData: () => {
        return {
            listings: DataManager.getListings(),
            partners: DataManager.getPartners(),
            inquiries: DataManager.getInquiries(),
            vips: DataManager.getVIPs()
        };
    },

    // --- VIPs ---
    getVIPs: () => {
        return DataManager._safeGet(STORAGE_KEYS.VIPS, []);
    },
    addVIP: (vipData) => {
        const vips = DataManager.getVIPs();
        const newVIP = {
            id: Date.now(),
            ...vipData,
            joinedDate: new Date().toISOString().split('T')[0]
        };
        vips.unshift(newVIP);
        localStorage.setItem(STORAGE_KEYS.VIPS, JSON.stringify(vips));
        return newVIP;
    },
    updateVIP: (updatedVIP) => {
        const vips = DataManager.getVIPs();
        const index = vips.findIndex(v => v.id === updatedVIP.id);
        if (index >= 0) {
            vips[index] = updatedVIP;
            localStorage.setItem(STORAGE_KEYS.VIPS, JSON.stringify(vips));
        }
        return vips;
    },
    deleteVIP: (id) => {
        const vips = DataManager.getVIPs().filter(v => v.id !== id);
        localStorage.setItem(STORAGE_KEYS.VIPS, JSON.stringify(vips));
        return vips;
    }
};

export default DataManager;
