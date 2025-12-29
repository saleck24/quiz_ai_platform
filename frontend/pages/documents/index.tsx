import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FileText, Plus, Search, MoreVertical } from 'lucide-react';

const documents = [
    { id: '1', title: 'Molecular Biology Ch. 12', type: 'PDF', pages: 24, date: 'Dec 12, 2024' },
    { id: '2', title: 'Calculus Integration Notes', type: 'DOCX', pages: 18, date: 'Dec 10, 2024' },
    { id: '3', title: 'Physics Mechanics', type: 'PDF', pages: 32, date: 'Dec 8, 2024' },
    { id: '4', title: 'Organic Chemistry Reactions', type: 'PDF', pages: 45, date: 'Dec 5, 2024' },
    { id: '5', title: 'Computer Science Algorithms', type: 'TXT', pages: 12, date: 'Dec 3, 2024' },
];

export default function DocumentsPage() {
    return (
        <Layout>
            <Head>
                <title>Documents | QuizGenius</title>
            </Head>

            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Documents</h1>
                        <p className="text-slate-500 mt-1">Manage your uploaded study materials</p>
                    </div>
                    <Link href="/documents/upload">
                        <Button className="bg-slate-900 hover:bg-slate-800">
                            <Plus className="w-5 h-5 mr-2" />
                            Upload New
                        </Button>
                    </Link>
                </div>

                {/* Search */}
                <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search documents..."
                        className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                </div>

                {/* Documents Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {documents.map((doc) => (
                        <Link key={doc.id} href={`/documents/${doc.id}`}>
                            <Card className="h-full cursor-pointer hover:border-indigo-200 hover:shadow-md transition-all group">
                                <CardContent className="p-5">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                                            <FileText className="w-6 h-6 text-indigo-600" />
                                        </div>
                                        <button
                                            onClick={(e) => { e.preventDefault(); }}
                                            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                                        >
                                            <MoreVertical className="w-5 h-5 text-slate-400" />
                                        </button>
                                    </div>
                                    <h3 className="font-semibold text-slate-900 mb-1 truncate">{doc.title}</h3>
                                    <div className="flex items-center gap-3 text-sm text-slate-500">
                                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-xs font-medium">{doc.type}</span>
                                        <span>{doc.pages} pages</span>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-3">{doc.date}</p>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </Layout>
    );
}
