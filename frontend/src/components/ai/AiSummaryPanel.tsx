'use client';

import { useState } from 'react';
import { fetchApi } from '@/lib/api';
import styles from './AiSummaryPanel.module.css';

interface SummaryResult {
  summary: string;
  keyPoints: string[];
  language: string;
}

interface Props {
  documentId: string;
  documentTitle: string;
}

export default function AiSummaryPanel({ documentId, documentTitle }: Props) {
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  const generateSummary = async () => {
    setState('loading');
    setErrorMsg('');
    try {
      const data = await fetchApi(`/documents/${documentId}/summary`);
      setResult(data);
      setState('done');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al generar el resumen');
      setState('error');
    }
  };

  const copySummary = async () => {
    if (!result) return;
    const text = `Resumen de "${documentTitle}"\n\n${result.summary}\n\nPuntos clave:\n${result.keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className={styles.panel} aria-label="Resumen con Inteligencia Artificial">
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.aiIcon} aria-hidden="true">✨</span>
          <div>
            <h2 className={styles.title}>Resumen con IA</h2>
            <p className={styles.subtitle}>Generado por GPT · DocVault AI</p>
          </div>
        </div>

        {state === 'done' && result && (
          <button
            className={styles.copyBtn}
            onClick={copySummary}
            aria-label={copied ? 'Resumen copiado' : 'Copiar resumen'}
          >
            {copied ? '✓ Copiado' : '⎘ Copiar'}
          </button>
        )}
      </div>

      {/* Idle state */}
      {state === 'idle' && (
        <div className={styles.idleState}>
          <p className={styles.idleText}>
            Genera un resumen inteligente de este documento automáticamente.
            El análisis extrae los puntos clave usando IA.
          </p>
          <button className={`btn btn-primary ${styles.generateBtn}`} onClick={generateSummary}>
            ✨ Generar Resumen
          </button>
        </div>
      )}

      {/* Loading state */}
      {state === 'loading' && (
        <div className={styles.loadingState} role="status" aria-label="Analizando documento">
          <div className={styles.loadingAnimation}>
            {[0, 1, 2].map((i) => (
              <div key={i} className={styles.dot} style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
          <p className={styles.loadingText}>Analizando documento…</p>
          <p className={styles.loadingSubtext}>Esto puede tardar unos segundos.</p>
        </div>
      )}

      {/* Error state */}
      {state === 'error' && (
        <div className={styles.errorState} role="alert">
          <p className={styles.errorMsg}>{errorMsg}</p>
          <button className={`btn ${styles.retryBtn}`} onClick={generateSummary}>
            Reintentar
          </button>
        </div>
      )}

      {/* Results */}
      {state === 'done' && result && (
        <div className={styles.results}>
          {/* Summary paragraph */}
          <div className={styles.summaryBlock}>
            <h3 className={styles.blockTitle}>Resumen</h3>
            <p className={styles.summaryText}>{result.summary}</p>
          </div>

          {/* Key points */}
          {result.keyPoints.length > 0 && (
            <div className={styles.keyPointsBlock}>
              <h3 className={styles.blockTitle}>Puntos Clave</h3>
              <ol className={styles.keyPointsList} aria-label="Puntos clave del documento">
                {result.keyPoints.map((point, i) => (
                  <li key={i} className={styles.keyPoint}>
                    <span className={styles.keyPointNumber} aria-hidden="true">{i + 1}</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Regenerate */}
          <button className={styles.regenerateBtn} onClick={generateSummary} aria-label="Regenerar resumen">
            ↺ Regenerar
          </button>
        </div>
      )}
    </section>
  );
}
