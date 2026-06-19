'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  searchDocuments,
  deleteDocument,
  Document,
  SearchParams,
} from '@/lib/documents';
import DocumentCard from '@/components/documents/DocumentCard';
import FilterPanel, { FilterState, DEFAULT_FILTERS } from '@/components/search/FilterPanel';
import styles from './documents.module.css';

const DEBOUNCE_MS = 350;

export default function DocumentsPage() {
  const searchParams = useSearchParams();

  const [items, setItems]           = useState<Document[]>([]);
  const [total, setTotal]           = useState(0);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [query, setQuery]           = useState(searchParams.get('q') ?? '');
  const [filters, setFilters]       = useState<FilterState>(DEFAULT_FILTERS);
  const [view, setView]             = useState<'grid' | 'list'>('grid');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadDocuments = useCallback(async (q: string, f: FilterState) => {
    setLoading(true);
    setError('');
    try {
      const params: SearchParams = {
        q:        q.trim() || undefined,
        type:     f.type !== 'all' ? f.type : undefined,
        category: f.category || undefined,
        sortBy:   f.sortBy,
        order:    f.order,
        limit:    100,
      };
      const res = await searchDocuments(params);
      setItems(res.items);
      setTotal(res.total);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los documentos');
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced re-fetch on query or filter change
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      loadDocuments(query, filters);
    }, query ? DEBOUNCE_MS : 0);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, filters, loadDocuments]);

  const handleDelete = async (id: string) => {
    try {
      await deleteDocument(id);
      setItems((prev) => prev.filter((d) => d.id !== id));
      setTotal((t) => Math.max(t - 1, 0));
      setConfirmDelete(null);
    } catch (err: any) {
      setError(err.message || 'Error al eliminar el documento');
    }
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.heading}>Mis Documentos</h1>
          <p className={styles.subtitle} aria-live="polite">
            {loading ? 'Cargando...' : `${total} documento${total !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Link href="/dashboard/upload" className="btn btn-primary">
          ⬆️ Subir Documento
        </Link>
      </div>

      <div className={styles.bodyLayout}>
        {/* ── Filter sidebar ─────────────────────── */}
        <FilterPanel
          filters={filters}
          onChange={setFilters}
          resultCount={total}
        />

        {/* ── Main area ──────────────────────────── */}
        <div className={styles.mainArea}>
          {/* Inline search + view toggle */}
          <div className={styles.toolbar}>
            <input
              type="search"
              className={`form-input ${styles.searchInput}`}
              placeholder="Buscar por título, descripción o etiqueta…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Buscar documentos en esta vista"
            />
            <div className={styles.viewToggle} role="group" aria-label="Cambiar vista">
              <button
                className={`${styles.viewBtn} ${view === 'grid' ? styles.viewBtnActive : ''}`}
                onClick={() => setView('grid')}
                aria-pressed={view === 'grid'}
                aria-label="Vista en cuadrícula"
              >⊞</button>
              <button
                className={`${styles.viewBtn} ${view === 'list' ? styles.viewBtnActive : ''}`}
                onClick={() => setView('list')}
                aria-pressed={view === 'list'}
                aria-label="Vista en lista"
              >☰</button>
            </div>
          </div>

          {/* Error */}
          {error && <p className={styles.error} role="alert">{error}</p>}

          {/* Loading skeletons */}
          {loading && (
            <div className={view === 'grid' ? styles.grid : styles.list}>
              {[...Array(6)].map((_, i) => (
                <div key={i} className={styles.skeleton} aria-hidden="true" />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && items.length === 0 && (
            <div className={styles.empty}>
              <span className={styles.emptyIcon} aria-hidden="true">📭</span>
              <p className={styles.emptyText}>
                {query || filters.type !== 'all' || filters.category
                  ? 'No se encontraron documentos con esos filtros.'
                  : 'Aún no tienes documentos.'}
              </p>
              {!query && (
                <Link href="/dashboard/upload" className="btn btn-primary">
                  Subir tu primer documento
                </Link>
              )}
            </div>
          )}

          {/* Document list */}
          {!loading && items.length > 0 && (
            <div className={view === 'grid' ? styles.grid : styles.list}>
              {items.map((doc) => (
                <DocumentCard key={doc.id} document={doc} onDelete={(id) => setConfirmDelete(id)} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation dialog */}
      {confirmDelete && (
        <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="confirm-title">
          <div className={styles.dialog}>
            <h2 id="confirm-title" className={styles.dialogTitle}>¿Eliminar documento?</h2>
            <p className={styles.dialogText}>Esta acción no se puede deshacer.</p>
            <div className={styles.dialogActions}>
              <button className="btn" onClick={() => setConfirmDelete(null)} style={{ border: '1px solid var(--border-color)' }}>
                Cancelar
              </button>
              <button
                className="btn"
                onClick={() => handleDelete(confirmDelete)}
                style={{ backgroundColor: 'var(--error)', color: 'white' }}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
