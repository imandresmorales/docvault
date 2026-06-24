import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ToastProvider } from '@/contexts/ToastContext';
import SkipLink from '@/components/ui/SkipLink';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://docvault.app'),
  title: {
    default: 'DocVault — Repositorio de Documentos con IA',
    template: '%s | DocVault',
  },
  description:
    'DocVault es un sistema seguro de gestión documental con previsualización, descarga y análisis inteligente de documentos con IA.',
  keywords: ['documentos', 'repositorio', 'gestión documental', 'IA', 'PDF', 'previsualización'],
  authors: [{ name: 'DocVault' }],
  creator: 'DocVault',
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    siteName: 'DocVault',
    title: 'DocVault — Repositorio de Documentos con IA',
    description: 'Sistema seguro de gestión documental con previsualización y análisis con IA.',
  },
  twitter: {
    card: 'summary',
    title: 'DocVault — Repositorio de Documentos con IA',
    description: 'Sistema seguro de gestión documental con previsualización y análisis con IA.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)',  color: '#0f172a' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.variable}>
        <SkipLink />
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
