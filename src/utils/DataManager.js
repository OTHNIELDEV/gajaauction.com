import { mockListings } from '../data/mockListings';
import { partners } from '../data/partners';

const STORAGE_KEYS = {
    LISTINGS: 'gaja_listings',
    PARTNERS: 'gaja_partners',
    INQUIRIES: 'gaja_inquiries',
    VIPS: 'gaja_vips'
};

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
                    // Check if it's an array for list-based keys
                    if (Array.isArray(seedData) && !Array.isArray(parsed)) {
                        isValid = false;
                    } else {
                        isValid = true;
                        // Special check for listings: ensure new mock items like exitwise-haeundae exist & have latest data
                        if (key === STORAGE_KEYS.LISTINGS && Array.isArray(parsed)) {
                            const exitwiseIdx = parsed.findIndex(item => item.id === 'exitwise-haeundae');
                            const mockExitwise = seedData.find(item => item.id === 'exitwise-haeundae');
                            
                            // If exitwise doesn't exist or is missing new metrics, update it
                            if (exitwiseIdx === -1 || !parsed[exitwiseIdx].exitwiseData?.keyMetrics) {
                                if (exitwiseIdx >= 0 && mockExitwise) {
                                    parsed[exitwiseIdx] = { ...parsed[exitwiseIdx], ...mockExitwise };
                                } else if (mockExitwise) {
                                    parsed.unshift(mockExitwise);
                                }
                                localStorage.setItem(key, JSON.stringify(parsed));
                                return;
                            }
                            
                            const hasNpl = parsed.some(item => item.type === 'npl');
                            if (!hasNpl) {
                                const userCreated = parsed.filter(item => typeof item.id === 'number' && item.id > 1000000000000);
                                const updatedListings = [...seedData, ...userCreated];
                                localStorage.setItem(key, JSON.stringify(updatedListings));
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
            }
        };

        checkAndSeed(STORAGE_KEYS.LISTINGS, mockListings);
        checkAndSeed(STORAGE_KEYS.PARTNERS, partners);

        // Inquiries Seed
        const dummyInquiries = [
            { id: 1, name: '홍길동', phone: '010-1234-5678', interest: 'NPL', budget: '1b-5b', status: 'New', date: '2026-02-06' },
            { id: 2, name: '김철수', phone: '010-9876-5432', interest: 'Auction', budget: '>5b', status: 'Contacted', date: '2026-02-05' }
        ];
        checkAndSeed(STORAGE_KEYS.INQUIRIES, dummyInquiries);

        // VIPs Seed
        const dummyVIPs = [
            { id: 1, name: '최회장', phone: '010-9999-8888', grade: 'Black', notes: 'VIP 투자자', joinedDate: '2025-01-01' },
            { id: 2, name: '이대표', phone: '010-7777-6666', grade: 'Platinum', notes: '빌딩 매입 관심', joinedDate: '2025-02-10' }
        ];
        checkAndSeed(STORAGE_KEYS.VIPS, dummyVIPs);
    },

    // --- Listings ---
    getListings: () => {
        return DataManager._safeGet(STORAGE_KEYS.LISTINGS, mockListings);
    },
    getListingById: (id) => {
        const listings = DataManager.getListings();
        return listings.find(item => String(item.id) === String(id));
    },
    saveListing: (listing) => {
        const listings = DataManager.getListings();
        const index = listings.findIndex(item => String(item.id) === String(listing.id));

        if (!listing.img) listing.img = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop&q=60';

        if (index >= 0) {
            listings[index] = { ...listings[index], ...listing };
        } else {
            listings.unshift(listing);
        }
        localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(listings));
        return listings;
    },
    importFromExitwise: (imData) => {
        const category = imData.category || (imData.assetName?.includes('호텔') ? '호텔' : '오피스빌딩');
        const isHotel = category.includes('호텔') || category.includes('숙박');
        const defaultImg = isHotel
            ? 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80'
            : 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80';

        const newListing = {
            id: imData.id || `exitwise-${Date.now()}`,
            type: imData.type || (category === 'NPL' ? 'npl' : 'general'),
            title: imData.title || imData.imTitle || `${imData.assetName || '자산'} 매각 IM`,
            location: imData.location || (isHotel ? '부산 해운대구 우동' : '서울 영등포구 여의대로 24'),
            category: category,
            salePrice: imData.salePrice || imData.targetPrice || (isHotel ? '1,850억' : '2,850억'),
            minPrice: imData.salePrice || imData.targetPrice || (isHotel ? '1,850억' : '2,850억'),
            deposit: imData.deposit || '30억',
            monthlyRent: imData.monthlyRent || '8.5억',
            roi: imData.roi || '5.8%',
            pricePerPyung: imData.pricePerPyung || (isHotel ? '1억 4,700만' : '3,800만'),
            status: 'Active',
            img: imData.img || defaultImg,
            tags: ['ExitWise 연동', category, '투자분석완료'],
            isExitwiseLinked: true,
            exitwiseData: {
                imDocumentId: imData.imDocumentId || `doc-${Date.now()}`,
                imTitle: imData.imTitle || imData.title,
                imDate: imData.imDate || new Date().toISOString().slice(0, 10),
                assetName: imData.assetName || imData.title,
                category: category,
                location: imData.location,
                salePrice: imData.salePrice || imData.targetPrice,
                capRate: imData.roi || '5.8%',
                rooms: isHotel ? (imData.rooms || '330실') : undefined,
                parking: imData.parking || (isHotel ? '240대 (자주식 180대)' : '총 450대 (자주식 380대)'),
                landArea: imData.landArea || (isHotel ? '4,158.4㎡ (1,257.9평)' : '3,305.8㎡ (1,000평)'),
                totalFloorArea: imData.totalFloorArea || (isHotel ? '36,837.2㎡ (11,143.2평)' : '52,890.0㎡ (16,000평)'),
                floors: imData.floors || (isHotel ? '지하 6층 / 지상 16층' : '지하 7층 / 지상 50층'),
                riskWarning: imData.riskWarning || '본 IM에 포함된 모든 정보는 투자 의사결정의 참고 자료로만 활용되어야 합니다.',
                executiveSummary: imData.executiveSummary || `${imData.assetName || '해당'} 자산에 대한 ExitWise AI 종합 출구전략 및 매각 인텔리전스 IM 리포트입니다.`,
                markdownContent: imData.markdownContent || '',
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
        return listings;
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
