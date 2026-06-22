'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import ThemeToggle from '@/components/ui/ThemeToggle';
import styles from './Sidebar.module.css';

const NAV_ITEMS = [
  { href: '/dashboard',            label: 'Dashboard',       icon: '🏠' },
  { href: '/dashboard/documents',  label: 'Mis Documentos',  icon: '📄' },
  { href: '/dashboard/upload',     label: 'Subir Documento', icon: '⬆️' },
  { href: '/dashboard/statistics', label: 'Estadísticas',    icon: '📊' },
  { href: '/dashboard/settings',   label: 'Configuración',   icon: '⚙️' },
];

interface Props {
  /** Controls visibility on mobile (ignored on desktop where sidebar is always visible) */
  isOpen?: boolean;
  /** Called when the user dismisses the sidebar on mobile */
  onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: Props) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // Close sidebar automatically on route change (mobile navigation)
  useEffect(() => {
    if (onClose) onClose();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && onClose) onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Mobile backdrop — clicking it closes the sidebar */}
      {isOpen && (
        <div
          className={styles.backdrop}
          aria-hidden="true"
          onClick={onClose}
        />
      )}

      <aside
        className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}
        aria-label="Navegación principal"
        aria-hidden={undefined} /* always visible to AT; hidden visually by CSS on mobile when closed */
      >
        {/* Logo + mobile close button */}
        <div className={styles.logoRow}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>📁</span>
            <span className={styles.logoText}>DocVault</span>
          </div>
          {/* Visible only on mobile */}
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Cerrar menú"
          >✕</button>
        </div>

        {/* Navigation */}
        <nav className={styles.nav}>
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${pathname === item.href ? styles.active : ''}`}
              aria-current={pathname === item.href ? 'page' : undefined}
            >
              <span className={styles.navIcon} aria-hidden="true">{item.icon}</span>
              <span className={styles.navLabel}>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* User section */}
        <div className={styles.userSection}>
          <div className={styles.userInfo} aria-label="Usuario actual">
            <div className={styles.userAvatar} aria-hidden="true">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className={styles.userDetails}>
              <p className={styles.userName}>{user?.name}</p>
              <p className={styles.userEmail}>{user?.email}</p>
            </div>
          </div>
          <div className={styles.themeToggleWrapper}>
            <ThemeToggle variant="full" />
          </div>
          <button
            onClick={logout}
            className={styles.logoutBtn}
            aria-label="Cerrar sesión"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
}
