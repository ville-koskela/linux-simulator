import type { JSX } from "react";
import "./LevelUpNotification.css";

interface LevelUpNotificationProps {
  level: number;
  newCommands: string[];
  onClose: () => void;
}

export function LevelUpNotification({
  level,
  newCommands,
  onClose,
}: LevelUpNotificationProps): JSX.Element {
  return (
    <div className="levelup-overlay" role="dialog" aria-modal="true" aria-label="Level up">
      <div className="levelup-card">
        <div className="levelup-badge">⬆</div>
        <h2 className="levelup-title">Level Up!</h2>
        <p className="levelup-level">You reached level {level}</p>

        {newCommands.length > 0 && (
          <div className="levelup-unlocks">
            <p className="levelup-unlocks__heading">Unlocked commands:</p>
            <ul className="levelup-unlocks__list">
              {newCommands.map((cmd) => (
                <li key={cmd} className="levelup-unlocks__item">
                  <code>{cmd}</code>
                </li>
              ))}
            </ul>
          </div>
        )}

        <button type="button" className="levelup-close" onClick={onClose}>
          Continue
        </button>
      </div>
    </div>
  );
}
