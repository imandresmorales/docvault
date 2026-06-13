import styles from './page.module.css';

export default function DashboardPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Dashboard</h1>
      <p className={styles.subtitle}>Bienvenido a DocVault. Gestiona tus documentos desde aquí.</p>
    </div>
  );
}
