-- Add progress tracking tables for the XP / levelling system
-- Migration 7: user_progress and user_completed_tasks

CREATE TABLE IF NOT EXISTS user_progress (
  user_id    INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  xp         INTEGER NOT NULL DEFAULT 0 CHECK (xp >= 0),
  level      INTEGER NOT NULL DEFAULT 1 CHECK (level >= 1),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_completed_tasks (
  user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  task_key     TEXT NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, task_key)
);

-- Index for quick lookups per user
CREATE INDEX IF NOT EXISTS idx_user_completed_tasks_user_id
  ON user_completed_tasks (user_id);
