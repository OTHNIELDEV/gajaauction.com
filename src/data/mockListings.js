import gangnamImg from '../assets/images/gangnam.png';
import pangyoImg from '../assets/images/pangyo.png';
import busanImg from '../assets/images/busan.png';

export const mockListings = [
    // [ExitWise 연동] 일반매물 1 - 해운대 그랜드조선 호텔 (첨부 스크린샷 연동 자산)
    {
        id: 'exitwise-haeundae',
        type: 'general', // 'auction' | 'general' | 'npl'
        img: busanImg,
        location: "부산 해운대구 우동",
        title: "해운대 그랜드조선 부산 관광호텔 자산 매각",
        category: "호텔",
        salePrice: "1,850억",
        deposit: "30억",
        monthlyRent: "8.5억",
        roi: "5.8%",
        pricePerPyung: "1억 4,700만",
        status: "Active",
        tags: ["ExitWise 연동", "특급호텔", "오션뷰", "수익률 5.8%↑"],
        isExitwiseLinked: true,
        exitwiseData: {
            imDocumentId: "cda6733f-78b1-4a42-b7ae-3a9b1c1bc606",
            imDocNumber: "IM-2026-EW-BUSAN-09",
            imTitle: "해운대 그랜드조선 부산 관광호텔 자산 매각 IM (Information Memorandum)",
            imDate: "2026-09-09",
            assetName: "그랜드조선 부산 (Grand Josun Busan)",
            assetClass: "특급 관광호텔 (5-Star Luxury Resort)",
            rooms: "330실",
            landArea: "4,158.4㎡ (1,257.9평)",
            totalFloorArea: "36,837.2㎡ (11,143.2평)",
            floors: "지하 6층 / 지상 16층",
            capRate: "5.8% (정상화 기준 6.3% 예상)",
            parking: "240대 (자주식 180대, 기계식 60대)",
            structure: "철골철근콘크리트구조 (SRC)",
            completionYear: "2020년 전면 리뉴얼 오픈",
            keyMetrics: {
                occ: "78.4%",
                occDelta: "+6.2%p (YoY)",
                adr: "285,000원",
                revpar: "223,440원",
                annualRevenue: "485.6억원",
                ebitda: "107.3억원",
                ebitdaMargin: "22.1%"
            },
            financials: [
                { year: "2023년 (실적)", revenue: "412.5억", roomRev: "235.0억", fbRev: "142.5억", otherRev: "35.0억", ebitda: "82.4억", margin: "20.0%" },
                { year: "2024년 (실적)", revenue: "451.8억", roomRev: "258.4억", fbRev: "156.2억", otherRev: "37.2억", ebitda: "96.5억", margin: "21.4%" },
                { year: "2025년 (실적)", revenue: "485.6억", roomRev: "280.1억", fbRev: "165.0억", otherRev: "40.5억", ebitda: "107.3억", margin: "22.1%" },
                { year: "2026년 (추정)", revenue: "520.0억", roomRev: "305.0억", fbRev: "172.0억", otherRev: "43.0억", ebitda: "119.6억", margin: "23.0%" }
            ],
            highlights: [
                {
                    title: "해운대 1선 오션프론트 영구조망 독점 입지",
                    desc: "해운대 백사장과 직접 연결되는 도보 0분 입지로, 희소가치가 극대화된 대한민국 1순위 해양 리조트 자산입니다."
                },
                {
                    title: "신세계 조선호텔앤리조트 브랜드 파워 & 안정적 캐시카우",
                    desc: "국내 최정상급 호텔 오퍼레이터의 위탁 운영 노하우와 멤버십 네트워크를 바탕으로 비수기 없는 견고한 객실 점유율(OCC 78%)을 확보했습니다."
                },
                {
                    title: "저층부 F&B 및 웰니스 복합 리뉴얼 밸류애드(Value-Add) 잠재력",
                    desc: "지하 및 저층부 상업시설의 하이엔드 다이닝 유치와 인피니티풀·스파 시설 리뉴얼을 통해 Cap Rate 6.3% 이상으로 즉각 상승시킬 수 있는 업사이드 잠재력을 보유합니다."
                },
                {
                    title: "부산 MICE 및 인바운드 외국인 관광객 폭발적 증가 수혜",
                    desc: "벡스코(BEXCO) 국제행사 및 김해신공항 확장, 외국인 VIP 관광객 증가로 ADR(객실 단가) 지속적 상향 여력이 충분합니다."
                }
            ],
            floorPlan: [
                { floor: "16F", use: "루프탑 인피니티풀 (온수풀), 풀사이드 라운지 & 바", note: "오션뷰 파노라마" },
                { floor: "6F ~ 15F", use: "프리미엄 객실 (총 330실)", note: "디럭스 180실, 프리미어 100실, 스위트 50실" },
                { floor: "4F ~ 5F", use: "피트니스 클럽, 실내 수영장, 사우나 & 스파, 키즈존", note: "투숙객 전용 웰니스" },
                { floor: "2F ~ 3F", use: "프리미엄 뷔페 '아리아', 중식 파인다이닝 '팔레드신', 대/중 연회장", note: "F&B 연간 165억 매출" },
                { floor: "1F", use: "메인 로비, 프런트 데스크, 라운지&바, '조선델리' 베이커리", note: "해변 직접 연결 로비" },
                { floor: "B1F ~ B6F", use: "지하 주차장 (240대 완비), 기계실, 전기실, 세탁/지원시설", note: "자주식 180대 / 기계식 60대" }
            ],
            riskWarning: "본 IM에 포함된 모든 정보는 투자 의사결정의 참고 자료로만 활용되어야 하며, 투자 권유 또는 확정적 수익을 보장하지 않습니다. 호텔 및 실물자산 투자에는 운영 리스크 및 원금 손실 리스크가 수반되며, 최종 투자 결정은 투자자 본인의 책임 하에 이루어져야 합니다. 본 문서는 투자·법률·세무 자문이 아닌 의사결정 보조 자료이며, 매각·인수 검토 전 반드시 매도인 측 실사 자료 확보 및 전문 감정평가를 진행하시기 바랍니다.",
            executiveSummary: "해운대 백사장 바로 앞에 위치한 5성급 럭셔리 관광호텔로 안정적인 객실 점유율(OCC 78%)과 식음(F&B) 매출을 보유하고 있으며, 향후 브랜드 리뉴얼 및 웰니스 복합 리조트 확장 가능성이 높은 국내 최정상급 밸류애드 호텔 자산입니다.",
            validationStatus: "검증 완료 (오류 0, 주의 2, 확인 4)"
        }
    },
    // 일반매물 2 - 강남 테헤란로 오피스 빌딩
    {
        id: 102,
        type: 'general',
        img: gangnamImg,
        location: "서울 강남구 역삼동",
        title: "테헤란로 프라임 오피스 사옥 매매",
        category: "오피스빌딩",
        salePrice: "620억",
        deposit: "25억",
        monthlyRent: "2.7억",
        roi: "5.4%",
        pricePerPyung: "1억 6,500만",
        status: "Active",
        tags: ["일반매물", "오피스빌딩", "강남권", "사옥추천"],
        specs: {
            landArea: "925.6㎡ (280평)",
            totalFloorArea: "7,933㎡ (2,400평)",
            floors: "지하 3층 / 지상 14층"
        }
    },
    // 일반매물 3 - 한남동 고급 하이엔드 주택
    {
        id: 103,
        type: 'general',
        img: pangyoImg,
        location: "서울 용산구 한남동",
        title: "유엔빌리지 단독 고급주택 매매",
        category: "아파트/주택",
        salePrice: "195억",
        deposit: "10억",
        monthlyRent: "4,500만",
        roi: "3.2%",
        pricePerPyung: "1억 8,000만",
        status: "Active",
        tags: ["일반매물", "유엔빌리지", "한강조망", "최고급보안"],
        specs: {
            landArea: "660㎡ (200평)",
            totalFloorArea: "826㎡ (250평)",
            floors: "지하 1층 / 지상 3층"
        }
    },
    // NPL 매물 1 - 서초동 법조타운 근생 선순위 NPL
    {
        id: 201,
        type: 'npl',
        img: gangnamImg,
        location: "서울 서초구 서초동",
        title: "서초동 법조타운 근린상가 선순위 NPL",
        category: "상가",
        opb: "120억",
        claimMax: "156억",
        nplTargetPrice: "95억",
        collateralValue: "145억",
        rate: "61%",
        expectedDividend: "118억 (수익률 24%↑)",
        status: "Active",
        tags: ["NPL", "선순위채권", "담보가치우수", "법조타운"]
    },
    // NPL 매물 2 - 제주 애월 오션프론트 풀빌라 부지 NPL
    {
        id: 202,
        type: 'npl',
        img: busanImg,
        location: "제주 제주시 애월읍",
        title: "애월 해안도로 오션프론트 리조트 NPL",
        category: "토지",
        opb: "48억",
        claimMax: "62.4억",
        nplTargetPrice: "36억",
        collateralValue: "58억",
        rate: "58%",
        expectedDividend: "49억 (수익률 36%↑)",
        status: "Active",
        tags: ["NPL", "토지/개발", "오션뷰", "개발호재"]
    },
    // 경매 매물 1 - 역삼동 고급 빌딩
    {
        id: 1,
        type: 'auction',
        img: gangnamImg,
        location: "서울 강남구 역삼동",
        title: "역삼동 테헤란로 이면 코너빌딩 경매",
        appraisal: "150억",
        minPrice: "105억",
        rate: "70%",
        category: "오피스빌딩",
        caseNumber: "2025타경10482",
        auctionDate: "2026-10-22",
        court: "서울중앙지방법원",
        status: "Active",
        tags: ["경매", "오피스빌딩", "강남권", "유찰1회"]
    },
    // 경매 매물 2 - 경기 판교 IT 밸리 오피스
    {
        id: 2,
        type: 'auction',
        img: pangyoImg,
        location: "경기 성남시 판교",
        title: "판교테크노밸리 스마트오피스 2개층 경매",
        appraisal: "28억",
        minPrice: "19.6억",
        rate: "70%",
        category: "오피스빌딩",
        caseNumber: "2025타경4821",
        auctionDate: "2026-11-04",
        court: "수원지방법원 성남지원",
        status: "Active",
        tags: ["경매", "오피스빌딩", "판교밸리", "임대수익"]
    },
    // 경매 매물 3 - 부산 해운대 펜트하우스
    {
        id: 3,
        type: 'auction',
        img: busanImg,
        location: "부산 해운대구 마린시티",
        title: "마린시티 오션프론트 초고층 펜트하우스",
        appraisal: "45억",
        minPrice: "31.5억",
        rate: "70%",
        category: "아파트/주택",
        caseNumber: "2025타경8832",
        auctionDate: "2026-10-18",
        court: "부산지방법원 동부지원",
        status: "Active",
        tags: ["경매", "마린시티", "오션뷰", "초고층"]
    },
    // 경매 매물 4 - 분당 정자동 카페거리 상가
    {
        id: 5,
        type: 'auction',
        img: pangyoImg,
        location: "경기 성남시 분당구",
        title: "정자동 카페거리 1층 테라스 코너상가",
        appraisal: "18억",
        minPrice: "12.6억",
        rate: "70%",
        category: "상가",
        caseNumber: "2025타경1943",
        auctionDate: "2026-10-29",
        court: "수원지방법원 성남지원",
        status: "Active",
        tags: ["경매", "정자동", "1층상가", "임대완료"]
    }
];

export const transactionTypes = [
    { key: 'all', label: '전체' },
    { key: 'general', label: '일반매물' },
    { key: 'npl', label: 'NPL' },
    { key: 'auction', label: '경매' }
];

export const filterCategories = [
    "전체",
    "오피스빌딩",
    "호텔",
    "상가",
    "토지",
    "아파트/주택"
];
