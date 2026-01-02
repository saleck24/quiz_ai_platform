// lib/api.ts

export type QuizPayload = {
  note_id: number;
  nb_questions: number;
  niveau: string;     // ex: "Facile"
  type_quiz: string;  // ex: "QCM"
};

class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = "/api";
  }

  private async fetchWithAuth<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string> | undefined),
    };

    // Si le body n'est pas FormData, on force JSON par défaut
    const isFormData =
      typeof FormData !== "undefined" && options.body instanceof FormData;

    if (!isFormData && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
      credentials: "include", // ✅ indispensable pour envoyer les cookies HttpOnly à Next
    });

    // Gestion des réponses vides (204, etc.)
    const contentType = response.headers.get("content-type") || "";
    const hasJson = contentType.includes("application/json");

    if (!response.ok) {
      const errorData = hasJson ? await response.json().catch(() => ({})) : {};
      throw new Error(errorData.error || errorData.detail || `HTTP ${response.status}`);
    }

    if (!hasJson) return (undefined as unknown) as T;
    return response.json();
  }

  // --------------------
  // AUTH
  // --------------------
  async login(email: string, password: string) {
    return this.fetchWithAuth("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  // (Optionnel) logout: si tu crées /api/auth/logout pour effacer cookies
  async logout() {
    return this.fetchWithAuth("/auth/logout", { method: "POST" });
  }

  // --------------------
  // NOTES
  // --------------------
  async getNotes() {
    return this.fetchWithAuth("/notes/list", { method: "GET" });
  }

  /**
   * Upload note (multipart)
   * ⚠️ nécessite que tu aies créé: pages/api/notes/upload.ts (proxy)
   * et que ton backend DRF accepte multipart sur /api/notes/upload/
   */
  async uploadNote(formData: FormData) {
    return this.fetchWithAuth("/notes/upload", {
      method: "POST",
      body: formData,
      // ne PAS mettre Content-Type ici, le navigateur gère le boundary
      headers: {},
    });
  }

  // --------------------
  // QUIZ
  // --------------------
  async generateQuiz(payload: QuizPayload) {
    return this.fetchWithAuth("/quiz/generer", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async submitQuizAnswer(quizId: number | string, questionId: number | string, reponse: string) {
    return this.fetchWithAuth(`/quiz/reponse/${quizId}/${questionId}`, {
      method: "POST",
      body: JSON.stringify({ reponse }),
    });
  }

  async createQuizSession(quizId: number | string) {
    return this.fetchWithAuth(`/quiz/session/creer/${quizId}`, {
      method: "POST",
      body: JSON.stringify({}),
    });
  }

  async joinQuizSession(token: string) {
    return this.fetchWithAuth(`/quiz/session/rejoindre/${token}`, {
      method: "GET",
    });
  }
}

export const apiClient = new ApiClient();