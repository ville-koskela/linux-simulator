import type { JSX } from "react";
import { useAuth } from "../../contexts/AuthContext";
import styles from "./LoginPage.module.css";

export function LoginPage(): JSX.Element {
  const { login, isLoading } = useAuth();

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <span className={styles.prompt}>$</span>
        </div>
        <h1 className={styles.title}>Linux Simulator</h1>
        <p className={styles.subtitle}>Sign in to access your virtual terminal</p>
        <button type="button" className={styles.loginButton} onClick={login} disabled={isLoading}>
          {isLoading ? "Signing in…" : "Sign in with OAuth"}
        </button>
      </div>
    </div>
  );
}
