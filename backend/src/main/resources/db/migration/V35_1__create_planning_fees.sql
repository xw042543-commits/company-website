-- Ownership is part of each foreign key: a fee cannot borrow another programme's proof or total.
ALTER TABLE planning_evidence ADD CONSTRAINT planning_evidence_id_programme_unique UNIQUE (id, programme_id);

CREATE TABLE planning_fees (
    id BIGSERIAL PRIMARY KEY,
    programme_id BIGINT NOT NULL REFERENCES programmes(id),
    evidence_id BIGINT NOT NULL,
    category VARCHAR(20) NOT NULL CHECK (category IN ('TUITION','TAX','LIVING')),
    amount NUMERIC(18,4) CHECK (amount >= 0),
    currency VARCHAR(3) CHECK (currency ~ '^[A-Z]{3}$'),
    period VARCHAR(20) NOT NULL CHECK (period IN ('TOTAL','YEAR','SEMESTER','UNKNOWN')),
    units INTEGER CHECK (units > 0),
    included_in BIGINT,
    coverage_complete BOOLEAN NOT NULL DEFAULT FALSE,
    UNIQUE (id, programme_id),
    FOREIGN KEY (evidence_id, programme_id) REFERENCES planning_evidence(id, programme_id),
    FOREIGN KEY (included_in, programme_id) REFERENCES planning_fees(id, programme_id),
    CHECK (included_in IS NULL OR included_in <> id),
    CHECK (period <> 'TOTAL' OR units = 1),
    CHECK (NOT coverage_complete OR (amount IS NOT NULL AND currency IS NOT NULL AND period <> 'UNKNOWN' AND units IS NOT NULL))
);

CREATE INDEX planning_fees_programme_idx ON planning_fees(programme_id, id);
