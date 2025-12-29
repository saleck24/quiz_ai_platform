import React, { useState, useCallback } from 'react';
import Head from 'next/head';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Upload, FileText, X, CheckCircle, ArrowRight } from 'lucide-react';

export default function UploadPage() {
    const { t } = useTranslation('common');
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [title, setTitle] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [isComplete, setIsComplete] = useState(false);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            setFile(droppedFile);
            setTitle(droppedFile.name.replace(/\.[^/.]+$/, ""));
        }
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setTitle(selectedFile.name.replace(/\.[^/.]+$/, ""));
        }
    };

    const handleUpload = async () => {
        if (!file || !title) return;
        setIsUploading(true);
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsUploading(false);
        setIsComplete(true);
    };

    const removeFile = () => {
        setFile(null);
        setTitle('');
        setIsComplete(false);
    };

    return (
        <Layout>
            <Head>
                <title>{t('documents.upload.title')} | {t('common.appName')}</title>
            </Head>

            <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">{t('documents.upload.title')}</h1>
                    <p className="text-slate-500 mt-1">{t('documents.upload.subtitle')}</p>
                </div>

                {isComplete ? (
                    <Card className="border-emerald-200 bg-emerald-50">
                        <CardContent className="p-8 text-center">
                            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8 text-emerald-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-emerald-900 mb-2">{t('documents.upload.success')}</h3>
                            <p className="text-emerald-700 mb-6">{t('documents.upload.successMessage')}</p>
                            <div className="flex justify-center gap-4">
                                <Button variant="outline" onClick={removeFile}>{t('documents.upload.uploadAnother')}</Button>
                                <Button className="bg-gradient-to-r from-indigo-600 to-purple-600">
                                    {t('dashboard.cta.generateQuiz')}
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardContent className="p-8">
                            <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${isDragging
                                        ? 'border-indigo-500 bg-indigo-50'
                                        : file
                                            ? 'border-emerald-300 bg-emerald-50'
                                            : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                                    }`}
                            >
                                {file ? (
                                    <div className="flex items-center justify-center gap-4">
                                        <div className="w-14 h-14 rounded-xl bg-indigo-100 flex items-center justify-center">
                                            <FileText className="w-7 h-7 text-indigo-600" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-semibold text-slate-900">{file.name}</p>
                                            <p className="text-sm text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                        </div>
                                        <button onClick={removeFile} className="p-2 rounded-full hover:bg-slate-200 transition-colors">
                                            <X className="w-5 h-5 text-slate-500" />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mx-auto mb-4">
                                            <Upload className="w-8 h-8 text-indigo-600" />
                                        </div>
                                        <p className="text-lg font-medium text-slate-900 mb-2">{t('documents.upload.dropHere')}</p>
                                        <p className="text-sm text-slate-500 mb-4">{t('documents.upload.orClick')}</p>
                                        <input
                                            type="file"
                                            accept=".pdf,.docx,.txt"
                                            onChange={handleFileSelect}
                                            className="hidden"
                                            id="file-upload"
                                        />
                                        <label htmlFor="file-upload">
                                            <Button variant="outline" className="cursor-pointer" asChild>
                                                <span>{t('documents.upload.browseFiles')}</span>
                                            </Button>
                                        </label>
                                        <p className="text-xs text-slate-400 mt-4">{t('documents.upload.supported')}</p>
                                    </>
                                )}
                            </div>

                            {file && (
                                <div className="mt-6 space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-slate-700 block mb-2">{t('documents.upload.documentTitle')}</label>
                                        <Input
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder={t('documents.upload.titlePlaceholder')}
                                            className="h-12"
                                        />
                                    </div>
                                    <Button
                                        onClick={handleUpload}
                                        isLoading={isUploading}
                                        className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/25"
                                    >
                                        {isUploading ? t('documents.upload.uploading') : t('documents.upload.uploadButton')}
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
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
