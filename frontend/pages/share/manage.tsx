import React, { useState } from 'react';
import Head from 'next/head';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Link2, Copy, Trash2, Clock, Users, ExternalLink, Plus, Check } from 'lucide-react';

const sharedLinks = [
    { id: '1', title: 'Molecular Biology Quiz', code: 'bio-quiz-x8d9s', views: 24, expires: '2 days', status: 'active' },
    { id: '2', title: 'Calculus Practice Test', code: 'calc-test-m29dk', views: 156, expires: 'Expired', status: 'expired' },
    { id: '3', title: 'Physics Mechanics', code: 'phys-mech-k4j2l', views: 87, expires: '5 days', status: 'active' },
];

export default function ManageLinksPage() {
    const { t } = useTranslation('common');
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const handleCopy = (id: string, code: string) => {
        navigator.clipboard.writeText(`https://quizgenius.com/s/${code}`);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <Layout>
            <Head>
                <title>{t('share.title')} | {t('common.appName')}</title>
            </Head>

            <div className="max-w-5xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">{t('share.title')}</h1>
                        <p className="text-slate-500 mt-1">{t('share.subtitle')}</p>
                    </div>
                    <Button className="bg-slate-900 hover:bg-slate-800">
                        <Plus className="w-5 h-5 mr-2" />
                        {t('share.createNew')}
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <Card>
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                                <Link2 className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900">12</p>
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
                                <p className="text-2xl font-bold text-slate-900">267</p>
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
                                <p className="text-2xl font-bold text-slate-900">8</p>
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
                        <div className="divide-y divide-slate-100">
                            {sharedLinks.map((link) => (
                                <div key={link.id} className="p-5 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${link.status === 'active' ? 'bg-emerald-100' : 'bg-slate-100'
                                        }`}>
                                        <Link2 className={`w-6 h-6 ${link.status === 'active' ? 'text-emerald-600' : 'text-slate-400'}`} />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-slate-900 truncate">{link.title}</p>
                                        <p className="text-sm text-slate-500 font-mono">quizgenius.com/s/{link.code}</p>
                                    </div>

                                    <div className="hidden md:flex items-center gap-6 text-sm">
                                        <div className="text-center">
                                            <p className="font-semibold text-slate-900">{link.views}</p>
                                            <p className="text-slate-500">{t('share.views')}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className={`font-semibold ${link.status === 'active' ? 'text-emerald-600' : 'text-slate-400'}`}>
                                                {link.status === 'expired' ? t('share.expired') : link.expires}
                                            </p>
                                            <p className="text-slate-500">{t('share.expires')}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleCopy(link.id, link.code)}
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
                                            className="text-slate-500 hover:text-slate-700"
                                        >
                                            <ExternalLink className="w-5 h-5" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-slate-500 hover:text-red-600"
                                            disabled={link.status === 'expired'}
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
    return {
        props: {
            ...(await serverSideTranslations(locale ?? 'en', ['common'])),
        },
    };
};
