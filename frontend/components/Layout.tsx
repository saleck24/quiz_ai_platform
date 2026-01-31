import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { Button } from '@/components/ui/Button';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { Sparkles, LayoutDashboard, Upload, BrainCircuit, Share2, LogOut, Settings } from 'lucide-react';
import { apiClient } from '@/lib/api';

interface LayoutProps {
    children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    const { t } = useTranslation('common');
    const router = useRouter();
    const pathname = router.pathname;
    const [userInitials, setUserInitials] = useState('JD');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                try {
                    const user = JSON.parse(userStr);
                    setUserInitials(user.username?.substring(0, 2).toUpperCase() || 'JD');
                } catch {
                    setUserInitials('JD');
                }
            }
        }
    }, []);

    const navItems = [
        { href: '/dashboard', label: t('common.dashboard'), icon: LayoutDashboard },
        { href: '/documents/upload', label: t('common.upload'), icon: Upload },
        { href: '/quiz/generate', label: t('common.generate'), icon: BrainCircuit },
        { href: '/share/manage', label: t('common.share'), icon: Share2 },
    ];

    const handleLogout = async () => {
        try {
            await apiClient.logout(); // appelle /api/auth/logout => supprime access_token & refresh_token (HttpOnly)
        } catch (e) {
            console.error("Erreur logout:", e);
        } finally {
            // Nettoyer les infos locales (optionnel mais recommandé)
            if (typeof window !== 'undefined') {
                localStorage.removeItem("user");
                localStorage.removeItem("access_token"); // si tu l'avais stocké
            }
            router.push('/login');
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex" dir={router.locale === 'ar' ? 'rtl' : 'ltr'}>
            {/* Sidebar */}
            <aside className="w-72 bg-white border-r border-slate-200 hidden md:flex flex-col rtl:border-r-0 rtl:border-l">
                <div className="p-6 border-b border-slate-100">
                    <Link href="/dashboard" className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-slate-900">{t('common.appName')}</span>
                    </Link>
                </div>

                <nav className="flex-1 p-4">
                    <ul className="space-y-1">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                            const Icon = item.icon;
                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                            ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 font-medium'
                                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                            }`}
                                    >
                                        <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                                        {item.label}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 mb-4">
                        <p className="text-sm font-medium text-indigo-900 mb-1">Upgrade to Pro</p>
                        <p className="text-xs text-indigo-600 mb-3">Unlock unlimited quizzes</p>
                        <Button size="sm" className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm">
                            Upgrade Now
                        </Button>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        {t('common.logout')}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white border-b border-slate-200 p-4 flex justify-between items-center">
                    <div className="md:hidden flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold text-slate-900">{t('common.appName')}</span>
                    </div>
                    <div className="hidden md:block"></div>
                    <div className="flex items-center gap-4">
                        <LanguageSwitcher />
                        <Link href="/settings">
                            <button className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
                                <Settings className="w-5 h-5 text-slate-600" />
                            </button>
                        </Link>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                            {userInitials}
                        </div>
                    </div>
                </header>
                <main className="flex-1 p-6 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
