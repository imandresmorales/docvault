'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { getDocuments, deleteDocument, Document, formatFileSize, getFileIcon } from '@/lib/documents';
import DocumentCard from '@/components/documents/DocumentCard';
import styles from './documents.module.css';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filtered, setFiltered] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getDocuments();
      setDocuments(data);
      setFiltered(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los documentos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      documents.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.description?.toLowerCase().includes(q) ||
          d.category?.toLowerCase().includes(q) ||
          d.tags?.toLowerCase().includes(q),
      ),
    );
  }, [search, documents]);

  const handleDelete = async (id: string) => {
    try {
      await deleteDocument(id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
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
          <p className={styles.subtitle}>
            {loading ? 'Cargando...' : `${filtered.length} documento${filtered.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Link href="/dashboard/upload" className="btn btn-primary">
          ⬆️ Subir Documento
        </Link>
      </div>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <input
          type="search"
          className={`form-input ${styles.searchInput}`}
          placeholder="Buscar documentos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Buscar documentos"
        />
        <div className={styles.viewToggle} role="group" aria-label="Cambiar vista">
          <button
            className={`${styles.viewBtn} ${view === 'grid' ? styles.viewBtnActive : ''}`}
            onClick={() => setView('grid')}
            aria-pressed={view === 'grid'}
            aria-label="Vista en cuadrícula"
          >
            ⊞
          </button>
          <button
            className={`${styles.viewBtn} ${view === 'list' ? styles.viewBtnActive : ''}`}
            onClick={() => setView('list')}
            aria-pressed={view === 'list'}
            aria-label="Vista en lista"
          >
            ☰
          </button>
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
      {!loading && filtered.length === 0 && (
        <div className={styles.empty}>
          <span className={styles.emptyIcon} aria-hidden="true">📭</span>
          <p className={styles.emptyText}>
            {search ? 'No se encontraron documentos con esa búsqueda.' : 'Aún no tienes documentos.'}
          </p>
          {!search && (
            <Link href="/dashboard/upload" className="btn btn-primary">
              Subir tu primer documento
            </Link>
          )}
        </div>
      )}

      {/* Document list */}
      {!loading && filtered.length > 0 && (
        <div className={view === 'grid' ? styles.grid : styles.list}>
          {filtered.map((doc) => (
            <DocumentCard key={doc.id} document={doc} onDelete={(id) => setConfirmDelete(id)} />
          ))}
        </div>
      )}

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
