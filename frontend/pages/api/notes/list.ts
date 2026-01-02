// FRONTEND/pages/api/notes/list.ts

import type { NextApiRequest, NextApiResponse } from "next";

type BackendNote = {
  id: number;
  user?: number;
  file?: string; // DRF renvoie souvent "file"
  uploaded_at?: string;

  // parfois existants si tu les as ajoutés
  title?: string;
  description?: string;
  file_url?: string;
  file_type?: string;
  file_size?: number;
  created_at?: string;
  updated_at?: string;
};

type FrontNote = {
  id: number;
  user: number;

  title: string;
  description?: string;

  file_url: string;
  file_type: string;
  file_size: number;

  uploaded_at: string;
  created_at?: string;
  updated_at?: string;
};

type ErrorResponse = {
  error: string;
  details?: any;
};

function guessTypeFromUrl(url: string): string {
  const u = (url || "").toLowerCase();
  if (u.endsWith(".pdf")) return "application/pdf";
  if (u.endsWith(".doc")) return "application/msword";
  if (u.endsWith(".docx"))
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  if (u.endsWith(".txt")) return "text/plain";
  return "application/octet-stream";
}

function titleFromUrl(url: string): string {
  try {
    const last = decodeURIComponent(url.split("/").pop() || "Document");
    return last.replace(/\.[^/.]+$/, "") || "Document";
  } catch {
    return "Document";
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<FrontNote[] | ErrorResponse>
) {
  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Méthode non autorisée. Utilisez GET.",
    });
  }

  try {
    const accessToken = req.cookies.access_token;
    if (!accessToken) {
      return res.status(401).json({
        error: "Non authentifié. Veuillez vous connecter.",
      });
    }

    const BACKEND_URL = process.env.BACKEND_URL;
    if (!BACKEND_URL) {
      console.error("BACKEND_URL non définie");
      return res.status(500).json({
        error: "Erreur de configuration serveur",
      });
    }

    const backendResponse = await fetch(`${BACKEND_URL}/api/notes/list/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const data = await backendResponse.json().catch(() => ({}));

    if (!backendResponse.ok) {
      console.error("[NOTES/LIST] Erreur:", data);

      if (backendResponse.status === 401) {
        res.setHeader("Set-Cookie", [
          "access_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;",
          "refresh_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;",
        ]);

        return res.status(401).json({
          error: "Session expirée. Veuillez vous reconnecter.",
          details: data,
        });
      }

      return res.status(backendResponse.status).json({
        error: data.detail || data.error || "Erreur lors de la récupération des notes",
        details: data,
      });
    }

    if (!Array.isArray(data)) {
      return res.status(500).json({
        error: "Format de réponse invalide (attendu: tableau)",
        details: data,
      });
    }

    // ✅ Mapping DRF -> Front
    const mapped: FrontNote[] = (data as BackendNote[]).map((n) => {
      const file_url = n.file_url || n.file || "";
      return {
        id: n.id,
        user: n.user ?? 0,

        title: n.title || (file_url ? titleFromUrl(file_url) : "Document"),
        description: n.description,

        file_url,
        file_type: n.file_type || (file_url ? guessTypeFromUrl(file_url) : "application/octet-stream"),
        file_size: typeof n.file_size === "number" ? n.file_size : 0,

        uploaded_at: n.uploaded_at || n.created_at || new Date().toISOString(),
        created_at: n.created_at,
        updated_at: n.updated_at,
      };
    });

    return res.status(200).json(mapped);
  } catch (error) {
    console.error("[NOTES/LIST] Erreur serveur:", error);

    return res.status(500).json({
      error: "Erreur interne du serveur",
      details: error instanceof Error ? error.message : "Erreur inconnue",
    });
  }
}