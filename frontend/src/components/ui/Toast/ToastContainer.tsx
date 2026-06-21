'use client';

import { useEffect, useState } from 'react';
import { useToast, Toast, ToastVariant } from '@/contexts/ToastContext';
import styles from './ToastContainer.module.css';

const ICONS: Record<ToastVariant, string> = {
  success: '✓',
  error:   '✕',
  info:    'ℹ',
  warning: '⚠',
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const [exiting, setExiting] = useState(false);

  const handleClose = () => {
    setExiting(true);
    // Let exit animation finish before removal
    setTimeout(onRemove, 250);
  };

  return (
    <div
      className={`${styles.toast} ${styles[toast.variant]} ${exiting ? styles.exiting : ''}`}
      role={toast.variant === 'error' ? 'alert' : 'status'}
      aria-live={toast.variant === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
    >
      <span className={styles.icon} aria-hidden="true">{ICONS[toast.variant]}</span>
      <p className={styles.message}>{toast.message}</p>
      <button
        className={styles.closeBtn}
        onClick={handleClose}
        aria-label="Cerrar notificación"
      >✕</button>
    </div>
  );
}

/**
 * ToastContainer renders the live notification stack.
 * Place it once inside the layout — it reads from ToastContext.
 */
export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div
      className={styles.container}
      aria-label="Notificaciones"
      aria-relevant="additions removals"
    >
      {toasts.map((t) => (
        <ToastItem
          key={t.id}
          toast={t}
          onRemove={() => removeToast(t.id)}
        />
      ))}
    </div>
  );
}
