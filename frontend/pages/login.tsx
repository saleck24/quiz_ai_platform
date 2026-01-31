import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/router';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { apiClient } from '@/lib/api';
import { Sparkles, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';

const loginSchema = z.object({
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const { t } = useTranslation('common');
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormValues) => {
        setIsLoading(true);
        setError(null);

        try {
            console.log('Tentative de connexion:', data.email);

            // 1. Appel à l'API via apiClient
            const result = await apiClient.login(data.email, data.password);

            // 3. Vérifier succès (apiClient throw si erreur)
            console.log('Connexion réussie:', result.user);
            console.log('Données reçues:', result);

            // 4. Stocker les informations utilisateur dans localStorage
            localStorage.setItem('user', JSON.stringify(result.user));

            // 5. Stocker le token d'accès côté client si nécessaire
            if (result.tokens && result.tokens.access) {
                localStorage.setItem('access_token', result.tokens.access);
            }

            // 6. Vérifier que le router est prêt avant de rediriger
            if (!router.isReady) {
                await new Promise(resolve => router.events.on('routeChangeComplete', resolve));
            }

            // 7. Rediriger vers le dashboard
            console.log('Redirection vers /dashboard...');

            // Utiliser replace au lieu de push pour éviter les problèmes d'historique
            await router.replace('/dashboard');

        } catch (err) {
            console.error('Erreur de connexion:', err);

            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Identifiants invalides. Veuillez réessayer.");
            }
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex" dir={router.locale === 'ar' ? 'rtl' : 'ltr'}>
            <Head>
                <title>{t('common.login')} | {t('common.appName')}</title>
            </Head>

            {/* Left Panel - Decorative */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-12 flex-col justify-between relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>

                <div className="relative z-10">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-white">{t('common.appName')}</span>
                    </Link>
                </div>

                <div className="relative z-10">
                    <blockquote className="text-xl text-white/90 font-medium leading-relaxed mb-6">
                        "QuizGenius transformed how I study. I went from struggling with exams to acing them!"
                    </blockquote>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm"></div>
                        <div>
                            <p className="text-white font-semibold">Sarah Johnson</p>
                            <p className="text-white/70 text-sm">Medical Student</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50">
                <div className="w-full max-w-md">
                    <div className="lg:hidden mb-8 flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-slate-900">{t('common.appName')}</span>
                    </div>

                    <h1 className="text-3xl font-bold text-slate-900 mb-2">{t('auth.welcomeBack')}</h1>
                    <p className="text-slate-600 mb-8">{t('auth.enterCredentials')}</p>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium text-slate-700">{t('auth.email')}</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 rtl:left-auto rtl:right-3" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    className="pl-10 rtl:pl-4 rtl:pr-10 h-12 bg-white text-slate-900 placeholder:text-slate-400 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                                    disabled={isLoading}
                                    error={errors.email?.message}
                                    {...register('email')}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <label htmlFor="password" className="text-sm font-medium text-slate-700">{t('auth.password')}</label>
                                <Link href="/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-700">{t('auth.forgotPassword')}</Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 rtl:left-auto rtl:right-3" />
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="pl-10 pr-10 rtl:pl-10 rtl:pr-10 h-12 bg-white text-slate-900 placeholder:text-slate-400 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                                    disabled={isLoading}
                                    error={errors.password?.message}
                                    {...register('password')}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 rtl:right-auto rtl:left-3"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full h-12 text-base bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/25 group"
                            isLoading={isLoading}
                        >
                            {t('auth.signIn')}
                            <ArrowRight className="ml-2 rtl:ml-0 rtl:mr-2 w-5 h-5 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                        </Button>
                    </form>

                    <p className="mt-8 text-center text-slate-600">
                        {t('auth.noAccount')}{' '}
                        <Link href="/register" className="text-indigo-600 font-semibold hover:text-indigo-700">
                            {t('auth.createFree')}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
    return {
        props: {
            ...(await serverSideTranslations(locale ?? 'en', ['common'])),
        },
    };
};
