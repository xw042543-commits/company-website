package com.yangdoujiao.website.planningagent.evidence;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class EvidenceRepository {
    private final JdbcTemplate jdbc;

    public EvidenceRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<Evidence> findByProgrammeId(long programmeId) {
        return jdbc.query("""
                SELECT id, programme_id, fact_type, source_url, source_type, student_scope, intake,
                    checked_at, expires_at, review_status, reviewer_id, excerpt, conflict
                FROM planning_evidence WHERE programme_id = ? ORDER BY id
                """, (row, index) -> new Evidence(row.getLong("id"), row.getLong("programme_id"),
                row.getString("fact_type"), row.getString("source_url"), row.getString("source_type"),
                row.getString("student_scope"), row.getString("intake"), instant(row.getTimestamp("checked_at")),
                instant(row.getTimestamp("expires_at")), row.getString("review_status"),
                row.getObject("reviewer_id", Long.class), row.getString("excerpt"), row.getBoolean("conflict")),
                programmeId);
    }

    private static Instant instant(Timestamp timestamp) {
        return timestamp == null ? null : timestamp.toInstant();
    }
}
