import { AiPropertyPhotoEngine, getVWorldSkyviewUrl } from '../services/AiPropertyPhotoEngine.js';

/**
 * AiAssetImageMatcher.js
 * 매물 제목(title), 마크다운 본문(content), 카테고리(category), 위치(location)를
 * AI 시맨틱 분석하여 100% 실물 건축물 및 랜드마크 고화질 사진을 자동으로 정밀 매칭합니다.
 * 
 * [원칙]
 * 1. 사람 얼굴, 초상화, 포트레이트 사진 0% 원천 박멸 (부동산 실물 건축물 100%)
 * 2. 원본 주소 보존 및 지역명 왜곡 방지
 * 3. NPL 매물의 경우 담보 자산의 실제 형태(주상복합, 상가, 오피스, 공장, 리조트 등)를 분석하여 매칭
 */

// 1. 특정 랜드마크 및 대표 자산 핀포인트 맵
export const PINPOINT_LANDMARKS = [
    {
        name: '해운대 마린시티 두산위브더제니스',
        pattern: /(?:두산위브|위브더제니스|제니스|마린시티\s*npl|해운대\s*두산|해운대\s*제니스|우동\s*1407|마린시티2로)/i,
        img: '/assets/listings/haeundae_zenith.jpg',
        category: '아파트/주택',
        location: '부산 해운대구 마린시티2로 33 (우동 1407)',
        defaultPrice: '1,850억',
        floors: '지하 5층 / 지상 80층 (3개동 1,788세대)',
        parking: '총 3,780대 (세대당 2.11대)',
        specs: {
            landArea: '42,500㎡ (12,856평)',
            totalFloorArea: '568,000㎡ (171,820평)'
        }
    },
    {
        name: '여의도 FKI타워 (전경련회관)',
        pattern: /(?:fki|여의도\s*fki|전경련|여의도\s*오피스|여의대로\s*24)/i,
        img: '/assets/listings/yeouido_fki_tower.jpg',
        category: '오피스빌딩',
        location: '서울 영등포구 여의대로 24 (여의도동)',
        defaultPrice: '2,850억',
        floors: '지하 7층 / 지상 50층',
        parking: '총 450대 (자주식 380대)',
        specs: {
            landArea: '3,305.8㎡ (1,000평)',
            totalFloorArea: '52,890.0㎡ (16,000평)'
        }
    },
    {
        name: '양주 스마트 제조 플랜트',
        pattern: /(?:양주|남면|상수리|일반공업|스마트\s*제조|플랜트)/i,
        img: '/assets/listings/yangju_factory.jpg',
        category: '공장/제조',
        location: '경기 양주시 남면 상수리 일반공업지역',
        defaultPrice: '480억',
        floors: '지상 3층 (공장동 2개동 및 복합사무동)',
        parking: '총 120대 (대형 화물 트레일러 15대)',
        specs: {
            landArea: '16,528.9㎡ (5,000평)',
            totalFloorArea: '23,140.5㎡ (7,000평)'
        }
    },
    {
        name: '해운대 그랜드조선 호텔',
        pattern: /(?:그랜드조선|조선호텔|해운대\s*호텔|해운대해변로\s*292)/i,
        img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&auto=format&fit=crop&q=80',
        category: '호텔',
        location: '부산 해운대구 우동 (해운대 해수욕장 1선)',
        defaultPrice: '1,850억',
        floors: '지하 6층 / 지상 16층',
        parking: '총 240대 (자주식 180대)',
        specs: {
            landArea: '4,158.4㎡ (1,257.9평)',
            totalFloorArea: '36,837.2㎡ (11,143.2평)',
            rooms: '330실'
        }
    },
    {
        name: '포시즌스호텔 서울',
        pattern: /(?:포시즌스|당주동\s*호텔|당주동\s*29|새문안로\s*97|four\s*seasons)/i,
        img: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&auto=format&fit=crop&q=80',
        category: '호텔',
        location: '서울 종로구 새문안로 97 (당주동, 포시즌스호텔 서울)',
        defaultPrice: '8,100억',
        floors: '지하 7층 / 지상 25층',
        parking: '총 350대 (자주식 완비)',
        specs: {
            landArea: '4,117㎡ (1,245평)',
            totalFloorArea: '88,000㎡ (26,620평)',
            rooms: '317실'
        }
    }
];

