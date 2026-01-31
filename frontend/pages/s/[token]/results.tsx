import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Trophy } from 'lucide-react';

export default function SharedQuizResultsPage() {
    const router = useRouter();
    const { token, score: scoreQuery, total: totalQuery } = router.query;

    const score = Number(scoreQuery) || 0;
    const total = Number(totalQuery) || 0;
    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
            <Head>
                <title>Résultats du quiz | QuizGenius</title>
            </Head>

            <Card className="max-w-2xl w-full text-center">
                <CardContent className="p-12">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-500/30">
                        <Trophy className="w-12 h-12 text-white" />
                    </div>

                    <h1 className="text-3xl font-bold text-slate-900 mb-4">Quiz terminé !</h1>

                    <div className="mb-8">
                        <p className="text-slate-500 mb-2">Votre score</p>
                        <p className="text-6xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            {percentage}%
                        </p>
                        <p className="text-slate-500 mt-2">{score}/{total} bonnes réponses</p>
                    </div>

                    <div className="flex justify-center gap-4 flex-wrap">
                        <Link href="/login">
                            <Button variant="outline">Se connecter</Button>
                        </Link>
                        <Link href="/register">
                            <Button className="bg-gradient-to-r from-indigo-600 to-purple-600">
                                Créer un compte
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
