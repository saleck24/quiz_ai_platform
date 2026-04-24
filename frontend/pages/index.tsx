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
    <div className="min-h-screen text-slate-100">
      <Head>
        <title>{`QuizGenius - ${t('landing.hero.titleHighlight')}`}</title>
        <meta name="description" content={t('landing.hero.subtitle')} />
      </Head>

      {/* Navigation */}
      <nav className="fixed w-full top-0 z-50 glass-card !bg-background/60 !border-b !border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl ai-button flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold ai-gradient-text">{t('common.appName')}</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-white/5">{t('common.login')}</Button>
            </Link>
            <Link href="/register">
              <Button className="ai-button border-none text-white shadow-lg shadow-primary/25">
                {t('common.register')}
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-48 pb-20 px-6 relative overflow-hidden">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8 border-primary/20">
            <Sparkles className="w-4 h-4 text-secondary" />
            <span className="text-sm font-medium ai-gradient-text">{t('landing.badge')}</span>
          </div>

          <h1 className="text-5xl md:text-8xl font-black mb-6 leading-tight tracking-tight">
            <span className="text-white">{t('landing.hero.title')}</span>
            <span className="block ai-gradient-text">
              {t('landing.hero.titleHighlight')}
            </span>
          </h1>

          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            {t('landing.hero.subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link href="/register">
              <Button size="lg" className="h-16 px-10 text-lg ai-button border-none shadow-2xl shadow-primary/40 group">
                {t('landing.hero.cta')}
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="h-16 px-10 text-lg glass-card border-white/10 hover:bg-white/5">
                {t('landing.hero.existingUser')}
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-24 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {[
              { value: '10K+', label: 'Active Students' },
              { value: '50K+', label: 'Quizzes Generated' },
              { value: '98%', label: 'Satisfaction Rate' },
            ].map((stat, i) => (
              <div key={i} className="glass-card p-6 rounded-2xl ai-glow">
                <div className="text-3xl font-black ai-gradient-text">{stat.value}</div>
                <div className="text-xs text-slate-500 uppercase tracking-widest mt-2 font-bold">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">{t('landing.features.title')}</h2>
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
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-16 rounded-[2.5rem] ai-button border-none shadow-3xl shadow-primary/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl -translate-y-1/2 translate-x-1/2 rounded-full" />
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 relative z-10">{t('landing.cta.title')}</h2>
            <p className="text-indigo-100 text-xl mb-12 max-w-xl mx-auto relative z-10">{t('landing.cta.subtitle')}</p>
            <Link href="/register">
              <Button size="lg" className="h-16 px-12 text-xl bg-white text-primary hover:bg-slate-50 shadow-2xl relative z-10">
                {t('landing.cta.button')}
                <ArrowRight className="ml-2 w-6 h-6" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl ai-button flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl ai-gradient-text">{t('common.appName')}</span>
          </div>
          <p className="text-slate-500 text-sm">© {new Date().getFullYear()} {t('common.appName')}. Engineered with Intelligence.</p>
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
    <div className="group p-8 glass-card rounded-3xl transition-all duration-500 hover:-translate-y-2 hover:bg-white/5">
      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white mb-6 shadow-2xl group-hover:scale-110 transition-transform duration-500`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
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