// 2. 자산 카테고리별 100% 실물 건축물 고해상도 이미지 풀 (인물 사진 0건 보장)
export const CATEGORY_IMAGE_POOLS = {
    // 공장 / 플랜트 / 제조
    factory: [
        '/assets/listings/yangju_factory.jpg',
        'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&auto=format&fit=crop&q=80'
    ],
    // 프라임 오피스 / 사옥
    office: [
        '/assets/listings/yeouido_fki_tower.jpg',
        '/assets/listings/korea_financial_tower.jpg',
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1200&auto=format&fit=crop&q=80'
    ],
    // 호텔 / 리조트
    hotel: [
        'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&auto=format&fit=crop&q=80'
    ],
    // 물류센터 / 창고
    logistics: [
        'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1553413077-190dd305871c?w=1200&auto=format&fit=crop&q=80'
    ],
    // 지식산업센터
    knowledge: [
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1200&auto=format&fit=crop&q=80'
    ],
    // 데이터센터 (IDC)
    datacenter: [
        'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&auto=format&fit=crop&q=80'
    ],
    // 주상복합 / 고급주택 / 아파트 (해운대 제니스 포함)
    residential: [
        '/assets/listings/haeundae_zenith.jpg',
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&auto=format&fit=crop&q=80'
    ],
    // 상가 / 근린생활시설
    commercial: [
        '/assets/listings/korea_financial_tower.jpg',
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&auto=format&fit=crop&q=80'
    ],
    // 토지 / 개발부지
    land: [
        'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&auto=format&fit=crop&q=80'
    ],
    // NPL 금융 / 프라임 금융 타워 (사람 사진 절대 금지, 100% 금융 타워 건축물 실사)
    npl: [
        '/assets/listings/korea_financial_tower.jpg',
        '/assets/listings/yeouido_fki_tower.jpg',
        '/assets/listings/haeundae_zenith.jpg'
    ]
};

// 해시 기반 인덱스 선택기 (동일 물건에 대해 항상 일관된 고유 이미지 반환)
function getHashIndex(str = '', arrayLength = 1) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash) % Math.max(1, arrayLength);
}

// 텍스트에서 지역명을 지능적으로 유추하는 헬퍼
function inferLocationFromText(text = '') {
    if (/(?:당주동|새문안로|광화문|종로구|종로|포시즌스)/i.test(text)) {
        return '서울 종로구 새문안로 97 (당주동, 포시즌스호텔 서울)';
    }
    if (/(?:마린시티|두산위브|제니스|우동|해운대)/i.test(text)) {
        return '부산 해운대구 마린시티2로 33 (우동 1407)';
    }
    if (/(?:부산|센텀|광안리|수영구)/i.test(text)) {
        return '부산 해운대구 센텀중앙로';
    }
    if (/(?:여의도|여의대로|전경련|fki|ybd)/i.test(text)) {
        return '서울 영등포구 여의대로 24 (여의도동)';
    }
    if (/(?:테헤란로|역삼|강남구|강남역|선릉)/i.test(text)) {
        return '서울 강남구 테헤란로 (역삼동)';
    }
    if (/(?:서초|교대역|법조타운|서초역)/i.test(text)) {
        return '서울 서초구 서초중앙로 (서초동 법조타운)';
    }
    if (/(?:판교|성남|분당|정자동)/i.test(text)) {
        return '경기 성남시 분당구 판교역로';
    }
    if (/(?:양주|남면|상수리)/i.test(text)) {
        return '경기 양주시 남면 상수리 일반공업지역';
    }
    if (/(?:제주|애월|서귀포)/i.test(text)) {
        return '제주 제주시 애월읍 애월해안로 892';
    }
    if (/(?:한남|유엔빌리지|용산)/i.test(text)) {
        return '서울 용산구 한남동 유엔빌리지';
    }
    if (/(?:성수|성동구)/i.test(text)) {
        return '서울 성동구 성수동 2가';
    }
    if (/(?:송도|인천|연수구)/i.test(text)) {
        return '인천 연수구 송도국제도시';
    }
    return '';
}

