/**
 * (주)가자에셋파트너스 - 전 매물 공인 정밀 위치 마스터 레지스트리 (Authoritative Property Coordinates)
 * 카카오 지도 및 국토교통부 공적장부 기반 1픽셀 오차 없는 정밀 좌표 (위도 Lat, 경도 Lng)
 */

export const PROPERTY_MASTER_COORDINATES = {
    // 1. [특급 호텔] 그랜드조선 부산 (부산 해운대구 해운대해변로 292 / 중동 1405-16, 해운대 해수욕장 백사장 바로 앞)
    'exitwise-haeundae': {
        lat: 35.160066,
        lng: 129.163128,
        name: '그랜드조선 부산 5성급 오션프론트 호텔',
        address: '부산 해운대구 해운대해변로 292 (중동 1405-16)',
        district: '해운대구 중동 (해운대 해수욕장 백사장)'
    },

    // 2. [NPL] 해운대 마린시티 두산위브더제니스 (부산 해운대구 마린시티2로 33 / 우동 1407, 80층 초고층 랜드마크)
    'exitwise-zenith-npl': {
        lat: 35.157204,
        lng: 129.144817,
        name: '해운대 마린시티 두산위브더제니스 80층 랜드마크',
        address: '부산 해운대구 마린시티2로 33 (우동 1407)',
        district: '해운대구 우동 (마린시티)'
    },

    // 3. [스마트 팩토리] 양주시 남면 상수리 일반공업지역 스마트 플랜트 (경기 양주시 남면 상수리 100-1 일원)
    'exitwise-yangju': {
        lat: 37.861053,
        lng: 127.002114,
        name: '양주시 남면 상수리 일반공업지역 스마트 팩토리',
        address: '경기 양주시 남면 상수리 일반공업지역',
        district: '경기 양주시 남면'
    },

    // 4. [프라임 오피스] 여의도 FKI타워 (서울 영등포구 여의대로 24 / 여의도동 28-1 전경련회관)
    'exitwise-fki': {
        lat: 37.522180,
        lng: 126.919917,
        name: '여의도 FKI타워 (전경련회관) 프라임 오피스',
        address: '서울 영등포구 여의대로 24 (여의도동 28-1)',
        district: '서울 영등포구 여의도동'
    },

    // 5. [일반매물 102] 강남 테헤란로 프라임 오피스 사옥 (서울 강남구 테헤란로 152 / 역삼동 737)
    '102': {
        lat: 37.500024,
        lng: 127.036509,
        name: '강남 테헤란로 프라임 오피스 사옥',
        address: '서울 강남구 테헤란로 152 (역삼동 737)',
        district: '서울 강남구 역삼동'
    },
    'gangnam-102': {
        lat: 37.500024,
        lng: 127.036509,
        name: '강남 테헤란로 프라임 오피스 사옥',
        address: '서울 강남구 테헤란로 152 (역삼동 737)',
        district: '서울 강남구 역삼동'
    },

    // 6. [일반매물 103] 한남동 유엔빌리지 단독 고급주택 (서울 용산구 한남대로20길 1-120)
    '103': {
        lat: 37.534998,
        lng: 127.008640,
        name: '한남동 유엔빌리지 최고급 하이엔드 주택',
        address: '서울 용산구 한남대로20길 1-120',
        district: '서울 용산구 한남동'
    },
    'hannam-103': {
        lat: 37.534998,
        lng: 127.008640,
        name: '한남동 유엔빌리지 최고급 하이엔드 주택',
        address: '서울 용산구 한남대로20길 1-120',
        district: '서울 용산구 한남동'
    },

    // 7. [NPL 매물 201] 서초동 법조타운 근린상가 선순위 NPL (서울 서초구 서초중앙로 125)
    '201': {
        lat: 37.493009,
        lng: 127.013419,
        name: '서초 법조타운 근린상가 선순위 NPL',
        address: '서울 서초구 서초중앙로 125',
        district: '서울 서초구 서초동'
    },
    'seocho-201': {
        lat: 37.493009,
        lng: 127.013419,
        name: '서초 법조타운 근린상가 선순위 NPL',
        address: '서울 서초구 서초중앙로 125',
        district: '서울 서초구 서초동'
    },

    // 8. [NPL 매물 202] 제주 애월 해안도로 오션프론트 리조트 NPL (제주 제주시 애월읍 애월해안로 512)
    '202': {
        lat: 33.465500,
        lng: 126.319500,
        name: '제주 애월 해안도로 오션프론트 리조트 NPL',
        address: '제주특별자치도 제주시 애월읍 애월해안로 512',
        district: '제주 제주시 애월읍'
    },
    'jeju-202': {
        lat: 33.465500,
        lng: 126.319500,
        name: '제주 애월 해안도로 오션프론트 리조트 NPL',
        address: '제주특별자치도 제주시 애월읍 애월해안로 512',
        district: '제주 제주시 애월읍'
    },

    // 9. [경매 매물 1] 역삼동 테헤란로 이면 코너빌딩 (서울 강남구 테헤란로25길 20 / 역삼동 670-1)
    '1': {
        lat: 37.502120,
        lng: 127.038100,
        name: '역삼동 테헤란로 이면 코너빌딩 경매',
        address: '서울 강남구 테헤란로25길 20 (역삼동 670-1)',
        district: '서울 강남구 역삼동'
    },
    'auc-01': {
        lat: 37.502120,
        lng: 127.038100,
        name: '역삼동 테헤란로 이면 코너빌딩 경매',
        address: '서울 강남구 테헤란로25길 20 (역삼동 670-1)',
        district: '서울 강남구 역삼동'
    },

    // 10. [경매 매물 2] 판교테크노밸리 스마트오피스 2개층 (경기 성남시 분당구 판교역로 146 / 삼평동)
    '2': {
        lat: 37.400544,
        lng: 127.106839,
        name: '판교테크노밸리 스마트오피스 2개층 경매',
        address: '경기 성남시 분당구 판교역로 146',
        district: '경기 성남시 분당구 삼평동'
    },
    'pangyo-02': {
        lat: 37.400544,
        lng: 127.106839,
        name: '판교테크노밸리 스마트오피스 2개층 경매',
        address: '경기 성남시 분당구 판교역로 146',
        district: '경기 성남시 분당구 삼평동'
    },

    // 11. [경매 매물 3] 마린시티 오션프론트 초고층 펜트하우스 (부산 해운대구 마린시티2로 33 / 우동 1407 두산위브더제니스)
    '3': {
        lat: 35.157204,
        lng: 129.144817,
        name: '마린시티 오션프론트 초고층 펜트하우스',
        address: '부산 해운대구 마린시티2로 33 (우동 1407)',
        district: '해운대구 우동 (마린시티)'
    },
    'marine-03': {
        lat: 35.157204,
        lng: 129.144817,
        name: '마린시티 오션프론트 초고층 펜트하우스',
        address: '부산 해운대구 마린시티2로 33 (우동 1407)',
        district: '해운대구 우동 (마린시티)'
    },

    // 12. [경매 매물 5] 정자동 카페거리 1층 테라스 코너상가 (경기 성남시 분당구 정자일로 135)
    '5': {
        lat: 37.365410,
        lng: 127.107250,
        name: '정자동 카페거리 1층 테라스 코너상가',
        address: '경기 성남시 분당구 정자일로 135',
        district: '경기 성남시 분당구 정자동'
    },
    'jeongja-05': {
        lat: 37.365410,
        lng: 127.107250,
        name: '정자동 카페거리 1층 테라스 코너상가',
        address: '경기 성남시 분당구 정자일로 135',
        district: '경기 성남시 분당구 정자동'
    }
};

