import type { JSX } from "react";
import { LoginPage } from "./components/Auth/LoginPage";
import { LevelUpNotification } from "./components/LevelUpNotification/LevelUpNotification";
import { WindowManager } from "./components/WindowManager";
import { WindowTaskbar } from "./components/WindowTaskbar";
import "./App.css";
import { useAuth } from "./contexts";
import { ProgressProvider, useProgress } from "./contexts/ProgressContext";
import { useTranslations } from "./contexts/TranslationsContext";

/** Renders the level-up overlay when progress triggers one. */
function LevelUpOverlay(): JSX.Element | null {
  const { pendingLevelUp, acknowledgeLevel } = useProgress();
  if (!pendingLevelUp) return null;
  return (
    <LevelUpNotification
      level={pendingLevelUp.newLevel}
      newCommands={pendingLevelUp.newCommands}
      onClose={acknowledgeLevel}
    />
  );
}

export function App(): JSX.Element {
  const { isAuthenticated, isLoading } = useAuth();
  const { t } = useTranslations();

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          background: "#1a1a2e",
          color: "#00ff41",
          fontFamily: "monospace",
          fontSize: "1.2rem",
        }}
      >
        {t.loginPage.signingIn}
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <ProgressProvider>
      <div className="App">
        <WindowManager />
        <WindowTaskbar />
        <LevelUpOverlay />
      </div>
    </ProgressProvider>
  );
}
