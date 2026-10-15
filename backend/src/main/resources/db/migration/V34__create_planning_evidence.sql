CREATE TABLE planning_evidence (
    id BIGSERIAL PRIMARY KEY,
    programme_id BIGINT NOT NULL REFERENCES programmes(id),
    fact_type VARCHAR(40) NOT NULL,
    source_url TEXT,
    source_type VARCHAR(30) NOT NULL,
    student_scope VARCHAR(30) NOT NULL,
    intake VARCHAR(30),
    checked_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    review_status VARCHAR(20) NOT NULL CHECK (review_status IN ('DRAFT','VERIFIED','REVOKED')),
    reviewer_id BIGINT,
    excerpt TEXT NOT NULL,
    conflict BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX planning_evidence_programme_idx ON planning_evidence(programme_id);
