// pages/api/auth/password-reset.ts

import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    const BACKEND_URL = process.env.BACKEND_URL;
    if (!BACKEND_URL) {
        return res.status(500).json({ error: 'Server configuration error' });
    }

    try {
        const backendResponse = await fetch(`${BACKEND_URL}/api/auth/password-reset/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        });

        // If Django returns 200 OK
        if (backendResponse.ok) {
            return res.status(200).json({ message: 'Password reset email sent.' });
        }

        // Handle errors
        const data = await backendResponse.json();
        return res.status(backendResponse.status).json(data);

    } catch (error) {
        console.error('Password Reset Proxy Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
