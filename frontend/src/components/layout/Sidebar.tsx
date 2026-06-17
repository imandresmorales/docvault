'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import styles from './Sidebar.module.css';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { href: '/dashboard/documents', label: 'Mis Documentos', icon: '📄' },
  { href: '/dashboard/upload', label: 'Subir Documento', icon: '⬆️' },
  { href: '/dashboard/statistics', label: 'Estadísticas', icon: '📊' },
  { href: '/dashboard/settings', label: 'Configuración', icon: '⚙️' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className={styles.sidebar} aria-label="Navegación principal">
      {/* Logo */}
      <div className={styles.logo}>
        <span className={styles.logoIcon}>📁</span>
        <span className={styles.logoText}>DocVault</span>
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
        <button
          onClick={logout}
          className={styles.logoutBtn}
          aria-label="Cerrar sesión"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
