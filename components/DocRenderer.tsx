'use client';

import React from 'react';
import { DocPage } from '@/types/content';
import styles from './DocRenderer.module.css';

interface DocRendererProps {
  page: DocPage;
}

export default function DocRenderer({ page }: DocRendererProps) {
  return (
    <article className={styles.docRenderer}>
      {/* Header */}
      <header className={styles.docHeader}>
        <h1 className={styles.docTitle}>{page.title}</h1>
        <p className={styles.docDescription}>{page.description}</p>
        
        <div className={styles.docMeta}>
          <span className={styles.status}>
            <span className={`${styles.statusBadge} ${styles[page.status]}`}>
              {page.status === 'specified' ? '✓ Specified' : '○ Planned'}
            </span>
          </span>
          <span className={styles.lastUpdated}>
            Updated {new Date(page.lastUpdated).toLocaleDateString()}
          </span>
        </div>
      </header>

      {/* Content */}
      <div className={styles.docContent}>
        {page.content.split('\n\n').map((paragraph, idx) => {
          if (paragraph.startsWith('# ')) {
            return (
              <h2 key={idx} className={styles.h2}>
                {paragraph.replace(/^# /, '')}
              </h2>
            );
          }
          if (paragraph.startsWith('## ')) {
            return (
              <h3 key={idx} className={styles.h3}>
                {paragraph.replace(/^## /, '')}
              </h3>
            );
          }
          if (paragraph.startsWith('### ')) {
            return (
              <h4 key={idx} className={styles.h4}>
                {paragraph.replace(/^### /, '')}
              </h4>
            );
          }
          if (paragraph.startsWith('- ')) {
            return (
              <ul key={idx} className={styles.list}>
                {paragraph.split('\n').map((item, i) => (
                  <li key={i}>{item.replace(/^- /, '')}</li>
                ))}
              </ul>
            );
          }
          if (paragraph.startsWith('| ')) {
            return (
              <div key={idx} className={styles.tableContainer}>
                <table className={styles.table}>
                  <tbody>
                    {paragraph.split('\n').map((row, i) => (
                      <tr key={i}>
                        {row.split('|').map((cell, j) => (
                          <td key={j}>{cell.trim()}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }
          return (
            <p key={idx} className={styles.paragraph}>
              {paragraph}
            </p>
          );
        })}
      </div>

      {/* Related Pages */}
      {page.relatedPages.length > 0 && (
        <section className={styles.relatedPages}>
          <h3>Related Pages</h3>
          <ul className={styles.relatedList}>
            {page.relatedPages.map((pageId) => (
              <li key={pageId}>
                <a href={`/docs/${pageId}`}>{pageId}</a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
