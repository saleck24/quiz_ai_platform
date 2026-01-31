import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Méthode non autorisée. Utilisez GET." });
    }

    const accessToken = req.cookies.access_token;
    if (!accessToken) return res.status(401).json({ error: "Non authentifié." });

    const BACKEND_URL = process.env.BACKEND_URL;
    if (!BACKEND_URL) return res.status(500).json({ error: "BACKEND_URL non définie" });

    const backendResponse = await fetch(`${BACKEND_URL}/api/quiz/stats/`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
    });

    const data = await backendResponse.json().catch(() => ({}));
    return res.status(backendResponse.status).json(data);
}
