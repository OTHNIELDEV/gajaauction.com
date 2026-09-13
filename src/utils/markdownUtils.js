/**
 * markdownUtils.js
 * 마크다운 텍스트 정규화 및 백슬래시 이스케이프 해제(Unescape) 엔진
 * 
 * ExitWise AI / LLM에 의해 마크다운 충돌 방지용으로 자동 삽입된
 * 불필요한 백슬래시(\., \[, \], \(, \), \-, \_ 등)를 안전하게 정제합니다.
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

export default {
    unescapeMarkdown,
    sanitizeMarkdownContent
};
