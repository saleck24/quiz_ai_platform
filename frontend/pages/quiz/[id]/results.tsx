import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Trophy } from 'lucide-react';

export default function QuizResultsPage() {
    const { t } = useTranslation('common');
    const score = 85;
    const total = 10;

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
                                {score}%
                            </p>
                            <p className="text-slate-500 mt-2">8/{total} correct answers</p>
                        </div>

                        <div className="flex justify-center gap-4">
                            <Link href="/dashboard">
                                <Button variant="outline">{t('quiz.results.backToDashboard')}</Button>
                            </Link>
                            <Link href="/quiz/generate">
                                <Button className="bg-gradient-to-r from-indigo-600 to-purple-600">
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
