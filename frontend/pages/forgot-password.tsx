import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Sparkles, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { apiClient } from '@/lib/api';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setIsLoading(true);
        setError(null);

        try {
            await apiClient.requestPasswordReset(email);
            setIsSubmitted(true);
        } catch (err) {
            console.error("Password reset error:", err);
            setError("Failed to send reset link. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
            <Head>
                <title>Reset Password | QuizGenius</title>
            </Head>

            <div className="w-full max-w-md">
                <div className="mb-8 flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold text-slate-900">QuizGenius</span>
                </div>

                {isSubmitted ? (
                    <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8 text-emerald-600" />
                            </div>
                            <h1 className="text-2xl font-bold text-slate-900 mb-2">Check your email</h1>
                            <p className="text-slate-600 mb-6">
                                We've sent a password reset link to <strong>{email}</strong>
                            </p>
                            <Link href="/login">
                                <Button className="w-full bg-slate-900 hover:bg-slate-800">
                                    Back to Login
                                </Button>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                        <h1 className="text-2xl font-bold text-slate-900 mb-2">Reset your password</h1>
                        <p className="text-slate-600 mb-6">Enter your email and we'll send you a reset link</p>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium text-slate-700">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        className="pl-10 h-12"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                isLoading={isLoading}
                                className="w-full h-12 bg-slate-900 hover:bg-slate-800"
                            >
                                Send Reset Link
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <Link href="/login" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
                                <ArrowLeft className="w-4 h-4" />
                                Back to Login
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
