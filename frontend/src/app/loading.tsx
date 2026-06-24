import styles from './loading.module.css';

/**
 * Global loading UI shown by Next.js App Router during page transitions.
 * Displayed automatically via React Suspense while the page chunk loads.
 */
export default function Loading() {
  return (
    <div className={styles.container} aria-label="Cargando página..." role="status">
      <div className={styles.pulse} aria-hidden="true" />
      <div className={styles.pulseSmall} aria-hidden="true" />
    </div>
  );
}
