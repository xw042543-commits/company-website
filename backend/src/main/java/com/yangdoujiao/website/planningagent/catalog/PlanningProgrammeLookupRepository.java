package com.yangdoujiao.website.planningagent.catalog;

import java.math.BigDecimal;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

/** Published catalogue material, deliberately separate from verified planning evidence. */
@Repository
public class PlanningProgrammeLookupRepository {
    public record Material(long id, String level, String nameZh, String nameEn, String university,
            String admissionsZh, String admissionsEn, String admissionsUrl, String admissionsType,
            Instant admissionsCheckedAt, String admissionsReference, BigDecimal tuitionMin, BigDecimal tuitionMax, String currency,
            String tuitionDisplay, String sourceUrl, String sourceType, String sourceReference, Instant checkedAt) {}

    private final JdbcTemplate jdbc;
    public PlanningProgrammeLookupRepository(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    public List<Material> search(List<String> keywords, String level, int limit, long offset) {
        StringBuilder sql = new StringBuilder("""
                SELECT p.id, l.code AS level, p.name_zh, p.name_en,
                    COALESCE(NULLIF(BTRIM(u.name_zh),''),NULLIF(BTRIM(u.name_en),''),u.name) AS university,
                    s.body_zh, s.body_en, s.source_url AS admissions_url,
                    s.source_type AS admissions_type, s.source_checked_at AS admissions_checked_at,
                    s.source_reference AS admissions_reference,
                    p.tuition_min, p.tuition_max, p.tuition_currency, p.tuition_display,
                    p.official_url, p.source_type, p.source_reference, p.source_checked_at
                FROM programmes p
                JOIN universities u ON u.id=p.university_id
                JOIN countries c ON c.id=u.country_id
                JOIN study_levels l ON l.id=p.study_level_id
                LEFT JOIN subject_categories cat ON cat.id=p.subject_category_id
                LEFT JOIN programme_detail_sections s ON s.programme_id=p.id
                    AND s.section_type='ADMISSIONS' AND s.status='PUBLISHED'
                WHERE p.status='PUBLISHED' AND u.status='PUBLISHED' AND c.code='MY'
                    AND l.code IN ('FOUNDATION','BACHELOR','MASTER','DOCTOR')
                """);
        List<Object> args = new ArrayList<>();
        if (level != null) { sql.append(" AND l.code=?"); args.add(level); }
        for (String keyword : keywords) {
            // Literal substring, not SQL LIKE: % and _ never expand the search.
            sql.append(" AND strpos(lower(concat_ws(' ',p.name_zh,p.name_en,u.name,u.name_zh,u.name_en,cat.code,cat.name_zh,cat.name_en)),lower(?))>0");
            args.add(keyword);
        }
        sql.append(" ORDER BY p.id LIMIT ? OFFSET ?");
        args.add(limit);
        args.add(offset);
        return jdbc.query(sql.toString(), (row, index) -> new Material(row.getLong("id"),
                row.getString("level"), row.getString("name_zh"), row.getString("name_en"), row.getString("university"),
                row.getString("body_zh"), row.getString("body_en"), row.getString("admissions_url"),
                row.getString("admissions_type"), instant(row,"admissions_checked_at"),
                row.getString("admissions_reference"),
                row.getBigDecimal("tuition_min"), row.getBigDecimal("tuition_max"), row.getString("tuition_currency"),
                row.getString("tuition_display"), row.getString("official_url"), row.getString("source_type"),
                row.getString("source_reference"), instant(row,"source_checked_at")), args.toArray());
    }

    private static Instant instant(ResultSet row, String column) throws SQLException {
        var value = row.getTimestamp(column);
        return value == null ? null : value.toInstant();
    }
}
