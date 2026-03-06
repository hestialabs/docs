'use client';

import React from 'react';
import Link from 'next/link';
import { DocsConfig } from '@/types/content';
import styles from './Footer.module.css';

interface FooterProps {
  config: DocsConfig;
}

export default function Footer({ config }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <div className={styles.footerContent}>
          <div className={styles.footerSection}>
            <h3>{config.name}</h3>
            <p>
              Capability-based, cryptographically signed execution platform for autonomous home automation.
            </p>
          </div>

          <div className={styles.footerSection}>
            <h4>Documentation</h4>
            <ul>
              {config.navigation.tabs.map((tab) => (
                <li key={tab.tab}>
                  <Link href={`/docs/${tab.tab.toLowerCase()}`}>
                    {tab.tab}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.footerSection}>
            <h4>Community</h4>
            <ul>
              {Object.entries(config.footer.socials).map(([name, url]) => (
                <li key={name}>
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    {name.charAt(0).toUpperCase() + name.slice(1)}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <p>© {currentYear} Hestia Labs. All rights reserved.</p>
          <div className={styles.footerLinks}>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/license">License</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