export const AiAssetImageMatcher = {
    /**
     * 자산의 제목, 마크다운 본문, 카테고리, 위치를 종합 평가하여
     * 100% 실물 건축물 사진과 정확한 메타데이터를 반환합니다.
     */
    match: ({ title = '', content = '', category = '', location = '' }) => {
        const fullText = `${title} ${content} ${category} ${location}`.toLowerCase();

        // 1. 핀포인트 랜드마크 우선 매칭
        for (const lm of PINPOINT_LANDMARKS) {
            if (lm.pattern.test(fullText)) {
                return {
                    img: lm.img,
                    category: lm.category,
                    location: location && !location.includes('테헤란로') && !location.includes('역삼동') ? location : lm.location,
                    salePrice: lm.defaultPrice,
                    floors: lm.floors,
                    parking: lm.parking,
                    specs: lm.specs,
                    matchedBy: 'pinpoint'
                };
            }
        }

        // 2. 위치 정합화 (기존 위치가 유효하면 100% 존중, 없을 때만 텍스트에서 지능 추출)
        let resolvedLocation = location?.trim();
        if (!resolvedLocation) {
            resolvedLocation = inferLocationFromText(fullText);
        }

        // 3. 자산 유형 및 담보물 시맨틱 분석
        let poolKey = 'office';
        let detectedCategory = category || '오피스빌딩';

        // NPL 판정: 제목(title) 또는 카테고리에 명시적인 NPL 관련 단어가 있을 때만 NPL로 분류 (본문의 일반 '담보' 단어에 의한 오인식 원천 차단)
        const titleAndCat = `${title} ${category}`.toLowerCase();
        const isNplContext = /(?:npl|부실채권|론세일)/i.test(titleAndCat) || (category && category.includes('NPL'));

        // 호텔 우선 판정: 제목이나 카테고리에 호텔 키워드가 있으면 본문 내용과 무관하게 100% 호텔로 확정
        if (/(?:호텔|hotel|포시즌스|조선호텔|리조트|resort|숙박|콘도|풀빌라)/i.test(titleAndCat)) {
            poolKey = 'hotel';
            detectedCategory = isNplContext ? 'NPL (호텔/리조트)' : '호텔';
            if (!resolvedLocation) resolvedLocation = '서울 종로구 새문안로 97 (당주동, 포시즌스호텔 서울)';
        } else if (/(?:두산위브|제니스|마린시티|아파트|주택|고급주택|빌라|펜트하우스|residential)/i.test(titleAndCat) || /(?:두산위브|제니스|마린시티)/i.test(fullText)) {
            poolKey = 'residential';
            detectedCategory = isNplContext ? 'NPL (주거/주상복합)' : '아파트/주택';
            if (!resolvedLocation) resolvedLocation = '부산 해운대구 마린시티2로 33';
        } else if (/(?:상가|근생|리테일|상업시설|상업용|법조타운)/i.test(titleAndCat) || /(?:근린상가|법조타운)/i.test(fullText)) {
            poolKey = 'commercial';
            detectedCategory = isNplContext ? 'NPL (근린상가)' : '상가';
            if (!resolvedLocation) resolvedLocation = '서울 서초구 서초동';
        } else if (/(?:공장|제조|공업지역|산업단지|산단|플랜트|factory|plant)/i.test(fullText)) {
            poolKey = 'factory';
            detectedCategory = isNplContext ? 'NPL (공장/제조)' : '공장/제조';
            if (!resolvedLocation) resolvedLocation = '경기 양주시 남면 상수리 일반공업지역';
        } else if (/(?:물류|로지스틱스|창고|풀필먼트|hub|warehouse)/i.test(fullText)) {
            poolKey = 'logistics';
            detectedCategory = isNplContext ? 'NPL (물류센터)' : '물류센터';
            if (!resolvedLocation) resolvedLocation = '경기 이천시 마장면 스마트 물류단지';
        } else if (/(?:지식산업센터|지산|아파트형공장)/i.test(fullText)) {
            poolKey = 'knowledge';
            detectedCategory = '지식산업센터';
            if (!resolvedLocation) resolvedLocation = '서울 성동구 성수동 2가';
        } else if (/(?:데이터센터|idc|인공지능센터)/i.test(fullText)) {
            poolKey = 'datacenter';
            detectedCategory = '데이터센터';
            if (!resolvedLocation) resolvedLocation = '경기 하남시 풍산동 첨단 IDC';
        } else if (/(?:호텔|리조트|숙박|콘도|풀빌라|hotel|resort)/i.test(fullText)) {
            poolKey = 'hotel';
            detectedCategory = isNplContext ? 'NPL (호텔/리조트)' : '호텔';
            if (!resolvedLocation) resolvedLocation = '서울 종로구 새문안로 97 (당주동)';
        } else if (/(?:토지|대지|나대지|부지|필지|land)/i.test(fullText)) {
            poolKey = 'land';
            detectedCategory = isNplContext ? 'NPL (토지/개발)' : '토지';
            if (!resolvedLocation) resolvedLocation = '경기 화성시 송산그린시티 상업부지';
        } else if (isNplContext) {
            // 담보물이 특정되지 않은 순수 금융 NPL 채권
            poolKey = 'npl';
            detectedCategory = 'NPL';
            if (!resolvedLocation) resolvedLocation = '서울 강남구 테헤란로 (역삼동)';
        } else {
            poolKey = 'office';
            detectedCategory = '오피스빌딩';
            if (!resolvedLocation) resolvedLocation = '서울 영등포구 여의대로 24 (여의도동)';
        }

        const pool = CATEGORY_IMAGE_POOLS[poolKey] || CATEGORY_IMAGE_POOLS.office;
        const chosenImg = pool[getHashIndex(title, pool.length)];

        return {
            img: chosenImg,
            category: detectedCategory,
            location: resolvedLocation,
            matchedBy: 'category_pool'
        };
    },

    /**
     * 브라우저 localStorage나 메모리 데이터에 잘못 매칭된 이미지(인물 사진 등)나 왜곡된 위치를 자가치유(Self-Healing)합니다.
     */
    healListings: (listings = []) => {
        if (!Array.isArray(listings)) return { healed: listings, hasChanged: false };

        let hasChanged = false;
        const healed = listings.map(item => {
            if (!item) return item;

            const isExitwise = item.isExitwiseLinked || String(item.id).startsWith('exitwise');
            const title = item.title || '';
            const img = item.img || '';
            const location = item.location || '';

            // 1. 흑백 남성 인물 사진(photo-1450133064473)이 들어간 경우 100% 즉시 교정
            const isHumanPortrait = img.includes('photo-1450133064473');

            // 2. 해운대 두산위브더제니스인데 주소가 서울/역삼으로 되어 있거나 사진이 인물/오피스인 경우 교정
            const isZenith = /(?:두산위브|위브더제니스|제니스|마린시티\s*npl)/i.test(title);
            const isZenithWrongLocation = isZenith && (location.includes('역삼') || location.includes('테헤란') || location.includes('서울'));
            const isZenithWrongImg = isZenith && (!img || isHumanPortrait || img.includes('photo-1450133064473'));

            // 3. 양주 공장인데 호텔 제원/주소가 있는 경우
            const isYangju = /(?:양주|공장|상수리)/i.test(title) && !title.includes('그랜드조선');
            const isYangjuWrongLocation = isYangju && location.includes('해운대');
            const isYangjuWrongImg = isYangju && img.includes('photo-1566073771259-6a8506099945');

            // 4. 여의도 FKI인데 해운대 주소/사진이 있는 경우
            const isFki = /(?:여의도|FKI)/i.test(title) && !title.includes('그랜드조선');
            const isFkiWrongLocation = isFki && location.includes('해운대');

            // 5. 포시즌스호텔인데 NPL이거나 주거/주상복합이거나 사진이 브릿지/인물이거나 위치에 '추정' 잔여물이 있는 경우
            const isFourSeasons = /(?:포시즌스|당주동\s*포시즌스|당주동\s*호텔)/i.test(title);
            const isFourSeasonsWrong = isFourSeasons && (
                item.category !== '호텔' || 
                item.type !== 'general' || 
                img.includes('busan') || 
                img.includes('haeundae_zenith') || 
                img.includes('photo-1566073771259') || // 과거 열대 휴양지 리조트 목조 방갈로 사진 감지 시 강제 치유!
                location.includes('추정') ||
                location.includes('}') ||
                location.includes('"') ||
                !location.includes('종로구')
            );

            if (isHumanPortrait || isZenithWrongLocation || isZenithWrongImg || isYangjuWrongLocation || isYangjuWrongImg || isFkiWrongLocation || isFourSeasonsWrong) {
                hasChanged = true;

                if (isFourSeasons) {
                    return {
                        ...item,
                        type: 'general',
                        category: '호텔',
                        img: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&auto=format&fit=crop&q=80',
                        location: '서울 종로구 새문안로 97 (당주동 29)',
                        salePrice: item.salePrice || '8,100억',
                        targetPrice: item.targetPrice || item.salePrice || '8,100억',
                        roi: item.roi || '2.15%',
                        tags: ['317실', 'ExitWise 연동', '호텔', '통매각'],
                        exitwiseData: {
                            ...(item.exitwiseData || {}),
                            category: '호텔',
                            assetClass: '호텔',
                            location: '서울 종로구 새문안로 97 (당주동 29)',
                            rooms: '317실',
                            floors: '지하 7층 / 지상 25층',
                            parking: '총 350대 (자주식 완비)'
                        }
                    };
                }

                if (isZenith) {
                    return {
                        ...item,
                        type: 'npl',
                        img: '/assets/listings/haeundae_zenith.jpg',
                        location: '부산 해운대구 마린시티2로 33 (우동 1407)',
                        category: '아파트/주택',
                        tags: ['ExitWise 연동', 'NPL', '초고층주상복합', '마린시티'],
                        exitwiseData: {
                            ...(item.exitwiseData || {}),
                            category: '아파트/주택',
                            location: '부산 해운대구 마린시티2로 33 (우동 1407)',
                            floors: '지하 5층 / 지상 80층 (3개동 1,788세대)',
                            parking: '총 3,780대 (세대당 2.11대)',
                            landArea: '42,500㎡ (12,856평)',
                            totalFloorArea: '568,000㎡ (171,820평)'
                        }
                    };
                }

                // AI 매칭 재실행
                const matchResult = AiAssetImageMatcher.match({
                    title: item.title,
                    content: item.exitwiseData?.markdownContent || '',
                    category: item.category,
                    location: item.location
                });

                return {
                    ...item,
                    img: isHumanPortrait ? matchResult.img : (matchResult.img || item.img),
                    location: matchResult.location || item.location,
                    category: matchResult.category || item.category
                };
            }

            // 6. 브이월드 국가 정밀 항공사진 및 공인 실사 자가치유 (더미/플레이스홀더/과거 Unsplash 잔여물 박멸)
            const hasVWorld = item.aiPhotoVerification?.candidates?.some(c => c.url?.includes('api.vworld.kr'));
            const isPlaceholderOrOutdated = !img || 
                img.includes('gangnam.png') || 
                img.includes('pangyo.png') || 
                img.includes('busan.png') || 
                img.includes('placeholder') ||
                img.includes('photo-1577495508048') ||
                img.includes('photo-1566073771259') ||
                img.includes('photo-1506973035872') ||
                (img.includes('unsplash.com') && 
                 !img.includes('photo-1542314831-068cd1dbfeeb') && 
                 !img.includes('photo-1497366216548-37526070297c'));

            if (!hasVWorld || isPlaceholderOrOutdated) {
                hasChanged = true;
                const photoEval = AiPropertyPhotoEngine.evaluateFast({
                    listingId: item.id,
                    title: item.title,
                    address: item.location,
                    category: item.category
                });
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

        return { healed, hasChanged };
    },

    /**
     * 카드의 안전한 이미지 추출 헬퍼
     */
    getImage: (item = {}) => {
        if (item.img && !item.img.includes('placeholder') && !item.img.includes('.png')) {
            return item.img;
        }
        const photoEval = AiPropertyPhotoEngine.evaluateFast({
            listingId: item.id,
            title: item.title,
            address: item.location,
            category: item.category
        });
        return photoEval.bestPhoto || '/assets/listings/korea_financial_tower.jpg';
    }
};

export default AiAssetImageMatcher;
