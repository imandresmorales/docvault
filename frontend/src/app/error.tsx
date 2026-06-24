'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import styles from './not-found.module.css';

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Global error boundary for the Next.js App Router.
 * Catches unexpected runtime errors and presents a friendly recovery UI.
 * Must be a Client Component (Next.js requirement).
 *
 * Security note: `error.message` is shown only in development.
 * In production, only the digest (a safe opaque hash) is displayed.
 */
export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    // Log to console for development debugging.
    // Replace with a monitoring service (e.g. Sentry) in production.
    console.error('[GlobalError]', error);
  }, [error]);

  const isDev = process.env.NODE_ENV === 'development';

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.code} aria-hidden="true" style={{ fontSize: '3.5rem' }}>⚠️</div>
        <h1 className={styles.title}>Algo salió mal</h1>
        <p className={styles.description}>
          Ocurrió un error inesperado.{' '}
          {isDev && error.message ? (
            <code style={{ fontSize: '0.8em', opacity: 0.7 }}>{error.message}</code>
          ) : error.digest ? (
            <span style={{ fontSize: '0.8em', opacity: 0.6 }}>Referencia: {error.digest}</span>
          ) : null}
        </p>
        <div className={styles.actions}>
          <button
            onClick={reset}
            className={`btn btn-primary ${styles.btn}`}
          >
            Intentar de nuevo
          </button>
          <Link href="/dashboard" className={`btn ${styles.btn}`}
            style={{ border: '1px solid var(--border-color)' }}>
            Ir al Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
