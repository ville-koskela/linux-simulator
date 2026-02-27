import { LoginPage } from "./components/Auth/LoginPage";
import { WindowManager } from "./components/WindowManager";
import { WindowTaskbar } from "./components/WindowTaskbar";
import "./App.css";
import type { JSX } from "react";
import { useAuth } from "./contexts";

export function App(): JSX.Element {
  const { isAuthenticated, isLoading } = useAuth();

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
        Signing in…
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="App">
      <WindowManager />
      <WindowTaskbar />
    </div>
  );
}
