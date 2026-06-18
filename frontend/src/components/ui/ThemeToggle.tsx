'use client';

import { useTheme } from '@/contexts/ThemeContext';
import styles from './ThemeToggle.module.css';

interface Props {
  /** 'icon' shows just sun/moon, 'full' shows a labeled button */
  variant?: 'icon' | 'full';
}

export default function ThemeToggle({ variant = 'icon' }: Props) {
  const { resolvedTheme, toggleTheme } = useTheme();

  const isDark = resolvedTheme === 'dark';
  const label  = isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro';
  const icon   = isDark ? '☀️' : '🌙';
  const text   = isDark ? 'Modo Claro' : 'Modo Oscuro';

  if (variant === 'full') {
    return (
      <button
        className={styles.fullBtn}
        onClick={toggleTheme}
        aria-label={label}
        title={label}
      >
        <span aria-hidden="true">{icon}</span>
        {text}
      </button>
    );
  }

  return (
    <button
      className={styles.iconBtn}
      onClick={toggleTheme}
      aria-label={label}
      title={label}
    >
      <span
        className={`${styles.track} ${isDark ? styles.dark : ''}`}
        aria-hidden="true"
      >
        <span className={styles.thumb}>{isDark ? '🌙' : '☀️'}</span>
      </span>
    </button>
  );
}
