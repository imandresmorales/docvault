'use client';

import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Document, getFileIcon, formatFileSize } from '@/lib/documents';
import styles from './PreviewModal.module.css';

// Lazy-load heavy viewers so they don't bloat the initial bundle
const PdfViewer      = dynamic(() => import('../PdfViewer/PdfViewer'),           { ssr: false });
const ImageViewer    = dynamic(() => import('../ImageViewer/ImageViewer'),        { ssr: false });
const TextViewer     = dynamic(() => import('../TextViewer/TextViewer'),          { ssr: false });
const MarkdownViewer = dynamic(() => import('../MarkdownViewer/MarkdownViewer'), { ssr: false });

/** MIME → viewer mapping */
const getViewerType = (mimeType: string): 'pdf' | 'image' | 'text' | 'markdown' | 'unsupported' => {
  if (mimeType === 'application/pdf')  return 'pdf';
  if (mimeType.startsWith('image/'))   return 'image';
  if (mimeType === 'text/markdown')    return 'markdown';
  if (mimeType === 'text/plain')       return 'text';
  return 'unsupported';
};

interface Props {
  document: Document;
  previewUrl: string;   // e.g. http://localhost:3001/documents/:id/preview
  onClose: () => void;
}

export default function PreviewModal({ document, previewUrl, onClose }: Props) {
  const [textContent, setTextContent] = useState<string | null>(null);
  const [loadError, setLoadError] = useState('');
  const viewerType = getViewerType(document.mimeType);

  // Fetch text/markdown content once
  useEffect(() => {
    if (viewerType !== 'text' && viewerType !== 'markdown') return;
    const token = localStorage.getItem('token');
    fetch(previewUrl, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => {
        if (!r.ok) throw new Error('No se pudo cargar el contenido');
        return r.text();
      })
      .then(setTextContent)
      .catch((err) => setLoadError(err.message));
  }, [previewUrl, viewerType]);

  // Close on Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); },
    [onClose],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    // Prevent body scroll while modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label={`Vista previa: ${document.title}`}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.docIcon} aria-hidden="true">{getFileIcon(document.mimeType)}</span>
            <div>
              <p className={styles.docTitle}>{document.title}</p>
              <p className={styles.docMeta}>{document.originalName} · {formatFileSize(document.size)}</p>
            </div>
          </div>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Cerrar vista previa"
            title="Cerrar (Esc)"
          >
            ✕
          </button>
        </div>

        {/* Viewer body */}
        <div className={styles.body}>
          {loadError && (
            <div className={styles.errorState} role="alert">
              <p>{loadError}</p>
            </div>
          )}

          {/* PDF */}
          {viewerType === 'pdf' && !loadError && (
            <PdfViewer url={previewUrl} title={document.title} />
          )}

          {/* Image */}
          {viewerType === 'image' && !loadError && (
            <ImageViewer url={previewUrl} alt={document.title} />
          )}

          {/* Plain text */}
          {viewerType === 'text' && textContent !== null && (
            <TextViewer content={textContent} />
          )}

          {/* Markdown */}
          {viewerType === 'markdown' && textContent !== null && (
            <MarkdownViewer content={textContent} />
          )}

          {/* Loading text content */}
          {(viewerType === 'text' || viewerType === 'markdown') && textContent === null && !loadError && (
            <div className={styles.loading} role="status" aria-label="Cargando contenido">
              <div className={styles.spinner} />
              <p>Cargando contenido…</p>
            </div>
          )}

          {/* Unsupported type */}
          {viewerType === 'unsupported' && (
            <div className={styles.unsupported}>
              <span className={styles.unsupportedIcon} aria-hidden="true">{getFileIcon(document.mimeType)}</span>
              <p className={styles.unsupportedTitle}>Vista previa no disponible</p>
              <p className={styles.unsupportedText}>
                Este tipo de archivo (<code>{document.mimeType}</code>) no puede visualizarse en el navegador.
              </p>
              <a
                href={previewUrl.replace('/preview', '/download')}
                className="btn btn-primary"
                download={document.originalName}
                style={{ marginTop: '1rem' }}
              >
                ⬇️ Descargar archivo
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
