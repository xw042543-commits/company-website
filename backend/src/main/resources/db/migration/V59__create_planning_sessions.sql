CREATE TABLE planning_sessions (
    id UUID PRIMARY KEY,
    owner_id BIGINT NOT NULL REFERENCES user_accounts(id) ON DELETE CASCADE,
    age_band VARCHAR(20) NOT NULL CHECK (age_band IN ('AGE_14_17','AGE_18_PLUS')),
    privacy_version VARCHAR(50) NOT NULL,
    profile_version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX planning_sessions_owner ON planning_sessions(owner_id,id);
CREATE TABLE planning_profiles (
    session_id UUID NOT NULL REFERENCES planning_sessions(id) ON DELETE CASCADE,
    version BIGINT NOT NULL CHECK (version > 0),
    facts JSONB NOT NULL CHECK (jsonb_typeof(facts) = 'object'),
    confirmed_at TIMESTAMPTZ NOT NULL,
    PRIMARY KEY (session_id,version)
);
CREATE TABLE planning_runs (
    id UUID PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES planning_sessions(id) ON DELETE CASCADE,
    request_key VARCHAR(100) NOT NULL,
    request_hash CHAR(64) NOT NULL,
    intent VARCHAR(10) NOT NULL CHECK (intent IN ('CHAT','GENERATE')),
    profile_version BIGINT,
    status VARCHAR(12) NOT NULL CHECK (status IN ('QUEUED','RUNNING','SUCCEEDED','FAILED','TIMED_OUT')),
    created_at TIMESTAMPTZ NOT NULL,
    deadline TIMESTAMPTZ NOT NULL,
    lease_token UUID,
    lease_until TIMESTAMPTZ,
    result TEXT,
    error_code VARCHAR(50),
    UNIQUE (session_id,request_key),
    UNIQUE (session_id,id),
    FOREIGN KEY (session_id,profile_version) REFERENCES planning_profiles(session_id,version),
    CHECK (deadline > created_at AND deadline <= created_at + INTERVAL '60 seconds'),
    CHECK (intent <> 'GENERATE' OR profile_version IS NOT NULL),
    CHECK (status <> 'RUNNING' OR (lease_token IS NOT NULL AND lease_until IS NOT NULL))
);
CREATE UNIQUE INDEX planning_single_active_run ON planning_runs(session_id) WHERE status IN ('QUEUED','RUNNING');
CREATE INDEX planning_runs_claim ON planning_runs(created_at) WHERE status = 'QUEUED';
CREATE INDEX planning_runs_expiry ON planning_runs(deadline) WHERE status IN ('QUEUED','RUNNING');
CREATE TABLE planning_messages (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES planning_sessions(id) ON DELETE CASCADE,
    run_id UUID NOT NULL,
    role VARCHAR(10) NOT NULL CHECK (role IN ('USER','ASSISTANT')),
    text TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    FOREIGN KEY (session_id,run_id) REFERENCES planning_runs(session_id,id) ON DELETE CASCADE,
    UNIQUE (run_id,role)
);
