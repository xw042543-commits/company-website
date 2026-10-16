CREATE TABLE planning_saved_plans (
    id UUID PRIMARY KEY,
    owner_id BIGINT NOT NULL REFERENCES user_accounts(id) ON DELETE CASCADE,
    session_id UUID NOT NULL,
    run_id UUID NOT NULL,
    request_key VARCHAR(100) NOT NULL,
    request_hash CHAR(64) NOT NULL,
    version BIGINT NOT NULL DEFAULT 1,
    snapshot JSONB NOT NULL,
    source_baseline JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    UNIQUE(owner_id,session_id,request_key)
);
CREATE INDEX planning_saved_plans_owner ON planning_saved_plans(owner_id,created_at,id);
CREATE TABLE planning_saved_plan_programmes (
    plan_id UUID NOT NULL REFERENCES planning_saved_plans(id) ON DELETE CASCADE,
    programme_id BIGINT NOT NULL,
    snapshot JSONB NOT NULL,
    PRIMARY KEY(plan_id,programme_id)
);
CREATE TABLE planning_plan_consultations (
    plan_id UUID NOT NULL REFERENCES planning_saved_plans(id) ON DELETE CASCADE,
    request_key VARCHAR(100) NOT NULL,
    request_hash CHAR(64) NOT NULL,
    reference_code UUID NOT NULL,
    submitted_at TIMESTAMPTZ NOT NULL,
    PRIMARY KEY(plan_id,request_key)
);
CREATE TABLE planning_usage (
    owner_id BIGINT NOT NULL REFERENCES user_accounts(id) ON DELETE CASCADE,
    bucket VARCHAR(40) NOT NULL,
    used INTEGER NOT NULL DEFAULT 0 CHECK(used>=0),
    PRIMARY KEY(owner_id,bucket)
);
CREATE TABLE planning_daily_budget (
    day DATE PRIMARY KEY,
    tokens BIGINT NOT NULL DEFAULT 0 CHECK(tokens>=0),
    cost NUMERIC(20,8) NOT NULL DEFAULT 0 CHECK(cost>=0)
);
-- Independent of session cleanup: consumed reservations must never disappear from daily usage.
CREATE TABLE planning_reservations (
    run_id UUID PRIMARY KEY,
    owner_id BIGINT NOT NULL REFERENCES user_accounts(id) ON DELETE CASCADE,
    day DATE NOT NULL REFERENCES planning_daily_budget(day),
    tokens BIGINT NOT NULL CHECK(tokens>0),
    cost NUMERIC(20,8) NOT NULL CHECK(cost>0),
    calls INTEGER NOT NULL DEFAULT 0 CHECK(calls BETWEEN 0 AND 10)
);
