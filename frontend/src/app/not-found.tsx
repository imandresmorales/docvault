import Link from 'next/link';
import type { Metadata } from 'next';
import styles from './not-found.module.css';

export const metadata: Metadata = {
  title: 'Página no encontrada',
  description: 'La página que buscas no existe en DocVault.',
  robots: { index: false, follow: false },
};

/**
 * Custom 404 page rendered by Next.js App Router when no route matches.
 * This is a Server Component — no 'use client' needed.
 */
export default function NotFound() {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.code} aria-hidden="true">404</div>
        <div className={styles.icon} aria-hidden="true">📭</div>
        <h1 className={styles.title}>Página no encontrada</h1>
        <p className={styles.description}>
          La página que buscas no existe o ha sido movida.
        </p>
        <div className={styles.actions}>
          <Link href="/dashboard" className={`btn btn-primary ${styles.btn}`}>
            Ir al Dashboard
          </Link>
          <Link href="/dashboard/documents" className={`btn ${styles.btn}`}
            style={{ border: '1px solid var(--border-color)' }}>
            Mis Documentos
          </Link>
        </div>
      </div>
    </div>
  );
}
