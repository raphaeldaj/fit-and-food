import styles from "./NotFoundLoader.module.css";

export default function NotFoundLoader() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.loader}>
        <svg className={styles.svg} width="100" height="100" viewBox="0 0 100 100" aria-hidden="true">
          <defs>
            <mask id="clip404" className={styles.clipping}>
              <polygon points="0,0 100,0 100,100 0,100" fill="black" />
              <polygon points="25,25 75,25 50,75" fill="white" />
              <polygon points="50,25 75,75 25,75" fill="white" />
              <polygon points="35,35 65,35 50,65" fill="white" />
              <polygon points="35,35 65,35 50,65" fill="white" />
              <polygon points="35,35 65,35 50,65" fill="white" />
              <polygon points="35,35 65,35 50,65" fill="white" />
            </mask>
          </defs>
        </svg>
        <div className={styles.box} style={{ mask: "url(#clip404)", WebkitMask: "url(#clip404)" }} />
      </div>

      <div className={styles.message}>
        <h1 className={styles.code}>404</h1>
        <p className={styles.label}>Not Found</p>
      </div>
    </div>
  );
}