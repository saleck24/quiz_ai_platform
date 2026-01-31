import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Méthode non autorisée. Utilisez GET.' });
    }

    const accessToken = req.cookies.access_token;
    if (!accessToken) {
        return res.status(401).json({ error: 'Non authentifié.' });
    }

    const BACKEND_URL = process.env.BACKEND_URL;
    if (!BACKEND_URL) {
        return res.status(500).json({ error: 'BACKEND_URL non définie' });
    }

    try {
        const backendResponse = await fetch(`${BACKEND_URL}/api/auth/profile/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await backendResponse.json().catch(() => ({}));

        if (!backendResponse.ok) {
            return res.status(backendResponse.status).json(data);
        }

        return res.status(200).json(data);
    } catch (error) {
        console.error('[PROFILE] Erreur serveur:', error);
        return res.status(500).json({
            error: 'Erreur interne du serveur',
            details: error instanceof Error ? error.message : 'Erreur inconnue',
        });
    }
}
