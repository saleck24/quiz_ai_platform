import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FileText, BrainCircuit, TrendingUp, Clock, Plus, ArrowRight } from 'lucide-react';

export default function Dashboard() {
    const { t } = useTranslation('common');

    return (
        <Layout>
            <Head>
                <title>{t('common.dashboard')} | {t('common.appName')}</title>
            </Head>

            {/* Welcome Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">{t('dashboard.welcome')}, John! 👋</h1>
                <p className="text-slate-500 mt-1">{t('dashboard.subtitle')}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title={t('dashboard.stats.documents')}
                    value="12"
                    change="+3 this week"
                    icon={<FileText className="w-6 h-6" />}
                    gradient="from-blue-500 to-cyan-400"
                />
                <StatCard
                    title={t('dashboard.stats.quizzesTaken')}
                    value="28"
                    change="+5 this week"
                    icon={<BrainCircuit className="w-6 h-6" />}
                    gradient="from-purple-500 to-pink-400"
                />
                <StatCard
                    title={t('dashboard.stats.averageScore')}
                    value="87%"
                    change="+12% improvement"
                    icon={<TrendingUp className="w-6 h-6" />}
                    gradient="from-emerald-500 to-teal-400"
                />
                <StatCard
                    title={t('dashboard.stats.studyTime')}
                    value="14h"
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
                        <div className="flex gap-4">
                            <Link href="/documents/upload">
                                <Button className="bg-white text-indigo-700 hover:bg-indigo-50 shadow-lg">
                                    <Plus className="w-5 h-5 mr-2" />
                                    {t('dashboard.cta.uploadDocument')}
                                </Button>
                            </Link>
                            <Link href="/quiz/generate">
                                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                                    {t('dashboard.cta.generateQuiz')}
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">{t('dashboard.recentActivity')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[
                            { action: 'Completed quiz', subject: 'Cell Biology', time: '2h ago', score: '92%' },
                            { action: 'Uploaded', subject: 'Chapter 5 Notes', time: '5h ago' },
                            { action: 'Completed quiz', subject: 'Organic Chemistry', time: '1d ago', score: '78%' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                                <div>
                                    <p className="text-sm font-medium text-slate-900">{item.action}</p>
                                    <p className="text-xs text-slate-500">{item.subject}</p>
                                </div>
                                <div className="text-right">
                                    {item.score && <p className="text-sm font-semibold text-emerald-600">{item.score}</p>}
                                    <p className="text-xs text-slate-400">{item.time}</p>
                                </div>
                            </div>
                        ))}
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
                    <div className="grid md:grid-cols-3 gap-4">
                        {[
                            { name: 'Molecular Biology Ch. 12', type: 'PDF', date: 'Dec 12, 2024' },
                            { name: 'Calculus Integration', type: 'DOCX', date: 'Dec 10, 2024' },
                            { name: 'Physics Mechanics Notes', type: 'PDF', date: 'Dec 8, 2024' },
                        ].map((doc, i) => (
                            <div key={i} className="p-4 rounded-xl border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all cursor-pointer group">
                                <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center mb-3 group-hover:bg-indigo-200 transition-colors">
                                    <FileText className="w-5 h-5 text-indigo-600" />
                                </div>
                                <p className="font-medium text-slate-900 text-sm mb-1 truncate">{doc.name}</p>
                                <p className="text-xs text-slate-500">{doc.type} • {doc.date}</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </Layout>
    );
}

function StatCard({ title, value, change, icon, gradient }: {
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
                        <p className="text-xs text-emerald-600 mt-1">{change}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-lg`}>
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
