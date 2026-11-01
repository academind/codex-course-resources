CREATE TABLE note (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '',
  content_json TEXT NOT NULL,
  share_enabled INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX idx_note_user_updated ON note(user_id, updated_at DESC);

CREATE TABLE note_share (
  id TEXT PRIMARY KEY,
  note_id TEXT NOT NULL REFERENCES note(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  enabled INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  disabled_at TEXT
);
CREATE INDEX idx_note_share_note ON note_share(note_id);
CREATE UNIQUE INDEX idx_note_share_active ON note_share(note_id) WHERE enabled = 1;
