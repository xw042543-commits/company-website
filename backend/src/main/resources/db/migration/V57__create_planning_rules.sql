CREATE TABLE planning_rule_sets (
    id BIGSERIAL PRIMARY KEY,
    programme_id BIGINT NOT NULL REFERENCES programmes(id),
    version BIGINT NOT NULL,
    complete BOOLEAN NOT NULL DEFAULT FALSE,
    active BOOLEAN NOT NULL DEFAULT FALSE,
    UNIQUE(programme_id, version)
);

CREATE UNIQUE INDEX planning_rule_sets_one_active_idx
    ON planning_rule_sets(programme_id) WHERE active;

CREATE TABLE planning_rule_conditions (
    id BIGSERIAL PRIMARY KEY,
    rule_set_id BIGINT NOT NULL REFERENCES planning_rule_sets(id),
    branch_no INTEGER NOT NULL CHECK (branch_no >= 0),
    field VARCHAR(100) NOT NULL,
    operator VARCHAR(30) NOT NULL,
    expected TEXT NOT NULL,
    scale VARCHAR(100),
    evidence_id BIGINT NOT NULL REFERENCES planning_evidence(id)
);

CREATE INDEX planning_rule_conditions_set_idx ON planning_rule_conditions(rule_set_id, branch_no, id);
