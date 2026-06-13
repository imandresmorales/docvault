'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Sidebar from '@/components/layout/Sidebar';
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
      <main id="main-content" className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}
