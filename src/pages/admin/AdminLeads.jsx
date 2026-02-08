import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

const AdminLeads = () => {
    const [leads, setLeads] = useState([]);
    const [selectedLead, setSelectedLead] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('leads')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching leads:', error);
        } else {
            setLeads(data);
        }
        setIsLoading(false);
    };

    const fetchMessages = async (sessionId) => {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('session_id', sessionId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching messages:', error);
        } else {
            setMessages(data);
        }
    };

    const handleViewChat = async (lead) => {
        setSelectedLead(lead);
        await fetchMessages(lead.source_session_id);
    };

    const closeChat = () => {
        setSelectedLead(null);
        setMessages([]);
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-white mb-6">Lead Management</h1>

            {isLoading ? (
                <div className="text-white">Loading leads...</div>
            ) : (
                <div className="overflow-x-auto bg-gray-900 rounded-lg shadow border border-gray-800">
                    <table className="w-full text-left text-gray-400">
                        <thead className="bg-gray-800 text-gray-200 uppercase text-xs">
                            <tr>
                                <th className="px-6 py-3">Created At</th>
                                <th className="px-6 py-3">Contact Info</th>
                                <th className="px-6 py-3">Interest</th>
                                <th className="px-6 py-3">Session ID</th>
                                <th className="px-6 py-3">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {leads.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-4 text-center">No leads found yet.</td>
                                </tr>
                            ) : (
                                leads.map((lead) => (
                                    <tr key={lead.id} className="hover:bg-gray-800 transition-colors">
                                        <td className="px-6 py-4">{new Date(lead.created_at).toLocaleString()}</td>
                                        <td className="px-6 py-4 text-white font-medium">{lead.contact_info}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold 
                                                ${lead.interest_category === 'NPL' ? 'bg-red-900 text-red-200' :
                                                    lead.interest_category === 'Apartment' ? 'bg-blue-900 text-blue-200' :
                                                        'bg-gray-700 text-gray-200'}`}>
                                                {lead.interest_category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-mono">{lead.source_session_id.slice(0, 8)}...</td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleViewChat(lead)}
                                                className="bg-yellow-600 hover:bg-yellow-500 text-white px-3 py-1 rounded text-sm transition-colors"
                                            >
                                                View Chat
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Chat History Modal */}
            <AnimatePresence>
                {selectedLead && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-gray-900 w-full max-w-2xl max-h-[80vh] rounded-xl flex flex-col border border-gray-700 shadow-2xl"
                        >
                            <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                                <h3 className="text-lg font-bold text-white">
                                    Chat Context: <span className="text-yellow-500">{selectedLead.contact_info}</span>
                                </h3>
                                <button onClick={closeChat} className="text-gray-400 hover:text-white">
                                    <i className="fas fa-times text-xl"></i>
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {messages.map((msg) => (
                                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[80%] p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-900/50 text-blue-100' : 'bg-gray-800 text-gray-200'
                                            }`}>
                                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                            <span className="text-[10px] opacity-50 block mt-1">
                                                {new Date(msg.created_at).toLocaleTimeString()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminLeads;
