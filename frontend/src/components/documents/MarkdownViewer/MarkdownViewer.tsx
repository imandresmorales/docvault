'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styles from './MarkdownViewer.module.css';

interface Props {
  content: string;
}

export default function MarkdownViewer({ content }: Props) {
  // Build Table of Contents from headings
  const headings = [...content.matchAll(/^(#{1,3})\s+(.+)$/gm)].map((m) => ({
    level: m[1].length,
    text: m[2],
    id: m[2].toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  }));

  return (
    <div className={styles.wrapper}>
      {/* Table of Contents */}
      {headings.length > 0 && (
        <nav className={styles.toc} aria-label="Tabla de contenidos">
          <p className={styles.tocTitle}>Contenidos</p>
          <ol className={styles.tocList}>
            {headings.map((h, i) => (
              <li key={i} className={styles[`tocLevel${h.level}`]}>
                <a href={`#${h.id}`} className={styles.tocLink}>{h.text}</a>
              </li>
            ))}
          </ol>
        </nav>
      )}

      {/* Markdown body */}
      <article className={styles.markdown} aria-label="Contenido en Markdown">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            /* Add IDs to headings so ToC links work */
            h1: ({ children, ...props }) => <h1 id={String(children).toLowerCase().replace(/[^a-z0-9]+/g, '-')} {...props}>{children}</h1>,
            h2: ({ children, ...props }) => <h2 id={String(children).toLowerCase().replace(/[^a-z0-9]+/g, '-')} {...props}>{children}</h2>,
            h3: ({ children, ...props }) => <h3 id={String(children).toLowerCase().replace(/[^a-z0-9]+/g, '-')} {...props}>{children}</h3>,
            /* Open external links in new tab safely */
            a: ({ href, children, ...props }) => (
              <a
                href={href}
                target={href?.startsWith('http') ? '_blank' : undefined}
                rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                {...props}
              >
                {children}
              </a>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </article>
    </div>
  );
}
