import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CheckCircle, XCircle, ArrowRight, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api';

type ChoiceKey = "A" | "B" | "C" | "D";

type Question = {
    id: number;
    question: string;
    options: Record<string, string>;
    reponse: string;
    explication: string;
};

type Quiz = {
    id: number;
    questions: Question[];
};

type SessionData = {
    quiz: Quiz;
    token: string;
};

export default function SharedQuizPage() {
    const router = useRouter();
    const { token } = router.query;

    const [session, setSession] = useState<SessionData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<ChoiceKey | null>(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [score, setScore] = useState(0);

    useEffect(() => {
        if (!token || typeof token !== 'string') return;

        const fetchSession = async () => {
            try {
                const data = await apiClient.joinQuizSessionPublic(token);
                setSession(data);
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : "Impossible de charger le quiz");
            } finally {
                setLoading(false);
            }
        };

        fetchSession();
    }, [token]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-100 flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (error || !session?.quiz?.questions?.length) {
        return (
            <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
                <Card className="max-w-md w-full">
                    <CardContent className="p-8 text-center">
                        <p className="text-red-600 font-medium mb-4">{error || "Lien invalide ou expiré."}</p>
                        <Link href="/login">
                            <Button>Se connecter</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const quiz = session.quiz;
    const question = quiz.questions[currentQuestionIndex];
    const options: ChoiceKey[] = ["A", "B", "C", "D"];
    const isCorrect = selectedOption === question.reponse;
    const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

    const handleOptionSelect = (key: ChoiceKey) => {
        if (showFeedback) return;
        setSelectedOption(key);
    };

    const handleCheck = () => {
        if (selectedOption === null) return;
        setShowFeedback(true);
        if (isCorrect) setScore(score + 1);
    };

    const handleNext = () => {
        if (currentQuestionIndex < quiz.questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedOption(null);
            setShowFeedback(false);
        } else {
            const finalScore = isCorrect ? score + 1 : score;
            router.push({
                pathname: `/s/${token}/results`,
                query: { score: finalScore, total: quiz.questions.length }
            });
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 py-8 px-4">
            <Head>
                <title>Quiz partagé | QuizGenius</title>
            </Head>

            <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-medium text-slate-600">
                            Question {currentQuestionIndex + 1} sur {quiz.questions.length}
                        </span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                <Card className="mb-6">
                    <CardContent className="p-8">
                        <h2 className="text-2xl font-semibold text-slate-900 mb-8">{question.question}</h2>

                        <div className="space-y-3">
                            {options.map((key) => {
                                const optionText = question.options?.[key];
                                if (!optionText) return null;

                                let optionStyles = 'border-slate-200 hover:border-indigo-300 hover:bg-indigo-50';
                                if (showFeedback) {
                                    if (key === question.reponse) {
                                        optionStyles = 'border-emerald-500 bg-emerald-50 text-emerald-900';
                                    } else if (key === selectedOption && !isCorrect) {
                                        optionStyles = 'border-red-500 bg-red-50 text-red-900';
                                    } else {
                                        optionStyles = 'border-slate-200 opacity-50';
                                    }
                                } else if (selectedOption === key) {
                                    optionStyles = 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500';
                                }

                                return (
                                    <button
                                        key={key}
                                        onClick={() => handleOptionSelect(key)}
                                        disabled={showFeedback}
                                        className={`w-full p-5 rounded-xl border-2 text-left transition-all duration-200 flex items-center justify-between ${optionStyles}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold text-slate-400">{key}.</span>
                                            <span className="font-medium text-slate-900">{optionText}</span>
                                        </div>
                                        {showFeedback && key === question.reponse && (
                                            <CheckCircle className="w-6 h-6 text-emerald-500" />
                                        )}
                                        {showFeedback && key === selectedOption && !isCorrect && (
                                            <XCircle className="w-6 h-6 text-red-500" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {showFeedback && (
                    <Card className={`mb-6 ${isCorrect ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
                        <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isCorrect ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                                    {isCorrect ? (
                                        <CheckCircle className="w-6 h-6 text-emerald-600" />
                                    ) : (
                                        <XCircle className="w-6 h-6 text-amber-600" />
                                    )}
                                </div>
                                <div>
                                    <p className={`font-semibold ${isCorrect ? 'text-emerald-900' : 'text-amber-900'}`}>
                                        {isCorrect ? 'Correct !' : 'Incorrect'}
                                    </p>
                                    <p className={`text-sm mt-1 ${isCorrect ? 'text-emerald-700' : 'text-amber-700'}`}>
                                        {question.explication || (isCorrect ? "Bravo !" : `La bonne réponse est ${question.reponse}`)}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="flex justify-end gap-4">
                    {!showFeedback ? (
                        <Button
                            onClick={handleCheck}
                            disabled={selectedOption === null}
                            className="h-12 px-8 bg-gradient-to-r from-indigo-600 to-purple-600"
                        >
                            Valider la réponse
                        </Button>
                    ) : (
                        <Button
                            onClick={handleNext}
                            className="h-12 px-8 bg-gradient-to-r from-indigo-600 to-purple-600"
                        >
                            {currentQuestionIndex < quiz.questions.length - 1 ? 'Question suivante' : 'Voir les résultats'}
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
