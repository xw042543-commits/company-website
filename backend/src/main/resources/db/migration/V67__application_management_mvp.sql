ALTER TABLE student_applications DROP CONSTRAINT student_applications_stage_check;
ALTER TABLE student_applications ADD CONSTRAINT student_applications_stage_check CHECK (stage BETWEEN 1 AND 10);

ALTER TABLE application_documents DROP CONSTRAINT application_documents_stage_check;
ALTER TABLE application_documents ADD CONSTRAINT application_documents_stage_check CHECK (stage BETWEEN 1 AND 10);

ALTER TABLE application_fees DROP CONSTRAINT application_fees_stage_check;
ALTER TABLE application_fees ADD CONSTRAINT application_fees_stage_check CHECK (stage BETWEEN 1 AND 10);

ALTER TABLE application_events DROP CONSTRAINT application_events_stage_check;
ALTER TABLE application_events ADD CONSTRAINT application_events_stage_check CHECK (stage BETWEEN 1 AND 10);

ALTER TABLE student_applications
    ADD COLUMN application_staff_id BIGINT REFERENCES user_accounts(id),
    ADD COLUMN current_stage_started_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN current_stage_due_at TIMESTAMPTZ;

CREATE INDEX idx_student_applications_staff
    ON student_applications(application_staff_id, current_stage_due_at, updated_at DESC)
    WHERE application_staff_id IS NOT NULL;

CREATE TABLE application_flow_stages (
    stage INTEGER PRIMARY KEY CHECK (stage BETWEEN 1 AND 10),
    name_zh VARCHAR(60) NOT NULL,
    sla_hours INTEGER CHECK (sla_hours IS NULL OR sla_hours > 0),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO application_flow_stages(stage,name_zh) VALUES
    (1,'材料准备'),(2,'材料审核'),(3,'公证认证'),(4,'申请递交'),(5,'院校审核'),
    (6,'录取结果'),(7,'签证办理'),(8,'行前准备'),(9,'入学注册'),(10,'结案');

CREATE TABLE application_follow_ups (
    id UUID PRIMARY KEY,
    application_id UUID NOT NULL REFERENCES student_applications(id) ON DELETE CASCADE,
    actor_id BIGINT NOT NULL REFERENCES user_accounts(id),
    channel VARCHAR(20) NOT NULL CHECK (channel IN ('PHONE','WECHAT','EMAIL','MEETING','OTHER')),
    content VARCHAR(2000) NOT NULL,
    result VARCHAR(2000) NOT NULL,
    next_follow_up_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_application_follow_ups_parent ON application_follow_ups(application_id,created_at DESC,id);

CREATE TABLE application_urges (
    id UUID PRIMARY KEY,
    application_id UUID NOT NULL REFERENCES student_applications(id) ON DELETE CASCADE,
    requester_id BIGINT NOT NULL REFERENCES user_accounts(id),
    assigned_to BIGINT REFERENCES user_accounts(id),
    type VARCHAR(30) NOT NULL CHECK (type IN ('DOCUMENT_REVIEW','SUBMISSION','VISA','OTHER')),
    detail VARCHAR(500) NOT NULL DEFAULT '',
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN','ACKNOWLEDGED','RESOLVED')),
    response VARCHAR(1000) NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    acknowledged_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ
);
CREATE INDEX idx_application_urges_parent ON application_urges(application_id,created_at DESC,id);
CREATE INDEX idx_application_urges_assignee ON application_urges(assigned_to,status,created_at)
    WHERE assigned_to IS NOT NULL AND status <> 'RESOLVED';
CREATE UNIQUE INDEX uk_application_open_urge ON application_urges(application_id,type)
    WHERE status <> 'RESOLVED';

CREATE TABLE application_sla_alerts (
    id UUID PRIMARY KEY,
    application_id UUID NOT NULL REFERENCES student_applications(id) ON DELETE CASCADE,
    stage INTEGER NOT NULL CHECK (stage BETWEEN 1 AND 10),
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('DUE_SOON','OVERDUE','ESCALATED')),
    opened_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMPTZ,
    CONSTRAINT uk_application_sla_alert UNIQUE(application_id,stage,severity)
);
