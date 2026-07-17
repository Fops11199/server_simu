-- HostLab PostgreSQL Database Schema

-- Drop tables if they exist (for clean initialization)
DROP TABLE IF EXISTS command_history CASCADE;
DROP TABLE IF EXISTS simulator_snapshots CASCADE;
DROP TABLE IF EXISTS objective_progress CASCADE;
DROP TABLE IF EXISTS mission_progress CASCADE;
DROP TABLE IF EXISTS mission_objectives CASCADE;
DROP TABLE IF EXISTS missions CASCADE;
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table (supporting Username + 4-digit PIN)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    pin_hash TEXT NOT NULL, -- encrypted 4-digit PIN (e.g. bcrypt)
    xp INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Active play sessions
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ended_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Catalog of missions (populated dynamically from CORE_MISSIONS at startup)
CREATE TABLE missions (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
    category TEXT NOT NULL CHECK (category IN ('DNS', 'Nginx', 'Terminal', 'Database', 'SSL', 'Firewall')),
    ticket_number INTEGER NOT NULL,
    client_name TEXT NOT NULL,
    description TEXT NOT NULL,
    ticket_message TEXT NOT NULL,
    xp_reward INTEGER NOT NULL DEFAULT 0,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Objectives for each mission (populated dynamically from CORE_MISSIONS at startup)
CREATE TABLE mission_objectives (
    id TEXT PRIMARY KEY,
    mission_id TEXT NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tracks user progress on missions
CREATE TABLE mission_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mission_id TEXT NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
    completed BOOLEAN NOT NULL DEFAULT false,
    completed_at TIMESTAMPTZ,
    attempts INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_user_mission UNIQUE (user_id, mission_id)
);

-- Tracks user progress on specific objectives
CREATE TABLE objective_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    objective_id TEXT NOT NULL REFERENCES mission_objectives(id) ON DELETE CASCADE,
    completed BOOLEAN NOT NULL DEFAULT false,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_user_objective UNIQUE (user_id, objective_id)
);

-- Simulator snapshots (JSONB)
CREATE TABLE simulator_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES user_sessions(id) ON DELETE SET NULL,
    snapshot JSONB NOT NULL, -- Full SimulatorCoreState serialized
    label TEXT NOT NULL DEFAULT 'auto-save',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Terminal command history
CREATE TABLE command_history (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES user_sessions(id) ON DELETE SET NULL,
    mission_id TEXT REFERENCES missions(id) ON DELETE SET NULL,
    command TEXT NOT NULL,
    outcome TEXT NOT NULL CHECK (outcome IN ('input', 'output', 'error', 'info', 'success')),
    executed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_mission_progress_user ON mission_progress(user_id);
CREATE INDEX idx_objective_progress_user ON objective_progress(user_id);
CREATE INDEX idx_snapshots_user_date ON simulator_snapshots(user_id, created_at DESC);
CREATE INDEX idx_command_history_session ON command_history(session_id);
CREATE INDEX idx_command_history_user ON command_history(user_id, executed_at DESC);
