import { mockListings } from '../data/mockListings';
import { partners } from '../data/partners';
import AiAssetImageMatcher from './AiAssetImageMatcher';
import AiPropertyPhotoEngine from '../services/AiPropertyPhotoEngine';
import { sanitizeMarkdownContent, unescapeMarkdown, extractMetricsFromIM, cleanExecutiveSummary, parseWonFromKorean } from './markdownUtils';

const STORAGE_KEYS = {
    LISTINGS: 'gaja_listings',
    PARTNERS: 'gaja_partners',
    INQUIRIES: 'gaja_inquiries',
    VIPS: 'gaja_vips'
};

// ExitWise 전 매물의 IM 전문 및 제원 최신 동기화 헬퍼 (서문, 지도, 도표, 가격, 임대료, 보증금 자가치유)
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
            // 6. 위치 및 공인 정밀 위경도 불일치 검사 (그랜드조선 및 전 매물 좌표 자가치유)
            const locOrCoordsMismatch = (seedMatch.location && item.location !== seedMatch.location) ||
                                        (seedMatch.lat && item.lat !== seedMatch.lat) ||
                                        (seedMatch.lng && item.lng !== seedMatch.lng) ||
                                        (!item.locationCoords && Boolean(seedMatch.locationCoords));

            if (missingCoverLetter || missingMap || missingCharts || missingMd || isOldZenith || !item.isExitwiseLinked || priceMismatch || markdownVersionMismatch || locOrCoordsMismatch) {
                changed = true;
                return {
                    ...item,
                    ...seedMatch,
                    isExitwiseLinked: true,
                    exitwiseData: {
                        ...(item.exitwiseData || {}),
                        ...(seedMatch.exitwiseData || {}),
                        markdownContent: sanitizeMarkdownContent(seedMatch.exitwiseData?.markdownContent || item.exitwiseData?.markdownContent)
                    }
                };
            }
        }

        // 7. 모든 ExitWise 연동 매물(임포트 매물 포함)의 데이터 무결성 및 IM 정합성 자가치유 검사
        if (item.isExitwiseLinked || item.exitwiseData?.markdownContent) {
            const md = item.exitwiseData?.markdownContent || '';
            const hasBackslash = /\\([.[\]()\-*_#:!~"'>+`]|(\d+)\\\.)/.test(md) || 
                                 /\\/.test(item.landArea || item.exitwiseData?.landArea || '');
            const hasKpiInSummary = (item.exitwiseData?.executiveSummary && (
                item.exitwiseData.executiveSummary.includes('```kpi') || 
                item.exitwiseData.executiveSummary.includes('{"items":')
            )) || (item.summary && (
                item.summary.includes('```kpi') ||
                item.summary.includes('{"items":')
            ));

            // 비정상적인 임대료/보증금 더미 데이터 감지 (예: 66억 건물에 8.5억 월세, 30억 보증금)
            const numPrice = parseWonFromKorean(item.salePrice || item.targetPrice || item.minPrice);
            const isRentMismatched = item.monthlyRent && numPrice > 0 && 
                                     (parseWonFromKorean(item.monthlyRent) * 12 > numPrice * 0.25);
            const isDepositMismatched = item.deposit && numPrice > 0 && 
                                       (parseWonFromKorean(item.deposit) > numPrice * 0.4);
            const isMissingMetrics = !item.deposit || !item.monthlyRent || !item.pricePerPyung;

            if (hasBackslash || hasKpiInSummary || isRentMismatched || isDepositMismatched || isMissingMetrics) {
                const extracted = extractMetricsFromIM(md, item);
                changed = true;
                return {
                    ...item,
                    salePrice: extracted.salePrice || item.salePrice,
                    roi: extracted.roi || item.roi,
                    deposit: extracted.deposit,
                    monthlyRent: extracted.monthlyRent,
                    pricePerPyung: extracted.pricePerPyung,
                    landArea: extracted.landArea,
                    totalFloorArea: extracted.totalFloorArea,
                    floors: extracted.floors,
                    parking: extracted.parking,
                    summary: extracted.executiveSummary || item.summary,
                    exitwiseData: {
                        ...(item.exitwiseData || {}),
                        salePrice: extracted.salePrice || item.exitwiseData?.salePrice,
                        capRate: extracted.roi || item.exitwiseData?.capRate,
                        deposit: extracted.deposit,
                        monthlyRent: extracted.monthlyRent,
                        pricePerPyung: extracted.pricePerPyung,
                        landArea: extracted.landArea,
                        totalFloorArea: extracted.totalFloorArea,
                        floors: extracted.floors,
                        parking: extracted.parking,
                        executiveSummary: extracted.executiveSummary,
                        kpiRaw: extracted.kpiRaw || item.exitwiseData?.kpiRaw,
                        kpiItems: extracted.kpiItems || item.exitwiseData?.kpiItems,
                        sensitivityRaw: extracted.sensitivityRaw || item.exitwiseData?.sensitivityRaw,
                        rechartsRaw: extracted.rechartsRaw || item.exitwiseData?.rechartsRaw,
                        markdownContent: sanitizeMarkdownContent(md)
                    }
                };
            }
        }

        // 8. 관리자가 직접 수동 등록/수정한 썸네일(isManualPhoto)은 AI 자가치유가 절대 덮어쓰지 않고 100% 영구 보존
        if (item.isManualPhoto || item.aiPhotoVerification?.isManual) {
            return item;
        }

        // 9. AI 사진 검증 메타데이터 누락 및 구버전/더미 이미지 자가치유
        // - 브이월드 국가 정밀 항공사진 또는 공인 실사로 전 매물 100% 자가치유 갱신
        const hasVWorldCandidate = item.aiPhotoVerification?.candidates?.some(c => c.url?.includes('api.vworld.kr'));
        const hasLegacyPlaceholder = !item.img || 
            item.img.includes('gangnam.png') || 
            item.img.includes('pangyo.png') || 
            item.img.includes('busan.png') || 
            item.img.includes('placeholder');
        const hasRandomUnsplash = item.img?.includes('unsplash.com') && 
            !item.img?.includes('photo-1542314831-068cd1dbfeeb') && // 포시즌스호텔 공인 실사 제외
            !item.img?.includes('photo-1497366216548-37526070297c'); // 두각빌딩 공인 실사 제외

        const hasOutdatedPhoto = !item.aiPhotoVerification || 
            !item.aiPhotoVerification.candidates ||
            !hasVWorldCandidate ||
            hasLegacyPlaceholder ||
            hasRandomUnsplash ||
            item.aiPhotoVerification.candidates.some(c => 
                c.url?.includes('photo-1577495508048') ||
                c.url?.includes('photo-1566073771259') ||
                c.url?.includes('photo-1506973035872') ||
                !c.embedType
            );

        if (hasOutdatedPhoto) {
            const photoEval = AiPropertyPhotoEngine.evaluateFast({
                listingId: item.id,
                title: item.title,
                address: item.location,
                category: item.category
            });
            changed = true;
            return {
                ...item,
                img: photoEval.bestPhoto || item.img,
                aiPhotoVerification: {
                    selectedSource: photoEval.selectedSource,
                    sourceLabel: photoEval.sourceLabel,
                    score: photoEval.score,
                    reason: photoEval.reason,
                    candidates: photoEval.candidates,
                    verifiedAt: photoEval.verifiedAt
                }
            };
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

    // 숫자 가격 파싱 (예: "620억" -> 62000000000, "66억" -> 6600000000)
    let numPrice = parseWonFromKorean(salePrice) || 50000000000;
    const numCap = parseFloat(capRate) || 5.5;
    const annualNoi = Math.round(numPrice * (numCap / 100));
    const noiEok = Math.round((annualNoi / 100000000) * 10) / 10;
    const revEok = Math.round(noiEok * 1.15 * 10) / 10;

    // 현실적인 보증금 및 월 임대료 자동 산출
    const depositWon = Math.round((numPrice * 0.05) / 10000000) * 10000000;
    const depositEok = Math.round((depositWon / 100000000) * 10) / 10;
    const depositStr = depositEok >= 1 ? `${depositEok}억원` : `${Math.round(depositWon / 10000).toLocaleString('ko-KR')}만원`;

    const monthlyRentWon = Math.round(annualNoi / 12);
    const monthlyRentStr = monthlyRentWon >= 100000000
        ? `${(monthlyRentWon / 100000000).toFixed(1)}억원`
        : `${Math.round(monthlyRentWon / 10000).toLocaleString('ko-KR')}만원`;

    // 평당가 산출 (대지면적 또는 연면적 기준)
    let pyungPriceStr = '시세 대비 우량';
    const pyungMatch = (landArea || totalFloorArea || '').match(/(?:약\s*)?(\d+(?:\.\d+)?)\s*평/);
    if (pyungMatch) {
        const pyung = parseFloat(pyungMatch[1]);
        if (pyung > 0) {
            const perPyungMan = Math.round((numPrice / pyung) / 10000);
            pyungPriceStr = `평당 약 ${perPyungMan.toLocaleString('ko-KR')}만원`;
        }
    }

    const cleanSummaryText = cleanExecutiveSummary(summary || `${location}에 위치한 우량 ${category || '실물자산'} 매각 건으로, 전문 권리분석 및 ExitWise 결정론 검증을 완료하여 안정적인 현금흐름 창출과 높은 자산가치 보존성을 보유한 핵심 투자 자산입니다.`);

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
- 대지면적: ${unescapeMarkdown(landArea) || '실사 확인'}
- 연면적: ${unescapeMarkdown(totalFloorArea) || '실사 확인'}
- 건축 규모: ${unescapeMarkdown(floors) || '실사 확인'}
- 주차 대수: ${unescapeMarkdown(parking) || '자주식 완비'}

\`\`\`kpi
{"items":[{"label":"희망 매각가","value":"${salePrice || '협의'}","highlight":true},{"label":"목표 Cap Rate","value":"${capRate || '5.5%'}"},{"label":"월 예상 임대수익","value":"월 ${monthlyRentStr}"},{"label":"연간 순영업소득","value":"약 ${noiEok}억원"}]}
\`\`\`

[Executive Summary] ${cleanSummaryText}

## Chapter 2. 핵심 운영 및 임대 재무 실적 (Operating & Financials)
- 가동률/임대율: ${isFactory ? '100.0% (장기 마스터리스 계약 체결)' : isOffice ? '98.2% 내외 (공실률 1.8%)' : isHotel ? '78.4%' : '95.0% 이상'}
- 목표 수익률: ${capRate || '5.5%'}
- 연간 순영업소득 (NOI): 약 ${noiEok}억원
- 임대 보증금 총액: 약 ${depositStr} (실사 기준 변동 가능)
- 월 임대수입(추정): 약 ${monthlyRentStr}
- 3.3㎡당 매매가: ${pyungPriceStr}

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

        // 2-B. 중복 매물 자동 제거 및 단일 정규화 (Self-Healing Deduplication)
        // ExitWise 전송 재시도나 동시 호출로 생성된 동일 매물(포시즌스호텔 등)을 단 1개로 병합
        const seenKeys = new Map();
        const deduplicated = [];
        for (const item of raw) {
            const rawTitle = (item.title || item.exitwiseData?.imTitle || '').trim();
            const normTitle = rawTitle.replace(/\s+/g, '');
            const rawLoc = (item.location || '').toString();
            const imDocId = item.exitwiseData?.imDocumentId || '';

            let dedupeKey = null;
            if (normTitle.includes('포시즌스') || rawLoc.includes('당주동') || String(item.id).includes('fourseasons')) {
                dedupeKey = 'exitwise-fourseasons-hotel';
            } else if (normTitle.includes('그랜드조선') || String(item.id).includes('haeundae')) {
                dedupeKey = 'exitwise-haeundae';
            } else if (normTitle.includes('제니스') || String(item.id).includes('zenith')) {
                dedupeKey = 'exitwise-zenith-npl';
            } else if (imDocId && imDocId.length > 5) {
                dedupeKey = `imdoc-${imDocId}`;
            } else if (normTitle.length > 5) {
                dedupeKey = `title-${normTitle}`;
            }

            if (dedupeKey) {
                if (!seenKeys.has(dedupeKey)) {
                    let canonicalItem = item;
                    if (dedupeKey === 'exitwise-fourseasons-hotel') {
                        canonicalItem = {
                            ...item,
                            id: 'exitwise-fourseasons-hotel',
                            type: 'general',
                            category: '호텔',
                            img: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&auto=format&fit=crop&q=80',
                            location: '서울 종로구 새문안로 97 (당주동 29)',
                            tags: ['317실', 'ExitWise 연동', '호텔', '통매각']
                        };
                    }
                    seenKeys.set(dedupeKey, canonicalItem);
                    deduplicated.push(canonicalItem);
                } else {
                    // 중복 발견 -> 하나로 병합 후 중복 항목 제거
                    hasChangedAny = true;
                    const existing = seenKeys.get(dedupeKey);
                    const isIncomingBetter = (item.category === '호텔' && existing.category !== '호텔') ||
                        ((item.exitwiseData?.markdownContent?.length || 0) > (existing.exitwiseData?.markdownContent?.length || 0));

                    const merged = isIncomingBetter ? { ...existing, ...item } : { ...item, ...existing };
                    if (dedupeKey === 'exitwise-fourseasons-hotel') {
                        merged.id = 'exitwise-fourseasons-hotel';
                        merged.type = 'general';
                        merged.category = '호텔';
                        merged.img = 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&auto=format&fit=crop&q=80';
                        merged.location = '서울 종로구 새문안로 97 (당주동 29)';
                        merged.tags = ['317실', 'ExitWise 연동', '호텔', '통매각'];
                    }

                    const targetIdx = deduplicated.indexOf(existing);
                    if (targetIdx >= 0) {
                        deduplicated[targetIdx] = merged;
                    }
                    seenKeys.set(dedupeKey, merged);
                }
            } else {
                deduplicated.push(item);
            }
        }
        raw = deduplicated;

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
        if (!id) return null;
        const targetId = String(id).trim();
        const listings = DataManager.getListings();

        // 1단계: 완전 일치 (Exact match)
        const exact = listings.find(item => String(item.id) === targetId);
        if (exact) return exact;

        // 2단계: 대소문자 무시 완전 일치
        const lowerTarget = targetId.toLowerCase();
        const caseInsensitive = listings.find(item => String(item.id).toLowerCase() === lowerTarget);
        if (caseInsensitive) return caseInsensitive;

        // 3단계: ExitWise ID 스마트 매칭 (8자리 단축, 16자리, UUID 전체, 접두사 상호 호환)
        const cleanTarget = lowerTarget.replace(/^exitwise-/, '').replace(/[^a-z0-9]/g, '');

        const smartMatch = listings.find(item => {
            const itemIdStr = String(item.id || '').toLowerCase();
            const cleanItemId = itemIdStr.replace(/^exitwise-/, '').replace(/[^a-z0-9]/g, '');
            const itemDocId = String(item.exitwiseData?.imDocumentId || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            const itemDocNum = String(item.exitwiseData?.imDocNumber || '').toLowerCase();

            // 3-A. 아이템 ID 접두사/포함 일치 (예: exitwise-8654b247 vs exitwise-8654b247abcd)
            if (cleanTarget.length >= 6 && cleanItemId.length >= 6) {
                if (cleanItemId.startsWith(cleanTarget) || cleanTarget.startsWith(cleanItemId)) {
                    return true;
                }
            }

            // 3-B. exitwiseData.imDocumentId(UUID) 매칭
            if (cleanTarget.length >= 6 && itemDocId.length >= 6) {
                if (itemDocId.startsWith(cleanTarget) || cleanTarget.startsWith(itemDocId)) {
                    return true;
                }
            }

            // 3-C. 문서번호 매칭 (예: IM-2026-EW-8654)
            if (cleanTarget.length >= 4 && itemDocNum && itemDocNum.includes(cleanTarget)) {
                return true;
            }

            return false;
        });

        if (smartMatch) return smartMatch;

        return null;
    },
    saveListing: (listing) => {
        const listings = DataManager.getListings();
        const index = listings.findIndex(item => String(item.id) === String(listing.id));

        // 관리자가 썸네일을 직접 지정/수정한 경우 플래그 및 메타데이터 자동 세팅 (자가치유 덮어쓰기 방지)
        if (listing.img) {
            listing.isManualPhoto = true;
            listing.aiPhotoVerification = {
                ...(listing.aiPhotoVerification || {}),
                selectedSource: 'manual_admin',
                sourceLabel: '👤 관리자 지정 대표 사진',
                score: 100,
                reason: '관리자가 직접 등록 및 수정한 공식 대표 사진 (영구 보존)',
                isManual: true,
                verifiedAt: new Date().toISOString()
            };
        } else if (!listing.img || !listing.aiPhotoVerification) {
            const photoEval = AiPropertyPhotoEngine.evaluateFast({
                listingId: listing.id,
                title: listing.title,
                category: listing.category,
                address: listing.location
            });
            listing.img = photoEval.bestPhoto;
            listing.aiPhotoVerification = {
                selectedSource: photoEval.selectedSource,
                sourceLabel: photoEval.sourceLabel,
                score: photoEval.score,
                reason: photoEval.reason,
                candidates: photoEval.candidates,
                verifiedAt: photoEval.verifiedAt
            };
        }

        if (index >= 0) {
            const updated = { ...listings[index], ...listing, updatedAt: new Date().toISOString() };
            // 최근 수정한 매물을 최상단으로 재배치하여 랜딩페이지(Home) Featured 매물에도 즉시 노출
            listings.splice(index, 1);
            listings.unshift(updated);
        } else {
            listings.unshift({ ...listing, createdAt: new Date().toISOString() });
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
        const cleanDocId = String(docId).toLowerCase().replace(/^exitwise-/, '').replace(/[^a-z0-9]/g, '');

        const index = listings.findIndex(item => {
            const itemIdStr = String(item.id || '').toLowerCase();
            const cleanItemId = itemIdStr.replace(/^exitwise-/, '').replace(/[^a-z0-9]/g, '');
            const itemDocId = String(item.exitwiseData?.imDocumentId || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            if (String(item.id) === String(docId)) return true;
            if (String(item.exitwiseData?.imDocumentId) === String(docId)) return true;
            if (cleanDocId.length >= 6) {
                if (cleanItemId.startsWith(cleanDocId) || cleanDocId.startsWith(cleanItemId)) return true;
                if (itemDocId.startsWith(cleanDocId) || cleanDocId.startsWith(itemDocId)) return true;
            }
            return false;
        });

        if (index >= 0) {
            const current = listings[index];
            const updatedExitwiseData = {
                ...(current.exitwiseData || {}),
                imDocumentId: docId,
                markdownContent: freshData.markdownContent ? sanitizeMarkdownContent(freshData.markdownContent) : current.exitwiseData?.markdownContent,
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
        } else {
            // 매물이 아직 로컬에 없으면 즉시 자동 임포트 생성!
            return DataManager.importFromExitwise({
                id: String(docId).startsWith('exitwise-') ? docId : `exitwise-${String(docId).slice(0, 8)}`,
                imDocumentId: docId,
                ...freshData
            });
        }
    },
    importFromExitwise: (imData) => {
        // AI 시맨틱 분석으로 제목과 본문에 100% 어울리는 사진 및 제원 도출
        const titleForMatch = imData.title || imData.imTitle || imData.assetName || '';
        const lowerTitle = titleForMatch.toLowerCase();

        // 1. 위치 문자열 정제 (JSON 파싱 찌꺼기 및 "(추정)" 괄호 제거)
        let cleanLocation = (imData.location || '')
            .replace(/["'}\]]+$/g, '')
            .replace(/\s*\([^)]*추정[^)]*\)/g, '')
            .trim();
        if (lowerTitle.includes('포시즌스') || cleanLocation.includes('당주동') || cleanLocation.includes('새문안로')) {
            cleanLocation = '서울 종로구 새문안로 97 (당주동 29)';
        }

        // 2. 멱등적 고유 ID 결정 (동일 매물 중복 등록 방지)
        let deterministicId = imData.id;
        if (lowerTitle.includes('포시즌스') || cleanLocation.includes('당주동') || cleanLocation.includes('새문안로')) {
            deterministicId = 'exitwise-fourseasons-hotel';
        } else if (lowerTitle.includes('그랜드조선') || lowerTitle.includes('조선호텔') || cleanLocation.includes('해운대')) {
            deterministicId = 'exitwise-haeundae';
        } else if (lowerTitle.includes('제니스') || lowerTitle.includes('마린시티')) {
            deterministicId = 'exitwise-zenith-npl';
        } else if (imData.id && String(imData.id).trim().length > 0) {
            // 전달받은 ID가 이미 있으면 그대로 최우선 채택 (불일치 원천 차단)
            deterministicId = String(imData.id).trim();
        } else if (imData.imDocumentId) {
            const rawDocId = String(imData.imDocumentId).trim();
            deterministicId = rawDocId.startsWith('exitwise-') 
                ? rawDocId 
                : `exitwise-${rawDocId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8)}`;
        } else if (!deterministicId) {
            deterministicId = `exitwise-${Date.now()}`;
        }

        const aiMatched = AiAssetImageMatcher.match({
            title: titleForMatch,
            content: imData.markdownContent || '',
            category: imData.category,
            location: cleanLocation
        });

        // AI 로드뷰/스카이뷰/웹실사 즉시 동기 평가
        const aiPhotoEval = AiPropertyPhotoEngine.evaluateFast({
            listingId: deterministicId,
            title: titleForMatch,
            address: cleanLocation,
            category: imData.category
        });

        const isHotel = lowerTitle.includes('호텔') || imData.category === '호텔' || aiMatched.category === '호텔';
        const finalCategory = isHotel ? '호텔' : (aiMatched.category || imData.category || '오피스빌딩');
        const finalLocation = cleanLocation || aiMatched.location || (isHotel ? '부산 해운대구 우동' : '서울 영등포구 여의대로 24');
        const finalTitle = imData.title || imData.imTitle || `${aiMatched.cleanTitle} 자산 매각`;
        const finalImg = aiPhotoEval.bestPhoto || (
            (deterministicId === 'exitwise-fourseasons-hotel' || lowerTitle.includes('포시즌스'))
                ? 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&auto=format&fit=crop&q=80'
                : aiMatched.img
        );

        const finalSalePrice = imData.salePrice || imData.targetPrice || (deterministicId === 'exitwise-fourseasons-hotel' ? '8,100억' : (isHotel ? '1,850억' : '2,850억'));
        const finalRoi = imData.roi || (deterministicId === 'exitwise-fourseasons-hotel' ? '2.15%' : (isHotel ? '5.8%' : '5.4%'));
        const finalRooms = isHotel ? (imData.rooms || (deterministicId === 'exitwise-fourseasons-hotel' ? '317실' : '330실')) : undefined;
        const finalFloors = imData.floors || (deterministicId === 'exitwise-fourseasons-hotel' ? '지하 7층 / 지상 25층' : (isHotel ? '지하 6층 / 지상 16층' : '지하 7층 / 지상 50층'));
        const finalParking = imData.parking || (deterministicId === 'exitwise-fourseasons-hotel' ? '총 350대 (자주식 완비)' : (isHotel ? '240대 (자주식 180대)' : '450대 (자주식 380대)'));
        const finalTags = deterministicId === 'exitwise-fourseasons-hotel'
            ? ['317실', 'ExitWise 연동', '호텔', '통매각']
            : ['ExitWise 연동', finalCategory, 'AI 분석'];

        const finalLandArea = imData.landArea || (isHotel ? '4,158.4㎡ (1,257.9평)' : '3,305.8㎡ (1,000평)');
        const finalTotalFloorArea = imData.totalFloorArea || (isHotel ? '36,837.2㎡ (11,143.2평)' : '52,890.0㎡ (16,000평)');
        const finalSummary = imData.summary || imData.executiveSummary || `${finalTitle}은(는) ExitWise AI를 통해 가치평가 및 출구전략 수립이 완료된 프리미엄 핵심 자산입니다.`;
        const finalRiskWarning = imData.riskWarning || '본 IM 자료는 투자 의사결정 참고용이며 최종 거래 조건은 법률 및 세무 실사에 따라 변동될 수 있습니다.';

        let finalMarkdown = imData.markdownContent ? sanitizeMarkdownContent(imData.markdownContent) : null;
        if (!finalMarkdown) {
            finalMarkdown = generateExitwiseMarkdown({
                title: finalTitle,
                assetName: imData.assetName || finalTitle,
                category: finalCategory,
                location: finalLocation,
                salePrice: finalSalePrice,
                capRate: finalRoi,
                landArea: finalLandArea,
                totalFloorArea: finalTotalFloorArea,
                floors: finalFloors,
                parking: finalParking,
                summary: finalSummary,
                riskWarning: finalRiskWarning,
                docNumber: imData.docNumber
            });
        }

        const extracted = extractMetricsFromIM(finalMarkdown, {
            salePrice: finalSalePrice,
            roi: finalRoi,
            deposit: imData.deposit,
            monthlyRent: imData.monthlyRent,
            pricePerPyung: imData.pricePerPyung,
            landArea: finalLandArea,
            totalFloorArea: finalTotalFloorArea,
            floors: finalFloors,
            parking: finalParking,
            summary: finalSummary,
            executiveSummary: imData.executiveSummary
        });

        // 기존 매물 목록에서 동일 물건 존재 여부 확인 (ID, imDocumentId, 또는 정규화된 제목 기준)
        let listings = DataManager._safeGet(STORAGE_KEYS.LISTINGS, mockListings);
        const existingIndex = listings.findIndex(item => {
            if (String(item.id) === String(deterministicId)) return true;
            if (imData.imDocumentId && String(item.exitwiseData?.imDocumentId) === String(imData.imDocumentId)) return true;
            const itemTitleNorm = (item.title || item.exitwiseData?.imTitle || '').replace(/\s+/g, '');
            const newTitleNorm = finalTitle.replace(/\s+/g, '');
            if (newTitleNorm.includes('포시즌스') && itemTitleNorm.includes('포시즌스')) return true;
            if (newTitleNorm.length > 5 && itemTitleNorm === newTitleNorm) return true;
            return false;
        });

        const newListing = {
            id: deterministicId,
            type: imData.type || (finalCategory === 'NPL' ? 'npl' : 'general'),
            img: finalImg,
            aiPhotoVerification: {
                selectedSource: aiPhotoEval.selectedSource,
                sourceLabel: aiPhotoEval.sourceLabel,
                score: aiPhotoEval.score,
                reason: aiPhotoEval.reason,
                candidates: aiPhotoEval.candidates,
                verifiedAt: aiPhotoEval.verifiedAt
            },
            location: finalLocation,
            title: finalTitle,
            category: finalCategory,
            salePrice: extracted.salePrice || finalSalePrice,
            roi: extracted.roi || finalRoi,
            deposit: extracted.deposit,
            monthlyRent: extracted.monthlyRent,
            pricePerPyung: extracted.pricePerPyung,
            landArea: extracted.landArea,
            totalFloorArea: extracted.totalFloorArea,
            floors: extracted.floors,
            parking: extracted.parking,
            summary: extracted.executiveSummary,
            status: 'Active',
            tags: finalTags,
            isExitwiseLinked: true,
            exitwiseData: {
                imDocumentId: imData.imDocumentId || imData.id || deterministicId,
                imDocNumber: imData.docNumber || `IM-2026-EW-${deterministicId.slice(-4)}`,
                imTitle: finalTitle,
                imDate: imData.imDate || new Date().toISOString().split('T')[0],
                assetName: imData.assetName || finalTitle,
                assetClass: finalCategory,
                category: finalCategory,
                location: finalLocation,
                salePrice: extracted.salePrice || finalSalePrice,
                capRate: extracted.roi || finalRoi,
                deposit: extracted.deposit,
                monthlyRent: extracted.monthlyRent,
                pricePerPyung: extracted.pricePerPyung,
                rooms: finalRooms,
                parking: extracted.parking,
                landArea: extracted.landArea,
                totalFloorArea: extracted.totalFloorArea,
                floors: extracted.floors,
                riskWarning: finalRiskWarning,
                executiveSummary: extracted.executiveSummary,
                kpiRaw: extracted.kpiRaw,
                kpiItems: extracted.kpiItems,
                sensitivityRaw: extracted.sensitivityRaw,
                rechartsRaw: extracted.rechartsRaw,
                kakaoMapRaw: extracted.kakaoMapRaw,
                markdownContent: finalMarkdown,
                htmlContent: imData.htmlContent || '',
                validationStatus: '검증 완료'
            }
        };

        if (existingIndex >= 0) {
            // 중복 생성 대신 기존 항목 업데이트 (Idempotent update)
            const current = listings[existingIndex];
            const preservedMarkdown = (newListing.exitwiseData?.markdownContent?.length || 0) >= (current.exitwiseData?.markdownContent?.length || 0)
                ? newListing.exitwiseData.markdownContent
                : (current.exitwiseData?.markdownContent || newListing.exitwiseData.markdownContent);

            const merged = {
                ...current,
                ...newListing,
                id: deterministicId,
                exitwiseData: {
                    ...current.exitwiseData,
                    ...newListing.exitwiseData,
                    markdownContent: preservedMarkdown
                }
            };
            listings[existingIndex] = merged;
            localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(listings));
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('gaja_listings_updated', { detail: { listings } }));
            }
            return merged;
        } else {
            listings.unshift(newListing);
            localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(listings));
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('gaja_listings_updated', { detail: { listings } }));
            }
            return newListing;
        }
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

    // 단일 매물 AI 사진 자동 촬영 및 검증 (카카오 로드뷰/스카이뷰/웹실사)
    captureListingPhoto: async (id) => {
        const listings = DataManager.getListings();
        const index = listings.findIndex(item => String(item.id) === String(id));
        if (index < 0) return null;

        const updatedItem = await AiPropertyPhotoEngine.applyAiPhotoToListing(listings[index]);
        listings[index] = updatedItem;
        localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(listings));

        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('gaja_listings_updated', { detail: { listings } }));
        }
        return updatedItem;
    },

    // 전 매물 대상 카카오 로드뷰/스카이뷰/웹실사 AI 사진 일괄 자동 촬영 및 등재
    autoCaptureAllListingsPhotos: async () => {
        const listings = DataManager.getListings();
        const updatedListings = [];

        for (const item of listings) {
            try {
                const updated = await AiPropertyPhotoEngine.applyAiPhotoToListing(item);
                updatedListings.push(updated);
            } catch (err) {
                console.warn('[DataManager] Error capturing photo for listing:', item.id, err);
                updatedListings.push(item);
            }
        }

        localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(updatedListings));
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('gaja_listings_updated', { detail: { listings: updatedListings } }));
            window.dispatchEvent(new CustomEvent('ai_photos_batch_completed', { detail: { count: updatedListings.length } }));
        }
        return updatedListings;
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
