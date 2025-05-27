'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from "./page.module.css";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('loggedIn') === 'true';
    if (!isLoggedIn) {
      router.push('/login');
    }
  }, [router]);
  
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <button className="btn btn-primary">Click Me</button>
      </main>
    </div>
  );
}
