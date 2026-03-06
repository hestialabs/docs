'use client';

import React from 'react';
import { getPageById, getBreadcrumbs, allPages } from '@/content/docs';
import Navigation from '@/components/Navigation';
import DocRenderer from '@/components/DocRenderer';
import AIAssistant from '@/components/AIAssistant';
import Footer from '@/components/Footer';
import { docsConfig } from '@/content/docs';
import Breadcrumbs from '@/components/Breadcrumbs';
import '../styles/doc-page.css';

interface DocPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return Object.keys(allPages).map((id) => ({
    slug: id.replace(/\//g, '__'),
  }));
}

export default async function DocPage({ params }: DocPageProps) {
  const { slug } = await params;
  const pageId = slug.replace(/__/g, '/');
  const page = getPageById(pageId);

  if (!page) {
    return (
      <div className="docs-layout">
        <Navigation config={docsConfig} />
        <main className="docs-main">
          <div className="not-found">
            <h1>Page Not Found</h1>
            <p>The documentation page you're looking for doesn't exist.</p>
            <a href="/docs">Return to Documentation Home</a>
          </div>
        </main>
        <Footer config={docsConfig} />
      </div>
    );
  }

  const breadcrumbs = getBreadcrumbs(pageId);

  return (
    <div className="docs-layout">
      <Navigation config={docsConfig} />
      
      <main className="docs-main">
        <div className="doc-page-container">
          <Breadcrumbs items={breadcrumbs} />
          <DocRenderer page={page} />
        </div>
      </main>

      <AIAssistant pageId={pageId} />
      <Footer config={docsConfig} />
    </div>
  );
}
