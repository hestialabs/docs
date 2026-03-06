'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { docsConfig, foundationIndex, getAllCategories, getPagesByCategory, allPages } from '@/content/docs';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SearchBar from '@/components/SearchBar';
import SiteMap from '@/components/SiteMap';
import '../styles/docs.css';

export default function DocsHomePage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="docs-layout">
      <Navigation config={docsConfig} />
      
      <main className="docs-main">
        <div className="docs-container">
          {/* Hero Section */}
          <section className="docs-hero">
            <h1 className="docs-title">{docsConfig.name}</h1>
            <p className="docs-subtitle">
              {foundationIndex.description}
            </p>
            <SearchBar onSearch={setSearchQuery} />
          </section>

          {/* Quick Navigation */}
          <section className="docs-quick-nav">
            <h2>Documentation Categories</h2>
            <div className="nav-grid">
              {docsConfig.navigation.tabs.map((tab) => (
                <Link
                  key={tab.tab}
                  href={`/docs/${tab.tab.toLowerCase()}`}
                  className="nav-card"
                >
                  <h3>{tab.tab}</h3>
                  <p>
                    {tab.groups.reduce((count, g) => count + g.pages.length, 0)} pages
                  </p>
                </Link>
              ))}
            </div>
          </section>

          {/* Featured Content */}
          <section className="docs-featured">
            <h2>Getting Started</h2>
            <div className="featured-grid">
              <article className="featured-card">
                <h3>System Architecture</h3>
                <p>
                  Understand the core principles that make Hestia Labs secure and sovereign.
                </p>
                <Link href="/docs/architecture/overview" className="featured-link">
                  Read More →
                </Link>
              </article>

              <article className="featured-card">
                <h3>Security Model</h3>
                <p>
                  Explore the cryptographic authority chain and threat mitigation strategies.
                </p>
                <Link href="/docs/security/trust-boundaries" className="featured-link">
                  Read More →
                </Link>
              </article>

              <article className="featured-card">
                <h3>Protocol Specification</h3>
                <p>
                  Learn the HxTP protocol and 12-stage dispatch pipeline for secure command execution.
                </p>
                <Link href="/docs/protocol/hxtp-protocol" className="featured-link">
                  Read More →
                </Link>
              </article>
            </div>
          </section>

          {/* Site Map */}
          <SiteMap config={docsConfig} allPages={allPages} />
        </div>
      </main>

      <Footer config={docsConfig} />
    </div>
  );
}