export const LANDMARK_PINPOINT_MAP = [
    // 1순위: 그랜드조선 부산 (중동 1405-16, 해운대해변로 292, 해수욕장 백사장) - 제니스와 철저히 분리
    { matchers: ['그랜드조선', '조선호텔', '해운대해변로 292', '중동 1405', '해운대 관광호텔'], coords: PROPERTY_MASTER_COORDINATES['exitwise-haeundae'] },

    // 2순위: 마린시티 두산위브더제니스 (우동 1407, 마린시티2로 33)
    { matchers: ['두산위브더제니스', '위브더제니스', '제니스', '마린시티2로 33', '우동 1407', '마린시티 펜트하우스'], coords: PROPERTY_MASTER_COORDINATES['exitwise-zenith-npl'] },

    // 3순위: 여의도 FKI타워 (전경련회관, 여의대로 24)
    { matchers: ['fki', '전경련', '여의대로 24', '여의도동 28-1', '여의도 오피스'], coords: PROPERTY_MASTER_COORDINATES['exitwise-fki'] },

    // 4순위: 양주시 남면 상수리 스마트 플랜트
    { matchers: ['상수리', '양주공장', '양주 스마트', '남면 상수리', '양주시 남면'], coords: PROPERTY_MASTER_COORDINATES['exitwise-yangju'] },

    // 5순위: 강남 테헤란로 프라임 사옥 (테헤란로 152 / 역삼동 737)
    { matchers: ['테헤란로 152', '테헤란로 프라임 오피스 사옥', '테헤란로 사옥'], coords: PROPERTY_MASTER_COORDINATES['102'] },

    // 6순위: 한남동 유엔빌리지 (한남대로20길 1-120)
    { matchers: ['유엔빌리지', '한남대로20길', '한남동 1-120', '한남동 단독'], coords: PROPERTY_MASTER_COORDINATES['103'] },

    // 7순위: 서초 법조타운 (서초중앙로 125)
    { matchers: ['서초중앙로 125', '서초동 법조', '서초 법조타운', '서초동 125'], coords: PROPERTY_MASTER_COORDINATES['201'] },

    // 8순위: 제주 애월 오션프론트 리조트 (애월해안로 512)
    { matchers: ['애월해안로 512', '애월 해안도로', '애월 리조트', '애월읍 애월해안로'], coords: PROPERTY_MASTER_COORDINATES['202'] },

    // 9순위: 역삼동 테헤란로 이면 코너빌딩 (테헤란로25길 20 / 역삼동 670-1)
    { matchers: ['테헤란로25길', '역삼동 670', '역삼동 테헤란로 이면 코너빌딩', '역삼동 코너빌딩'], coords: PROPERTY_MASTER_COORDINATES['1'] },

    // 10순위: 판교테크노밸리 (판교역로 146)
    { matchers: ['판교역로 146', '판교테크노밸리 스마트오피스', '판교 테크노', '판교역로'], coords: PROPERTY_MASTER_COORDINATES['2'] },

    // 11순위: 정자동 카페거리 테라스 상가 (정자일로 135)
    { matchers: ['정자일로 135', '정자동 카페거리', '정자일로', '정자동 상가'], coords: PROPERTY_MASTER_COORDINATES['5'] }
];

