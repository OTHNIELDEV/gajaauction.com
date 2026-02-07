import { supabase } from '../lib/supabase';

// This manager replaces DataManager.js when connecting to real DB
const SupabaseManager = {
    // --- Listings ---
    getListings: async () => {
        const { data, error } = await supabase
            .from('listings')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching listings:', error);
            return [];
        }
        return data;
    },

    getListingById: async (id) => {
        const { data, error } = await supabase
            .from('listings')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching listing:', error);
            return null;
        }
        return data;
    },

    saveListing: async (listing) => {
        // If ID exists, update. Else insert.
        // Assuming 'id' is unique or handled by DB sequence if new
        const { data, error } = await supabase
            .from('listings')
            .upsert(listing)
            .select();

        if (error) console.error('Error saving listing:', error);
        return data;
    },

    deleteListing: async (id) => {
        const { error } = await supabase
            .from('listings')
            .delete()
            .eq('id', id);

        if (error) console.error('Error deleting listing:', error);
    },

    // --- Inquiries ---
    addInquiry: async (inquiryData) => {
        const { data, error } = await supabase
            .from('inquiries')
            .insert([
                {
                    ...inquiryData,
                    status: 'New',
                    date: new Date().toISOString().split('T')[0]
                }
            ])
            .select();

        if (error) console.error('Error adding inquiry:', error);
        return data;
    },

    getInquiries: async () => {
        const { data, error } = await supabase
            .from('inquiries')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching inquiries:', error);
            return [];
        }
        return data;
    },

    updateInquiryStatus: async (id, status) => {
        const { data, error } = await supabase
            .from('inquiries')
            .update({ status: status })
            .eq('id', id)
            .select();

        if (error) console.error('Error updating inquiry:', error);
        return data;
    },

    // --- Partners ---
    getPartners: async () => {
        const { data, error } = await supabase
            .from('partners')
            .select('*');

        if (error) return [];
        return data;
    },

    savePartner: async (partner) => {
        const { data, error } = await supabase
            .from('partners')
            .upsert(partner)
            .select();

        if (error) console.error('Error saving partner:', error);
        return data;
    },

    deletePartner: async (id) => {
        const { error } = await supabase
            .from('partners')
            .delete()
            .eq('id', id);
        if (error) console.error('Error deleting partner:', error);
    },

    // --- VIPs ---
    getVIPs: async () => {
        const { data, error } = await supabase
            .from('vips')
            .select('*');
        if (error) return [];
        return data;
    },

    addVIP: async (vipData) => {
        const { data, error } = await supabase
            .from('vips')
            .insert([{
                ...vipData,
                joined_date: new Date().toISOString().split('T')[0]
            }])
            .select();
        if (error) console.error('Error adding VIP:', error);
        return data;
    }
};

export default SupabaseManager;
