'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { searchDocuments, Document, getFileIcon, formatFileSize } from '@/lib/documents';
import styles from './GlobalSearch.module.css';

/** Debounce delay in ms before the API call fires */
const DEBOUNCE_MS = 300;
/** Maximum results shown in the dropdown */
const MAX_PREVIEW_RESULTS = 6;

export default function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Document[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Open search with Ctrl+K / Cmd+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setTotal(0);
      setOpen(false);
      return;
    }
    setLoading(true);
    try {
      const res = await searchDocuments({ q: q.trim(), limit: MAX_PREVIEW_RESULTS });
      setResults(res.items);
      setTotal(res.total);
      setOpen(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setActiveIndex(-1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(value), DEBOUNCE_MS);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && results[activeIndex]) {
        router.push(`/dashboard/documents/${results[activeIndex].id}`);
        clearSearch();
      } else if (query.trim()) {
        router.push(`/dashboard/documents?q=${encodeURIComponent(query.trim())}`);
        clearSearch();
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setOpen(false);
    setActiveIndex(-1);
  };

  const showAllResults = () => {
    if (query.trim()) {
      router.push(`/dashboard/documents?q=${encodeURIComponent(query.trim())}`);
      clearSearch();
    }
  };

  return (
    <div ref={containerRef} className={styles.wrapper} role="search">
      <div className={styles.inputWrapper}>
        <span className={styles.searchIcon} aria-hidden="true">🔍</span>
        <input
          ref={inputRef}
          type="search"
          id="global-search"
          className={styles.input}
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query.trim() && setOpen(true)}
          placeholder="Buscar documentos… (Ctrl+K)"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          aria-label="Buscar documentos"
          aria-autocomplete="list"
          aria-controls="search-results"
          aria-activedescendant={activeIndex >= 0 ? `search-result-${activeIndex}` : undefined}
          aria-expanded={open}
        />
        {loading && <span className={styles.spinner} aria-label="Buscando…" />}
        {query && !loading && (
          <button
            className={styles.clearBtn}
            onClick={clearSearch}
            aria-label="Limpiar búsqueda"
          >✕</button>
        )}
      </div>

      {/* Dropdown results */}
      {open && (
        <div
          id="search-results"
          className={styles.dropdown}
          role="listbox"
          aria-label="Resultados de búsqueda"
        >
          {results.length === 0 && !loading && (
            <p className={styles.noResults}>Sin resultados para «{query}»</p>
          )}

          {results.map((doc, i) => (
            <Link
              key={doc.id}
              id={`search-result-${i}`}
              href={`/dashboard/documents/${doc.id}`}
              className={`${styles.result} ${i === activeIndex ? styles.resultActive : ''}`}
              role="option"
              aria-selected={i === activeIndex}
              onClick={clearSearch}
            >
              <span className={styles.resultIcon} aria-hidden="true">{getFileIcon(doc.mimeType)}</span>
              <div className={styles.resultInfo}>
                <p className={styles.resultTitle}>{doc.title}</p>
                <p className={styles.resultMeta}>
                  {doc.category ?? 'Sin categoría'} · {formatFileSize(doc.size)}
                </p>
              </div>
            </Link>
          ))}

          {total > MAX_PREVIEW_RESULTS && (
            <button className={styles.showAllBtn} onClick={showAllResults}>
              Ver los {total} resultados para «{query}» →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
