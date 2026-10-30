// Esquema PostgreSQL de Tako. Todo es idempotente: se puede ejecutar en cada arranque.
module.exports = `
CREATE TABLE IF NOT EXISTS users (
  id              SERIAL PRIMARY KEY,
  email           TEXT NOT NULL,
  username        TEXT NOT NULL,
  password_hash   TEXT NOT NULL,
  occupation      TEXT NOT NULL DEFAULT '',
  daily_goal      SMALLINT NOT NULL DEFAULT 3,
  theme           TEXT NOT NULL DEFAULT 'auto',
  onboarded       BOOLEAN NOT NULL DEFAULT FALSE,
  xp              INTEGER NOT NULL DEFAULT 0,
  coins           INTEGER NOT NULL DEFAULT 30,
  total_completed INTEGER NOT NULL DEFAULT 0,
  streak_freezes  SMALLINT NOT NULL DEFAULT 0,
  last_settled    DATE,
  pet             JSONB NOT NULL DEFAULT '{"name":"Tako","shell":"shell_green","hat":null,"glasses":null,"neck":null,"scene":"scene_meadow"}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS users_email_uq ON users (lower(email));
CREATE UNIQUE INDEX IF NOT EXISTS users_username_uq ON users (lower(username));

CREATE TABLE IF NOT EXISTS tasks (
  id             SERIAL PRIMARY KEY,
  user_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title          TEXT NOT NULL,
  notes          TEXT NOT NULL DEFAULT '',
  date           DATE NOT NULL,
  category       TEXT NOT NULL DEFAULT 'personal',
  completed      BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at   TIMESTAMPTZ,
  completed_on   DATE,
  completed_hour SMALLINT,
  reward_claimed BOOLEAN NOT NULL DEFAULT FALSE,
  series_id      TEXT,
  deleted_at     TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS tasks_user_date_idx ON tasks (user_id, date);
CREATE INDEX IF NOT EXISTS tasks_user_completed_on_idx ON tasks (user_id, completed_on);

CREATE TABLE IF NOT EXISTS inventory (
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_id     TEXT NOT NULL,
  acquired_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, item_id)
);

CREATE TABLE IF NOT EXISTS achievements (
  user_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  unlocked_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, achievement_id)
);

CREATE TABLE IF NOT EXISTS frozen_days (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day     DATE NOT NULL,
  PRIMARY KEY (user_id, day)
);

CREATE TABLE IF NOT EXISTS goal_claims (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day     DATE NOT NULL,
  PRIMARY KEY (user_id, day)
);

CREATE TABLE IF NOT EXISTS custom_rewards (
  id             SERIAL PRIMARY KEY,
  user_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title          TEXT NOT NULL,
  emoji          TEXT NOT NULL DEFAULT '🎁',
  cost           INTEGER NOT NULL,
  times_redeemed INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS focus_sessions (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  minutes    SMALLINT NOT NULL,
  day        DATE NOT NULL,
  rewarded   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS focus_user_day_idx ON focus_sessions (user_id, day);
`;
