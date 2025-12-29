import React from 'react';
import { useRouter } from 'next/router';
import { Globe } from 'lucide-react';

const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
];

export default function LanguageSwitcher() {
    const router = useRouter();
    const { pathname, asPath, query, locale } = router;

    const handleChange = (newLocale: string) => {
        router.push({ pathname, query }, asPath, { locale: newLocale });
    };

    const currentLang = languages.find(l => l.code === locale) || languages[0];

    return (
        <div className="relative group">
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors">
                <Globe className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-medium text-slate-700">{currentLang.flag}</span>
            </button>
            <div className="absolute right-0 top-full mt-1 py-2 bg-white rounded-xl border border-slate-200 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 min-w-[140px]">
                {languages.map((lang) => (
                    <button
                        key={lang.code}
                        onClick={() => handleChange(lang.code)}
                        className={`w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-slate-50 transition-colors ${locale === lang.code ? 'text-indigo-600 font-medium bg-indigo-50' : 'text-slate-700'
                            }`}
                    >
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
