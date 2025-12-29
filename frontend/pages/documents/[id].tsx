import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function DocumentPreview() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <Layout>
      <Head>
        <title>Document Preview | SecureApp</title>
      </Head>
      <div className="max-w-5xl mx-auto h-[calc(100vh-140px)] flex flex-col">
        <div className="flex justify-between items-center mb-4">
             <h1 className="text-xl font-bold">Preview: Document {id}</h1>
             <button onClick={() => router.back()} className="text-sm text-gray-600 hover:text-gray-900">Close</button>
        </div>
        
        <Card className="flex-1 overflow-hidden flex flex-col">
          <CardContent className="flex-1 p-0 bg-gray-50 flex items-center justify-center">
            {/* 
                Security Note:
                When rendering real document content, ensure:
                1. PDFs are rendered in a sandboxed iframe or using a library like react-pdf
                2. HTML content is sanitized using DOMPurify
            */}
            <iframe 
                src="about:blank" 
                className="w-full h-full border-0"
                title="Document Viewer"
                sandbox="allow-scripts allow-same-origin"
            />
            <div className="absolute text-gray-400 pointer-events-none">
                Document Viewer (Sandboxed)
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
