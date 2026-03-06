'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { DocsConfig } from '@/types/content';
import styles from './Navigation.module.css';

interface NavigationProps {
  config: DocsConfig;
}

export default function Navigation({ config }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        {/* Logo */}
        <Link href="/docs" className={styles.logo}>
          <img 
            src={config.logo.light} 
            alt={config.name}
            className={styles.logoImage}
          />
          <span className={styles.logoText}>{config.name}</span>
        </Link>

        {/* Desktop Navigation */}
        <div className={styles.navLinks}>
          {config.navigation.tabs.map((tab) => (
            <Link
              key={tab.tab}
              href={`/docs/${tab.tab.toLowerCase()}`}
              className={styles.navLink}
            >
              {tab.tab}
            </Link>
          ))}
        </div>

        {/* Global Links */}
        <div className={styles.globalLinks}>
          {config.navigation.global.anchors.map((anchor) => (
            <a
              key={anchor.anchor}
              href={anchor.href}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.externalLink}
            >
              {anchor.anchor}
            </a>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <button
          className={styles.mobileMenuButton}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className={styles.mobileMenu}>
          {config.navigation.tabs.map((tab) => (
            <Link
              key={tab.tab}
              href={`/docs/${tab.tab.toLowerCase()}`}
              className={styles.mobileLink}
              onClick={() => setMobileMenuOpen(false)}
            >
              {tab.tab}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
