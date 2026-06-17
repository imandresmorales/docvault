'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getStats, DocumentStats, formatFileSize, getCategoryColor } from '@/lib/stats';
import { getFileIcon } from '@/lib/documents';
import StatCard from '@/components/dashboard/StatCard';
import styles from './statistics.module.css';

export default function StatisticsPage() {
  const [stats, setStats] = useState<DocumentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getStats()
      .then(setStats)
      .catch((err) => setError(err.message || 'Error al cargar las estadísticas'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.heading}>Estadísticas</h1>
        </div>
        <div className={styles.skeletonGrid}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className={styles.skeleton} aria-hidden="true" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <p className={styles.error} role="alert">{error}</p>
      </div>
    );
  }

  if (!stats) return null;

  const maxCategoryCount = Math.max(...stats.byCategory.map((c) => c.count), 1);
  const maxMonthCount    = Math.max(...stats.byMonth.map((m) => m.count), 1);

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.heading}>Estadísticas</h1>
          <p className={styles.subtitle}>Resumen de tu biblioteca de documentos</p>
        </div>
        <Link href="/dashboard/documents" className="btn" style={{ border: '1px solid var(--border-color)' }}>
          ← Ver documentos
        </Link>
      </div>

      {/* Summary cards */}
      <div className={styles.summaryGrid} role="region" aria-label="Resumen general">
        <StatCard
          icon="📄"
          label="Total de documentos"
          value={String(stats.totalCount)}
        />
        <StatCard
          icon="💾"
          label="Almacenamiento usado"
          value={formatFileSize(stats.totalSize)}
        />
        <StatCard
          icon="📁"
          label="Categorías activas"
          value={String(stats.byCategory.length)}
        />
        <StatCard
          icon="📊"
          label="Tipos de archivo"
          value={String(stats.byMimeType.length)}
        />
      </div>

      <div className={styles.chartsGrid}>
        {/* Categories chart */}
        <section className={styles.chartCard} aria-label="Documentos por categoría">
          <h2 className={styles.chartTitle}>Por Categoría</h2>

          {stats.byCategory.length === 0 ? (
            <p className={styles.empty}>Sin categorías todavía.</p>
          ) : (
            <div className={styles.barChart} role="list">
              {stats.byCategory.map((cat, i) => (
                <Link
                  key={cat.name}
                  href={`/dashboard/documents?category=${encodeURIComponent(cat.name)}`}
                  className={styles.barRow}
                  role="listitem"
                  aria-label={`${cat.name}: ${cat.count} documento${cat.count !== 1 ? 's' : ''}`}
                >
                  <span className={styles.barLabel}>{cat.name}</span>
                  <div className={styles.barTrack}>
                    <div
                      className={styles.barFill}
                      style={{
                        width: `${(cat.count / maxCategoryCount) * 100}%`,
                        backgroundColor: getCategoryColor(i),
                      }}
                    />
                  </div>
                  <span className={styles.barCount}>{cat.count}</span>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* MIME types */}
        <section className={styles.chartCard} aria-label="Tipos de archivo">
          <h2 className={styles.chartTitle}>Por Tipo de Archivo</h2>

          {stats.byMimeType.length === 0 ? (
            <p className={styles.empty}>Sin archivos todavía.</p>
          ) : (
            <div className={styles.mimeList} role="list">
              {stats.byMimeType.map((m, i) => {
                const pct = Math.round((m.count / stats.totalCount) * 100);
                return (
                  <div key={m.mimeType} className={styles.mimeRow} role="listitem">
                    <span className={styles.mimeIcon} aria-hidden="true">
                      {getFileIcon(m.mimeType)}
                    </span>
                    <div className={styles.mimeInfo}>
                      <div className={styles.mimeHeader}>
                        <span className={styles.mimeName}>{m.mimeType}</span>
                        <span className={styles.mimeCount}>{m.count} ({pct}%)</span>
                      </div>
                      <div className={styles.barTrack}>
                        <div
                          className={styles.barFill}
                          style={{
                            width: `${pct}%`,
                            backgroundColor: getCategoryColor(i + 2),
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Monthly activity */}
        {stats.byMonth.length > 0 && (
          <section className={`${styles.chartCard} ${styles.fullWidth}`} aria-label="Actividad mensual">
            <h2 className={styles.chartTitle}>Actividad Mensual (últimos 6 meses)</h2>
            <div className={styles.monthChart} role="list">
              {stats.byMonth.map((m, i) => (
                <div key={m.month} className={styles.monthCol} role="listitem">
                  <span className={styles.monthCount} aria-hidden="true">{m.count}</span>
                  <div
                    className={styles.monthBar}
                    style={{
                      height: `${Math.max(8, (m.count / maxMonthCount) * 120)}px`,
                      backgroundColor: getCategoryColor(i),
                    }}
                    role="img"
                    aria-label={`${m.month}: ${m.count} documento${m.count !== 1 ? 's' : ''}`}
                  />
                  <span className={styles.monthLabel}>{m.month}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
