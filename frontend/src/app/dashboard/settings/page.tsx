'use client';

import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import styles from './settings.module.css';

const THEME_OPTIONS = [
  { value: 'light',  label: 'Claro',         icon: '☀️',  description: 'Siempre modo claro' },
  { value: 'dark',   label: 'Oscuro',         icon: '🌙', description: 'Siempre modo oscuro' },
  { value: 'system', label: 'Sistema',        icon: '💻', description: 'Sigue la preferencia del sistema operativo' },
] as const;

export default function SettingsPage() {
  const { user } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.heading}>Configuración</h1>
        <p className={styles.subtitle}>Personaliza tu experiencia en DocVault</p>
      </div>

      {/* Profile section */}
      <section className={styles.section} aria-labelledby="profile-heading">
        <h2 id="profile-heading" className={styles.sectionTitle}>
          <span aria-hidden="true">👤</span> Perfil
        </h2>

        <div className={styles.profileCard}>
          <div className={styles.avatar} aria-hidden="true">
            {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
          </div>
          <div className={styles.profileInfo}>
            <p className={styles.profileName}>{user?.name}</p>
            <p className={styles.profileEmail}>{user?.email}</p>
          </div>
        </div>

        <div className={styles.infoGrid} aria-label="Datos de la cuenta">
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Nombre</span>
            <span className={styles.infoValue}>{user?.name ?? '—'}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Correo electrónico</span>
            <span className={styles.infoValue}>{user?.email ?? '—'}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>ID de cuenta</span>
            <span className={`${styles.infoValue} ${styles.mono}`}>{user?.id ?? '—'}</span>
          </div>
        </div>
      </section>

      {/* Appearance section */}
      <section className={styles.section} aria-labelledby="appearance-heading">
        <h2 id="appearance-heading" className={styles.sectionTitle}>
          <span aria-hidden="true">🎨</span> Apariencia
        </h2>
        <p className={styles.sectionDescription}>
          Elige cómo se verá la interfaz. El tema activo es <strong>{resolvedTheme === 'dark' ? 'oscuro' : 'claro'}</strong>.
        </p>

        <div className={styles.themeGrid} role="radiogroup" aria-label="Selección de tema">
          {THEME_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              role="radio"
              aria-checked={theme === opt.value}
              className={`${styles.themeOption} ${theme === opt.value ? styles.themeActive : ''}`}
              onClick={() => setTheme(opt.value)}
            >
              <span className={styles.themeIcon} aria-hidden="true">{opt.icon}</span>
              <span className={styles.themeLabel}>{opt.label}</span>
              <span className={styles.themeDesc}>{opt.description}</span>
              {theme === opt.value && (
                <span className={styles.checkmark} aria-hidden="true">✓</span>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* About section */}
      <section className={styles.section} aria-labelledby="about-heading">
        <h2 id="about-heading" className={styles.sectionTitle}>
          <span aria-hidden="true">ℹ️</span> Acerca de DocVault
        </h2>
        <div className={styles.aboutCard}>
          <div className={styles.aboutRow}>
            <span className={styles.infoLabel}>Versión</span>
            <span className={`${styles.infoValue} ${styles.badge}`}>v1.0.0</span>
          </div>
          <div className={styles.aboutRow}>
            <span className={styles.infoLabel}>Backend</span>
            <span className={styles.infoValue}>NestJS + SQLite</span>
          </div>
          <div className={styles.aboutRow}>
            <span className={styles.infoLabel}>Frontend</span>
            <span className={styles.infoValue}>Next.js 15 (App Router)</span>
          </div>
          <div className={styles.aboutRow}>
            <span className={styles.infoLabel}>IA</span>
            <span className={styles.infoValue}>OpenAI GPT-4o-mini</span>
          </div>
        </div>
      </section>
    </div>
  );
}
