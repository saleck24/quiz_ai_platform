import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/router';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Sparkles, Mail, Lock, User, ArrowRight, Check } from 'lucide-react';

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
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
            console.log('Register data:', data);
            router.push('/login');
        } catch (err) {
            setError("Registration failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            <Head>
                <title>Create Account | QuizGenius</title>
            </Head>

            {/* Left Panel - Decorative */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-500 p-12 flex-col justify-between relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>

                <div className="relative z-10">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-white">QuizGenius</span>
                    </Link>
                </div>

                <div className="relative z-10">
                    <h2 className="text-3xl font-bold text-white mb-6">Start your learning journey today</h2>
                    <ul className="space-y-4">
                        {[
                            "Upload any document format",
                            "AI generates smart quizzes",
                            "Track your progress",
                            "Share with classmates",
                        ].map((feature, i) => (
                            <li key={i} className="flex items-center gap-3 text-white/90">
                                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                                    <Check className="w-4 h-4 text-white" />
                                </div>
                                {feature}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50">
                <div className="w-full max-w-md">
                    <div className="lg:hidden mb-8 flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-slate-900">QuizGenius</span>
                    </div>

                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Create your account</h1>
                    <p className="text-slate-600 mb-8">Join thousands of students learning smarter</p>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium text-slate-700">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="John Doe"
                                    className="pl-10 h-12 bg-white border-slate-200"
                                    disabled={isLoading}
                                    error={errors.name?.message}
                                    {...register('name')}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium text-slate-700">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    className="pl-10 h-12 bg-white border-slate-200"
                                    disabled={isLoading}
                                    error={errors.email?.message}
                                    {...register('email')}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium text-slate-700">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Create a strong password"
                                    className="pl-10 h-12 bg-white border-slate-200"
                                    disabled={isLoading}
                                    error={errors.password?.message}
                                    {...register('password')}
                                />
                            </div>
                            {/* Password Strength Indicator */}
                            <div className="grid grid-cols-2 gap-2 mt-3">
                                {passwordChecks.map((check, i) => (
                                    <div key={i} className={`flex items-center gap-2 text-xs ${check.valid ? 'text-emerald-600' : 'text-slate-400'}`}>
                                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${check.valid ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                                            {check.valid && <Check className="w-3 h-3" />}
                                        </div>
                                        {check.label}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">Confirm Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="Confirm your password"
                                    className="pl-10 h-12 bg-white border-slate-200"
                                    disabled={isLoading}
                                    error={errors.confirmPassword?.message}
                                    {...register('confirmPassword')}
                                />
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
                            Create Account
                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </form>

                    <p className="mt-8 text-center text-slate-600">
                        Already have an account?{' '}
                        <Link href="/login" className="text-indigo-600 font-semibold hover:text-indigo-700">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
