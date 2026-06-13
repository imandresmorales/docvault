import Link from 'next/link';
import { Document, formatFileSize, getFileIcon } from '@/lib/documents';
import styles from './DocumentCard.module.css';

interface Props {
  document: Document;
  onDelete: (id: string) => void;
}

export default function DocumentCard({ document, onDelete }: Props) {
  const date = new Date(document.createdAt).toLocaleDateString('es-ES', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  return (
    <article className={styles.card}>
      <div className={styles.cardIcon} aria-hidden="true">
        {getFileIcon(document.mimeType)}
      </div>

      <div className={styles.cardBody}>
        <Link href={`/dashboard/documents/${document.id}`} className={styles.title}>
          {document.title}
        </Link>
        {document.description && (
          <p className={styles.description}>{document.description}</p>
        )}
        <div className={styles.meta}>
          {document.category && (
            <span className={styles.badge}>{document.category}</span>
          )}
          <span className={styles.metaItem}>{formatFileSize(document.size)}</span>
          <span className={styles.metaItem}>{date}</span>
        </div>
      </div>

      <button
        className={styles.deleteBtn}
        onClick={() => onDelete(document.id)}
        aria-label={`Eliminar ${document.title}`}
        title="Eliminar documento"
      >
        🗑️
      </button>
    </article>
  );
}
