'use client';

import { useState, useEffect, useRef } from 'react';
import { Document, CATEGORIES } from '@/lib/documents';
import { updateDocument } from '@/lib/update-document';
import FocusTrap from '@/components/ui/FocusTrap';
import styles from './EditDocumentModal.module.css';

interface Props {
  document: Document;
  onClose: () => void;
  onSaved: (updated: Document) => void;
}

export default function EditDocumentModal({ document, onClose, onSaved }: Props) {
  const [title,       setTitle]       = useState(document.title);
  const [description, setDescription] = useState(document.description ?? '');
  const [category,    setCategory]    = useState(document.category ?? '');
  const [tags,        setTags]        = useState(document.tags ?? '');
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState('');

  const titleRef = useRef<HTMLInputElement>(null);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const isDirty =
    title       !== document.title        ||
    description !== (document.description ?? '') ||
    category    !== (document.category    ?? '') ||
    tags        !== (document.tags        ?? '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError('El título no puede estar vacío.'); return; }

    setSaving(true);
    setError('');

    try {
      await updateDocument(document.id, {
        title:       title.trim(),
        description: description.trim(),
        category:    category || null,
        tags:        tags.trim(),
      });

      // Build an optimistically-updated document object for the parent
      const updated: Document = {
        ...document,
        title:       title.trim(),
        description: description.trim(),
        category:    category || null,
        tags:        tags.trim(),
        updatedAt:   new Date().toISOString(),
      };
      onSaved(updated);
    } catch (err: any) {
      setError(err.message || 'Error al guardar los cambios');
      setSaving(false);
    }
  };

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-modal-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <FocusTrap className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <h2 id="edit-modal-title" className={styles.title}>Editar Documento</h2>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Cerrar sin guardar"
            disabled={saving}
          >✕</button>
        </div>

        {/* File info banner */}
        <div className={styles.fileBanner} aria-label="Archivo">
          <span aria-hidden="true">📎</span>
          <span className={styles.fileName}>{document.originalName}</span>
          <span className={styles.fileMime}>{document.mimeType}</span>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {/* Title */}
          <div className="form-group">
            <label htmlFor="edit-title" className="form-label">
              Título <span aria-hidden="true" style={{ color: 'var(--error)' }}>*</span>
            </label>
            <input
              ref={titleRef}
              id="edit-title"
              type="text"
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={255}
              required
              aria-required="true"
              aria-describedby={error ? 'edit-error' : undefined}
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="edit-description" className="form-label">Descripción</label>
            <textarea
              id="edit-description"
              className={`form-input ${styles.textarea}`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={2000}
              rows={3}
              aria-label="Descripción del documento"
            />
          </div>

          {/* Category */}
          <div className="form-group">
            <label htmlFor="edit-category" className="form-label">Categoría</label>
            <select
              id="edit-category"
              className="form-input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Sin categoría</option>
              {CATEGORIES.filter((c) => c !== 'Sin categoría').map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div className="form-group">
            <label htmlFor="edit-tags" className="form-label">Etiquetas</label>
            <input
              id="edit-tags"
              type="text"
              className="form-input"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Separadas por comas: informe,2024,legal"
              maxLength={500}
              aria-describedby="tags-hint"
            />
            <p id="tags-hint" className={styles.hint}>
              Separa las etiquetas con comas. Se normalizan automáticamente.
            </p>
          </div>

          {/* Error */}
          {error && (
            <p id="edit-error" className={styles.error} role="alert">{error}</p>
          )}

          {/* Actions */}
          <div className={styles.actions}>
            <button
              type="button"
              className={`btn ${styles.cancelBtn}`}
              onClick={onClose}
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving || !isDirty}
              aria-busy={saving}
            >
              {saving ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </FocusTrap>
    </div>
  );
}
