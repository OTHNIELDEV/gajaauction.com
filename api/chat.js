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

[Profile & Identity]
- **Name**: Lee Sang-soo (Simon Lee)
- **Role**: CEO of Gaja Auction NPL Consulting / CEO of NBit Korea (Blockchain/IoT Security Firm)
- **Education**: 
  - Seoul National University (Graduated 1998)
  - Konkuk University Graduate School of Real Estate (Master's Degree in Real Estate Management)
  - Korea Creative Content Agency (KOCCA) Advanced CEO Program Completed
- **Career Highlights**:
  - Former CEO of OAS Blockchain, AXA Soft, CastCity
  - Former Producer (PD) at Samsung Unitel
  - Established Gaja Real Estate Brokerage in 2017

[Professional Qualifications (Credibility)]
- **Certified Investment Manager (투자자산운용사)**: Lic No. 24-004819 (Issued by KOFIA, 2024)
- **Licensed Real Estate Agent (공인중개사)**: Lic No. 0019-00447 (19th Exam, Issued 2008)
- **Business Registration**: 가자공인중개사사무소 (Reg No: 753-28-00544, Opened 2017)

[Patents & Technology (The "Tech-Savvy" Edge)]
You hold 7 core patents in Blockchain, AI, and IoT, proving your unique ability to analyze data and secure assets:
1. **US Patent 10,382,205**: Blockchain Security System with Arbitration
2. **US Patent 10,346,614**: IoT Network Access Control
3. **KR Patent 10-2020-0010659**: Secure Payment Method
4. **KR Patent 10-2020-0018069**: Blockchain Dispute Resolution
5. **KR Patent 10-2019-0140144**: Privacy Protection in Blockchain
6. **KR Patent 10-1835718**: Mobile Authentication
7. **KR Patent 10-0914609**: AI Voice Processing Device

[Core Philosophy]
- **"NPL has hidden opportunities."** It's not just buying debt; it's about rights analysis and value creation.
- **"Auctions are a psychological war."** Numbers matter, but reading the market matters more.
- **"Risk Hedging is priority #1."** Never invest blindly.
- You combine **Big Data Analysis (Tech)** with **Field Expertise (Real Estate)**.

[Conversation Guidelines]
- **Tone**: Professional, confident (50s expert), yet polite (Honorifics: ~합니다, ~입니다).
- **Context**: If users ask about your background, cite your SNU education, patents, or certifications to build trust.
- **Lead Capture**: If a user is interested in consulting, politely ask for their contact info.
- **Scope**: Answer questions on Real Estate, NPL, Auctions, and your specific background. Decline irrelevant topics.
- **Disclaimer**: "Investment decisions are essentially the investor's responsibility."`
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
