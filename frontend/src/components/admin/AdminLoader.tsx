import styles from "./AdminLoader.module.css";

export default function AdminLoader({ label = "Chargement..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-14">
      <div className={styles.container}>
        <div className={styles.vial}>
          <div className={styles.chamber}>
            <div className={`${styles.pool} ${styles.bottomPool}`} />
            <div className={`${styles.pool} ${styles.topPool}`} />
            <div className={`${styles.droplet} ${styles.d1}`} />
            <div className={`${styles.droplet} ${styles.d2}`} />
            <div className={`${styles.droplet} ${styles.d3}`} />
            <div className={`${styles.droplet} ${styles.d4}`} />
            <div className={`${styles.droplet} ${styles.d5}`} />
          </div>
        </div>
        <div className={styles.base} />
        <span className={styles.label}>{label}</span>
      </div>
    </div>
  );
}