import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { User, Mail, Globe, Shield, Bell, Save, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api';

export default function SettingsPage() {
    const { t } = useTranslation('common');
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const profile = await apiClient.getUserProfile();
                setUser(profile);
            } catch (error) {
                console.error("Failed to load profile:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

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
                <title>{`${t('common.settings')} | ${t('common.appName')}`}</title>
            </Head>

            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">{t('common.settings')}</h1>
                    <p className="text-slate-500 mt-1">Gérez vos préférences et les informations de votre compte</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Navigation Sidebar */}
                    <div className="space-y-2">
                        <Button variant="ghost" className="w-full justify-start gap-3 bg-indigo-50 text-indigo-700">
                            <User className="w-5 h-5" />
                            Profil
                        </Button>
                        <Button variant="ghost" className="w-full justify-start gap-3 text-slate-600">
                            <Globe className="w-5 h-5" />
                            Langue & Région
                        </Button>
                        <Button variant="ghost" className="w-full justify-start gap-3 text-slate-600">
                            <Shield className="w-5 h-5" />
                            Sécurité
                        </Button>
                        <Button variant="ghost" className="w-full justify-start gap-3 text-slate-600">
                            <Bell className="w-5 h-5" />
                            Notifications
                        </Button>
                    </div>

                    {/* Main Content */}
                    <div className="md:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Informations Personnelles</CardTitle>
                                <CardDescription>Mettez à jour vos informations de base</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Prénom</label>
                                        <input
                                            type="text"
                                            className="w-full p-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                            defaultValue={user?.first_name}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Nom</label>
                                        <input
                                            type="text"
                                            className="w-full p-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                            defaultValue={user?.last_name}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="email"
                                            className="w-full pl-10 p-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-500"
                                            disabled
                                            defaultValue={user?.email}
                                        />
                                    </div>
                                    <p className="text-xs text-slate-500">L'adresse email ne peut pas être modifiée.</p>
                                </div>
                                <div className="pt-4">
                                    <Button className="bg-slate-900 hover:bg-slate-800 gap-2">
                                        <Save className="w-4 h-4" />
                                        Enregistrer les modifications
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-red-100 bg-red-50/30">
                            <CardHeader>
                                <CardTitle className="text-red-900">Zone de Danger</CardTitle>
                                <CardDescription>Actions irréversibles pour votre compte</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 bg-white">
                                    Supprimer mon compte
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
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
