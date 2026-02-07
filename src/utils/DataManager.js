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
        return listings.find(item => item.id == id);
    },
    saveListing: (listing) => {
        const listings = DataManager.getListings();
        const index = listings.findIndex(item => item.id === listing.id);

        if (!listing.img) listing.img = 'https://via.placeholder.com/400x300?text=No+Image';

        if (index >= 0) {
            listings[index] = listing;
        } else {
            listings.push(listing);
        }
        localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(listings));
        return listings;
    },
    deleteListing: (id) => {
        const listings = DataManager.getListings().filter(item => item.id !== id);
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
