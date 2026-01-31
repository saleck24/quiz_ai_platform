import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Méthode non autorisée. Utilisez GET." });
    }

    const { token } = req.query;
    if (!token || typeof token !== "string") {
        return res.status(400).json({ error: "Token manquant." });
    }

    const BACKEND_URL = process.env.BACKEND_URL;
    if (!BACKEND_URL) return res.status(500).json({ error: "BACKEND_URL non définie" });

    // Accès public : le token dans l'URL est l'autorisation (AllowAny côté Django)
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const accessToken = req.cookies.access_token;
    if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
    }

    const backendResponse = await fetch(`${BACKEND_URL}/api/quiz/session/rejoindre/${token}/`, {
        method: "GET",
        headers,
    });

    const data = await backendResponse.json().catch(() => ({}));
    return res.status(backendResponse.status).json(data);
}
