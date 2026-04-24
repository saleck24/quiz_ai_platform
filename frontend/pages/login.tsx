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
import { Sparkles, Mail, Lock, ArrowRight, Eye, EyeOff, BookOpen, BrainCircuit, Check } from 'lucide-react';

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
            // 1. Appel à l'API via apiClient
            const result = await apiClient.login(data.email, data.password);

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
        <div className="min-h-screen flex text-white" dir={router.locale === 'ar' ? 'rtl' : 'ltr'}>
            <Head>
                <title>{`${t('common.login')} | ${t('common.appName')}`}</title>
            </Head>

            {/* Left Panel - Decorative */}
            <div className="hidden lg:flex lg:w-1/2 ai-button p-16 flex-col justify-between relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-20 scale-150"></div>

                <div className="relative z-10">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-3xl font-black text-white tracking-tighter">{t('common.appName')}</span>
                    </Link>
                </div>

                <div className="relative z-10 max-w-lg">
                    <h2 className="text-6xl font-black text-white mb-8 tracking-tighter leading-[0.9]">
                        L'IA qui <br /><span className="text-secondary">révolutionne</span> <br />vos études.
                    </h2>

                    <div className="grid grid-cols-1 gap-4 mt-12">
                        {[
                            { icon: BrainCircuit, text: "Génération de quiz par IA", desc: "Transformez vos PDF en questions pertinentes" },
                            { icon: BookOpen, text: "Apprentissage Adaptatif", desc: "L'IA s'ajuste à votre niveau réel" },
                            { icon: Check, text: "Succès Garanti", desc: "Boostez vos notes de 40% en moyenne" }
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-5 p-6 glass-card border-white/10 rounded-3xl group hover:bg-white/5 transition-all">
                                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <item.icon className="w-6 h-6 text-secondary" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-lg">{item.text}</h3>
                                    <p className="text-white/50 text-sm">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
                <div className="w-full max-w-md relative z-10">
                    <div className="lg:hidden mb-12 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl ai-button flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-black ai-gradient-text">{t('common.appName')}</span>
                    </div>

                    <h1 className="text-5xl font-black text-white mb-3 tracking-tight">{t('auth.welcomeBack')}</h1>
                    <p className="text-slate-400 mb-10 text-lg font-medium">{t('auth.enterCredentials')}</p>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">{t('auth.email')}</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 rtl:left-auto rtl:right-4" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    className="pl-12 rtl:pl-4 rtl:pr-12 h-14 glass-card !bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-primary/50 focus:ring-primary/20 rounded-2xl transition-all"
                                    disabled={isLoading}
                                    error={errors.email?.message}
                                    {...register('email')}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <label htmlFor="password" className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t('auth.password')}</label>
                                <Link href="/forgot-password" className="text-xs font-bold text-secondary hover:text-white transition-colors">{t('auth.forgotPassword')}</Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 rtl:left-auto rtl:right-4" />
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="pl-12 pr-12 rtl:pl-12 rtl:pr-12 h-14 glass-card !bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-primary/50 focus:ring-primary/20 rounded-2xl transition-all"
                                    disabled={isLoading}
                                    error={errors.password?.message}
                                    {...register('password')}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors rtl:right-auto rtl:left-4"
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
                            <div className="p-4 text-sm font-bold text-red-400 bg-red-400/10 border border-red-400/20 rounded-2xl animate-shake">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full h-14 text-lg font-black ai-button border-none shadow-2xl shadow-primary/30 group mt-4"
                            isLoading={isLoading}
                        >
                            {t('auth.signIn')}
                            <ArrowRight className="ml-2 rtl:ml-0 rtl:mr-2 w-5 h-5 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                        </Button>
                    </form>

                    <p className="mt-10 text-center text-slate-500 font-medium">
                        {t('auth.noAccount')}{' '}
                        <Link href="/register" className="ai-gradient-text hover:opacity-80 transition-opacity">
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
