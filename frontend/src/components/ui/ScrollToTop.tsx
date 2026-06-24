'use client';

import { useEffect, useState } from 'react';
import styles from './ScrollToTop.module.css';

/**
 * A floating "scroll to top" button that appears after the user
 * scrolls down more than 300px. Respects prefers-reduced-motion.
 */
export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const threshold = 300;
    const onScroll = () => setVisible(window.scrollY > threshold);

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollUp = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!visible) return null;

  return (
    <button
      onClick={scrollUp}
      className={styles.btn}
      aria-label="Volver al inicio de la página"
    >
      ↑
    </button>
  );
}
