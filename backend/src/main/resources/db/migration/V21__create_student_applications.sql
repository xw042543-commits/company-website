CREATE TABLE student_applications (
 id UUID PRIMARY KEY,
 reference VARCHAR(40) NOT NULL UNIQUE,
 user_account_id BIGINT NOT NULL REFERENCES user_accounts(id),
 adviser_id BIGINT NOT NULL REFERENCES user_accounts(id),
 programme_id BIGINT NOT NULL REFERENCES programmes(id),
 status VARCHAR(30) NOT NULL DEFAULT 'IN_PROGRESS' CHECK (status IN ('IN_PROGRESS','NEEDS_DOCUMENTS','SUBMITTED','COMPLETED','CANCELLED')),
 stage INTEGER NOT NULL DEFAULT 1 CHECK (stage BETWEEN 1 AND 8),
 note VARCHAR(2000) NOT NULL DEFAULT '',
 created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_student_applications_owner ON student_applications(user_account_id,created_at DESC,id);
CREATE INDEX idx_student_applications_adviser ON student_applications(adviser_id,created_at DESC,id);
CREATE TABLE application_documents (
 id UUID PRIMARY KEY,
 application_id UUID NOT NULL REFERENCES student_applications(id) ON DELETE CASCADE,
 title VARCHAR(120) NOT NULL,
 stage INTEGER NOT NULL CHECK (stage BETWEEN 1 AND 8),
 status VARCHAR(20) NOT NULL DEFAULT 'MISSING' CHECK (status IN ('MISSING','SUBMITTED','APPROVED','REJECTED')),
 review_note VARCHAR(2000) NOT NULL DEFAULT '',
 filename VARCHAR(180),
 content BYTEA,
 updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CHECK (content IS NULL OR octet_length(content) <= 1048576)
);
CREATE INDEX idx_application_documents_parent ON application_documents(application_id,stage,id);
CREATE TABLE application_fees (
 id UUID PRIMARY KEY,
 application_id UUID NOT NULL REFERENCES student_applications(id) ON DELETE CASCADE,
 title VARCHAR(120) NOT NULL,
 amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
 currency VARCHAR(3) NOT NULL CHECK (currency ~ '^[A-Z]{3}$'),
 status VARCHAR(20) NOT NULL CHECK (status IN ('DUE','PAID','WAIVED')),
 stage INTEGER NOT NULL CHECK (stage BETWEEN 1 AND 8)
);
CREATE INDEX idx_application_fees_parent ON application_fees(application_id,stage,id);
CREATE TABLE application_events (
 id UUID PRIMARY KEY,
 application_id UUID NOT NULL REFERENCES student_applications(id) ON DELETE CASCADE,
 stage INTEGER NOT NULL CHECK (stage BETWEEN 1 AND 8),
 message VARCHAR(2000) NOT NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_application_events_parent ON application_events(application_id,created_at DESC,id);
