import DataManager from './DataManager';

/**
 * ExitWiseSyncManager
 * ExitWise AI 플랫폼 ↔ 가자에셋(gajaasset.com) 실시간 양방향 동기화 엔진
 * 
 * 1. BroadcastChannel('gajaasset_im_sync') 리스너: ExitWise 에디터/채팅창에서 발생한 즉시 갱신 신호 수신
 * 2. Cross-Window postMessage 리스너: 새 창 연동 핸드셰이크 수신
 * 3. Background SWR: 매물 상세 페이지 진입 시 백그라운드에서 ExitWise의 최신 IM 마크다운/제원 조회 및 자가 갱신
 */

const SYNC_CHANNEL_NAME = 'gajaasset_im_sync';
const EXITWISE_API_BASE = 'https://exitwise.io';

class ExitWiseSyncManagerClass {
    constructor() {
        this.subscribers = new Set();
        this.channel = null;
        this.isInitialized = false;
        this.syncCache = new Map(); // imDocumentId -> lastFetchTime
        this.init();
    }

    init() {
        if (typeof window === 'undefined' || this.isInitialized) return;
        this.isInitialized = true;

        // 1. BroadcastChannel 리스너 (브라우저 탭/창 간 실시간 통신)
        if ('BroadcastChannel' in window) {
            try {
                this.channel = new BroadcastChannel(SYNC_CHANNEL_NAME);
                this.channel.onmessage = (event) => {
                    this.handleSyncMessage(event.data);
                };
            } catch (e) {
                console.warn('[ExitWiseSyncManager] BroadcastChannel not supported or error:', e);
            }
        }

        // 2. window.postMessage 리스너 (opener / iframe / cross-origin 통신)
        window.addEventListener('message', (event) => {
            const data = event.data;
            if (!data) return;
            if (data.type === 'IM_DOCUMENT_UPDATED' || data.type === 'GAJA_IMPORT_DATA') {
                this.handleSyncMessage(data);
            }
        });

        // 3. window storage 이벤트 리스너 (동일 도메인 다른 탭의 localStorage 변경 감지)
        window.addEventListener('storage', (event) => {
            if (event.key === 'gaja_listings' && event.newValue) {
                this.notifySubscribers({
                    type: 'STORAGE_UPDATED',
                    timestamp: Date.now()
                });
            }
        });
    }

    handleSyncMessage(data) {
        if (!data) return;
        const payload = data.payload || data;
        const docId = data.documentId || payload?.imDocumentId || payload?.id;

        if (!docId) return;

        console.log('[ExitWiseSyncManager] Received real-time sync event for:', docId);

        // DataManager에 업데이트 반영
        const updated = DataManager.updateListingFromExitwise(docId, payload);

        // 구독자들에게 브로드캐스트
        this.notifySubscribers({
            type: 'IM_DOCUMENT_UPDATED',
            documentId: docId,
            listing: updated,
            timestamp: Date.now()
        });
    }

    subscribe(callback) {
        if (typeof callback === 'function') {
            this.subscribers.add(callback);
        }
        return () => {
            this.subscribers.delete(callback);
        };
    }

    notifySubscribers(eventData) {
        this.subscribers.forEach((cb) => {
            try {
                cb(eventData);
            } catch (err) {
                console.error('[ExitWiseSyncManager] Subscriber error:', err);
            }
        });
    }

    /**
     * ExitWise API로부터 해당 매물의 최신 IM 데이터 실시간 폴링/조회 (Background SWR)
     */
    async syncWithExitwise(imDocumentId) {
        if (!imDocumentId) return null;

        // 동일 문서에 대해 10초 이내 중복 fetch 방지 (스로틀링)
        const lastSync = this.syncCache.get(imDocumentId);
        const now = Date.now();
        if (lastSync && now - lastSync < 10000) {
            return null;
        }
        this.syncCache.set(imDocumentId, now);

        try {
            const endpoint = `${EXITWISE_API_BASE}/api/gajaasset/sync/${imDocumentId}`;
            const res = await fetch(endpoint, {
                method: 'GET',
                headers: { 'Accept': 'application/json' },
                cache: 'no-store'
            });

            if (!res.ok) {
                // 아직 공개 배포 전이거나 없는 문서인 경우 무음 종료
                return null;
            }

            const json = await res.json();
            if (json.success && json.data) {
                const freshDoc = json.data;
                const updatedListing = DataManager.updateListingFromExitwise(imDocumentId, {
                    markdownContent: freshDoc.markdownContent,
                    htmlContent: freshDoc.htmlContent,
                    mediaAssets: freshDoc.mediaAssets,
                    title: freshDoc.title,
                    updatedAt: freshDoc.updatedAt,
                });

                if (updatedListing) {
                    this.notifySubscribers({
                        type: 'LIVE_REVALIDATION_SUCCESS',
                        documentId: imDocumentId,
                        listing: updatedListing,
                        timestamp: now
                    });
                }
                return updatedListing;
            }
        } catch (error) {
            // 네트워크 오류 시 로컬 캐시 유지 및 무음 폴백
            console.debug('[ExitWiseSyncManager] Background sync skipped:', error?.message);
        }
        return null;
    }
}

const ExitWiseSyncManager = new ExitWiseSyncManagerClass();
export default ExitWiseSyncManager;
