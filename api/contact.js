/**
 * SINCOTECS — Contact Form API (Serverless Function)
 * Compatible with Vercel/Netlify serverless deployment.
 *
 * For local development, the frontend falls back to localStorage.
 * Deploy this as `api/contact.js` on Vercel, or `netlify/functions/contact.js` on Netlify.
 */

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { name, email, message, website, source, timestamp } = req.body;

        // Honeypot check
        if (website) {
            return res.status(200).json({ success: true });
        }

        // Validation
        if (!name || !email || !message) {
            return res.status(400).json({ error: 'Missing required fields: name, email, message' });
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ error: 'Invalid email address' });
        }

        if (message.length < 10) {
            return res.status(400).json({ error: 'Message must be at least 10 characters' });
        }

        if (name.length > 200 || email.length > 200 || message.length > 5000) {
            return res.status(400).json({ error: 'Input exceeds maximum length' });
        }

        // Rate limiting (basic, per-IP)
        // In production, use a Redis or database-backed rate limiter.
        // For serverless, consider Vercel KV, Upstash Redis, or similar.

        const submission = {
            name: sanitize(name),
            email: sanitize(email),
            message: sanitize(message),
            source: source || 'website',
            timestamp: timestamp || new Date().toISOString(),
            ip: req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown'
        };

        // TODO: Store in database (MongoDB, Supabase, etc.)
        // TODO: Send email notification (SendGrid, Resend, etc.)
        console.log('[SINCOTECS Contact]', JSON.stringify(submission));

        return res.status(200).json({ success: true, message: 'Message received successfully' });
    } catch (error) {
        console.error('[SINCOTECS Contact Error]', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

/** Basic XSS sanitization */
function sanitize(str) {
    return str.replace(/[<>]/g, '').trim();
}
