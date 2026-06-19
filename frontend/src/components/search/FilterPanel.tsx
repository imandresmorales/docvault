'use client';

import { useCallback } from 'react';
import { CATEGORIES } from '@/lib/documents';
import styles from './FilterPanel.module.css';

export interface FilterState {
  type: 'all' | 'pdf' | 'image' | 'text';
  category: string;
  sortBy: 'createdAt' | 'title' | 'size';
  order: 'asc' | 'desc';
}

export const DEFAULT_FILTERS: FilterState = {
  type:     'all',
  category: '',
  sortBy:   'createdAt',
  order:    'desc',
};

const TYPE_OPTIONS = [
  { value: 'all',   label: 'Todos',    icon: '📁' },
  { value: 'pdf',   label: 'PDF',      icon: '📕' },
  { value: 'image', label: 'Imágenes', icon: '🖼️' },
  { value: 'text',  label: 'Texto',    icon: '📄' },
] as const;

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Fecha de subida' },
  { value: 'title',     label: 'Nombre' },
  { value: 'size',      label: 'Tamaño' },
] as const;

interface Props {
  filters: FilterState;
  onChange: (f: FilterState) => void;
  resultCount: number;
}

export default function FilterPanel({ filters, onChange, resultCount }: Props) {
  const set = useCallback(
    (partial: Partial<FilterState>) => onChange({ ...filters, ...partial }),
    [filters, onChange],
  );

  const isDefault =
    filters.type === 'all' &&
    filters.category === '' &&
    filters.sortBy === 'createdAt' &&
    filters.order === 'desc';

  return (
    <aside className={styles.panel} aria-label="Filtros de documentos">
      {/* Type filter */}
      <section className={styles.section} aria-labelledby="type-filter-label">
        <h3 id="type-filter-label" className={styles.sectionTitle}>Tipo de archivo</h3>
        <div className={styles.typeGrid} role="radiogroup" aria-labelledby="type-filter-label">
          {TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              role="radio"
              aria-checked={filters.type === opt.value}
              className={`${styles.typeBtn} ${filters.type === opt.value ? styles.typeBtnActive : ''}`}
              onClick={() => set({ type: opt.value as FilterState['type'] })}
            >
              <span aria-hidden="true">{opt.icon}</span>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Category filter */}
      <section className={styles.section} aria-labelledby="category-filter-label">
        <h3 id="category-filter-label" className={styles.sectionTitle}>Categoría</h3>
        <select
          className={styles.select}
          value={filters.category}
          onChange={(e) => set({ category: e.target.value })}
          aria-label="Filtrar por categoría"
        >
          <option value="">Todas las categorías</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </section>

      {/* Sort */}
      <section className={styles.section} aria-labelledby="sort-filter-label">
        <h3 id="sort-filter-label" className={styles.sectionTitle}>Ordenar por</h3>
        <select
          className={styles.select}
          value={filters.sortBy}
          onChange={(e) => set({ sortBy: e.target.value as FilterState['sortBy'] })}
          aria-label="Ordenar por campo"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        {/* Order toggle */}
        <div className={styles.orderToggle} role="radiogroup" aria-label="Dirección del orden">
          {(['asc', 'desc'] as const).map((ord) => (
            <button
              key={ord}
              role="radio"
              aria-checked={filters.order === ord}
              className={`${styles.orderBtn} ${filters.order === ord ? styles.orderBtnActive : ''}`}
              onClick={() => set({ order: ord })}
              aria-label={ord === 'asc' ? 'Ascendente' : 'Descendente'}
            >
              {ord === 'asc' ? '↑ Ascendente' : '↓ Descendente'}
            </button>
          ))}
        </div>
      </section>

      {/* Footer */}
      <div className={styles.footer}>
        <span className={styles.resultCount} aria-live="polite" aria-atomic="true">
          {resultCount} resultado{resultCount !== 1 ? 's' : ''}
        </span>
        {!isDefault && (
          <button
            className={styles.resetBtn}
            onClick={() => onChange(DEFAULT_FILTERS)}
            aria-label="Restablecer todos los filtros"
          >
            Limpiar filtros
          </button>
        )}
      </div>
    </aside>
  );
}
