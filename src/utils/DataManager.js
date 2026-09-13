import { mockListings } from '../data/mockListings';
import { partners } from '../data/partners';
import AiAssetImageMatcher from './AiAssetImageMatcher';

const STORAGE_KEYS = {
    LISTINGS: 'gaja_listings',
    PARTNERS: 'gaja_partners',
    INQUIRIES: 'gaja_inquiries',
    VIPS: 'gaja_vips'
};

// ExitWise 전 매물의 IM 전문 및 제원 최신 동기화 헬퍼 (서문, 지도, 도표, 가격 자가치유)
function syncExitwiseIMData(list) {
    if (!Array.isArray(list)) return { synced: list, changed: false };
    let changed = false;
    const synced = list.map(item => {
        const seedMatch = mockListings.find(m => String(m.id) === String(item.id));
        if (seedMatch) {
            // 1. 서문 누락 검사
            const missingCoverLetter = seedMatch.exitwiseData?.markdownContent?.includes('<<<COVER_LETTER_START>>>') && 
                                      !item.exitwiseData?.markdownContent?.includes('<<<COVER_LETTER_START>>>');
            // 2. 지도 또는 금융 도표 블록 누락 검사
            const missingMap = seedMatch.exitwiseData?.markdownContent?.includes('```kakao-map') && 
                              !item.exitwiseData?.markdownContent?.includes('```kakao-map');
            const missingCharts = seedMatch.exitwiseData?.markdownContent?.includes('```recharts') && 
                                 !item.exitwiseData?.markdownContent?.includes('```recharts');
            // 3. 구형 데이터 또는 마크다운 부재 검사
            const missingMd = !item.exitwiseData?.markdownContent && Boolean(seedMatch.exitwiseData?.markdownContent);
            const isOldZenith = (item.id === 'exitwise-zenith-npl' || item.title?.includes('두산위브')) && 
                                (item.img?.includes('photo-1450133064473') || item.location?.includes('역삼') || item.salePrice === '1,850억');
            // 4. 가격 또는 핵심 메트릭 불일치 검사 (카드 가격 vs 시드 가격 자가치유)
            const priceMismatch = (seedMatch.salePrice && item.salePrice !== seedMatch.salePrice) ||
                                  (seedMatch.minPrice && item.minPrice !== seedMatch.minPrice) ||
                                  (seedMatch.nplTargetPrice && item.nplTargetPrice !== seedMatch.nplTargetPrice) ||
                                  (seedMatch.claimMax && item.claimMax !== seedMatch.claimMax) ||
                                  (seedMatch.collateralValue && item.collateralValue !== seedMatch.collateralValue);
            // 5. 마크다운 내용 최신 버전 일치 검사
            const markdownVersionMismatch = seedMatch.exitwiseData?.markdownContent && 
                                            item.exitwiseData?.markdownContent !== seedMatch.exitwiseData?.markdownContent;

            if (missingCoverLetter || missingMap || missingCharts || missingMd || isOldZenith || !item.isExitwiseLinked || priceMismatch || markdownVersionMismatch) {
                changed = true;
                return {
                    ...item,
                    ...seedMatch,
                    isExitwiseLinked: true,
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

// 누락된 마크다운을 카테고리별 맞춤 ExitWise IM 표준 규격으로 자동 합성하는 생성기 (서문, 5개 챕터, 차트, 민감도, 지도 완비)
function generateExitwiseMarkdown({ title, assetName, category, location, salePrice, capRate, landArea, totalFloorArea, floors, parking, summary, riskWarning, docNumber }) {
    const isFactory = category === '공장/제조' || (title && (title.includes('공장') || title.includes('플랜트')));
    const isOffice = category === '오피스빌딩' || (title && (title.includes('오피스') || title.includes('빌딩')));
    const isHotel = category === '호텔';
    const isNpl = (category && category.includes('NPL')) || (title && title.includes('NPL'));

    const parsedDocNo = docNumber || `IM-2026-EW-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // 숫자 가격 파싱 (예: "620억" -> 62000000000)
    let numPrice = 50000000000;
    if (salePrice && typeof salePrice === 'string') {
        const match = salePrice.replace(/,/g, '').match(/(\d+(\.\d+)?)/);
        if (match) {
            numPrice = parseFloat(match[1]) * 100000000;
        }
    }
    const numCap = parseFloat(capRate) || 5.5;
    const annualNoi = Math.round(numPrice * (numCap / 100));
    const noiEok = Math.round((annualNoi / 100000000) * 10) / 10;
    const revEok = Math.round(noiEok * 1.15 * 10) / 10;

    const coverLetterBlock = `<<<COVER_LETTER_START>>>
문서번호: ${parsedDocNo}
기밀유지등급: 🔒 STRICTLY CONFIDENTIAL · 기관투자자 및 적격투자자 전용
수신: 대표이사 및 투자심의위원회 귀하
발신: (주)가자에셋파트너스 투자자문본부 & ExitWise AI Intelligence

귀사의 무궁한 발전과 번영을 진심으로 기원합니다.

본 투자설명서(Information Memorandum)는 ${assetName || title || '매각 대상 자산'}의 성공적인 매각 및 투자 유치를 위해 ExitWise AI 기업가치 평가 엔진과 가자에셋 부동산 자산관리 전문 인력의 정밀 실사를 거쳐 작성된 공식 투자 자문 자료입니다.

본 자산은 탁월한 입지 경쟁력과 견고한 현금흐름, 미래 가치 상승 잠재력을 동시에 갖춘 최우량 코어 포트폴리오로서, 귀사의 투자 전략에 최적의 시너지를 제공할 것으로 확신합니다.

상세한 재무 제원, 법적 권리관계 분석, 그리고 출구 전략 시뮬레이션 결과를 본 보고서에 충실히 수록하였사오니 심도 있는 검토를 요청드립니다.
<<<COVER_LETTER_END>>>

`;

    return `${coverLetterBlock}# ${title || `${assetName} 자산 매각 IM`}

## Chapter 1. 자산 개요 및 거래 구조 (Executive Summary)
- 매각 대상 자산명: ${assetName || title}
- 희망 매각가: ${salePrice || '협의'}
- 목표 수익률 (Cap Rate): ${capRate || '5.5% 내외'}
- 자산 분류: ${category || '수익형 부동산'}
- 소재지: ${location}
- 대지면적: ${landArea || '실사 확인'}
- 연면적: ${totalFloorArea || '실사 확인'}
- 건축 규모: ${floors || '실사 확인'}
- 주차 대수: ${parking || '자주식 완비'}

[Executive Summary] ${summary || `${location}에 위치한 우량 ${category || '실물자산'} 매각 건으로, 전문 권리분석 및 ExitWise 결정론 검증을 완료하여 안정적인 현금흐름 창출과 높은 자산가치 보존성을 보유한 핵심 투자 자산입니다.`}

## Chapter 2. 핵심 운영 및 임대 재무 실적 (Operating & Financials)
- 가동률/임대율: ${isFactory ? '100.0% (장기 마스터리스 계약 체결)' : isOffice ? '98.2% 내외 (공실률 1.8%)' : isHotel ? '78.4%' : '95.0% 이상'}
- 목표 수익률: ${capRate || '5.5%'}
- 연간 순영업소득 (NOI): 약 ${noiEok}억원

\`\`\`recharts
{"type":"bar","title":"연도별 총 매출/수입 및 순영업소득(NOI) 추이 (단위: 억원)","data":[{"name":"2023년","총수입":${Math.round(revEok * 0.9 * 10) / 10},"NOI":${Math.round(noiEok * 0.9 * 10) / 10}},{"name":"2024년","총수입":${Math.round(revEok * 0.95 * 10) / 10},"NOI":${Math.round(noiEok * 0.95 * 10) / 10}},{"name":"2025년","총수입":${revEok},"NOI":${noiEok}},{"name":"2026년(추정)","총수입":${Math.round(revEok * 1.06 * 10) / 10},"NOI":${Math.round(noiEok * 1.05 * 10) / 10}}],"bars":[{"key":"총수입","name":"총 매출/수입","color":"#0ea5e9"},{"key":"NOI","name":"순영업소득 (NOI)","color":"#10b981"}]}
\`\`\`

\`\`\`sensitivity
{"title":"${title || assetName} 매입가 및 Cap Rate 민감도 시뮬레이터","basePrice":${numPrice},"annualNoi":${annualNoi},"priceRangePct":15,"exitCapPct":${numCap},"noiGrowthPct":2.0,"holdYears":5,"caption":"기준: 매각가 ${salePrice || '협의'} · 목표 수익률 ${capRate || '5.5%'}"}
\`\`\`

## Chapter 3. 4대 핵심 투자 하이라이트 (Investment Thesis)
1. 광역 교통망 및 핵심 거점 연계 최적의 입지 경쟁력 확보
2. 우량 테넌트와의 장기 임대차 계약을 통한 무위험 코어 현금흐름 창출
3. 권역 내 희소성과 향후 주변 개발 호재에 따른 자산가치 상승(Capital Gain) 잠재력
4. 전문 자산운용 실사를 통한 공적장부 및 권리관계 무결성 검증 통과

## Chapter 4. 층별 공간 및 입지 분석 (Location & Facility)
\`\`\`kakao-map
{"address":"${location}","caption":"${title || assetName} 핵심 입지","zoom":4}
\`\`\`

- 상층부: 핵심 업무/제조/주거 전용 공간
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
                                if (typeof window !== 'undefined') {
                                    window.dispatchEvent(new CustomEvent('gaja_listings_updated', { detail: { listings: healed } }));
                                }
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
                if (typeof window !== 'undefined' && key === STORAGE_KEYS.LISTINGS) {
                    window.dispatchEvent(new CustomEvent('gaja_listings_updated', { detail: { listings: seedData } }));
                }
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
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('gaja_listings_updated', { detail: { listings: healed } }));
            }
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
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('gaja_listings_updated', { detail: { listings } }));
        }
        return listings;
    },
    updateListingFromExitwise: (docId, freshData) => {
        if (!docId || !freshData) return null;
        const listings = DataManager.getListings();
        const index = listings.findIndex(item => 
            String(item.id) === String(docId) || 
            String(item.exitwiseData?.imDocumentId) === String(docId)
        );

        if (index >= 0) {
            const current = listings[index];
            const updatedExitwiseData = {
                ...(current.exitwiseData || {}),
                imDocumentId: docId,
                markdownContent: freshData.markdownContent || current.exitwiseData?.markdownContent,
                htmlContent: freshData.htmlContent || current.exitwiseData?.htmlContent,
                mediaAssets: freshData.mediaAssets || current.exitwiseData?.mediaAssets,
                imTitle: freshData.title || freshData.imTitle || current.exitwiseData?.imTitle,
                lastSyncedAt: new Date().toISOString()
            };

            const updatedListing = {
                ...current,
                title: freshData.title || current.title,
                location: freshData.location || current.location,
                salePrice: freshData.salePrice || current.salePrice,
                exitwiseData: updatedExitwiseData
            };

            listings[index] = updatedListing;
            localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(listings));
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('gaja_listings_updated', { detail: { listings } }));
            }
            console.log(`[DataManager] Successfully live-synced listing ${current.id} (${docId})`);
            return updatedListing;
        }
        return null;
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
        const finalTitle = imData.title || imData.imTitle || `${aiMatched.cleanTitle} 자산 매각`;
        const finalSalePrice = imData.salePrice || (isHotel ? '1,850억' : '2,850억');
        const finalLandArea = imData.landArea || (isHotel ? '4,158.4㎡ (1,257.9평)' : '3,305.8㎡ (1,000평)');
        const finalTotalFloorArea = imData.totalFloorArea || (isHotel ? '36,837.2㎡ (11,143.2평)' : '52,890.0㎡ (16,000평)');
        const finalFloors = imData.floors || (isHotel ? '지하 6층 / 지상 16층' : '지하 7층 / 지상 50층');
        const finalParking = imData.parking || (isHotel ? '240대 (자주식 180대)' : '450대 (자주식 380대)');
        const finalSummary = imData.summary || imData.executiveSummary || `${finalTitle}은(는) ExitWise AI를 통해 가치평가 및 출구전략 수립이 완료된 프리미엄 핵심 자산입니다.`;
        const finalRiskWarning = imData.riskWarning || '본 IM 자료는 투자 의사결정 참고용이며 최종 거래 조건은 법률 및 세무 실사에 따라 변동될 수 있습니다.';

        let finalMarkdown = imData.markdownContent;
        if (!finalMarkdown) {
            finalMarkdown = generateExitwiseMarkdown({
                title: finalTitle,
                assetName: imData.assetName || finalTitle,
                category: finalCategory,
                location: finalLocation,
                salePrice: finalSalePrice,
                capRate: imData.roi || (isHotel ? '5.8%' : '5.4%'),
                landArea: finalLandArea,
                totalFloorArea: finalTotalFloorArea,
                floors: finalFloors,
                parking: finalParking,
                summary: finalSummary,
                riskWarning: finalRiskWarning,
                docNumber: imData.docNumber
            });
        }

        const newListing = {
            id: `exitwise-${Date.now()}`,
            type: 'general',
            img: aiMatched.img,
            location: finalLocation,
            title: finalTitle,
            category: finalCategory,
            salePrice: finalSalePrice,
            roi: imData.roi || (isHotel ? '5.8%' : '5.4%'),
            status: 'Active',
            tags: ['ExitWise 연동', finalCategory, 'AI 분석'],
            isExitwiseLinked: true,
            exitwiseData: {
                imDocumentId: imData.id || `doc-${Date.now()}`,
                imDocNumber: imData.docNumber || `IM-2026-EW-${Date.now().toString().slice(-4)}`,
                imTitle: finalTitle,
                imDate: new Date().toISOString().split('T')[0],
                assetName: imData.assetName || finalTitle,
                assetClass: finalCategory,
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
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('gaja_listings_updated', { detail: { listings } }));
        }
        return listings;
    },

    // 단일 매물 ExitWise 정본 IM 최신 재생성 & 동기화
    revalidateListingIM: (id, force = true) => {
        if (!id) return null;
        const listings = DataManager.getListings();
        const index = listings.findIndex(item => String(item.id) === String(id));
        if (index < 0) return null;

        let target = listings[index];
        const seedMatch = mockListings.find(m => String(m.id) === String(id));

        if (seedMatch) {
            target = {
                ...target,
                ...seedMatch,
                isExitwiseLinked: true,
                exitwiseData: {
                    ...(target.exitwiseData || {}),
                    ...(seedMatch.exitwiseData || {})
                }
            };
        } else {
            const freshMd = generateExitwiseMarkdown({
                title: target.title,
                assetName: target.exitwiseData?.assetName || target.title,
                category: target.category,
                location: target.location,
                salePrice: target.salePrice,
                capRate: target.capRate || target.roi,
                landArea: target.landArea,
                totalFloorArea: target.totalFloorArea || target.area,
                floors: target.floors,
                parking: target.parking,
                summary: target.summary,
                docNumber: target.exitwiseData?.imDocNumber
            });
            target = {
                ...target,
                isExitwiseLinked: true,
                exitwiseData: {
                    ...(target.exitwiseData || {}),
                    markdownContent: freshMd,
                    imTitle: target.exitwiseData?.imTitle || `${target.title} ExitWise 투자설명서`,
                    imDate: target.exitwiseData?.imDate || new Date().toISOString().split('T')[0]
                }
            };
        }

        const { healed } = AiAssetImageMatcher.healListings([target]);
        listings[index] = healed[0];
        localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(listings));

        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('exitwise_im_revalidated', { detail: { id, listing: listings[index] } }));
            window.dispatchEvent(new CustomEvent('gaja_listings_updated', { detail: { listings } }));
        }
        return listings[index];
    },

    // 전 매물(12건) ExitWise 정본 IM 일괄 자동 재생성 & 동기화
    revalidateAllListingsIM: (force = true) => {
        const listings = DataManager.getListings();
        const updated = listings.map(item => {
            const seedMatch = mockListings.find(m => String(m.id) === String(item.id));
            if (seedMatch) {
                return {
                    ...item,
                    ...seedMatch,
                    isExitwiseLinked: true,
                    exitwiseData: {
                        ...(item.exitwiseData || {}),
                        ...(seedMatch.exitwiseData || {})
                    }
                };
            } else {
                const freshMd = generateExitwiseMarkdown({
                    title: item.title,
                    assetName: item.exitwiseData?.assetName || item.title,
                    category: item.category,
                    location: item.location,
                    salePrice: item.salePrice,
                    capRate: item.capRate || item.roi,
                    landArea: item.landArea,
                    totalFloorArea: item.totalFloorArea || item.area,
                    floors: item.floors,
                    parking: item.parking,
                    summary: item.summary,
                    docNumber: item.exitwiseData?.imDocNumber
                });
                return {
                    ...item,
                    isExitwiseLinked: true,
                    exitwiseData: {
                        ...(item.exitwiseData || {}),
                        markdownContent: freshMd,
                        imTitle: item.exitwiseData?.imTitle || `${item.title} ExitWise 투자설명서`,
                        imDate: item.exitwiseData?.imDate || new Date().toISOString().split('T')[0]
                    }
                };
            }
        });

        const { healed } = AiAssetImageMatcher.healListings(updated);
        localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(healed));

        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('exitwise_all_im_revalidated', { detail: { count: healed.length } }));
            window.dispatchEvent(new CustomEvent('gaja_listings_updated', { detail: { listings: healed } }));
        }
        return healed;
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
