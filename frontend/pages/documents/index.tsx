import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FileText, Plus, Search, MoreVertical, Loader2, ArrowRight } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useTranslation } from 'next-i18next';

type Note = {
    id: number;
    file: string;
    uploaded_at: string;
};

export default function DocumentsPage() {
    const { t } = useTranslation('common');
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

    // ✅ Sécurisation des utilitaires pour éviter les crashs
    const getFileName = (path?: string) => {
        if (!path) return "Document sans nom";
        try {
            return decodeURIComponent(path.split('/').pop() || "Document");
        } catch {
            return path.split('/').pop() || "Document";
        }
    };

    const getFileType = (path?: string) => {
        if (!path) return "FILE";
        return path.split('.').pop()?.toUpperCase() || "FILE";
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return "Date inconnue";
        try {
            return new Date(dateString).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
        } catch {
            return dateString;
        }
    };

    const filteredDocs = documents.filter(doc =>
        getFileName(doc.file).toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Layout>
            <Head>
                <title>{`Mes Documents | ${t('common.appName')}`}</title>
            </Head>

            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-4xl font-black ai-gradient-text tracking-tight">Mes Documents</h1>
                        <p className="text-slate-400 mt-2 font-medium">Gérez et explorez votre bibliothèque de connaissances</p>
                    </div>
                    <Link href="/documents/upload">
                        <Button className="h-12 px-6 ai-button border-none text-white shadow-2xl shadow-primary/20 font-bold group">
                            <Plus className="w-5 h-5 mr-2" />
                            Nouveau Document
                            <ArrowRight className="w-4 h-4 ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                        </Button>
                    </Link>
                </div>

                {/* Search */}
                <div className="relative mb-10 group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Rechercher un document par nom..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full h-14 pl-14 pr-6 rounded-2xl glass-card border-white/5 !bg-white/5 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary/30 focus:ring-4 focus:ring-primary/10 transition-all text-lg font-medium"
                    />
                </div>

                {/* Documents Grid */}
                {loading ? (
                    <div className="flex justify-center py-24">
                        <Loader2 className="w-12 h-12 animate-spin text-primary" />
                    </div>
                ) : filteredDocs.length === 0 ? (
                    <div className="text-center py-24 glass-card border-white/5 rounded-[3rem]">
                        <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <FileText className="w-10 h-10 text-slate-700" />
                        </div>
                        <p className="text-slate-500 font-bold text-xl">
                            {error ? <span className="text-red-400">{error}</span> : "Aucun document trouvé."}
                        </p>
                        <Link href="/documents/upload" className="mt-8 inline-block">
                            <Button variant="outline" className="glass-card border-white/10 hover:bg-white/5 font-bold">
                                <Plus className="w-4 h-4 mr-2" />
                                Importer mon premier fichier
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredDocs.map((doc) => (
                            <Link key={doc.id} href={`/documents/${doc.id}`}>
                                <Card className="glass-card border-white/5 rounded-[2.5rem] h-full cursor-pointer hover:border-primary/30 hover:bg-white/5 transition-all group overflow-hidden relative">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                                    
                                    <CardContent className="p-8">
                                        <div className="flex items-start justify-between mb-8">
                                            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-500">
                                                <FileText className="w-7 h-7 text-primary" />
                                            </div>
                                            <div className="p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <MoreVertical className="w-5 h-5 text-slate-600" />
                                            </div>
                                        </div>
                                        
                                        <h3 className="text-xl font-black text-white mb-2 truncate group-hover:text-primary transition-colors" title={getFileName(doc.file)}>
                                            {getFileName(doc.file)}
                                        </h3>
                                        
                                        <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-slate-500">
                                            <span className="px-2.5 py-1 rounded-lg bg-white/5 text-slate-400 border border-white/5">{getFileType(doc.file)}</span>
                                            <span>•</span>
                                            <span className="opacity-60">{formatDate(doc.uploaded_at)}</span>
                                        </div>

                                        <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                                            <span className="text-xs font-black ai-gradient-text uppercase">Consulter</span>
                                            <ArrowRight className="w-5 h-5 text-slate-700 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                        </div>
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

