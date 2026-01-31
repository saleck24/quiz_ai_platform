// FRONTEND/pages/documents/upload.tsx

import React, { useRef, useState, useCallback } from 'react';
import Head from 'next/head';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/Card';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Upload, FileText, X, CheckCircle, ArrowRight } from 'lucide-react';
import { apiClient } from '@/lib/api';

export default function UploadPage() {
  const { t } = useTranslation('common');
  const router = useRouter();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [uploadedNoteId, setUploadedNoteId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      setError(null);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setTitle(selectedFile.name.replace(/\.[^/.]+$/, ""));
      setError(null);
    }
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    if (!file || !title) return;

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();

      /**
       * ⚠️ IMPORTANT:
       * ici, les noms des champs doivent matcher DRF.
       * Je mets "file" et "title" (les plus classiques).
       * Si ton DRF attend d’autres noms (ex: "document" ou "fichier"), dis-moi et j’adapte.
       */
      formData.append('file', file);
      formData.append('title', title);

      const response = await apiClient.uploadNote(formData);

      if (response && response.id) {
        setUploadedNoteId(response.id);
      }

      setIsComplete(true);
    } catch (e: any) {
      console.error("Upload error:", e);
      setError(e?.message || "Erreur lors de l'upload");
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setTitle('');
    setIsComplete(false);
    setError(null);

    // reset input pour pouvoir re-choisir le même fichier
    if (fileInputRef.current) fileInputRef.current.value = "";
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
                <Button variant="outline" onClick={removeFile} type="button">
                  {t('documents.upload.uploadAnother')}
                </Button>
                <Button
                  className="bg-gradient-to-r from-indigo-600 to-purple-600"
                  type="button"
                  onClick={() => {
                    if (uploadedNoteId) {
                      router.push(`/quiz/generate?note_id=${uploadedNoteId}`);
                    } else {
                      router.push('/quiz/generate');
                    }
                  }}
                >
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
                    <button onClick={removeFile} className="p-2 rounded-full hover:bg-slate-200 transition-colors" type="button">
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

                    {/* input file caché */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.docx,.txt"
                      onChange={handleFileSelect}
                      className="hidden"
                    />

                    {/* Bouton existant (même UI), mais click fiable */}
                    <Button variant="outline" className="cursor-pointer" onClick={openFilePicker} type="button">
                      {t('documents.upload.browseFiles')}
                    </Button>

                    <p className="text-xs text-slate-400 mt-4">{t('documents.upload.supported')}</p>
                  </>
                )}
              </div>

              {error && (
                <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm">
                  {error}
                </div>
              )}

              {file && (
                <div className="mt-6 space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-2">
                      {t('documents.upload.documentTitle')}
                    </label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder={t('documents.upload.titlePlaceholder')}
                      className="h-12 bg-white text-slate-900 placeholder:text-slate-400 border-indigo-100 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>

                  <Button
                    onClick={handleUpload}
                    isLoading={isUploading}
                    className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/25"
                    type="button"
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