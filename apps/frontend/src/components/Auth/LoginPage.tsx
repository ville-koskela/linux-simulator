import type { JSX } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useTranslations } from "../../contexts/TranslationsContext";
import styles from "./LoginPage.module.css";

export function LoginPage(): JSX.Element {
  const { login, isLoading } = useAuth();
  const { t } = useTranslations();

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <span className={styles.prompt}>$</span>
        </div>
        <h1 className={styles.title}>{t.loginPage.title}</h1>
        <p className={styles.subtitle}>{t.loginPage.subtitle}</p>
        <button type="button" className={styles.loginButton} onClick={login} disabled={isLoading}>
          {isLoading ? t.loginPage.signingIn : t.loginPage.signInButton}
        </button>
      </div>
    </div>
  );
}
