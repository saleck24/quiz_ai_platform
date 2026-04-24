import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/router';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { apiClient } from '@/lib/api';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticProps } from 'next';
import { Sparkles, Mail, Lock, User, ArrowRight, Check, Eye, EyeOff, BookOpen, BrainCircuit } from 'lucide-react';

const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email"),
    password: z.string()
        .min(10, "At least 10 characters")
        .regex(/[A-Z]/, "At least one uppercase letter")
        .regex(/[0-9]/, "At least one number")
        .regex(/[^A-Za-z0-9]/, "At least one special character"),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const { t } = useTranslation('common');
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { register, handleSubmit, formState: { errors }, watch } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
    });

    const password = watch("password", "");

    const passwordChecks = [
        { label: "At least 10 characters", valid: password.length >= 10 },
        { label: "One uppercase letter", valid: /[A-Z]/.test(password) },
        { label: "One number", valid: /[0-9]/.test(password) },
        { label: "One special character", valid: /[^A-Za-z0-9]/.test(password) },
    ];

    const onSubmit = async (data: RegisterFormValues) => {
        setIsLoading(true);
        setError(null);

        try {
            // 1. Appel à l'API via apiClient
            const result = await apiClient.register({
                name: data.name,
                email: data.email,
                password: data.password,
                confirmPassword: data.confirmPassword,
            });

            // 5. Rediriger vers la page de login
            router.push('/login?registered=true'); // Paramètre pour afficher un message de succès

        } catch (err) {
            // 6. Gérer les erreurs
            console.error('Erreur d\'inscription:', err);

            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Une erreur est survenue. Veuillez réessayer.");
            }
        } finally {
            // 7. Toujours désactiver le loading
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex text-white">
            <Head>
                <title>{`Create Account | ${t('common.appName')}`}</title>
            </Head>

            {/* Left Panel - Decorative */}
            <div className="hidden lg:flex lg:w-1/2 ai-button p-16 flex-col justify-between relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-20 scale-150"></div>

                <div className="relative z-10">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-3xl font-black text-white tracking-tighter">QuizGenius</span>
                    </Link>
                </div>

                <div className="relative z-10 max-w-lg">
                    <h2 className="text-6xl font-black text-white mb-8 tracking-tighter leading-[0.9]">
                        L'IA qui <br/><span className="text-secondary">révolutionne</span> <br/>vos études.
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

                    <h1 className="text-5xl font-black text-white mb-3 tracking-tight">Inscription</h1>
                    <p className="text-slate-400 mb-10 text-lg font-medium">Rejoignez des milliers d'étudiants connectés</p>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Nom complet</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="John Doe"
                                    className="pl-12 h-14 glass-card !bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-primary/50 focus:ring-primary/20 rounded-2xl"
                                    disabled={isLoading}
                                    error={errors.name?.message}
                                    {...register('name')}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="email" className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    className="pl-12 h-14 glass-card !bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-primary/50 focus:ring-primary/20 rounded-2xl"
                                    disabled={isLoading}
                                    error={errors.email?.message}
                                    {...register('email')}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="password" className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Mot de passe</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Choisissez un mot de passe fort"
                                    className="pl-12 pr-12 h-14 glass-card !bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-primary/50 focus:ring-primary/20 rounded-2xl"
                                    disabled={isLoading}
                                    error={errors.password?.message}
                                    {...register('password')}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-4 px-1">
                                {passwordChecks.map((check, i) => (
                                    <div key={i} className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider ${check.valid ? 'text-secondary' : 'text-slate-600'}`}>
                                        <div className={`w-4 h-4 rounded-lg flex items-center justify-center ${check.valid ? 'bg-secondary/20' : 'bg-white/5'}`}>
                                            {check.valid && <Check className="w-3 h-3" />}
                                        </div>
                                        {check.label}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="confirmPassword" className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Confirmer le mot de passe</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <Input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Confirmez votre mot de passe"
                                    className="pl-12 pr-12 h-14 glass-card !bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-primary/50 focus:ring-primary/20 rounded-2xl"
                                    disabled={isLoading}
                                    error={errors.confirmPassword?.message}
                                    {...register('confirmPassword')}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                                >
                                    {showConfirmPassword ? (
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
                            Créer mon compte
                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </form>

                    <p className="mt-10 text-center text-slate-500 font-medium">
                        Déjà un compte ?{' '}
                        <Link href="/login" className="ai-gradient-text hover:opacity-80 transition-opacity">
                            Se connecter
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
    props: {
        ...(await serverSideTranslations(locale ?? 'fr', ['common'])),
    },
});
