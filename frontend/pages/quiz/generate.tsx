// FRONTEND/pages/quiz/generate.tsx

import React, { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { apiClient } from "@/lib/api";
import {
  Loader2,
  FileText,
  BrainCircuit,
  CheckCircle2,
  XCircle,
} from "lucide-react";

type Note = {
  id: number;
  title?: string;
  // ton backend notes/list renvoie plutôt:
  file?: string;
  uploaded_at?: string;

  // si plus tard tu ajoutes ces champs côté backend, ça marchera aussi
  file_url?: string;
  file_type?: string;
  file_size?: number;
};

type ChoiceKey = "A" | "B" | "C" | "D";
type OptionsMap = Partial<Record<ChoiceKey, string>>;

type QuizQuestion = {
  id: number;
  question: string;
  // ✅ ton backend renvoie "options"
  options?: OptionsMap;
};

type GeneratedQuiz = {
  id: number;
  note: number;
  user: number;
  niveau: number | string;
  type_quiz: string;
  created_at: string;
  questions: QuizQuestion[];
};

type SubmitAnswerResult = {
  // ✅ ton backend renvoie "correct" et "feedback"
  correct?: boolean;
  feedback?: string;
  niveau_actuel?: number;

  // si tu ajoutes plus tard ça côté backend
  correct_answer?: ChoiceKey;
  correct_text?: string;

  // fallback en cas d’erreur
  message?: string;
};

function normalizeOptions(q: QuizQuestion): Record<ChoiceKey, string> | null {
  const o = q.options;
  if (!o) return null;

  const A = o.A ?? "";
  const B = o.B ?? "";
  const C = o.C ?? "";
  const D = o.D ?? "";

  if (!A && !B && !C && !D) return null;
  return { A, B, C, D };
}

export default function GenerateQuizPage() {
  const { t } = useTranslation("common");

  // Notes
  const [notes, setNotes] = useState<Note[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [notesError, setNotesError] = useState<string | null>(null);

  // Form
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);
  const [nbQuestions, setNbQuestions] = useState<number>(5);
  const [niveau, setNiveau] = useState<string>("Facile");
  const [typeQuiz, setTypeQuiz] = useState<string>("QCM");

  // Quiz generation
  const [isGenerating, setIsGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  // Quiz state
  const [quizId, setQuizId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);

  // answers selected by user: questionId -> "A"/"B"/"C"/"D"
  const [answers, setAnswers] = useState<Record<number, ChoiceKey>>({});

  // result per question after submit
  const [results, setResults] = useState<Record<number, SubmitAnswerResult>>(
    {}
  );
  const [submitLoading, setSubmitLoading] = useState<Record<number, boolean>>(
    {}
  );

  useEffect(() => {
    const loadNotes = async () => {
      setLoadingNotes(true);
      setNotesError(null);

      try {
        const data = await apiClient.getNotes();
        const arr: Note[] = Array.isArray(data) ? data : [];
        setNotes(arr);
        if (arr.length > 0) setSelectedNoteId(arr[0].id);
      } catch (e: any) {
        setNotesError(e?.message || "Erreur lors du chargement des notes");
      } finally {
        setLoadingNotes(false);
      }
    };

    loadNotes();
  }, []);

  const selectedNote = useMemo(
    () => notes.find((n) => n.id === selectedNoteId) || null,
    [notes, selectedNoteId]
  );

  const handleGenerate = async () => {
    setGenError(null);
    setQuizId(null);
    setQuestions([]);
    setAnswers({});
    setResults({});

    if (!selectedNoteId) {
      setGenError("Veuillez choisir une note.");
      return;
    }

    setIsGenerating(true);
    try {
      const result: GeneratedQuiz = await apiClient.generateQuiz({
        note_id: selectedNoteId,
        nb_questions: nbQuestions,
        niveau,
        type_quiz: typeQuiz,
      });

      if (!result?.id) {
        setGenError("Quiz créé mais aucun ID retourné par le backend.");
        return;
      }

      if (!Array.isArray(result?.questions)) {
        setGenError("Le backend n’a pas renvoyé les questions.");
        return;
      }

      // Pour QCM : on veut options A/B/C/D
      if (typeQuiz === "QCM") {
        const missing = result.questions.some((q) => !normalizeOptions(q));
        if (missing) {
          setGenError(
            "Certaines questions n'ont pas 'options' (A,B,C,D). Vérifie que le backend renvoie options."
          );
          return;
        }
      }

      setQuizId(result.id);
      setQuestions(result.questions);
    } catch (e: any) {
      setGenError(e?.message || "Erreur génération quiz");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmitAnswer = async (questionId: number) => {
    if (!quizId) return;

    const selected = answers[questionId];
    if (!selected) {
      setResults((prev) => ({
        ...prev,
        [questionId]: { message: "Veuillez choisir une réponse." },
      }));
      return;
    }

    setSubmitLoading((p) => ({ ...p, [questionId]: true }));
    try {
      const resp: SubmitAnswerResult = await apiClient.submitQuizAnswer(
        quizId,
        questionId,
        selected
      );

      setResults((prev) => ({
        ...prev,
        [questionId]: resp,
      }));
    } catch (e: any) {
      setResults((prev) => ({
        ...prev,
        [questionId]: { message: e?.message || "Erreur d'envoi" },
      }));
    } finally {
      setSubmitLoading((p) => ({ ...p, [questionId]: false }));
    }
  };

  const getNoteTitle = (n: Note) => {
    // backend notes/list renvoie pas title => fallback sur nom de fichier depuis l'URL
    if (n.title) return n.title;
    const url = n.file || n.file_url || "";
    if (!url) return `Note #${n.id}`;
    try {
      const parts = url.split("/");
      return decodeURIComponent(parts[parts.length - 1] || `Note #${n.id}`);
    } catch {
      return `Note #${n.id}`;
    }
  };

  const getNoteUrl = (n: Note) => n.file || n.file_url || "";

  return (
    <Layout>
      <Head>
        <title>
          {t("common.generate")} | {t("common.appName")}
        </title>
      </Head>

      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <BrainCircuit className="w-7 h-7 text-indigo-600" />
            {t("common.generate")}
          </h1>
          <p className="text-slate-500 mt-1">
            Choisissez une note, générez un quiz, puis répondez aux questions.
          </p>
        </div>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Vos notes</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingNotes ? (
              <div className="py-10 flex justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              </div>
            ) : notesError ? (
              <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-700">
                {notesError}
              </div>
            ) : notes.length === 0 ? (
              <div className="text-slate-600">
                Aucune note trouvée. Uploadez d’abord un document.
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-3">
                {notes.map((n) => {
                  const active = n.id === selectedNoteId;
                  return (
                    <button
                      key={n.id}
                      onClick={() => setSelectedNoteId(n.id)}
                      className={`text-left p-4 rounded-xl border transition-all ${
                        active
                          ? "border-indigo-300 bg-indigo-50"
                          : "border-slate-200 hover:border-indigo-200 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900">
                            {getNoteTitle(n)}
                          </p>
                          <p className="text-xs text-slate-500 mt-1 truncate">
                            {getNoteUrl(n)}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Params */}
        <Card>
          <CardHeader>
            <CardTitle>Paramètres du quiz</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedNote ? (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-sm text-slate-600">Note sélectionnée :</p>
                <p className="font-semibold text-slate-900">
                  {getNoteTitle(selectedNote)}
                </p>
              </div>
            ) : (
              <div className="text-slate-600">
                Sélectionnez une note pour continuer.
              </div>
            )}

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">
                  Nombre de questions
                </label>
                <Input
                  type="number"
                  value={nbQuestions}
                  onChange={(e) => setNbQuestions(Number(e.target.value || 5))}
                  className="h-12"
                  min={1}
                  max={50}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">
                  Niveau
                </label>
                <select
                  value={niveau}
                  onChange={(e) => setNiveau(e.target.value)}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
                >
                  <option value="Facile">Facile</option>
                  <option value="Moyen">Moyen</option>
                  <option value="Difficile">Difficile</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">
                  Type
                </label>
                <select
                  value={typeQuiz}
                  onChange={(e) => setTypeQuiz(e.target.value)}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
                >
                  <option value="QCM">QCM</option>
                </select>
              </div>
            </div>

            {genError && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm">
                {genError}
              </div>
            )}

            <Button
              className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/25"
              onClick={handleGenerate}
              disabled={!selectedNoteId}
              isLoading={isGenerating}
            >
              Générer le quiz
            </Button>
          </CardContent>
        </Card>

        {/* Questions */}
        {quizId && questions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Questions (Quiz #{quizId})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {questions.map((q) => {
                const opts = normalizeOptions(q);
                const selected = answers[q.id];
                const r = results[q.id];
                const isCorrect =
                  typeof r?.correct === "boolean" ? r.correct : undefined;

                return (
                  <div
                    key={q.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white"
                  >
                    <p className="font-semibold text-slate-900 mb-3">
                      {q.question}
                    </p>

                    {/* QCM A/B/C/D */}
                    {opts ? (
                      <div className="grid md:grid-cols-2 gap-2 mb-4">
                        {(["A", "B", "C", "D"] as const).map((k) => (
                          <button
                            key={k}
                            onClick={() =>
                              setAnswers((prev) => ({ ...prev, [q.id]: k }))
                            }
                            className={`p-3 rounded-xl border text-left transition-all ${
                              selected === k
                                ? "border-indigo-300 bg-indigo-50"
                                : "border-slate-200 hover:border-indigo-200 hover:bg-slate-50"
                            }`}
                          >
                            <span className="font-bold mr-2">{k}.</span>
                            <span className="text-slate-800">
                              {opts[k] || ""}
                            </span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-red-600 mb-3">
                        Cette question n'a pas d'options (A/B/C/D) renvoyées par
                        l'API.
                      </div>
                    )}

                    <div className="flex items-center gap-3 flex-wrap">
                      <Button
                        variant="outline"
                        onClick={() => handleSubmitAnswer(q.id)}
                        isLoading={!!submitLoading[q.id]}
                      >
                        Vérifier la réponse
                      </Button>

                      {r?.message && (
                        <span className="text-sm text-slate-600">
                          {r.message}
                        </span>
                      )}

                      {typeof isCorrect === "boolean" && (
                        <div className="flex items-center gap-2 text-sm">
                          {isCorrect ? (
                            <>
                              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                              <span className="text-emerald-700 font-medium">
                                Correct ✅
                              </span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-5 h-5 text-red-600" />
                              <span className="text-red-700 font-medium">
                                Incorrect ❌
                              </span>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Feedback backend */}
                    {r?.feedback && (
                      <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700">
                        <span className="font-medium">Feedback :</span>{" "}
                        {r.feedback}
                      </div>
                    )}

                    {/* Si plus tard tu ajoutes correct_answer/correct_text dans l'API */}
                    {!r?.correct &&
                      r?.correct_answer && (
                        <div className="mt-3 text-sm text-slate-700">
                          Réponse correcte :{" "}
                          <span className="font-semibold">
                            {r.correct_answer}
                          </span>
                          {r.correct_text ? ` (${r.correct_text})` : ""}
                        </div>
                      )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en", ["common"])),
    },
  };
};