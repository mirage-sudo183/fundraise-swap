-- Workspaces (shared seed for deterministic ordering)
CREATE TABLE IF NOT EXISTS workspaces (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    seed TEXT NOT NULL UNIQUE,
    invite_code TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Users (simple name-based for demo)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    workspace_id TEXT REFERENCES workspaces(id),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Sessions
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Per-user cursor per mode
CREATE TABLE IF NOT EXISTS user_progress (
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mode TEXT NOT NULL CHECK (mode IN ('archive', 'recent')),
    cursor_index INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (user_id, mode)
);

-- Swipe decisions (like/pass per fundraise)
CREATE TABLE IF NOT EXISTS swipe_decisions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    fundraise_id TEXT NOT NULL,
    mode TEXT NOT NULL CHECK (mode IN ('archive', 'recent')),
    decision TEXT NOT NULL CHECK (decision IN ('like', 'pass')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(user_id, fundraise_id, mode)
);

-- Reflections (optional notes on Likes)
CREATE TABLE IF NOT EXISTS reflections (
    id TEXT PRIMARY KEY,
    swipe_id TEXT NOT NULL REFERENCES swipe_decisions(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    chips TEXT NOT NULL DEFAULT '[]',
    note TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Matches (when both users Like the same fundraise)
CREATE TABLE IF NOT EXISTS matches (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    fundraise_id TEXT NOT NULL,
    mode TEXT NOT NULL CHECK (mode IN ('archive', 'recent')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(workspace_id, fundraise_id, mode)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_name ON users(name);
CREATE INDEX IF NOT EXISTS idx_users_workspace ON users(workspace_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_workspaces_invite ON workspaces(invite_code);
CREATE INDEX IF NOT EXISTS idx_swipe_decisions_user ON swipe_decisions(user_id);
CREATE INDEX IF NOT EXISTS idx_swipe_decisions_fundraise ON swipe_decisions(user_id, fundraise_id);
CREATE INDEX IF NOT EXISTS idx_swipe_decisions_mode_fundraise ON swipe_decisions(fundraise_id, mode, decision);
CREATE INDEX IF NOT EXISTS idx_reflections_swipe ON reflections(swipe_id);
CREATE INDEX IF NOT EXISTS idx_reflections_user ON reflections(user_id);
CREATE INDEX IF NOT EXISTS idx_matches_workspace ON matches(workspace_id);
CREATE INDEX IF NOT EXISTS idx_matches_fundraise ON matches(fundraise_id);
