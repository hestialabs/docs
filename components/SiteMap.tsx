'use client';

import React from 'react';
import Link from 'next/link';
import { DocsConfig, DocPage } from '@/types/content';
import { getPagesByCategory } from '@/content/docs';
import styles from './SiteMap.module.css';

interface SiteMapProps {
  config: DocsConfig;
  allPages: Record<string, DocPage>;
}

export default function SiteMap({ config, allPages }: SiteMapProps) {
  const pageArray = Object.values(allPages);

  return (
    <div className={styles.sitemap}>
      <h2 className={styles.title}>Documentation Structure</h2>
      
      <nav className={styles.navigation}>
        {config.navigation.tabs.map((tab) => {
          const tabPages = pageArray.filter(
            (page) =>
              page.category === tab.tab.toLowerCase() ||
              page.category === tab.tab.toLowerCase().replace(/\s+/g, '-')
          );

          return (
            <section key={tab.tab} className={styles.section}>
              <h3 className={styles.sectionTitle}>{tab.tab}</h3>
              
              {tab.groups.map((group) => (
                <div key={group.group || 'ungrouped'} className={styles.group}>
                  {group.group && (
                    <h4 className={styles.groupTitle}>{group.group}</h4>
                  )}
                  
                  <ul className={styles.pageList}>
                    {group.pages.map((pageId) => {
                      const page = allPages[pageId];
                      if (!page) return null;

                      return (
                        <li key={pageId} className={styles.pageItem}>
                          <Link href={`/docs/${pageId}`} className={styles.pageLink}>
                            <span className={styles.pageName}>{page.title}</span>
                            {page.status === 'planned' && (
                              <span className={styles.plannedBadge}>Planned</span>
                            )}
                          </Link>
                          {page.description && (
                            <p className={styles.pageDesc}>{page.description}</p>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </section>
          );
        })}
      </nav>

      {/* Category Stats */}
      <div className={styles.stats}>
        <h3>Documentation Statistics</h3>
        <dl className={styles.statsList}>
          <div>
            <dt>Total Pages</dt>
            <dd>{pageArray.length}</dd>
          </div>
          <div>
            <dt>Specified</dt>
            <dd>{pageArray.filter((p) => p.status === 'specified').length}</dd>
          </div>
          <div>
            <dt>Planned</dt>
            <dd>{pageArray.filter((p) => p.status === 'planned').length}</dd>
          </div>
          <div>
            <dt>Categories</dt>
            <dd>{config.navigation.tabs.length}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
