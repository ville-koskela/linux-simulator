import type { JSX } from "react";
import { useTranslations } from "../../contexts";
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
  const { t } = useTranslations();

  return (
    <div className="levelup-overlay" role="dialog" aria-modal="true" aria-label={t.levelUp.aria}>
      <div className="levelup-card">
        <div className="levelup-badge">⬆</div>
        <h2 className="levelup-title">{t.levelUp.title}</h2>
        <p className="levelup-level">{t.levelUp.reachedLevel.replace("{level}", String(level))}</p>

        {newCommands.length > 0 && (
          <div className="levelup-unlocks">
            <p className="levelup-unlocks__heading">{t.levelUp.unlockedCommands}</p>
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
          {t.levelUp.continue}
        </button>
      </div>
    </div>
  );
}
