import gangnamImg from '../assets/images/gangnam.png';
import pangyoImg from '../assets/images/pangyo.png';
import busanImg from '../assets/images/busan.png';

export const mockListings = [
    {
        id: 1,
        img: gangnamImg,
        location: "서울 강남",
        title: "역삼동 고급 빌딩 경매",
        appraisal: "150억",
        minPrice: "105억",
        rate: "70%",
        category: "빌딩/오피스",
        tags: ["강남권", "수익률 20%↑"]
    },
    {
        id: 2,
        img: pangyoImg,
        location: "경기 판교",
        title: "IT 밸리 오피스 전용",
        appraisal: "28억",
        minPrice: "19.6억",
        rate: "70%",
        category: "빌딩/오피스",
        tags: ["판교", "안전 자산"]
    },
    {
        id: 3,
        img: busanImg,
        location: "부산 해운대",
        title: "오션뷰 펜트하우스",
        appraisal: "45억",
        minPrice: "31.5억",
        rate: "70%",
        category: "아파트/주택",
        tags: ["오션뷰", "하이엔드"]
    },
    {
        id: 4,
        img: gangnamImg,
        location: "서울 서초",
        title: "서초동 법조타운 상가",
        appraisal: "12억",
        minPrice: "7.2억",
        rate: "60%",
        category: "상가",
        tags: ["강남권", "수익률 20%↑", "NPL"]
    },
    {
        id: 5,
        img: pangyoImg,
        location: "경기 분당",
        title: "정자동 카페거리 상가",
        appraisal: "18억",
        minPrice: "12.6억",
        rate: "70%",
        category: "상가",
        tags: ["핫플레이스", "임대수익"]
    },
    {
        id: 6,
        img: busanImg,
        location: "제주 애월",
        title: "오션프론트 풀빌라 부지",
        appraisal: "8억",
        minPrice: "4.8억",
        rate: "60%",
        category: "토지",
        tags: ["오션뷰", "개발호재", "NPL"]
    }
];

export const filterCategories = ["전체", "빌딩/오피스", "아파트/주택", "상가", "토지", "NPL"];
