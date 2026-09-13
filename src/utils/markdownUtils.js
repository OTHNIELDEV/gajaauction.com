/**
 * markdownUtils.js
 * 마크다운 텍스트 정규화, 백슬래시 이스케이프 해제(Unescape) 및 IM 지표 자동 역추출 엔진
 * 
 * ExitWise AI / LLM에 의해 마크다운 충돌 방지용으로 자동 삽입된
 * 불필요한 백슬래시(\., \[, \], \(, \), \-, \_ 등)를 안전하게 정제하고,
 * IM 전문 마크다운 본문으로부터 거래 지표, 제원, KPI, 시뮬레이션 데이터를 정확하게 파싱합니다.
 */

/**
 * 단일 문자열 내의 마크다운 백슬래시 이스케이프 문자를 해제합니다.
 * 예: "4\. 임대 현황" -> "4. 임대 현황"
 *     "\[출처: ...\]" -> "[출처: ...]"
 *     "\(NLA\)" -> "(NLA)"
 */
export function unescapeMarkdown(str) {
    if (!str || typeof str !== 'string') return str;

    return str
        // 1. 숫자 뒤의 이스케이프 마침표 (예: "4\. ", "1\. ")
        .replace(/(\d+)\\\./g, '$1.')
        // 2. 일반 마크다운 특수문자 이스케이프 해제 (.[ ] ( ) - * _ # : ! ~ " ' > + ` /)
        .replace(/\\([.[\]()\-*_#:!~"'>+`/])/g, '$1')
        // 3. 간혹 남아있는 단독 백슬래시 뒤 공백이나 한글/영문 앞 백슬래시 정리 (예: "\출처" -> "출처")
        .replace(/\\([가-힣a-zA-Z])/g, '$1');
}

/**
 * 전체 마크다운 문서에 대해 코드 블록(``` ... ```)은 원본 그대로 보존하면서,
 * 코드 블록 바깥의 본문 텍스트 라인들에 대해 백슬래시 이스케이프를 일괄 정규화합니다.
 */
export function sanitizeMarkdownContent(markdown) {
    if (!markdown || typeof markdown !== 'string') return markdown;

    const lines = markdown.split('\n');
    let inCodeBlock = false;
    const cleanedLines = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        // 코드 블록 토글 감지 (``` 시작/종료)
        if (trimmed.startsWith('```')) {
            inCodeBlock = !inCodeBlock;
            cleanedLines.push(line);
            continue;
        }

        if (inCodeBlock) {
            // 코드 블록(json, chart, map 등) 내부는 원본 코드 보존
            cleanedLines.push(line);
        } else {
            // 코드 블록 바깥의 일반 텍스트 라인은 이스케이프 문자 해제
            cleanedLines.push(unescapeMarkdown(line));
        }
    }

    return cleanedLines.join('\n');
}

/**
 * 한글 금액 문자열을 원 단위 숫자로 파싱 (예: "66억원" -> 6600000000, "1,850억" -> 185000000000)
 */
export function parseWonFromKorean(str) {
    if (!str) return 0;
    if (typeof str === 'number') return str;
    const cleanStr = String(str).replace(/,/g, '');
    let total = 0;

    const joMatch = cleanStr.match(/(\d+(?:\.\d+)?)\s*조/);
    if (joMatch) total += parseFloat(joMatch[1]) * 1000000000000;

    const eokMatch = cleanStr.match(/(\d+(?:\.\d+)?)\s*억/);
    if (eokMatch) total += parseFloat(eokMatch[1]) * 100000000;

    const manMatch = cleanStr.match(/(\d+(?:\.\d+)?)\s*만/);
    if (manMatch) total += parseFloat(manMatch[1]) * 10000;

    if (total === 0) {
        const numOnly = cleanStr.replace(/[^0-9.]/g, '');
        total = parseFloat(numOnly) || 0;
    }
    return total;
}

/**
 * 요약문 내에 포함된 ```kpi 또는 ```json 등 마크다운 코드 블록을 깨끗하게 분리/제거합니다.
 */
export function cleanExecutiveSummary(summaryText) {
    if (!summaryText || typeof summaryText !== 'string') return '';

    return summaryText
        // 1. ```kpi ... ``` 블록 통째로 제거
        .replace(/```kpi[\s\S]*?```/gi, '')
        // 2. ```json ... ``` 블록 통째로 제거
        .replace(/```(?:json|recharts|sensitivity)[\s\S]*?```/gi, '')
        // 3. 미완성되거나 잘린 ```kpi 블록 시작 부분 제거 (예: "```kpi {"items":[")
        .replace(/```kpi\b[\s\S]*/gi, '')
        // 4. [Executive Summary] 태그 접두사 제거
        .replace(/^\[Executive Summary\]\s*/i, '')
        // 5. 백슬래시 이스케이프 해제 및 공백 정돈
        .trim();
}

/**
 * IM 마크다운 본문으로부터 모든 정합 지표(매각가, Cap Rate, 보증금, 월세, 평당가, 제원, KPI, 시뮬레이션)를 자동 역추출합니다.
 */
export function extractMetricsFromIM(markdownContent, fallback = {}) {
    if (!markdownContent || typeof markdownContent !== 'string') {
        return {
            salePrice: fallback.salePrice || fallback.minPrice || '협의',
            roi: fallback.roi || fallback.exitwiseData?.capRate || '협의',
            deposit: fallback.deposit || '협의',
            monthlyRent: fallback.monthlyRent || '상담 문의',
            pricePerPyung: fallback.pricePerPyung || '시세 대비 우량',
            landArea: unescapeMarkdown(fallback.landArea || fallback.exitwiseData?.landArea || '실사 확인'),
            totalFloorArea: unescapeMarkdown(fallback.totalFloorArea || fallback.exitwiseData?.totalFloorArea || '실사 확인'),
            floors: unescapeMarkdown(fallback.floors || fallback.exitwiseData?.floors || '실사 확인'),
            parking: unescapeMarkdown(fallback.parking || fallback.exitwiseData?.parking || '자주식 완비'),
            executiveSummary: cleanExecutiveSummary(fallback.executiveSummary || fallback.exitwiseData?.executiveSummary || fallback.summary || ''),
            kpiRaw: null,
            kpiItems: null,
            sensitivityRaw: null,
            rechartsRaw: null
        };
    }

    const unescapedMd = sanitizeMarkdownContent(markdownContent);

    // 1. 희망 매각가 추출
    const priceMatch = unescapedMd.match(/(?:희망\s*매각가|희망\s*매매가|매각\s*희망가|매매\s*희망가|매각가|매매가)\s*[:：]\s*([^\n\r]+)/i);
    const rawSalePrice = priceMatch ? priceMatch[1].trim() : (fallback.salePrice || fallback.minPrice || '');
    const cleanSalePrice = unescapeMarkdown(rawSalePrice);
    const numPrice = parseWonFromKorean(cleanSalePrice) || parseWonFromKorean(fallback.salePrice) || 0;

    // 2. Cap Rate (목표 수익률) 추출
    const capMatch = unescapedMd.match(/(?:목표\s*수익률|Cap\s*Rate|연\s*예상\s*수익률|예상\s*수익률)\s*(?:\([^)]*\))?\s*[:：]\s*([^\n\r]+)/i);
    let cleanRoi = capMatch ? capMatch[1].trim() : (fallback.roi || fallback.exitwiseData?.capRate || '5.5%');
    cleanRoi = unescapeMarkdown(cleanRoi);
    const numCap = parseFloat(cleanRoi) || 5.5;

    // 3. 자산 상세 제원 추출
    const landMatch = unescapedMd.match(/(?:대지면적|대지\s*면적)\s*[:：]\s*([^\n\r]+)/i);
    const totalFloorMatch = unescapedMd.match(/(?:연면적|연\s*면적)\s*[:：]\s*([^\n\r]+)/i);
    const floorsMatch = unescapedMd.match(/(?:건축\s*규모|규모\s*\/\s*층수|건축규모|규모|층수)\s*[:：]\s*([^\n\r]+)/i);
    const parkingMatch = unescapedMd.match(/(?:주차\s*대수|주차대수|주차)\s*[:：]\s*([^\n\r]+)/i);

    const cleanLandArea = unescapeMarkdown(landMatch ? landMatch[1].trim() : (fallback.landArea || fallback.exitwiseData?.landArea || '실사 확인'));
    const cleanTotalFloorArea = unescapeMarkdown(totalFloorMatch ? totalFloorMatch[1].trim() : (fallback.totalFloorArea || fallback.exitwiseData?.totalFloorArea || '실사 확인'));
    const cleanFloors = unescapeMarkdown(floorsMatch ? floorsMatch[1].trim() : (fallback.floors || fallback.exitwiseData?.floors || '실사 확인'));
    const cleanParking = unescapeMarkdown(parkingMatch ? parkingMatch[1].trim() : (fallback.parking || fallback.exitwiseData?.parking || '자주식 완비'));

    // 4. 임대 보증금 및 월 임대료 추출 또는 현실적 산출
    const depositMatch = unescapedMd.match(/(?:임대\s*보증금|보증금\s*총액|보증금)\s*[:：]\s*([^\n\r]+)/i);
    const rentMatch = unescapedMd.match(/(?:월\s*임대료|월\s*임대수입|월세|월수입)\s*[:：]\s*([^\n\r]+)/i);

    let cleanDeposit = depositMatch ? unescapeMarkdown(depositMatch[1].trim()) : null;
    let cleanMonthlyRent = rentMatch ? unescapeMarkdown(rentMatch[1].trim()) : null;

    // 기존 데이터의 비정상 더미 데이터(예: 66억 건물에 30억 보증금, 8.5억 월세) 감지 및 정합
    const isDepositAbsurd = cleanDeposit
        ? (numPrice > 0 && parseWonFromKorean(cleanDeposit) > numPrice * 0.4)
        : (fallback.deposit && numPrice > 0 && parseWonFromKorean(fallback.deposit) > numPrice * 0.4);

    const isRentAbsurd = cleanMonthlyRent
        ? (numPrice > 0 && parseWonFromKorean(cleanMonthlyRent) * 12 > numPrice * 0.25)
        : (fallback.monthlyRent && numPrice > 0 && parseWonFromKorean(fallback.monthlyRent) * 12 > numPrice * 0.25);

    // 연간 NOI 및 월 임대료 합리적 산출 (Cap Rate 기준)
    const annualNoiWon = numPrice > 0 ? numPrice * (numCap / 100) : 0;
    const monthlyRentWon = annualNoiWon > 0 ? Math.round(annualNoiWon / 12) : 0;

    if (!cleanDeposit || isDepositAbsurd) {
        if (numPrice > 0) {
            // 상업용 부동산 통상 보증금: 매매가의 약 5% 수준
            const estDepositWon = Math.round((numPrice * 0.05) / 10000000) * 10000000;
            const estDepositEok = Math.round((estDepositWon / 100000000) * 10) / 10;
            cleanDeposit = estDepositEok >= 1 ? `약 ${estDepositEok}억` : `약 ${Math.round(estDepositWon / 10000).toLocaleString('ko-KR')}만`;
        } else {
            cleanDeposit = fallback.deposit && !isDepositAbsurd ? fallback.deposit : '협의 (실사 확인)';
        }
    }

    if (!cleanMonthlyRent || isRentAbsurd) {
        if (monthlyRentWon > 0) {
            cleanMonthlyRent = monthlyRentWon >= 100000000
                ? `${(monthlyRentWon / 100000000).toFixed(1)}억`
                : `${Math.round(monthlyRentWon / 10000).toLocaleString('ko-KR')}만`;
        } else {
            cleanMonthlyRent = fallback.monthlyRent && !isRentAbsurd ? fallback.monthlyRent : '직접 운영 / 협의';
        }
    }

    // 5. 평당가 산출 또는 추출
    const pyungMatch = unescapedMd.match(/(?:평당가|평당\s*매매가|3\.3㎡당\s*가격)\s*[:：]\s*([^\n\r]+)/i);
    let cleanPricePerPyung = pyungMatch ? unescapeMarkdown(pyungMatch[1].trim()) : null;

    // 대지면적 또는 연면적에서 평수 추출
    const landPyungMatch = cleanLandArea.match(/(?:약\s*)?(\d+(?:\.\d+)?)\s*평/);
    const floorPyungMatch = cleanTotalFloorArea.match(/(?:약\s*)?(\d+(?:\.\d+)?)\s*평/);

    const landPyung = landPyungMatch ? parseFloat(landPyungMatch[1]) : 0;
    const floorPyung = floorPyungMatch ? parseFloat(floorPyungMatch[1]) : 0;

    // 평당가 비정상 검사 (예: 66억 건물에 1억 4,700만 해운대 호텔 평당가 들어간 경우)
    const isPyungAbsurd = !cleanPricePerPyung && fallback.pricePerPyung && (
        (landPyung > 0 && Math.abs(parseWonFromKorean(fallback.pricePerPyung) - (numPrice / landPyung)) > 40000000) ||
        (floorPyung > 0 && Math.abs(parseWonFromKorean(fallback.pricePerPyung) - (numPrice / floorPyung)) > 40000000)
    );

    if (!cleanPricePerPyung || isPyungAbsurd) {
        if (numPrice > 0 && landPyung > 0) {
            const wonPerPyung = Math.round((numPrice / landPyung) / 100000) * 100000;
            const manWon = Math.round(wonPerPyung / 10000);
            cleanPricePerPyung = `${manWon.toLocaleString('ko-KR')}만`;
        } else if (numPrice > 0 && floorPyung > 0) {
            const wonPerPyung = Math.round((numPrice / floorPyung) / 100000) * 100000;
            const manWon = Math.round(wonPerPyung / 10000);
            cleanPricePerPyung = `${manWon.toLocaleString('ko-KR')}만`;
        } else {
            cleanPricePerPyung = fallback.pricePerPyung && !isPyungAbsurd ? fallback.pricePerPyung : '시세 대비 우량';
        }
    }

    // 6. KPI 블록 및 요약문 추출
    let kpiRaw = null;
    let kpiItems = null;

    // 본문 전체 또는 executiveSummary 내에서 ```kpi 감지
    const kpiBlockMatch = markdownContent.match(/```kpi\s*\n([\s\S]*?)\n```/i);
    if (kpiBlockMatch) {
        kpiRaw = kpiBlockMatch[1].trim();
        try {
            const parsed = JSON.parse(kpiRaw);
            kpiItems = Array.isArray(parsed) ? parsed : (parsed.items || null);
        } catch (e) {
            // json 파싱 실패 시 fallback
        }
    }

    // 요약문 추출 및 깨진 코드블록 정제
    let summaryText = '';
    const execSummaryMatch = unescapedMd.match(/\[Executive Summary\]\s*([^\n\r]+(?:\n(?![#\-\*`])[^\n\r]+)*)/i);
    if (execSummaryMatch) {
        summaryText = execSummaryMatch[1].trim();
    } else {
        summaryText = fallback.executiveSummary || fallback.exitwiseData?.executiveSummary || fallback.summary || '';
    }

    // 혹시 요약문 내에 ```kpi 가 포함되어 있었다면 kpiRaw 추출 보충
    if (!kpiRaw && summaryText.includes('```kpi')) {
        const innerKpiMatch = summaryText.match(/```kpi\s*([\s\S]*?)(?:```|$)/i);
        if (innerKpiMatch) {
            kpiRaw = innerKpiMatch[1].trim();
            try {
                const parsed = JSON.parse(kpiRaw);
                kpiItems = Array.isArray(parsed) ? parsed : (parsed.items || null);
            } catch (e) {}
        }
    }

    const cleanSummary = cleanExecutiveSummary(summaryText);

    // 7. Sensitivity 및 Recharts 블록 추출
    const sensitivityMatch = markdownContent.match(/```sensitivity\s*\n([\s\S]*?)\n```/i);
    const sensitivityRaw = sensitivityMatch ? sensitivityMatch[1].trim() : null;

    const rechartsMatch = markdownContent.match(/```recharts\s*\n([\s\S]*?)\n```/i);
    const rechartsRaw = rechartsMatch ? rechartsMatch[1].trim() : null;

    const kakaoMapMatch = markdownContent.match(/```kakao-map\s*\n([\s\S]*?)\n```/i);
    const kakaoMapRaw = kakaoMapMatch ? kakaoMapMatch[1].trim() : null;

    return {
        salePrice: cleanSalePrice,
        roi: cleanRoi,
        deposit: cleanDeposit,
        monthlyRent: cleanMonthlyRent,
        pricePerPyung: cleanPricePerPyung,
        landArea: cleanLandArea,
        totalFloorArea: cleanTotalFloorArea,
        floors: cleanFloors,
        parking: cleanParking,
        executiveSummary: cleanSummary,
        kpiRaw,
        kpiItems,
        sensitivityRaw,
        rechartsRaw,
        kakaoMapRaw,
        numPrice,
        annualNoiWon
    };
}

export default {
    unescapeMarkdown,
    sanitizeMarkdownContent,
    parseWonFromKorean,
    cleanExecutiveSummary,
    extractMetricsFromIM
};

