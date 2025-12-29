import { WindowManager } from "./components/WindowManager";
import { WindowTaskbar } from "./components/WindowTaskbar";
import "./App.css";
import type { JSX } from "react";

export function App(): JSX.Element {
  return (
    <div className="App">
      <WindowManager />
      <WindowTaskbar />
    </div>
  );
}