export function resolvePropertyCoordinates({ listingId, address, title, lat, lng }) {
    if (lat && lng && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng))) {
        return {
            lat: parseFloat(lat),
            lng: parseFloat(lng),
            source: 'props'
        };
    }

    const stringId = (listingId !== undefined && listingId !== null) ? String(listingId) : '';
    if (stringId && PROPERTY_MASTER_COORDINATES[stringId]) {
        const item = PROPERTY_MASTER_COORDINATES[stringId];
        return {
            lat: item.lat,
            lng: item.lng,
            name: item.name,
            source: 'listingId'
        };
    }

    const query = String((address || '') + ' ' + (title || '')).toLowerCase();

    for (const entry of LANDMARK_PINPOINT_MAP) {
        for (const m of entry.matchers) {
            if (query.includes(m.toLowerCase())) {
                return {
                    lat: entry.coords.lat,
                    lng: entry.coords.lng,
                    name: entry.coords.name,
                    source: 'landmark'
                };
            }
        }
    }

    return {
        lat: PROPERTY_MASTER_COORDINATES['exitwise-fki'].lat,
        lng: PROPERTY_MASTER_COORDINATES['exitwise-fki'].lng,
        name: PROPERTY_MASTER_COORDINATES['exitwise-fki'].name,
        source: 'default'
    };
}
