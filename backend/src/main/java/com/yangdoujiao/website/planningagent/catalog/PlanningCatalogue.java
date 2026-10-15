package com.yangdoujiao.website.planningagent.catalog;

import java.util.List;
import java.util.Set;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

/** PostgreSQL is authoritative; the general search API's three previews are not a planning catalogue. */
@Repository
public class PlanningCatalogue {
    private static final Set<String> LEVELS = Set.of("FOUNDATION","BACHELOR","MASTER","DOCTOR");
    private static final String PUBLISHED_MY = "p.status='PUBLISHED' AND u.status='PUBLISHED' AND c.code='MY'";
    private final JdbcTemplate jdbc;
    public PlanningCatalogue(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    /** Zero-based, twenty rows, stable id ordering; subject is an exact code or localized category name. */
    public List<Long> search(String level, String subject, String city, int page) {
        if (level == null || !LEVELS.contains(level) || page < 0
                || subject != null && subject.length() > 200 || city != null && city.length() > 200) {
            throw new IllegalArgumentException("Invalid planning catalogue filters");
        }
        String subjectFilter = subject == null || subject.isBlank() ? "" : subject.strip();
        String cityFilter = city == null || city.isBlank() ? "" : city.strip();
        return jdbc.queryForList("""
                SELECT p.id FROM programmes p
                JOIN universities u ON u.id=p.university_id
                JOIN countries c ON c.id=u.country_id
                JOIN study_levels l ON l.id=p.study_level_id
                JOIN subject_categories s ON s.id=p.subject_category_id
                WHERE %s AND l.code=?
                  AND (?='' OR lower(s.code)=lower(?) OR lower(s.name_en)=lower(?) OR s.name_zh=?)
                  AND (?='' OR lower(u.city_en)=lower(?) OR u.city_zh=?)
                ORDER BY p.id LIMIT 20 OFFSET ?
                """.formatted(PUBLISHED_MY),Long.class,level,subjectFilter,subjectFilter,subjectFilter,subjectFilter,
                cityFilter,cityFilter,cityFilter,(long)page*20);
    }

    public boolean isPublishedMalaysianProgramme(long programmeId) {
        if (programmeId <= 0) return false;
        return Boolean.TRUE.equals(jdbc.queryForObject("""
                SELECT EXISTS (SELECT 1 FROM programmes p
                JOIN universities u ON u.id=p.university_id JOIN countries c ON c.id=u.country_id
                WHERE p.id=? AND %s)
                """.formatted(PUBLISHED_MY),Boolean.class,programmeId));
    }
}
