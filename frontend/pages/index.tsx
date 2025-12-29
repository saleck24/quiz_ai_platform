import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { Button } from '@/components/ui/Button';
import { Shield, BookOpen, BrainCircuit, Share2, Sparkles, ArrowRight } from 'lucide-react';

export default function Home() {
  const { t } = useTranslation('common');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <Head>
        <title>QuizGenius - {t('landing.hero.titleHighlight')}</title>
        <meta name="description" content={t('landing.hero.subtitle')} />
      </Head>

      {/* Navigation */}
      <nav className="fixed w-full top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">{t('common.appName')}</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-slate-700">{t('common.login')}</Button>
            </Link>
            <Link href="/register">
              <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25">
                {t('common.register')}
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 mb-8">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-medium text-indigo-700">{t('landing.badge')}</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 leading-tight">
            {t('landing.hero.title')}
            <span className="block bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              {t('landing.hero.titleHighlight')}
            </span>
          </h1>

          <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            {t('landing.hero.subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="h-14 px-8 text-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-xl shadow-indigo-500/30 group">
                {t('landing.hero.cta')}
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="h-14 px-8 text-lg border-slate-300 hover:bg-slate-50">
                {t('landing.hero.existingUser')}
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            {[
              { value: '10K+', label: 'Active Students' },
              { value: '50K+', label: 'Quizzes Generated' },
              { value: '98%', label: 'Satisfaction Rate' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{stat.value}</div>
                <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 bg-slate-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">{t('landing.features.title')}</h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">{t('landing.features.subtitle')}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={<Shield className="w-7 h-7" />}
              title={t('landing.features.security.title')}
              description={t('landing.features.security.description')}
              gradient="from-blue-500 to-cyan-400"
            />
            <FeatureCard
              icon={<BookOpen className="w-7 h-7" />}
              title={t('landing.features.uploads.title')}
              description={t('landing.features.uploads.description')}
              gradient="from-emerald-500 to-teal-400"
            />
            <FeatureCard
              icon={<BrainCircuit className="w-7 h-7" />}
              title={t('landing.features.ai.title')}
              description={t('landing.features.ai.description')}
              gradient="from-purple-500 to-pink-400"
            />
            <FeatureCard
              icon={<Share2 className="w-7 h-7" />}
              title={t('landing.features.sharing.title')}
              description={t('landing.features.sharing.description')}
              gradient="from-orange-500 to-amber-400"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-12 rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-700 shadow-2xl shadow-indigo-500/30">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t('landing.cta.title')}</h2>
            <p className="text-indigo-100 text-lg mb-8">{t('landing.cta.subtitle')}</p>
            <Link href="/register">
              <Button size="lg" className="h-14 px-10 text-lg bg-white text-indigo-700 hover:bg-indigo-50 shadow-xl">
                {t('landing.cta.button')}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-slate-900">{t('common.appName')}</span>
          </div>
          <p className="text-slate-500 text-sm">© {new Date().getFullYear()} {t('common.appName')}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, gradient }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}) {
  return (
    <div className="group p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-all duration-300 hover:-translate-y-1">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
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
