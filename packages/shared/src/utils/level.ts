/**
 * XP → Level formula using a square-root curve.
 *
 * level = floor(sqrt(xp / 50)) + 1
 *
 * Sample values:
 *  xp    level
 *   0    1
 *  50    2
 * 200    3
 * 450    4
 * 800    5
 * 1250   6
 */
export function xpToLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 50)) + 1;
}

/**
 * The total XP required to reach `level`.
 */
export function levelToXpThreshold(level: number): number {
  return (level - 1) ** 2 * 50;
}

/**
 * XP needed to advance from the current level to the next.
 */
export function xpForNextLevel(currentLevel: number): number {
  return levelToXpThreshold(currentLevel + 1);
}

/**
 * Progress (0–1) towards the next level.
 */
export function levelProgress(xp: number): number {
  const level = xpToLevel(xp);
  const current = levelToXpThreshold(level);
  const next = levelToXpThreshold(level + 1);
  return (xp - current) / (next - current);
}
