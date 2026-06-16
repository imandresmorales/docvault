'use client';

import { useState, useRef, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import styles from './AiChatPanel.module.css';

interface Message {
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

interface Props {
  documentId: string;
  documentTitle: string;
}

const SUGGESTED_QUESTIONS = [
  '¿Cuál es el tema principal de este documento?',
  '¿Qué conclusiones se presentan?',
  '¿Qué fechas o plazos se mencionan?',
  '¿Quiénes son los responsables mencionados?',
];

export default function AiChatPanel({ documentId, documentTitle }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const askQuestion = async (q: string) => {
    const text = q.trim();
    if (!text || isLoading) return;

    const userMsg: Message = { role: 'user', text, timestamp: new Date() };
    setMessages((m) => [...m, userMsg]);
    setQuestion('');
    setError('');
    setIsLoading(true);

    try {
      const data = await fetchApi(`/documents/${documentId}/ask`, {
        method: 'POST',
        body: JSON.stringify({ question: text }),
      });
      const assistantMsg: Message = {
        role: 'assistant',
        text: data.answer,
        timestamp: new Date(),
      };
      setMessages((m) => [...m, assistantMsg]);
    } catch (err: any) {
      setError(err.message || 'Error al obtener la respuesta');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    askQuestion(question);
  };

  const clearChat = () => {
    setMessages([]);
    setError('');
  };

  const formatTime = (d: Date) =>
    d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  return (
    <section className={styles.panel} aria-label="Chat de preguntas sobre el documento">
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.icon} aria-hidden="true">💬</span>
          <div>
            <h2 className={styles.title}>Preguntas al Documento</h2>
            <p className={styles.subtitle}>Haz cualquier pregunta · DocVault AI</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button className={styles.clearBtn} onClick={clearChat} aria-label="Limpiar conversación">
            🗑️ Limpiar
          </button>
        )}
      </div>

      {/* Messages area */}
      <div className={styles.messages} role="log" aria-live="polite" aria-label="Conversación">
        {/* Welcome / empty state */}
        {messages.length === 0 && !isLoading && (
          <div className={styles.welcomeState}>
            <p className={styles.welcomeText}>
              Puedes hacerle preguntas específicas a este documento.
              La IA analizará el contenido y responderá basándose en él.
            </p>
            <div className={styles.suggestions} aria-label="Preguntas sugeridas">
              <p className={styles.suggestionsLabel}>Sugerencias:</p>
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  className={styles.suggestionBtn}
                  onClick={() => askQuestion(q)}
                  aria-label={`Preguntar: ${q}`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Conversation messages */}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`${styles.message} ${msg.role === 'user' ? styles.userMsg : styles.assistantMsg}`}
            aria-label={msg.role === 'user' ? 'Pregunta tuya' : 'Respuesta de la IA'}
          >
            <div className={styles.bubble}>
              <p className={styles.bubbleText}>{msg.text}</p>
              <span className={styles.timestamp} aria-hidden="true">{formatTime(msg.timestamp)}</span>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className={`${styles.message} ${styles.assistantMsg}`} aria-label="La IA está pensando">
            <div className={`${styles.bubble} ${styles.thinkingBubble}`}>
              <div className={styles.thinkingDots}>
                {[0, 1, 2].map((i) => (
                  <span key={i} className={styles.thinkingDot} style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <p className={styles.errorMsg} role="alert">{error}</p>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <form className={styles.inputArea} onSubmit={handleSubmit} noValidate>
        <input
          type="text"
          className={styles.input}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={`Pregunta sobre "${documentTitle}"…`}
          disabled={isLoading}
          maxLength={500}
          aria-label="Tu pregunta"
          autoComplete="off"
        />
        <button
          type="submit"
          className={styles.sendBtn}
          disabled={isLoading || !question.trim()}
          aria-label="Enviar pregunta"
        >
          {isLoading ? '⏳' : '↑'}
        </button>
      </form>
    </section>
  );
}
