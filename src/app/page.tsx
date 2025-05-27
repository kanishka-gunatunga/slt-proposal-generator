import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <button className="btn btn-primary">Click Me</button>
      </main>
    </div>
  );
}
