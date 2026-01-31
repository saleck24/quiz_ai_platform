// FRONTEND/pages/dashboard/index.tsx

import React, { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  FileText,
  BrainCircuit,
  TrendingUp,
  Clock,
  Plus,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { apiClient } from '@/lib/api';

// ✅ Type aligné avec DRF + fallback (certains champs peuvent ne pas exister)
interface Note {
  id: number;
  user?: number;

  // DRF actuel renvoie: file + uploaded_at
  file?: string; // ex: "http://localhost:8000/media/notes/..."
  uploaded_at?: string;

  // Optionnels (si tu les ajoutes plus tard côté backend)
  title?: string;
  description?: string;
  file_url?: string;
  file_type?: string;
  file_size?: number;
  created_at?: string;
  updated_at?: string;
}

export default function Dashboard() {
  const { t } = useTranslation('common');
  const router = useRouter();

  const [notes, setNotes] = useState<Note[]>([]);
  const [recentNotes, setRecentNotes] = useState<Note[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState(true);
  const [errorNotes, setErrorNotes] = useState<string | null>(null);

  const [userName, setUserName] = useState<string>('');

  // --- Quiz quick action states
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [quizError, setQuizError] = useState<string | null>(null);

  useEffect(() => {
    // Récupérer le profil utilisateur et les stats
    const initDashboard = async () => {
      try {
        // 1. Profil
        try {
          const profile = await apiClient.getUserProfile();
          if (profile) {
            setUserName(profile.first_name || profile.username || 'Utilisateur');
            // Mettre à jour le localStorage pour la prochaine fois
            localStorage.setItem('user', JSON.stringify(profile));
          }
        } catch (e) {
          console.error('Erreur chargement profil:', e);
          // Fallback au localStorage si API échoue
          const userStr = localStorage.getItem('user');
          if (userStr) {
            const u = JSON.parse(userStr);
            setUserName(u.first_name || u.username || 'Utilisateur');
          }
        }

        // 2. Stats
        try {
          const s = await apiClient.getDashboardStats();
          if (s) {
            setStats({
              documents: s.documents,
              quizzesTaken: s.quizzesTaken,
              averageScore: s.averageScore,
              studyTime: s.studyTime || 'N/A'
            });
            // Mise à jour de l'activité récente
            if (s.recentActivity) {
              setRecentActivity(s.recentActivity);
            }
          }
        } catch (e) {
          console.error("Erreur chargement stats:", e);
        }

      } catch (err) {
        console.error(err);
      }
    };

    initDashboard();
    fetchNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchNotes = async () => {
    setIsLoadingNotes(true);
    setErrorNotes(null);

    try {
      const fetched = await apiClient.getNotes();
      const arr: Note[] = Array.isArray(fetched) ? fetched : [];

      // Trier par date (uploaded_at si dispo)
      const sorted = [...arr].sort((a, b) => {
        const da = a.uploaded_at ? new Date(a.uploaded_at).getTime() : 0;
        const db = b.uploaded_at ? new Date(b.uploaded_at).getTime() : 0;
        return db - da;
      });

      setNotes(sorted);
      setRecentNotes(sorted.slice(0, 3));
    } catch (err) {
      console.error('Erreur lors du chargement des notes:', err);

      if (err instanceof Error) {
        if (err.message.includes('401') || err.message.toLowerCase().includes('session')) {
          router.push('/login?session=expired');
          return;
        }
        setErrorNotes(err.message);
      } else {
        setErrorNotes('Une erreur est survenue lors du chargement des notes');
      }
    } finally {
      setIsLoadingNotes(false);
    }
  };

  // --- Quick Action: Generate quiz using latest note
  const generateQuizFromLatestNote = async () => {
    setQuizError(null);

    const latest = notes[0];
    if (!latest?.id) {
      setQuizError("Aucune note disponible. Uploadez un document d'abord.");
      return;
    }

    setIsGeneratingQuiz(true);

    try {
      const quiz = await apiClient.generateQuiz({
        note_id: latest.id,
        nb_questions: 5,
        niveau: 'Facile',
        type_quiz: 'QCM',
      });

      const quizId = quiz?.id ?? quiz?.quiz_id;

      if (quizId) {
        router.push(`/quiz/${quizId}`);
      } else {
        router.push('/quiz/generate?created=1');
      }
    } catch (err) {
      console.error('Erreur génération quiz:', err);

      if (err instanceof Error) {
        if (err.message.includes('401') || err.message.toLowerCase().includes('session')) {
          router.push('/login?session=expired');
          return;
        }
        setQuizError(err.message);
      } else {
        setQuizError('Impossible de générer le quiz pour le moment.');
      }
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  // ✅ Fix: ne jamais appeler includes() sur undefined
  // + fallback depuis l'URL si file_type absent
  const getFileIcon = (fileType?: string, fileUrl?: string): string => {
    const type = (fileType || '').toLowerCase();

    if (type.includes('pdf')) return 'PDF';
    if (type.includes('word') || type.includes('document') || type.includes('docx')) return 'DOC';
    if (type.includes('text') || type.includes('txt')) return 'TXT';

    const url = (fileUrl || '').toLowerCase();
    if (url.endsWith('.pdf')) return 'PDF';
    if (url.endsWith('.doc') || url.endsWith('.docx')) return 'DOC';
    if (url.endsWith('.txt')) return 'TXT';

    return 'FILE';
  };

  // --- Stats State
  const [stats, setStats] = useState({
    documents: 0,
    quizzesTaken: 0,
    averageScore: 0,
    studyTime: 'N/A'
  });

  return (
    <Layout>
      <Head>
        <title>
          {t('common.dashboard')} | {t('common.appName')}
        </title>
      </Head>

      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          {t('dashboard.welcome')}, {userName}! 👋
        </h1>
        <p className="text-slate-500 mt-1">{t('dashboard.subtitle')}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title={t('dashboard.stats.documents')}
          value={stats.documents.toString()}
          change=""
          icon={<FileText className="w-6 h-6" />}
          gradient="from-blue-500 to-cyan-400"
        />
        <StatCard
          title={t('dashboard.stats.quizzesTaken')}
          value={stats.quizzesTaken.toString()}
          change=""
          icon={<BrainCircuit className="w-6 h-6" />}
          gradient="from-purple-500 to-pink-400"
        />
        <StatCard
          title={t('dashboard.stats.averageScore')}
          value={`${stats.averageScore}%`}
          change=""
          icon={<TrendingUp className="w-6 h-6" />}
          gradient="from-emerald-500 to-teal-400"
        />
        <StatCard
          title={t('dashboard.stats.studyTime')}
          value={stats.studyTime}
          change={t('dashboard.stats.thisWeek')}
          icon={<Clock className="w-6 h-6" />}
          gradient="from-orange-500 to-amber-400"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2 bg-gradient-to-br from-indigo-600 to-purple-600 border-0 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <CardContent className="p-8 relative z-10">
            <h3 className="text-2xl font-bold mb-2">{t('dashboard.cta.title')}</h3>
            <p className="text-indigo-100 mb-6 max-w-md">{t('dashboard.cta.subtitle')}</p>

            <div className="flex gap-4 flex-wrap">
              <Link href="/documents/upload">
                <Button className="bg-white text-indigo-700 hover:bg-indigo-50 shadow-lg">
                  <Plus className="w-5 h-5 mr-2" />
                  {t('dashboard.cta.uploadDocument')}
                </Button>
              </Link>

              <Button
                variant="outline"
                className="bg-transparent border-2 border-white/40 text-white hover:bg-white hover:text-indigo-600 transition-all font-semibold"
                onClick={generateQuizFromLatestNote}
                disabled={isGeneratingQuiz}
              >
                {isGeneratingQuiz ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {t('dashboard.cta.generateQuiz')}
                  </>
                ) : (
                  <>
                    {t('dashboard.cta.generateQuiz')}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </div>

            {quizError && (
              <div className="mt-4 p-3 rounded-xl bg-white/10 border border-white/20 text-white/90 text-sm">
                {quizError}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('dashboard.recentActivity')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">
                Aucune activité récente.
              </p>
            ) : (
              recentActivity.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">{item.action}</p>
                    <p className="text-xs text-slate-500">{item.subject}</p>
                  </div>
                  <div className="text-right">
                    {item.score && <p className="text-sm font-semibold text-emerald-600">{item.score}</p>}
                    <p className="text-xs text-slate-400">{formatDate(item.timestamp)}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Documents */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t('dashboard.recentDocuments')}</CardTitle>
          <Link href="/documents" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
            {t('dashboard.viewAll')} →
          </Link>
        </CardHeader>

        <CardContent>
          {isLoadingNotes ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
          ) : errorNotes ? (
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{errorNotes}</p>
              <Button onClick={fetchNotes} variant="outline">
                Réessayer
              </Button>
            </div>
          ) : recentNotes.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>Aucun document uploadé</p>
              <Link href="/documents/upload">
                <Button variant="outline" className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Uploader votre premier document
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-4">
              {recentNotes.map((note) => {
                // ✅ Normaliser DRF -> UI
                const fileUrl = note.file_url || note.file || '';
                const title =
                  note.title ||
                  (fileUrl ? decodeURIComponent(fileUrl.split('/').pop() || '') : 'Document');
                const fileType = note.file_type; // peut être undefined
                const uploadedAt = note.uploaded_at;

                return (
                  <div
                    key={note.id}
                    className="p-4 rounded-xl border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all cursor-pointer group"
                    onClick={() => {
                      // Click: ouvrir le doc si dispo
                      if (fileUrl) window.open(fileUrl, '_blank', 'noopener,noreferrer');
                    }}
                  >
                    <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center mb-3 group-hover:bg-indigo-200 transition-colors">
                      <FileText className="w-5 h-5 text-indigo-600" />
                    </div>

                    {/* ✅ Title safe */}
                    <p className="font-medium text-slate-900 text-sm mb-1 truncate">
                      {title || 'Document'}
                    </p>

                    {/* ✅ No crash: getFileIcon safe */}
                    <div className="flex items-center flex-wrap gap-x-2 text-xs text-slate-500">
                      <span>{getFileIcon(fileType, fileUrl)}</span>

                      {uploadedAt && (
                        <>
                          <span>•</span>
                          <span>{formatDate(uploadedAt)}</span>
                        </>
                      )}

                      {typeof note.file_size === 'number' && (
                        <>
                          <span>•</span>
                          <span>{formatFileSize(note.file_size)}</span>
                        </>
                      )}
                    </div>

                    {/* ✅ Link open */}
                    {fileUrl && (
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-700"
                        onClick={(e) => e.stopPropagation()}
                      >
                        📄 Ouvrir le document
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </Layout>
  );
}

function StatCard({
  title,
  value,
  change,
  icon,
  gradient,
}: {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  gradient: string;
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-500 mb-1">{title}</p>
            <p className="text-3xl font-bold text-slate-900">{value}</p>
            {change && <p className="text-xs text-emerald-600 mt-1">{change}</p>}
          </div>
          <div
            className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-lg`}
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
  };
};