import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export const config = {
    runtime: 'edge',
};

export default async function handler(request) {
    if (request.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
    }

    try {
        const { message, sessionId } = await request.json();

        // 1. Save User Message
        const { error: userMsgError } = await supabase.from('messages').insert({
            session_id: sessionId,
            role: 'user',
            content: message
        });

        // Create session if it doesn't exist (handled by foreign key constraint usually, 
        // but good to ensure session exists first. For simplicity/speed, we assume session exists 
        // or we upsert it. Let's try upserting the session first).
        await supabase.from('chat_sessions').upsert({ id: sessionId }, { onConflict: 'id' });

        // User Lead Capture Logic (Regex)
        const phoneRegex = /010-\d{4}-\d{4}/;
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;

        let contactInfo = null;
        let interestCategory = 'General'; // Default

        const phoneMatch = message.match(phoneRegex);
        const emailMatch = message.match(emailRegex);

        if (phoneMatch) {
            contactInfo = phoneMatch[0];
        } else if (emailMatch) {
            contactInfo = emailMatch[0];
        }

        if (contactInfo) {
            // Determine interest based on keywords
            if (message.includes('아파트')) interestCategory = 'Apartment';
            else if (message.includes('공장')) interestCategory = 'Factory';
            else if (message.includes('NPL')) interestCategory = 'NPL';

            await supabase.from('leads').insert({
                contact_info: contactInfo,
                interest_category: interestCategory,
                source_session_id: sessionId
            });
        }


        const stream = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: `You are Lee Sang-soo (이상수), the CEO of 'GAJA Auction & NPL Consulting'.
You are a top-tier expert in Korean Real Estate Auctions, NPL (Non-Performing Loans), and Asset Management.

[Tone & Style]
- Professional, trustworthy, authoritative yet approachable. (50s male executive tone).
- Use formal Korean honorifics (e.g., 합니다, 습니까, 판단됩니다).
- Be concise but insightful. Always emphasize "Value Analysis" and "Risk Management."

[Knowledge Base]
- Explain NPL as "buying the rights to the mortgage at a discount," not just buying property.
- Emphasize that "Auctions are a psychological war and a numbers game."
- Your goal is to protect and grow the client's assets safely.

[Constraints]
- ONLY answer questions related to Real Estate, NPL, Auctions, Investment, and Finance.
- If asked about unrelated topics (e.g., "Write code," "What is for dinner?"), politely decline.
- Disclaimer: Always remind users that "Final investment decisions are the investor's responsibility."
- **Lead Capture**: If the user seems highly interested or asks for detailed files, politely ask for their email address or phone number to send the materials.`
                },
                { role: 'user', content: message }
            ],
            stream: true,
        });

        const encoder = new TextEncoder();
        let fullResponse = '';

        const readable = new ReadableStream({
            async start(controller) {
                for await (const chunk of stream) {
                    const content = chunk.choices[0]?.delta?.content || '';
                    if (content) {
                        fullResponse += content;
                        controller.enqueue(encoder.encode(content));
                    }
                }

                // 2. Save AI Response (after streaming completes)
                await supabase.from('messages').insert({
                    session_id: sessionId,
                    role: 'assistant',
                    content: fullResponse
                });

                controller.close();
            },
        });

        return new Response(readable, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
            },
        });

    } catch (error) {
        console.error('API Error:', error);
        return new Response(JSON.stringify({ error: 'Error processing your request' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
