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
  Sparkles,
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
            // ✅ Formatage intelligent du nom : "Prénom NOM" ou "Username" capitalisé
            let displayName = 'Utilisateur';
            
            if (profile.first_name || profile.last_name) {
              const firstName = profile.first_name ? 
                profile.first_name.charAt(0).toUpperCase() + profile.first_name.slice(1).toLowerCase() : '';
              const lastName = profile.last_name ? 
                profile.last_name.toUpperCase() : '';
              displayName = `${firstName} ${lastName}`.trim();
            } else if (profile.username) {
              displayName = profile.username.charAt(0).toUpperCase() + profile.username.slice(1);
            }

            setUserName(displayName);
            // Mettre à jour le localStorage pour la prochaine fois
            localStorage.setItem('user', JSON.stringify({ ...profile, display_name: displayName }));
          }
        } catch (e) {
          console.error('Erreur chargement profil:', e);
          // Fallback au localStorage
          const userStr = localStorage.getItem('user');
          if (userStr) {
            const u = JSON.parse(userStr);
            setUserName(u.display_name || u.first_name || u.username || 'Utilisateur');
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
          {`${t('common.dashboard')} | ${t('common.appName')}`}
        </title>
      </Head>

      {/* Welcome Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-black ai-gradient-text tracking-tight">
          {t('dashboard.welcome')}, {userName}! 👋
        </h1>
        <p className="text-slate-400 mt-2 font-medium">{t('dashboard.subtitle')}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
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
      <div className="grid lg:grid-cols-3 gap-8 mb-10">
        <Card className="lg:col-span-2 ai-button border-none text-white overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:scale-110 transition-transform duration-700"></div>
          <CardContent className="p-10 relative z-10">
            <h3 className="text-3xl font-black mb-4 tracking-tight">{t('dashboard.cta.title')}</h3>
            <p className="text-indigo-100 text-lg mb-8 max-w-md opacity-90">{t('dashboard.cta.subtitle')}</p>

            <div className="flex gap-4 flex-wrap">
              <Link href="/documents/upload">
                <Button className="h-12 px-6 bg-white text-primary font-bold hover:bg-slate-50 shadow-2xl">
                  <Plus className="w-5 h-5 mr-2" />
                  {t('dashboard.cta.uploadDocument')}
                </Button>
              </Link>

              <Button
                variant="outline"
                className="h-12 px-6 bg-transparent border-2 border-white/30 text-white hover:bg-white/10 transition-all font-bold backdrop-blur-sm"
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
                    <Sparkles className="w-5 h-5 mr-2" />
                    {t('dashboard.cta.generateQuiz')}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </div>

            {quizError && (
              <div className="mt-6 p-4 rounded-2xl bg-black/20 border border-white/10 text-white/90 text-sm backdrop-blur-md">
                {quizError}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card border-white/5">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white">{t('dashboard.recentActivity')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">
                Aucune activité récente.
              </p>
            ) : (
              recentActivity.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-1 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary ai-glow" />
                    <div>
                      <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">{item.action}</p>
                      <p className="text-xs text-slate-500 font-medium">{item.subject}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {item.score && <p className="text-sm font-black ai-gradient-text">{item.score}</p>}
                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-tighter">{formatDate(item.timestamp)}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Documents */}
      <Card className="glass-card border-white/5 overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-6">
          <CardTitle className="text-2xl font-bold text-white tracking-tight">{t('dashboard.recentDocuments')}</CardTitle>
          <Link href="/documents" className="text-sm ai-gradient-text hover:opacity-80 transition-opacity font-bold">
            {t('dashboard.viewAll')} →
          </Link>
        </CardHeader>

        <CardContent className="pt-8">
          {isLoadingNotes ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
          ) : errorNotes ? (
            <div className="text-center py-12">
              <p className="text-red-400 mb-6 font-medium">{errorNotes}</p>
              <Button onClick={fetchNotes} variant="outline" className="glass-card">
                Réessayer
              </Button>
            </div>
          ) : recentNotes.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <FileText className="w-10 h-10 text-slate-700" />
              </div>
              <p className="text-slate-500 font-medium text-lg">Aucun document uploadé</p>
              <Link href="/documents/upload">
                <Button variant="outline" className="mt-8 glass-card border-white/10 hover:bg-white/5">
                  <Plus className="w-4 h-4 mr-2" />
                  Uploader votre premier document
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {recentNotes.map((note) => {
                const fileUrl = note.file_url || note.file || '';
                const title =
                  note.title ||
                  (fileUrl ? decodeURIComponent(fileUrl.split('/').pop() || '') : 'Document');
                const fileType = note.file_type;
                const uploadedAt = note.uploaded_at;

                return (
                  <div
                    key={note.id}
                    className="p-6 rounded-[2rem] glass-card border-white/5 hover:border-primary/30 hover:bg-white/5 transition-all cursor-pointer group relative overflow-hidden"
                    onClick={() => {
                      if (fileUrl) window.open(fileUrl, '_blank', 'noopener,noreferrer');
                    }}
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>

                    <p className="font-bold text-white text-lg mb-2 truncate group-hover:text-primary transition-colors">
                      {title || 'Document'}
                    </p>

                    <div className="flex items-center flex-wrap gap-x-3 text-xs text-slate-500 font-bold uppercase tracking-widest">
                      <span className="px-2 py-1 bg-white/5 rounded-md text-slate-400">{getFileIcon(fileType, fileUrl)}</span>

                      {uploadedAt && (
                        <span className="opacity-60">{formatDate(uploadedAt)}</span>
                      )}

                      {typeof note.file_size === 'number' && (
                        <span className="opacity-60">{formatFileSize(note.file_size)}</span>
                      )}
                    </div>

                    {fileUrl && (
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-6 flex items-center text-sm font-black ai-gradient-text"
                        onClick={(e) => e.stopPropagation()}
                      >
                        📄 Ouvrir <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
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
    <Card className="glass-card border-white/5 overflow-hidden group">
      <CardContent className="p-8 relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
        <div className="flex items-start justify-between relative z-10">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{title}</p>
            <p className="text-4xl font-black text-white group-hover:ai-gradient-text transition-colors">{value}</p>
            {change && <p className="text-xs font-bold text-emerald-400 mt-2 flex items-center gap-1"><TrendingUp className="w-3 h-3"/> {change}</p>}
          </div>
          <div
            className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-2xl group-hover:scale-110 transition-transform duration-500`}
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