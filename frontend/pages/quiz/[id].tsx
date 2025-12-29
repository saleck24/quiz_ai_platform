import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CheckCircle, XCircle, ArrowRight, Clock } from 'lucide-react';

const mockQuestions = [
    {
        id: 1,
        text: "What is the primary function of mitochondria in a cell?",
        options: ["Protein synthesis", "Energy production", "Cell division", "Waste removal"],
        answer: 1
    },
    {
        id: 2,
        text: "Which HTTP security header prevents clickjacking attacks?",
        options: ["X-XSS-Protection", "X-Frame-Options", "Content-Security-Policy", "Strict-Transport-Security"],
        answer: 1
    },
    {
        id: 3,
        text: "What does DNA stand for?",
        options: ["Deoxyribonucleic Acid", "Dinitrogen Acid", "Dynamic Nucleic Array", "Digital Neural Algorithm"],
        answer: 0
    }
];

export default function QuizPage() {
    const router = useRouter();
    const { id } = router.query;

    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [score, setScore] = useState(0);

    const question = mockQuestions[currentQuestion];
    const isCorrect = selectedOption === question.answer;
    const progress = ((currentQuestion + 1) / mockQuestions.length) * 100;

    const handleOptionSelect = (index: number) => {
        if (showFeedback) return;
        setSelectedOption(index);
    };

    const handleCheck = () => {
        if (selectedOption === null) return;
        setShowFeedback(true);
        if (isCorrect) setScore(score + 1);
    };

    const handleNext = () => {
        if (currentQuestion < mockQuestions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
            setSelectedOption(null);
            setShowFeedback(false);
        } else {
            router.push(`/quiz/${id}/results`);
        }
    };

    return (
        <Layout>
            <Head>
                <title>Quiz | QuizGenius</title>
            </Head>

            <div className="max-w-3xl mx-auto">
                {/* Progress Header */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-medium text-slate-600">
                            Question {currentQuestion + 1} of {mockQuestions.length}
                        </span>
                        <div className="flex items-center gap-2 text-slate-500">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm font-medium">12:45</span>
                        </div>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Question Card */}
                <Card className="mb-6">
                    <CardContent className="p-8">
                        <h2 className="text-2xl font-semibold text-slate-900 mb-8">{question.text}</h2>

                        <div className="space-y-3">
                            {question.options.map((option, index) => {
                                let optionStyles = 'border-slate-200 hover:border-indigo-300 hover:bg-indigo-50';

                                if (showFeedback) {
                                    if (index === question.answer) {
                                        optionStyles = 'border-emerald-500 bg-emerald-50 text-emerald-900';
                                    } else if (index === selectedOption && !isCorrect) {
                                        optionStyles = 'border-red-500 bg-red-50 text-red-900';
                                    } else {
                                        optionStyles = 'border-slate-200 opacity-50';
                                    }
                                } else if (selectedOption === index) {
                                    optionStyles = 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500';
                                }

                                return (
                                    <button
                                        key={index}
                                        onClick={() => handleOptionSelect(index)}
                                        disabled={showFeedback}
                                        className={`w-full p-5 rounded-xl border-2 text-left transition-all duration-200 flex items-center justify-between ${optionStyles}`}
                                    >
                                        <span className="font-medium text-slate-900">{option}</span>
                                        {showFeedback && index === question.answer && (
                                            <CheckCircle className="w-6 h-6 text-emerald-500" />
                                        )}
                                        {showFeedback && index === selectedOption && !isCorrect && (
                                            <XCircle className="w-6 h-6 text-red-500" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Feedback Section */}
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
                                        {isCorrect ? 'Correct!' : 'Not quite right'}
                                    </p>
                                    <p className={`text-sm mt-1 ${isCorrect ? 'text-emerald-700' : 'text-amber-700'}`}>
                                        {isCorrect
                                            ? 'Great job! You got this one right.'
                                            : `The correct answer is: ${question.options[question.answer]}`
                                        }
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end gap-4">
                    {!showFeedback ? (
                        <Button
                            onClick={handleCheck}
                            disabled={selectedOption === null}
                            className="h-12 px-8 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/25"
                        >
                            Check Answer
                        </Button>
                    ) : (
                        <Button
                            onClick={handleNext}
                            className="h-12 px-8 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/25 group"
                        >
                            {currentQuestion === mockQuestions.length - 1 ? 'View Results' : 'Next Question'}
                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    )}
                </div>
            </div>
        </Layout>
    );
}
