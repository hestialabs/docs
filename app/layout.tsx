import type { Metadata, Viewport } from 'next';
import { docsConfig } from '@/content/docs';
import './globals.css';

export const metadata: Metadata = {
  title: docsConfig.name,
  description: 'Hestia Labs documentation - Capability-based, cryptographically signed execution platform',
  icons: {
    icon: docsConfig.favicon,
  },
  openGraph: {
    title: docsConfig.name,
    description: 'Hestia Labs documentation and architecture specification',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: docsConfig.colors.primary,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style>
          {`
            :root {
              --color-primary: ${docsConfig.colors.primary};
              --color-light: ${docsConfig.colors.light};
              --color-dark: ${docsConfig.colors.dark};
            }
          `}
        </style>
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
