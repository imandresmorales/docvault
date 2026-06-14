'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import styles from './ImageViewer.module.css';

interface Props {
  url: string;
  alt?: string;
}

const MIN_SCALE = 0.25;
const MAX_SCALE = 4;
const SCALE_STEP = 0.25;

export default function ImageViewer({ url, alt = 'Vista previa de imagen' }: Props) {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [error, setError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const zoomIn  = () => setScale((s) => Math.min(MAX_SCALE, parseFloat((s + SCALE_STEP).toFixed(2))));
  const zoomOut = () => setScale((s) => Math.max(MIN_SCALE, parseFloat((s - SCALE_STEP).toFixed(2))));
  const reset   = () => { setScale(1); setRotation(0); };
  const rotateRight = () => setRotation((r) => (r + 90) % 360);

  // Keyboard shortcuts inside viewer
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === '+' || e.key === '=') { e.preventDefault(); zoomIn(); }
    if (e.key === '-')                  { e.preventDefault(); zoomOut(); }
    if (e.key === 'r')                  { e.preventDefault(); rotateRight(); }
    if (e.key === '0')                  { e.preventDefault(); reset(); }
    if (e.key === 'Escape' && fullscreen) { e.preventDefault(); setFullscreen(false); }
  }, [fullscreen]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Wheel-to-zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (!e.ctrlKey) return;
    e.preventDefault();
    if (e.deltaY < 0) zoomIn();
    else zoomOut();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={containerRef}
      className={`${styles.viewer} ${fullscreen ? styles.fullscreen : ''}`}
      aria-label="Visor de imagen"
    >
      {/* Toolbar */}
      <div className={styles.toolbar} role="toolbar" aria-label="Controles del visor de imagen">
        <div className={styles.toolGroup}>
          <button className={styles.toolBtn} onClick={zoomOut} disabled={scale <= MIN_SCALE} aria-label="Reducir zoom" title="Reducir zoom (-)">−</button>
          <button className={styles.zoomLabel} onClick={reset} title="Restablecer (tecla 0)">{Math.round(scale * 100)}%</button>
          <button className={styles.toolBtn} onClick={zoomIn}  disabled={scale >= MAX_SCALE} aria-label="Aumentar zoom"  title="Aumentar zoom (+)">+</button>
        </div>

        <div className={styles.toolGroup}>
          <button className={styles.toolBtn} onClick={rotateRight} aria-label="Rotar 90° a la derecha" title="Rotar (r)">↻</button>
          <button
            className={`${styles.toolBtn} ${fullscreen ? styles.active : ''}`}
            onClick={() => setFullscreen((f) => !f)}
            aria-label={fullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
            title={fullscreen ? 'Salir de pantalla completa (Esc)' : 'Pantalla completa'}
          >
            {fullscreen ? '⊠' : '⊡'}
          </button>
        </div>
      </div>

      {/* Image canvas */}
      <div className={styles.canvas} onWheel={handleWheel}>
        {error ? (
          <div className={styles.errorState} role="alert">
            <span aria-hidden="true">🖼️</span>
            <p>No se pudo cargar la imagen.</p>
          </div>
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={url}
            alt={alt}
            className={styles.image}
            style={{
              transform: `scale(${scale}) rotate(${rotation}deg)`,
            }}
            onError={() => setError(true)}
            draggable={false}
          />
        )}
      </div>

      {/* Hint bar */}
      <div className={styles.hint} aria-hidden="true">
        Ctrl+Rueda para zoom · R para rotar · 0 para restablecer
      </div>
    </div>
  );
}
