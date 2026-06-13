'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getDocument, deleteDocument, Document, formatFileSize, getFileIcon, getDownloadUrl } from '@/lib/documents';
import styles from './detail.module.css';

export default function DocumentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    getDocument(id)
      .then(setDocument)
      .catch((err) => setError(err.message || 'Error al cargar el documento'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteDocument(id);
      router.replace('/dashboard/documents');
    } catch (err: any) {
      setError(err.message || 'Error al eliminar el documento');
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.skeletonHeader} aria-hidden="true" />
        <div className={styles.skeletonBody} aria-hidden="true" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <p className={styles.error} role="alert">{error}</p>
        <Link href="/dashboard/documents" className="btn" style={{ border: '1px solid var(--border-color)', marginTop: '1rem', display: 'inline-flex' }}>
          ← Volver a documentos
        </Link>
      </div>
    );
  }

  if (!document) return null;

  const date = new Date(document.createdAt).toLocaleDateString('es-ES', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  });

  const updatedDate = new Date(document.updatedAt).toLocaleDateString('es-ES', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  const tags = document.tags ? document.tags.split(',').map((t) => t.trim()).filter(Boolean) : [];

  return (
    <div className={styles.page}>
      {/* Breadcrumb */}
      <nav aria-label="Ruta de navegación" className={styles.breadcrumb}>
        <Link href="/dashboard/documents" className={styles.breadcrumbLink}>Mis Documentos</Link>
        <span className={styles.breadcrumbSep} aria-hidden="true">›</span>
        <span className={styles.breadcrumbCurrent}>{document.title}</span>
      </nav>

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.docIcon} aria-hidden="true">{getFileIcon(document.mimeType)}</div>
        <div className={styles.headerInfo}>
          <h1 className={styles.title}>{document.title}</h1>
          {document.description && (
            <p className={styles.description}>{document.description}</p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        <a
          href={getDownloadUrl(document.id)}
          className="btn btn-primary"
          download={document.originalName}
          aria-label={`Descargar ${document.originalName}`}
        >
          ⬇️ Descargar
        </a>
        <button
          className={`btn ${styles.deleteBtn}`}
          onClick={() => setConfirmDelete(true)}
          aria-label="Eliminar documento"
        >
          🗑️ Eliminar
        </button>
      </div>

      {/* Metadata */}
      <section className={styles.metaSection} aria-label="Información del documento">
        <h2 className={styles.sectionTitle}>Detalles</h2>
        <dl className={styles.metaGrid}>
          <div className={styles.metaRow}>
            <dt className={styles.metaLabel}>Nombre original</dt>
            <dd className={styles.metaValue}>{document.originalName}</dd>
          </div>
          <div className={styles.metaRow}>
            <dt className={styles.metaLabel}>Tipo de archivo</dt>
            <dd className={styles.metaValue}>{document.mimeType}</dd>
          </div>
          <div className={styles.metaRow}>
            <dt className={styles.metaLabel}>Tamaño</dt>
            <dd className={styles.metaValue}>{formatFileSize(document.size)}</dd>
          </div>
          <div className={styles.metaRow}>
            <dt className={styles.metaLabel}>Categoría</dt>
            <dd className={styles.metaValue}>{document.category || 'Sin categoría'}</dd>
          </div>
          <div className={styles.metaRow}>
            <dt className={styles.metaLabel}>Subido el</dt>
            <dd className={styles.metaValue}>{date}</dd>
          </div>
          <div className={styles.metaRow}>
            <dt className={styles.metaLabel}>Última modificación</dt>
            <dd className={styles.metaValue}>{updatedDate}</dd>
          </div>
        </dl>

        {tags.length > 0 && (
          <div className={styles.tagsSection}>
            <h3 className={styles.tagsTitle}>Etiquetas</h3>
            <div className={styles.tags} aria-label="Etiquetas del documento">
              {tags.map((tag) => (
                <span key={tag} className={styles.tag}>{tag}</span>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="confirm-delete-title">
          <div className={styles.dialog}>
            <h2 id="confirm-delete-title" className={styles.dialogTitle}>¿Eliminar documento?</h2>
            <p className={styles.dialogText}>
              Vas a eliminar <strong>{document.title}</strong>. Esta acción es permanente y no se puede deshacer.
            </p>
            <div className={styles.dialogActions}>
              <button className="btn" onClick={() => setConfirmDelete(false)} disabled={deleting}
                style={{ border: '1px solid var(--border-color)' }}>
                Cancelar
              </button>
              <button className="btn" onClick={handleDelete} disabled={deleting}
                style={{ backgroundColor: 'var(--error)', color: 'white' }}>
                {deleting ? 'Eliminando...' : 'Eliminar definitivamente'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
