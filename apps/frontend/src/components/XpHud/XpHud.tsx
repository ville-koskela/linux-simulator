import type { JSX } from "react";
import { useProgress } from "../../contexts/ProgressContext";
import { useWindows } from "../../contexts/WindowContext";
import { TaskPanel } from "../TaskPanel/TaskPanel";
import "./XpHud.css";

export function XpHud(): JSX.Element {
  const { xp, level, levelProgressFraction } = useProgress();
  const { createWindow } = useWindows();

  const pct = Math.round(levelProgressFraction * 100);

  const handleOpen = (): void => {
    createWindow({
      id: "tasks",
      title: "Tasks",
      content: <TaskPanel />,
      initialX: 80,
      initialY: 80,
      initialWidth: 400,
      initialHeight: 500,
      minWidth: 320,
      minHeight: 300,
    });
  };

  return (
    <button type="button" className="xp-hud" onClick={handleOpen} title="Open task list">
      <span className="xp-hud__level">Lvl {level}</span>
      <div className="xp-hud__bar-wrap">
        <div className="xp-hud__bar" style={{ width: `${pct}%` }} />
      </div>
      <span className="xp-hud__xp">{xp} XP</span>
    </button>
  );
}
