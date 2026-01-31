import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Trophy, Share2, Copy, Check, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useState } from 'react';
import { useRouter } from 'next/router';

export default function QuizResultsPage() {
    const { t } = useTranslation('common');
    const router = useRouter();
    const { score: scoreQuery, total: totalQuery } = router.query;

    const score = Number(scoreQuery) || 0;
    const total = Number(totalQuery) || 0;
    const { id: quizId } = router.query;
    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

    const [isSharing, setIsSharing] = useState(false);
    const [shareToken, setShareToken] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    const handleShare = async () => {
        if (!quizId) return;
        setIsSharing(true);
        try {
            const session = await apiClient.createQuizSession(quizId as string);
            if (session?.token) {
                setShareToken(session.token);
            }
        } catch (error) {
            console.error("Erreur lors de la création de la session:", error);
        } finally {
            setIsSharing(false);
        }
    };

    const [baseUrl, setBaseUrl] = useState('');

    useEffect(() => {
        setBaseUrl(window.location.origin);
    }, []);

    const copyToClipboard = () => {
        if (!shareToken) return;
        const url = `${baseUrl}/s/${shareToken}`;
        navigator.clipboard.writeText(url);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <Layout>
            <Head>
                <title>{t('quiz.results.title')} | {t('common.appName')}</title>
            </Head>

            <div className="max-w-2xl mx-auto">
                <Card className="text-center">
                    <CardContent className="p-12">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-500/30">
                            <Trophy className="w-12 h-12 text-white" />
                        </div>

                        <h1 className="text-3xl font-bold text-slate-900 mb-4">{t('quiz.results.title')}</h1>

                        <div className="mb-8">
                            <p className="text-slate-500 mb-2">{t('quiz.results.yourScore')}</p>
                            <p className="text-6xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                {percentage}%
                            </p>
                            <p className="text-slate-500 mt-2">{score}/{total} {t('quiz.results.correctAnswers') || "correct answers"}</p>
                        </div>

                        {shareToken ? (
                            <div className="mb-8 p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
                                <div className="flex-1 text-left truncate text-sm font-mono text-slate-600">
                                    {baseUrl}/s/{shareToken}
                                </div>
                                <Button size="sm" variant="ghost" onClick={copyToClipboard} className="text-indigo-600">
                                    {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                </Button>
                            </div>
                        ) : (
                            <div className="mb-8">
                                <Button
                                    variant="outline"
                                    className="w-full flex items-center justify-center gap-2 py-6 border-dashed border-2 hover:border-indigo-300 hover:bg-indigo-50/50"
                                    onClick={handleShare}
                                    disabled={isSharing}
                                >
                                    {isSharing ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <Share2 className="w-5 h-5 text-indigo-600" />
                                            <span>{t('share.createNew') || "Partager ce quiz"}</span>
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}

                        <div className="flex justify-center gap-4">
                            <Link href="/dashboard">
                                <Button variant="outline" className="flex-1">{t('quiz.results.backToDashboard')}</Button>
                            </Link>
                            <Link href="/quiz/generate">
                                <Button className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600">
                                    {t('quiz.results.tryAgain')}
                                </Button>
                            </Link>
                        </div>
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
