import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Link2, Copy, Trash2, Clock, Users, Plus, Check, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api';

type SharedLink = {
    id: number;
    token: string;
    expires_at: string;
    views_count: number;
    quiz: {
        id: number;
        note_title?: string;
    };
};

type QuizOption = { id: number; note_title: string; created_at: string };

export default function ManageLinksPage() {
    const { t } = useTranslation('common');
    const [links, setLinks] = useState<SharedLink[]>([]);
    const [quizzes, setQuizzes] = useState<QuizOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<number | null>(null);
    const [showCreate, setShowCreate] = useState(false);
    const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null);
    const [creating, setCreating] = useState(false);

    const fetchLinks = async () => {
        try {
            const data = await apiClient.getQuizSessions();
            setLinks(Array.isArray(data) ? data : []);
        } catch (err: any) {
            setError(err.message || "Failed to load links");
        } finally {
            setLoading(false);
        }
    };

    const fetchQuizzes = async () => {
        try {
            const data = await apiClient.getQuizzes();
            setQuizzes(Array.isArray(data) ? data : []);
        } catch {
            setQuizzes([]);
        }
    };

    useEffect(() => {
        fetchLinks();
        fetchQuizzes();
    }, []);

    const handleCreateLink = async () => {
        if (!selectedQuizId) return;
        setCreating(true);
        try {
            const session = await apiClient.createQuizSession(selectedQuizId);
            if (session?.token) {
                setLinks(prev => [session, ...prev]);
                setShowCreate(false);
                setSelectedQuizId(null);
                const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/s/${session.token}`;
                if (typeof navigator !== 'undefined' && navigator.clipboard) {
                    navigator.clipboard.writeText(url);
                }
            }
        } catch (err: any) {
            alert(err.message || "Erreur lors de la création du lien");
        } finally {
            setCreating(false);
        }
    };

    const handleCopy = (id: number, token: string) => {
        if (typeof window === 'undefined') return;
        const url = `${window.location.origin}/s/${token}`;
        navigator.clipboard.writeText(url);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleDelete = async (id: number) => {
        if (!confirm(t('share.confirmDelete') || t('common.confirmDelete') || "Voulez-vous vraiment supprimer ce lien ?")) return;
        try {
            await apiClient.deleteQuizSession(id);
            setLinks(prev => prev.filter(l => l.id !== id));
        } catch (err: any) {
            alert(err.message || "Deletion failed");
        }
    };

    const isExpired = (expiry: string) => new Date(expiry) < new Date();
    const formatExpiry = (expiry: string) => {
        if (isExpired(expiry)) return t('share.expired');
        const diff = new Date(expiry).getTime() - new Date().getTime();
        const hours = Math.round(diff / (1000 * 60 * 60));
        return hours > 24 ? `${Math.round(hours / 24)} days` : `${hours}h remaining`;
    };

    // Stats
    const totalViews = links.reduce((acc, curr) => acc + curr.views_count, 0);
    const activeLinks = links.filter(l => !isExpired(l.expires_at)).length;

    if (loading) return (
        <Layout>
            <div className="flex justify-center items-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
            </div>
        </Layout>
    );

    return (
        <Layout>
            <Head>
                <title>{`${t('share.title')} | ${t('common.appName')}`}</title>
            </Head>

            <div className="max-w-5xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">{t('share.title')}</h1>
                        <p className="text-slate-500 mt-1">{t('share.subtitle')}</p>
                    </div>
                    <Button
                        onClick={() => setShowCreate(true)}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        {t('share.createNew')}
                    </Button>
                </div>

                {showCreate && (
                    <Card className="mb-8 border-indigo-200">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>{t('share.createNew')}</CardTitle>
                            <Button variant="ghost" size="sm" onClick={() => { setShowCreate(false); setSelectedQuizId(null); }}>×</Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">{t('share.selectQuiz')}</label>
                                <select
                                    value={selectedQuizId ?? ''}
                                    onChange={(e) => setSelectedQuizId(e.target.value ? Number(e.target.value) : null)}
                                    className="w-full h-12 rounded-xl border border-slate-200 px-4 text-slate-900"
                                >
                                    <option value="">-- {t('share.chooseQuiz')} --</option>
                                    {quizzes.map((q) => (
                                        <option key={q.id} value={q.id}>
                                            {q.note_title || `Quiz #${q.id}`}
                                        </option>
                                    ))}
                                </select>
                                {quizzes.length === 0 && !loading && (
                                    <p className="text-sm text-amber-600 mt-2">{t('share.noQuizzes')}</p>
                                )}
                            </div>
                            <Button
                                onClick={handleCreateLink}
                                disabled={!selectedQuizId || creating}
                            >
                                {creating ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> {t('share.creating')}</> : t('share.createLink')}
                            </Button>
                        </CardContent>
                    </Card>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <Card>
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                                <Link2 className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900">{links.length}</p>
                                <p className="text-sm text-slate-500">{t('share.totalLinks')}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                                <Users className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900">{totalViews}</p>
                                <p className="text-sm text-slate-500">{t('share.totalViews')}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                                <Clock className="w-6 h-6 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900">{activeLinks}</p>
                                <p className="text-sm text-slate-500">{t('share.activeLinks')}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('share.yourLinks')}</CardTitle>
                        <CardDescription>{t('share.linksDescription')}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {links.length === 0 ? (
                            <div className="p-10 text-center text-slate-500">
                                {error || "Aucun lien partagé pour le moment."}
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {links.map((link) => (
                                    <div key={link.id} className="p-5 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${!isExpired(link.expires_at) ? 'bg-emerald-100' : 'bg-slate-100'
                                            }`}>
                                            <Link2 className={`w-6 h-6 ${!isExpired(link.expires_at) ? 'text-emerald-600' : 'text-slate-400'}`} />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-slate-900 truncate">{link.quiz?.note_title || `Quiz #${link.quiz?.id}`}</p>
                                            <p className="text-sm text-slate-500 font-mono truncate">Token: {link.token}</p>
                                        </div>

                                        <div className="hidden md:flex items-center gap-6 text-sm">
                                            <div className="text-center">
                                                <p className="font-semibold text-slate-900">{link.views_count}</p>
                                                <p className="text-slate-500">{t('share.views')}</p>
                                            </div>
                                            <div className="text-center">
                                                <p className={`font-semibold ${!isExpired(link.expires_at) ? 'text-emerald-600' : 'text-slate-400'}`}>
                                                    {formatExpiry(link.expires_at)}
                                                </p>
                                                <p className="text-slate-500">{t('share.expires')}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleCopy(link.id, link.token)}
                                                className="text-slate-500 hover:text-slate-700"
                                            >
                                                {copiedId === link.id ? (
                                                    <Check className="w-5 h-5 text-emerald-600" />
                                                ) : (
                                                    <Copy className="w-5 h-5" />
                                                )}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-slate-500 hover:text-red-600"
                                                onClick={() => handleDelete(link.id)}
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
    return {
        props: {
            ...(await serverSideTranslations(locale ?? 'en', ['common'])),
        },
    };
};
