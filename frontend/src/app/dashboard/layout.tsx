'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Sidebar from '@/components/layout/Sidebar';
import GlobalSearch from '@/components/search/GlobalSearch';
import ToastContainer from '@/components/ui/Toast/ToastContainer';
import styles from './layout.module.css';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

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
      <Sidebar />
      <div className={styles.contentArea}>
        {/* Top header bar with global search */}
        <header className={styles.topBar} role="banner">
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
