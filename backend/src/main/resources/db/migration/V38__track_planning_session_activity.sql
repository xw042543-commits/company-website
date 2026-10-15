ALTER TABLE planning_sessions ADD COLUMN last_activity_at TIMESTAMPTZ;

UPDATE planning_sessions s SET last_activity_at = GREATEST(
    s.created_at,
    (SELECT MAX(m.created_at) FROM planning_messages m WHERE m.session_id=s.id),
    (SELECT MAX(p.confirmed_at) FROM planning_profiles p WHERE p.session_id=s.id),
    (SELECT MAX(r.created_at) FROM planning_runs r WHERE r.session_id=s.id)
);

ALTER TABLE planning_sessions ALTER COLUMN last_activity_at SET NOT NULL;
ALTER TABLE planning_sessions ALTER COLUMN last_activity_at SET DEFAULT CURRENT_TIMESTAMP;
CREATE INDEX planning_sessions_last_activity ON planning_sessions(last_activity_at);
