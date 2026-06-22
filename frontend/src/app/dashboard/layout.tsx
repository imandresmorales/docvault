'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Sidebar from '@/components/layout/Sidebar';
import GlobalSearch from '@/components/search/GlobalSearch';
import ToastContainer from '@/components/ui/Toast/ToastContainer';
import styles from './layout.module.css';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  if (isLoading) {
    return (
      <div className={styles.loadingScreen} aria-label="Cargando">
        <div className={styles.spinner} role="status" aria-label="Verificando sesión..." />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className={styles.dashboardWrapper}>
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className={styles.contentArea}>
        {/* Top header bar */}
        <header className={styles.topBar} role="banner">
          {/* Hamburger — visible only on mobile */}
          <button
            className={styles.hamburger}
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menú de navegación"
            aria-expanded={sidebarOpen}
            aria-controls="sidebar"
          >
            <span className={styles.hamburgerLine} aria-hidden="true" />
            <span className={styles.hamburgerLine} aria-hidden="true" />
            <span className={styles.hamburgerLine} aria-hidden="true" />
          </button>
          <GlobalSearch />
        </header>
        <main id="main-content" className={styles.mainContent}>
          {children}
        </main>
      </div>
      {/* Global toast notifications */}
      <ToastContainer />
    </div>
  );
}
