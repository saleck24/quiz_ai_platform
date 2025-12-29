import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FileText, Sparkles, Settings2, Zap, GraduationCap } from 'lucide-react';

const documents = [
    { id: '1', title: 'Molecular Biology Ch. 12', pages: 24 },
    { id: '2', title: 'Calculus Integration Notes', pages: 18 },
    { id: '3', title: 'Physics Mechanics', pages: 32 },
];

export default function GenerateQuizPage() {
    const { t } = useTranslation('common');
    const router = useRouter();
    const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
    const [difficulty, setDifficulty] = useState('medium');
    const [questionCount, setQuestionCount] = useState(10);
    const [isGenerating, setIsGenerating] = useState(false);

    const difficultyLevels = [
        { value: 'easy', label: t('quiz.generate.easy'), description: t('quiz.generate.basicConcepts') },
        { value: 'medium', label: t('quiz.generate.medium'), description: t('quiz.generate.standardDifficulty') },
        { value: 'hard', label: t('quiz.generate.hard'), description: t('quiz.generate.advancedTopics') },
    ];

    const handleGenerate = async () => {
        if (!selectedDoc) return;
        setIsGenerating(true);
        await new Promise(resolve => setTimeout(resolve, 2000));
        router.push('/quiz/123');
    };

    return (
        <Layout>
            <Head>
                <title>{t('quiz.generate.title')} | {t('common.appName')}</title>
            </Head>

            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">{t('quiz.generate.title')}</h1>
                    <p className="text-slate-500 mt-1">{t('quiz.generate.subtitle')}</p>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-indigo-600" />
                                    {t('quiz.generate.selectDocument')}
                                </CardTitle>
                                <CardDescription>{t('quiz.generate.selectDocumentDesc')}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {documents.map((doc) => (
                                        <button
                                            key={doc.id}
                                            onClick={() => setSelectedDoc(doc.id)}
                                            className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 flex items-center gap-4 ${selectedDoc === doc.id
                                                    ? 'border-indigo-500 bg-indigo-50'
                                                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                                }`}
                                        >
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedDoc === doc.id ? 'bg-indigo-100' : 'bg-slate-100'
                                                }`}>
                                                <FileText className={`w-6 h-6 ${selectedDoc === doc.id ? 'text-indigo-600' : 'text-slate-400'}`} />
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900">{doc.title}</p>
                                                <p className="text-sm text-slate-500">{doc.pages} {t('documents.pages')}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <GraduationCap className="w-5 h-5 text-indigo-600" />
                                    {t('quiz.generate.difficulty')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-3 gap-3">
                                    {difficultyLevels.map((level) => (
                                        <button
                                            key={level.value}
                                            onClick={() => setDifficulty(level.value)}
                                            className={`p-4 rounded-xl border-2 text-center transition-all duration-200 ${difficulty === level.value
                                                    ? 'border-indigo-500 bg-indigo-50'
                                                    : 'border-slate-200 hover:border-slate-300'
                                                }`}
                                        >
                                            <p className="font-semibold text-slate-900">{level.label}</p>
                                            <p className="text-xs text-slate-500 mt-1">{level.description}</p>
                                        </button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Settings2 className="w-5 h-5 text-indigo-600" />
                                    {t('quiz.generate.numberOfQuestions')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-6">
                                    <input
                                        type="range"
                                        min="5"
                                        max="30"
                                        value={questionCount}
                                        onChange={(e) => setQuestionCount(Number(e.target.value))}
                                        className="flex-1 h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-indigo-600"
                                    />
                                    <div className="w-16 h-12 rounded-xl bg-indigo-50 flex items-center justify-center">
                                        <span className="text-xl font-bold text-indigo-600">{questionCount}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div>
                        <Card className="sticky top-24 bg-gradient-to-br from-slate-900 to-slate-800 border-0 text-white">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                                        <Sparkles className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="font-semibold">{t('quiz.generate.summary')}</p>
                                        <p className="text-sm text-slate-400">{t('quiz.generate.configuration')}</p>
                                    </div>
                                </div>

                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">{t('quiz.generate.document')}</span>
                                        <span className="font-medium">{selectedDoc ? documents.find(d => d.id === selectedDoc)?.title.slice(0, 15) + '...' : t('quiz.generate.notSelected')}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">{t('quiz.generate.difficulty')}</span>
                                        <span className="font-medium capitalize">{difficulty}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">{t('quiz.generate.questions')}</span>
                                        <span className="font-medium">{questionCount}</span>
                                    </div>
                                </div>

                                <Button
                                    onClick={handleGenerate}
                                    disabled={!selectedDoc}
                                    isLoading={isGenerating}
                                    className="w-full h-12 bg-white text-slate-900 hover:bg-slate-100"
                                >
                                    <Zap className="w-5 h-5 mr-2" />
                                    {isGenerating ? t('quiz.generate.generating') : t('quiz.generate.generateQuiz')}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
    return {
        props: {
            ...(await serverSideTranslations(locale ?? 'en', ['common'])),
        },
    };
};
