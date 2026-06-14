'use client';

import { useState, useCallback } from 'react';
import styles from './TextViewer.module.css';

interface Props {
  /** Raw text content to display */
  content: string;
}

export default function TextViewer({ content }: Props) {
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState(false);

  const lines = content.split('\n');

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [content]);

  /**
   * Highlight matching text inside a line.
   * Returns an array of React nodes (plain strings and <mark> elements).
   * Security note: we use textContent (never innerHTML) so there is no XSS risk.
   */
  const highlight = (line: string, query: string): React.ReactNode => {
    if (!query) return line;
    const parts = line.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase()
        ? <mark key={i} className={styles.mark}>{part}</mark>
        : part,
    );
  };

  const matchingLines = search
    ? lines.filter((l) => l.toLowerCase().includes(search.toLowerCase())).length
    : 0;

  return (
    <div className={styles.viewer}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <input
          type="search"
          className={styles.searchInput}
          placeholder="Buscar en el documento…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Buscar en el texto"
        />
        {search && (
          <span className={styles.matchCount} aria-live="polite">
            {matchingLines} línea{matchingLines !== 1 ? 's' : ''} encontrada{matchingLines !== 1 ? 's' : ''}
          </span>
        )}
        <button
          className={styles.copyBtn}
          onClick={handleCopy}
          aria-label={copied ? 'Copiado al portapapeles' : 'Copiar texto completo'}
          title="Copiar al portapapeles"
        >
          {copied ? '✓ Copiado' : '⎘ Copiar'}
        </button>
      </div>

      {/* Code block */}
      <div className={styles.codeWrapper} role="region" aria-label="Contenido del archivo de texto">
        <table className={styles.codeTable} aria-label="Líneas del archivo">
          <tbody>
            {lines.map((line, i) => {
              const lineNumber = i + 1;
              const isMatch = search && line.toLowerCase().includes(search.toLowerCase());
              return (
                <tr key={lineNumber} className={isMatch ? styles.matchRow : undefined}>
                  <td className={styles.lineNumber} aria-label={`Línea ${lineNumber}`}>{lineNumber}</td>
                  <td className={styles.lineContent}>{highlight(line, search)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
