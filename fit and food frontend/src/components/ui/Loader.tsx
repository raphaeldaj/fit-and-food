import styles from "./Loader.module.css";

const RINGS = Array.from({ length: 15 }, (_, i) => i);

interface LoaderProps {
  /** Taille en pixels du loader (largeur = hauteur). Défaut : 120px. */
  size?: number;
  /** Texte optionnel affiché sous le loader. */
  label?: string;
}

export default function Loader({ size = 120, label }: LoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className={styles.container} style={{ width: size, height: size }}>
        {RINGS.map((i) => (
          <div key={i} className={styles.aro} style={{ "--s": i } as React.CSSProperties} />
        ))}
      </div>
      {label && <p className="text-sm text-text-muted">{label}</p>}
    </div>
  );
}