import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FileText, Plus, Search, MoreVertical, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api';

type Note = {
    id: number;
    file: string;
    uploaded_at: string;
};

export default function DocumentsPage() {
    const [documents, setDocuments] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const data = await apiClient.getNotes();
                setDocuments(Array.isArray(data) ? data : []);
            } catch (err: any) {
                setError(err.message || "Failed to load documents");
            } finally {
                setLoading(false);
            }
        };
        fetchNotes();
    }, []);

    const getFileName = (path: string) => path.split('/').pop() || "Document";
    const getFileType = (path: string) => path.split('.').pop()?.toUpperCase() || "FILE";
    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();

    const filteredDocs = documents.filter(doc =>
        getFileName(doc.file).toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Layout>
            <Head>
                <title>Documents | QuizGenius</title>
            </Head>

            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Documents</h1>
                        <p className="text-slate-500 mt-1">Gérez vos documents téléchargés</p>
                    </div>
                    <Link href="/documents/upload">
                        <Button className="bg-slate-900 hover:bg-slate-800">
                            <Plus className="w-5 h-5 mr-2" />
                            Nouveau Document
                        </Button>
                    </Link>
                </div>

                {/* Search */}
                <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Rechercher des documents..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900"
                    />
                </div>

                {/* Documents Grid */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                    </div>
                ) : filteredDocs.length === 0 ? (
                    <div className="text-center py-20 text-slate-500">
                        {error ? <p className="text-red-500">{error}</p> : "Aucun document trouvé."}
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredDocs.map((doc) => (
                            <Link key={doc.id} href={`/documents/${doc.id}`}>
                                <Card className="h-full cursor-pointer hover:border-indigo-200 hover:shadow-md transition-all group">
                                    <CardContent className="p-5">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                                                <FileText className="w-6 h-6 text-indigo-600" />
                                            </div>
                                        </div>
                                        <h3 className="font-semibold text-slate-900 mb-1 truncate" title={getFileName(doc.file)}>
                                            {getFileName(doc.file)}
                                        </h3>
                                        <div className="flex items-center gap-3 text-sm text-slate-500">
                                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-xs font-medium">{getFileType(doc.file)}</span>
                                            {/* <span>{doc.pages} pages</span> Pas dispo */}
                                        </div>
                                        <p className="text-xs text-slate-400 mt-3">{formatDate(doc.uploaded_at)}</p>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
}
