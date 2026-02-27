import type { Task } from "@linux-simulator/shared";
import type { JSX } from "react";
import { useProgress } from "../../contexts/ProgressContext";
import { useSettings } from "../../contexts/SettingsContext";
import "./TaskPanel.css";

const CATEGORY_LABELS: Record<string, Record<string, string>> = {
  navigation: { en: "Navigation", fi: "Navigointi" },
  files: { en: "File Management", fi: "Tiedostonhallinta" },
  editor: { en: "Editor", fi: "Editori" },
  exploration: { en: "Exploration", fi: "Tutkiminen" },
};

const CATEGORY_ORDER = ["navigation", "exploration", "files", "editor"] as const;

interface TaskRowProps {
  task: Task;
  completed: boolean;
  lang: string;
}

function TaskRow({ task, completed, lang }: TaskRowProps): JSX.Element | null {
  const tr = task.translations[lang as "en" | "fi"] ?? task.translations.en;
  if (!tr) return null;
  return (
    <div className={`task-row ${completed ? "task-row--done" : ""}`}>
      <span className="task-row__check">{completed ? "✓" : "○"}</span>
      <div className="task-row__body">
        <span className="task-row__title">{tr.title}</span>
        <span className="task-row__desc">{tr.description}</span>
      </div>
      <span className="task-row__xp">+{task.xpReward} XP</span>
    </div>
  );
}

export function TaskPanel(): JSX.Element {
  const { availableTasks, completedTaskKeys, xp, level, levelProgressFraction } = useProgress();
  const { settings } = useSettings();
  const lang = settings.language;

  const pct = Math.round(levelProgressFraction * 100);
  const doneCount = availableTasks.filter((t) => completedTaskKeys.has(t.key)).length;

  return (
    <div className="task-panel">
      {/* Progress summary */}
      <div className="task-panel__header">
        <div className="task-panel__stats">
          <span className="task-panel__level">Level {level}</span>
          <span className="task-panel__xp">{xp} XP</span>
        </div>
        <div className="task-panel__bar-wrap">
          <div className="task-panel__bar" style={{ width: `${pct}%` }} />
        </div>
        <div className="task-panel__summary">
          {doneCount} / {availableTasks.length} tasks completed
        </div>
      </div>

      {/* Tasks by category */}
      <div className="task-panel__list">
        {CATEGORY_ORDER.map((cat) => {
          const tasks = availableTasks.filter((t) => t.category === cat);
          if (tasks.length === 0) return null;
          const label = CATEGORY_LABELS[cat]?.[lang] ?? CATEGORY_LABELS[cat]?.en ?? cat;
          return (
            <div key={cat} className="task-panel__category">
              <div className="task-panel__cat-title">{label}</div>
              {tasks.map((t) => (
                <TaskRow
                  key={t.key}
                  task={t}
                  completed={completedTaskKeys.has(t.key)}
                  lang={lang}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
