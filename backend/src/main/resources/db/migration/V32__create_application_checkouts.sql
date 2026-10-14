ALTER TABLE student_applications
    DROP CONSTRAINT student_applications_status_check,
    ALTER COLUMN adviser_id DROP NOT NULL,
    ADD CONSTRAINT student_applications_status_check
        CHECK (status IN ('UNPAID','PAID','IN_PROGRESS','NEEDS_DOCUMENTS','SUBMITTED','COMPLETED','CANCELLED'));

CREATE TABLE application_payment_orders (
    id UUID PRIMARY KEY,
    reference VARCHAR(40) NOT NULL UNIQUE,
    user_account_id BIGINT NOT NULL REFERENCES user_accounts(id),
    idempotency_key VARCHAR(80) NOT NULL,
    request_fingerprint CHAR(64) NOT NULL,
    status VARCHAR(24) NOT NULL DEFAULT 'UNPAID'
        CHECK (status IN ('UNPAID','PREPAY_CREATED','PAID','FAILED','CANCELLED')),
    total_amount_fen BIGINT CHECK (total_amount_fen IS NULL OR total_amount_fen >= 0),
    currency CHAR(3) NOT NULL DEFAULT 'CNY' CHECK (currency = 'CNY'),
    provider VARCHAR(24) NOT NULL DEFAULT 'WECHAT',
    provider_order_id VARCHAR(80),
    provider_transaction_id VARCHAR(80) UNIQUE,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_application_payment_order_idempotency UNIQUE (user_account_id, idempotency_key)
);

ALTER TABLE student_applications
    ADD COLUMN payment_order_id UUID REFERENCES application_payment_orders(id),
    ADD CONSTRAINT ck_student_application_assignment
        CHECK (adviser_id IS NOT NULL OR payment_order_id IS NOT NULL);

CREATE INDEX idx_application_payment_orders_owner
    ON application_payment_orders(user_account_id, created_at DESC, id DESC);
CREATE INDEX idx_student_applications_payment_order
    ON student_applications(payment_order_id, id) WHERE payment_order_id IS NOT NULL;

CREATE TABLE application_payment_items (
    id UUID PRIMARY KEY,
    payment_order_id UUID NOT NULL REFERENCES application_payment_orders(id) ON DELETE CASCADE,
    application_id UUID NOT NULL UNIQUE REFERENCES student_applications(id) ON DELETE CASCADE,
    programme_id BIGINT NOT NULL REFERENCES programmes(id),
    description VARCHAR(120) NOT NULL,
    amount_fen BIGINT CHECK (amount_fen IS NULL OR amount_fen >= 0),
    CONSTRAINT uk_application_payment_item_programme UNIQUE (payment_order_id, programme_id)
);

CREATE INDEX idx_application_payment_items_order
    ON application_payment_items(payment_order_id, id);
