'use client';

import { useState, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import styles from './PdfViewer.module.css';

// Use the bundled worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

interface Props {
  /** Full URL of the PDF file to load */
  url: string;
  /** Accessible name for the viewer */
  title?: string;
}

export default function PdfViewer({ url, title = 'Vista previa del PDF' }: Props) {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
  }, []);

  const onDocumentLoadError = useCallback((err: Error) => {
    setError(`Error al cargar el PDF: ${err.message}`);
    setLoading(false);
  }, []);

  const goToPrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const goToNext = () => setCurrentPage((p) => Math.min(numPages, p + 1));
  const zoomIn = () => setScale((s) => Math.min(2.5, parseFloat((s + 0.25).toFixed(2))));
  const zoomOut = () => setScale((s) => Math.max(0.5, parseFloat((s - 0.25).toFixed(2))));
  const resetZoom = () => setScale(1.0);

  return (
    <div className={styles.viewer} aria-label={title}>
      {/* Toolbar */}
      <div className={styles.toolbar} role="toolbar" aria-label="Controles del PDF">
        {/* Page navigation */}
        <div className={styles.toolGroup}>
          <button
            className={styles.toolBtn}
            onClick={goToPrev}
            disabled={currentPage <= 1}
            aria-label="Página anterior"
            title="Página anterior"
          >
            ‹
          </button>
          <span className={styles.pageInfo} aria-live="polite" aria-atomic="true">
            <input
              type="number"
              className={styles.pageInput}
              value={currentPage}
              min={1}
              max={numPages}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10);
                if (v >= 1 && v <= numPages) setCurrentPage(v);
              }}
              aria-label="Número de página actual"
            />
            <span aria-hidden="true"> / {numPages}</span>
          </span>
          <button
            className={styles.toolBtn}
            onClick={goToNext}
            disabled={currentPage >= numPages}
            aria-label="Página siguiente"
            title="Página siguiente"
          >
            ›
          </button>
        </div>

        {/* Zoom controls */}
        <div className={styles.toolGroup}>
          <button className={styles.toolBtn} onClick={zoomOut} disabled={scale <= 0.5} aria-label="Reducir zoom" title="Reducir zoom">−</button>
          <button className={styles.zoomLabel} onClick={resetZoom} aria-label="Restablecer zoom al 100%">
            {Math.round(scale * 100)}%
          </button>
          <button className={styles.toolBtn} onClick={zoomIn} disabled={scale >= 2.5} aria-label="Aumentar zoom" title="Aumentar zoom">+</button>
        </div>
      </div>

      {/* PDF canvas */}
      <div className={styles.canvasWrapper}>
        {loading && (
          <div className={styles.loadingState} role="status" aria-label="Cargando PDF">
            <div className={styles.spinner} />
            <p>Cargando PDF…</p>
          </div>
        )}
        {error && (
          <div className={styles.errorState} role="alert">
            <p>{error}</p>
          </div>
        )}
        {!error && (
          <Document
            file={url}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={null}
          >
            <Page
              pageNumber={currentPage}
              scale={scale}
              renderAnnotationLayer
              renderTextLayer
              loading={null}
            />
          </Document>
        )}
      </div>
    </div>
  );
}
