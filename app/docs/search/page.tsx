'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { searchPages } from '@/content/docs';
import Navigation from '@/components/Navigation';
import SearchBar from '@/components/SearchBar';
import Footer from '@/components/Footer';
import { docsConfig } from '@/content/docs';
import '../styles/search.css';

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const results = searchPages(query);

  return (
    <>
      <Navigation config={docsConfig} />
      
      <main className="search-main">
        <div className="search-container">
          <h1>Search Results</h1>
          <SearchBar />
          
          {query && (
            <div className="search-info">
              <p>
                {results.length === 0
                  ? `No results found for "${query}"`
                  : `Found ${results.length} result${results.length !== 1 ? 's' : ''} for "${query}"`}
              </p>
            </div>
          )}

          {results.length > 0 && (
            <div className="search-results">
              {results.map((result) => (
                <article key={result.id} className="search-result">
                  <Link href={`/docs/${result.id}`} className="result-title">
                    {result.title}
                  </Link>
                  <p className="result-description">{result.description}</p>
                  <div className="result-meta">
                    <span className="result-category">{result.category}</span>
                    <span className="result-status">
                      {result.status === 'specified' ? '✓ Specified' : '○ Planned'}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}

          {results.length === 0 && query && (
            <div className="search-tips">
              <h3>Search Tips</h3>
              <ul>
                <li>Try different keywords</li>
                <li>Search for specific concepts like "authority chain" or "capability manifest"</li>
                <li>Look for category names like "architecture", "security", "protocol"</li>
                <li>Check the <Link href="/docs">documentation home</Link> for browsing by category</li>
              </ul>
            </div>
          )}
        </div>
      </main>

      <Footer config={docsConfig} />
    </>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchResults />
    </Suspense>
  );
}
