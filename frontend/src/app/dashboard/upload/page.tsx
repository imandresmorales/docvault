'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { uploadDocument, ALLOWED_TYPES, CATEGORIES, formatFileSize } from '@/lib/documents';
import styles from './upload.module.css';

export default function UploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [metadata, setMetadata] = useState({
    title: '',
    description: '',
    category: 'Sin categoría',
    tags: '',
  });

  const validateFile = (f: File): string | null => {
    if (!ALLOWED_TYPES.includes(f.type)) {
      return `Tipo de archivo no permitido. Tipos aceptados: PDF, Word, Excel, PowerPoint, TXT, Markdown, imágenes.`;
    }
    if (f.size > 50 * 1024 * 1024) {
      return 'El archivo supera el límite de 50 MB.';
    }
    return null;
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (!dropped) return;
    const err = validateFile(dropped);
    if (err) { setError(err); return; }
    setFile(dropped);
    setError('');
    if (!metadata.title) setMetadata((m) => ({ ...m, title: dropped.name.replace(/\.[^.]+$/, '') }));
  }, [metadata.title]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    const err = validateFile(selected);
    if (err) { setError(err); return; }
    setFile(selected);
    setError('');
    if (!metadata.title) setMetadata((m) => ({ ...m, title: selected.name.replace(/\.[^.]+$/, '') }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { setError('Selecciona un archivo antes de continuar.'); return; }
    setUploading(true);
    setError('');
    try {
      await uploadDocument(file, metadata, setProgress);
      setSuccess(true);
      setTimeout(() => router.push('/dashboard/documents'), 1500);
    } catch (err: any) {
      setError(err.message || 'Error al subir el documento');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.heading}>Subir Documento</h1>
        <p className={styles.subtitle}>Sube archivos PDF, Word, Excel, PowerPoint, imágenes y más.</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        {/* Drop zone */}
        <div
          className={`${styles.dropzone} ${dragging ? styles.dragging : ''} ${file ? styles.hasFile : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-label="Zona de carga. Arrastra un archivo o haz clic para seleccionar"
          onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_TYPES.join(',')}
            onChange={handleFileInput}
            className={styles.hiddenInput}
            aria-hidden="true"
            tabIndex={-1}
          />
          {file ? (
            <div className={styles.filePreview}>
              <span className={styles.fileIcon} aria-hidden="true">📄</span>
              <div>
                <p className={styles.fileName}>{file.name}</p>
                <p className={styles.fileSize}>{formatFileSize(file.size)}</p>
              </div>
              <button
                type="button"
                className={styles.removeFile}
                aria-label="Quitar archivo"
                onClick={(e) => { e.stopPropagation(); setFile(null); setProgress(0); }}
              >
                ✕
              </button>
            </div>
          ) : (
            <div className={styles.dropzoneContent}>
              <span className={styles.dropIcon} aria-hidden="true">☁️</span>
              <p className={styles.dropText}>
                {dragging ? 'Suelta el archivo aquí' : 'Arrastra tu archivo aquí'}
              </p>
              <p className={styles.dropSubtext}>o <span className={styles.browseLink}>haz clic para explorar</span></p>
              <p className={styles.dropHint}>Máximo 50 MB · PDF, Word, Excel, PowerPoint, imágenes</p>
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className={styles.metadataGrid}>
          <div className="form-group">
            <label className="form-label" htmlFor="title">Título <span aria-hidden="true">*</span></label>
            <input
              id="title"
              type="text"
              className="form-input"
              value={metadata.title}
              onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
              required
              maxLength={255}
              placeholder="Nombre descriptivo del documento"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="category">Categoría</label>
            <select
              id="category"
              className="form-input"
              value={metadata.category}
              onChange={(e) => setMetadata({ ...metadata, category: e.target.value })}
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className={`form-group ${styles.fullWidth}`}>
            <label className="form-label" htmlFor="description">Descripción</label>
            <textarea
              id="description"
              className={`form-input ${styles.textarea}`}
              value={metadata.description}
              onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
              maxLength={1000}
              rows={3}
              placeholder="Descripción opcional del documento"
            />
          </div>

          <div className={`form-group ${styles.fullWidth}`}>
            <label className="form-label" htmlFor="tags">
              Etiquetas <span className={styles.hint}>(separadas por comas)</span>
            </label>
            <input
              id="tags"
              type="text"
              className="form-input"
              value={metadata.tags}
              onChange={(e) => setMetadata({ ...metadata, tags: e.target.value })}
              placeholder="contrato, 2024, confidencial"
            />
          </div>
        </div>

        {/* Progress bar */}
        {uploading && (
          <div className={styles.progressWrapper} role="status" aria-label={`Subiendo: ${progress}%`}>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${progress}%` }} />
            </div>
            <span className={styles.progressText}>{progress}%</span>
          </div>
        )}

        {/* Success state */}
        {success && (
          <div className={styles.success} role="alert">
            ✅ Documento subido correctamente. Redirigiendo...
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className={styles.error} role="alert">
            ⚠️ {error}
          </div>
        )}

        <div className={styles.actions}>
          <button
            type="button"
            className={`btn ${styles.cancelBtn}`}
            onClick={() => router.back()}
            disabled={uploading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={uploading || !file}
            aria-busy={uploading}
          >
            {uploading ? `Subiendo... ${progress}%` : 'Subir Documento'}
          </button>
        </div>
      </form>
    </div>
  );
}
