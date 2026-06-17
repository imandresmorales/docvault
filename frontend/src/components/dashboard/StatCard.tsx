import styles from './StatCard.module.css';

interface Props {
  label: string;
  value: string;
  icon: string;
  trend?: string;
}

export default function StatCard({ label, value, icon, trend }: Props) {
  return (
    <div className={styles.card}>
      <div className={styles.iconWrapper} aria-hidden="true">{icon}</div>
      <div className={styles.content}>
        <p className={styles.value}>{value}</p>
        <p className={styles.label}>{label}</p>
        {trend && <p className={styles.trend}>{trend}</p>}
      </div>
    </div>
  );
}
