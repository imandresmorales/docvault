'use client';

import styles from './SkipLink.module.css';

/**
 * "Skip to main content" link.
 * Visually hidden until focused by keyboard, then slides into view.
 * Place this as the very first element inside <body>.
 *
 * Usage:
 *   <SkipLink />
 *   <main id="main-content"> … </main>
 */
export default function SkipLink() {
  return (
    <a href="#main-content" className={styles.skipLink}>
      Saltar al contenido principal
    </a>
  );
}
