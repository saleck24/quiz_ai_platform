// FRONTEND/pages/api/notes/upload.ts

import type { NextApiRequest, NextApiResponse } from "next";

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée. Utilisez POST." });
  }

  const accessToken = req.cookies.access_token;
  if (!accessToken) return res.status(401).json({ error: "Non authentifié." });

  const BACKEND_URL = process.env.BACKEND_URL;
  if (!BACKEND_URL) return res.status(500).json({ error: "BACKEND_URL non définie" });

  try {
    // Important: forward Content-Type (avec boundary) + Content-Length si présent
    const headers: Record<string, string> = {
      Authorization: `Bearer ${accessToken}`,
    };

    const ct = req.headers["content-type"];
    if (ct) headers["Content-Type"] = String(ct);

    const cl = req.headers["content-length"];
    if (cl) headers["Content-Length"] = String(cl);

    const backendResponse = await fetch(
    `${BACKEND_URL}/api/notes/upload/`,
    {
        method: "POST",
        headers,
        body: req as any,
        duplex: "half",
    } as RequestInit & { duplex: "half" }
    );

    const contentType = backendResponse.headers.get("content-type") || "";
    res.status(backendResponse.status);

    if (contentType.includes("application/json")) {
      const data = await backendResponse.json().catch(() => ({}));
      return res.json(data);
    } else {
      const text = await backendResponse.text();
      return res.send(text);
    }
  } catch (e: any) {
    return res.status(500).json({ error: "Erreur upload proxy", details: e?.message || e });
  }
}