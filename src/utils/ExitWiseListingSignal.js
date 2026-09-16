/**
 * ExitWise 에 가자에셋 매물 등록·삭제 사실을 알린다 (2026-09-16).
 *
 * 왜 필요한가:
 *   가자에셋 매물은 관리자 브라우저 localStorage 에만 저장된다. 그래서 여기서 매물을 지워도
 *   ExitWise 서버는 알 방법이 없고, ExitWise IM 화면의 「가자에셋 매물 올리기」 버튼은 계속
 *   「등록 완료」로 남는다. 등록·삭제 순간 이 페이지가 직접 ExitWise 에 신호를 보낸다.
 *
 *   listed  : ImportListingPage 가 ExitWise 에서 넘어온 IM 을 저장했다 → ExitWise 버튼 「등록 완료」
 *   removed : 관리자가 ExitWise 연동 매물을 삭제했다              → ExitWise 버튼 다시 「올리기」
 *
 * ⚠️ 반드시 https://www.exitwise.io 로 보낸다. exitwise.io(아펙스)는 www 로 307 리다이렉트되는데,
 *    JSON POST 의 CORS preflight 는 리다이렉트를 따라가지 못해 신호가 조용히 사라진다.
 *
 * 신호 실패는 가자에셋 동작을 막지 않는다(경고만 남긴다). 신호에는 비밀 정보가 없다.
 */

const EXITWISE_PROD_BASE = 'https://www.exitwise.io';
const EXITWISE_LOCAL_BASE = 'http://localhost:3000';
const EVENTS_PATH = '/api/gajaasset/listing-events';
const OPENER_MESSAGE_TYPE = 'GAJA_LISTING_EVENT';
// ExitWise 가 「올리기 클릭」 기록을 남기기 전에 등록 신호가 먼저 도착한 경우 한 번 더 보낸다.
const LISTED_RETRY_DELAY_MS = 2500;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isLocalHost() {
    const host = window.location.hostname;
    return host === 'localhost' || host === '127.0.0.1';
}

async function postEvent(event) {
    const base = isLocalHost() ? EXITWISE_LOCAL_BASE : EXITWISE_PROD_BASE;
    const res = await fetch(`${base}${EVENTS_PATH}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
        // 삭제 직후 페이지를 떠나도 신호가 끝까지 가도록
        keepalive: true,
    });
    if (!res.ok) throw new Error(`ExitWise 신호 실패 (HTTP ${res.status})`);
    return res.json();
}

// ExitWise 탭이 이 창을 열었다면 곧바로 다시 읽도록 알린다(서버 기록이 끝난 뒤에만).
function notifyOpener(event) {
    try {
        window.opener?.postMessage({ type: OPENER_MESSAGE_TYPE, ...event }, '*');
    } catch (err) {
        console.debug('[ExitWiseListingSignal] opener 알림 생략:', err?.message);
    }
}

export function signalExitwiseListed({ imDocumentId, listingId }) {
    if (!UUID_PATTERN.test(String(imDocumentId || ''))) return;
    const event = { type: 'listed', imDocumentId, listingId };

    const send = (isRetry) => postEvent(event)
        .then((json) => {
            if (json?.data?.updated === 0 && !isRetry) {
                setTimeout(() => send(true), LISTED_RETRY_DELAY_MS);
                return;
            }
            notifyOpener(event);
        })
        .catch((err) => console.warn('[ExitWiseListingSignal] 등록 신호 실패:', err?.message));

    send(false);
}

export function signalExitwiseRemoved(listing) {
    if (!listing) return;
    const rawDocId = String(listing.exitwiseData?.imDocumentId || '');
    const imDocumentId = UUID_PATTERN.test(rawDocId) ? rawDocId : undefined;
    const isLinked = Boolean(listing.isExitwiseLinked || imDocumentId);
    if (!isLinked) return;

    const event = { type: 'removed', imDocumentId, listingId: String(listing.id) };
    postEvent(event)
        .then(() => notifyOpener(event))
        .catch((err) => console.warn('[ExitWiseListingSignal] 삭제 신호 실패:', err?.message));
}
