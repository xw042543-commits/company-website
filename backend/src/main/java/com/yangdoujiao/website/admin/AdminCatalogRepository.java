package com.yangdoujiao.website.admin;

import static com.yangdoujiao.website.admin.AdminCatalogDtos.*;

import java.math.BigDecimal;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class AdminCatalogRepository {
    private final JdbcTemplate jdbc;
    private final NamedParameterJdbcTemplate named;

    public AdminCatalogRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
        this.named = new NamedParameterJdbcTemplate(jdbc);
    }

    public PageResponse<UniversityItem> universities(String query, String status, String country, int page, int size) {
        String where = " WHERE (:q = '' OR LOWER(COALESCE(u.name_zh,'') || ' ' || COALESCE(u.name_en,'') || ' ' || u.name) LIKE :like)"
                + " AND (:status = '' OR u.status = :status)"
                + countryPredicate();
        Map<String, Object> values = Map.of("q", query, "like", "%" + query.toLowerCase() + "%", "status", status, "country", country,
                "limit", size, "offset", (long) (page - 1) * size);
        long total = named.queryForObject("SELECT COUNT(*) FROM universities u" + where, values, Long.class);
        List<UniversityItem> items = named.query("""
                SELECT u.id,u.university_code,u.slug,u.name_zh,u.name_en,c.code country_code,
                       c.name_zh country_name_zh,c.name_en country_name_en,u.city_zh,u.city_en,
                       u.description_zh,u.description_en,u.official_url,u.status,u.updated_at,
                       (SELECT um.asset_url FROM university_media um WHERE um.university_id=u.id
                         AND um.kind IN ('LOGO','CREST') AND um.status='PUBLISHED' ORDER BY um.sort_order,um.id LIMIT 1) logo_url,
                       (SELECT COUNT(*) FROM programmes p WHERE p.university_id=u.id) programme_count
                  FROM universities u LEFT JOIN countries c ON c.id=u.country_id
                """ + where + " ORDER BY COALESCE(u.name_zh,u.name_en,u.name),u.id LIMIT :limit OFFSET :offset",
                values, UNIVERSITY_MAPPER);
        return page(items, page, size, total);
    }

    public UniversityItem university(long id) {
        return named.query("""
                SELECT u.id,u.university_code,u.slug,u.name_zh,u.name_en,c.code country_code,
                       c.name_zh country_name_zh,c.name_en country_name_en,u.city_zh,u.city_en,
                       u.description_zh,u.description_en,u.official_url,u.status,u.updated_at,
                       (SELECT um.asset_url FROM university_media um WHERE um.university_id=u.id
                         AND um.kind IN ('LOGO','CREST') AND um.status='PUBLISHED' ORDER BY um.sort_order,um.id LIMIT 1) logo_url,
                       (SELECT COUNT(*) FROM programmes p WHERE p.university_id=u.id) programme_count
                  FROM universities u LEFT JOIN countries c ON c.id=u.country_id WHERE u.id=:id
                """, Map.of("id", id), UNIVERSITY_MAPPER).stream().findFirst().orElse(null);
    }

    public long createUniversity(UniversityInput in) {
        return jdbc.queryForObject("""
                INSERT INTO universities(name,slug,country,popular,university_code,name_zh,name_en,city_zh,city_en,
                    description_zh,description_en,country_id,status,published_at,official_url)
                SELECT COALESCE(NULLIF(?,''),NULLIF(?,'')),?,COALESCE(c.name_en,c.code),FALSE,?,?,?,?,?,?,?,c.id,'PUBLISHED',CURRENT_TIMESTAMP,?
                  FROM countries c WHERE c.code=? RETURNING id
                """, Long.class, trim(in.nameEn()), trim(in.nameZh()), in.slug(), in.universityCode(),
                blank(in.nameZh()), blank(in.nameEn()), blank(in.regionZh()), blank(in.regionEn()),
                blank(in.descriptionZh()), blank(in.descriptionEn()), blank(in.officialUrl()), in.countryCode());
    }

    public int updateUniversity(long id, UniversityInput in) {
        return jdbc.update("""
                UPDATE universities SET name=COALESCE(NULLIF(?,''),NULLIF(?,'')),slug=?,country=(SELECT COALESCE(name_en,code) FROM countries WHERE code=?),university_code=?,
                    name_zh=?,name_en=?,city_zh=?,city_en=?,description_zh=?,description_en=?,country_id=(SELECT id FROM countries WHERE code=?),
                    official_url=?,updated_at=CURRENT_TIMESTAMP WHERE id=?
                """, trim(in.nameEn()), trim(in.nameZh()), in.slug(), in.countryCode(), in.universityCode(),
                blank(in.nameZh()), blank(in.nameEn()), blank(in.regionZh()), blank(in.regionEn()),
                blank(in.descriptionZh()), blank(in.descriptionEn()), in.countryCode(), blank(in.officialUrl()), id);
    }

    public void replaceLogo(long universityId, String logoUrl, String sourceUrl) {
        jdbc.update("UPDATE university_media SET status='ARCHIVED',updated_at=CURRENT_TIMESTAMP WHERE university_id=? AND kind IN ('LOGO','CREST')", universityId);
        if (blank(logoUrl) != null) {
            jdbc.update("""
                    INSERT INTO university_media(university_id,kind,asset_url,source_url,source_checked_at,status,sort_order)
                    VALUES (?,'LOGO',?,?,CURRENT_TIMESTAMP,'PUBLISHED',0)
                    ON CONFLICT (university_id,kind,asset_url) DO UPDATE SET source_url=EXCLUDED.source_url,
                        source_checked_at=CURRENT_TIMESTAMP,status='PUBLISHED',updated_at=CURRENT_TIMESTAMP
                    """, universityId, trim(logoUrl), blank(sourceUrl) == null ? trim(logoUrl) : trim(sourceUrl));
        }
    }

    public PageResponse<ProgrammeItem> programmes(String query, Long universityId, String status, String country, int page, int size) {
        String where = " WHERE (:q = '' OR LOWER(COALESCE(p.name_zh,'') || ' ' || COALESCE(p.name_en,'') || ' ' || p.programme_code) LIKE :like)"
                + (universityId == null ? "" : " AND p.university_id=:universityId")
                + " AND (:status='' OR p.status=:status)"
                + countryPredicate();
        Map<String, Object> values = new HashMap<>();
        values.put("q", query); values.put("like", "%" + query.toLowerCase() + "%");
        if (universityId != null) values.put("universityId", universityId);
        values.put("status", status);
        values.put("country", country);
        values.put("limit", size); values.put("offset", (long) (page - 1) * size);
        long total = named.queryForObject("SELECT COUNT(*) FROM programmes p JOIN universities u ON u.id=p.university_id" + where, values, Long.class);
        List<ProgrammeItem> items = named.query(programmeSelect() + where
                + " ORDER BY COALESCE(p.name_zh,p.name_en),p.id LIMIT :limit OFFSET :offset", values, PROGRAMME_MAPPER);
        return page(items, page, size, total);
    }

    public ProgrammeItem programme(long id) {
        return named.query(programmeSelect() + " WHERE p.id=:id", Map.of("id", id), PROGRAMME_MAPPER)
                .stream().findFirst().orElse(null);
    }

    public long createProgramme(ProgrammeInput in) {
        return jdbc.queryForObject("""
                INSERT INTO programmes(programme_code,university_id,subject_category_id,study_level_id,course_mode_id,
                    slug,name_zh,name_en,description_zh,description_en,duration_months,duration_display,
                    tuition_min,tuition_max,tuition_currency,tuition_display,official_url,source_checked_at,status,published_at)
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP,'PUBLISHED',CURRENT_TIMESTAMP) RETURNING id
                """, Long.class, in.programmeCode(), in.universityId(), in.categoryId(), in.studyLevelId(), in.courseModeId(),
                in.slug(), blank(in.nameZh()), blank(in.nameEn()), blank(in.descriptionZh()), blank(in.descriptionEn()),
                in.durationMonths(), blank(in.durationDisplay()), in.tuitionMin(), in.tuitionMax(), blank(in.tuitionCurrency()),
                blank(in.tuitionDisplay()), blank(in.officialUrl()));
    }

    public int updateProgramme(long id, ProgrammeInput in) {
        return jdbc.update("""
                UPDATE programmes SET programme_code=?,university_id=?,subject_category_id=?,study_level_id=?,course_mode_id=?,
                    slug=?,name_zh=?,name_en=?,description_zh=?,description_en=?,duration_months=?,duration_display=?,
                    tuition_min=?,tuition_max=?,tuition_currency=?,tuition_display=?,official_url=?,source_checked_at=CURRENT_TIMESTAMP,
                    updated_at=CURRENT_TIMESTAMP WHERE id=?
                """, in.programmeCode(), in.universityId(), in.categoryId(), in.studyLevelId(), in.courseModeId(),
                in.slug(), blank(in.nameZh()), blank(in.nameEn()), blank(in.descriptionZh()), blank(in.descriptionEn()),
                in.durationMonths(), blank(in.durationDisplay()), in.tuitionMin(), in.tuitionMax(), blank(in.tuitionCurrency()),
                blank(in.tuitionDisplay()), blank(in.officialUrl()), id);
    }

    public void upsertSection(long programmeId, String type, String titleZh, String titleEn, String bodyZh, String bodyEn,
            int sortOrder, String sourceUrl) {
        if (blank(bodyZh) == null && blank(bodyEn) == null) {
            jdbc.update("UPDATE programme_detail_sections SET status='ARCHIVED',updated_at=CURRENT_TIMESTAMP WHERE programme_id=? AND section_type=?", programmeId, type);
            return;
        }
        jdbc.update("""
                INSERT INTO programme_detail_sections(programme_id,section_type,title_zh,title_en,body_zh,body_en,sort_order,
                    source_url,source_checked_at,source_type,status)
                VALUES (?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP,CASE WHEN ? IS NULL THEN 'ai_generated' ELSE 'official' END,'PUBLISHED')
                ON CONFLICT (programme_id,section_type) DO UPDATE SET title_zh=EXCLUDED.title_zh,title_en=EXCLUDED.title_en,
                    body_zh=EXCLUDED.body_zh,body_en=EXCLUDED.body_en,sort_order=EXCLUDED.sort_order,
                    source_url=EXCLUDED.source_url,source_checked_at=CURRENT_TIMESTAMP,source_type=EXCLUDED.source_type,
                    status='PUBLISHED',updated_at=CURRENT_TIMESTAMP
                """, programmeId, type, titleZh, titleEn, blank(bodyZh), blank(bodyEn), sortOrder, blank(sourceUrl), blank(sourceUrl));
    }

    public int setUniversityStatus(long id, boolean enabled) {
        return jdbc.update("UPDATE universities SET status=?,published_at=CASE WHEN ? THEN COALESCE(published_at,CURRENT_TIMESTAMP) ELSE published_at END,updated_at=CURRENT_TIMESTAMP WHERE id=?",
                enabled ? "PUBLISHED" : "ARCHIVED", enabled, id);
    }

    public int setProgrammeStatus(long id, boolean enabled) {
        return jdbc.update("UPDATE programmes SET status=?,published_at=CASE WHEN ? THEN COALESCE(published_at,CURRENT_TIMESTAMP) ELSE published_at END,updated_at=CURRENT_TIMESTAMP WHERE id=?",
                enabled ? "PUBLISHED" : "ARCHIVED", enabled, id);
    }

    public Long programmeUniversityId(long programmeId) {
        return jdbc.query("SELECT university_id FROM programmes WHERE id=?", rs -> rs.next() ? rs.getLong(1) : null, programmeId);
    }

    public boolean countryExists(String code) { return Boolean.TRUE.equals(jdbc.queryForObject("SELECT EXISTS(SELECT 1 FROM countries WHERE code=?)", Boolean.class, code)); }
    public boolean universityExists(long id) { return Boolean.TRUE.equals(jdbc.queryForObject("SELECT EXISTS(SELECT 1 FROM universities WHERE id=?)", Boolean.class, id)); }
    public boolean categoryExists(long id) { return Boolean.TRUE.equals(jdbc.queryForObject("SELECT EXISTS(SELECT 1 FROM subject_categories WHERE id=? AND status='PUBLISHED')", Boolean.class, id)); }
    public boolean studyLevelExists(Long id) { return id == null || Boolean.TRUE.equals(jdbc.queryForObject("SELECT EXISTS(SELECT 1 FROM study_levels WHERE id=? AND status='PUBLISHED')", Boolean.class, id)); }
    public boolean courseModeExists(Long id) { return id == null || Boolean.TRUE.equals(jdbc.queryForObject("SELECT EXISTS(SELECT 1 FROM course_modes WHERE id=? AND status='PUBLISHED')", Boolean.class, id)); }

    public Options options() {
        List<Option> countries = jdbc.query("SELECT id,code,name_zh,name_en FROM countries ORDER BY code", OPTION_MAPPER);
        List<Option> categories = jdbc.query("SELECT id,code,name_zh,name_en FROM subject_categories WHERE status='PUBLISHED' ORDER BY sort_order,code", OPTION_MAPPER);
        List<Option> levels = jdbc.query("SELECT id,code,name_zh,name_en FROM study_levels WHERE status='PUBLISHED' ORDER BY sort_order,code", OPTION_MAPPER);
        List<Option> modes = jdbc.query("SELECT id,code,name_zh,name_en FROM course_modes WHERE status='PUBLISHED' ORDER BY sort_order,code", OPTION_MAPPER);
        List<Option> universities = jdbc.query("SELECT id,COALESCE(university_code,slug),name_zh,name_en FROM universities ORDER BY COALESCE(name_zh,name_en,name)", OPTION_MAPPER);
        return new Options(countries, categories, levels, modes, universities);
    }

    public void enqueue(long universityId) {
        jdbc.update("""
                INSERT INTO search_sync_jobs(university_id,status,available_at,created_at,updated_at)
                SELECT ?,'PENDING',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP
                WHERE NOT EXISTS (SELECT 1 FROM search_sync_jobs WHERE university_id=? AND status IN ('PENDING','PROCESSING'))
                """, universityId, universityId);
    }

    private static String countryPredicate() {
        return " AND (:country = '' OR u.country_id = (SELECT id FROM countries WHERE code = :country))";
    }

    private static String programmeSelect() { return """
            SELECT p.id,p.programme_code,p.university_id,COALESCE(u.name_zh,u.name_en,u.name) university_name,
                   p.slug,p.name_zh,p.name_en,p.subject_category_id,COALESCE(sc.name_zh,sc.name_en) category_name,
                   p.study_level_id,COALESCE(sl.name_zh,sl.name_en) study_level_name,
                   p.course_mode_id,COALESCE(cm.name_zh,cm.name_en) course_mode_name,
                   p.description_zh,p.description_en,p.duration_months,p.duration_display,p.tuition_min,p.tuition_max,
                   p.tuition_currency,p.tuition_display,
                   (SELECT body_zh FROM programme_detail_sections s WHERE s.programme_id=p.id AND s.section_type='ADMISSIONS' ORDER BY s.id LIMIT 1) admissions_zh,
                   (SELECT body_en FROM programme_detail_sections s WHERE s.programme_id=p.id AND s.section_type='ADMISSIONS' ORDER BY s.id LIMIT 1) admissions_en,
                   (SELECT body_zh FROM programme_detail_sections s WHERE s.programme_id=p.id AND s.section_type='CURRICULUM' ORDER BY s.id LIMIT 1) curriculum_zh,
                   (SELECT body_en FROM programme_detail_sections s WHERE s.programme_id=p.id AND s.section_type='CURRICULUM' ORDER BY s.id LIMIT 1) curriculum_en,
                   p.official_url,p.status,p.updated_at
              FROM programmes p JOIN universities u ON u.id=p.university_id
              JOIN subject_categories sc ON sc.id=p.subject_category_id
              LEFT JOIN study_levels sl ON sl.id=p.study_level_id LEFT JOIN course_modes cm ON cm.id=p.course_mode_id
            """; }

    private static final RowMapper<Option> OPTION_MAPPER = (rs, row) -> new Option(rs.getLong(1), rs.getString(2), rs.getString(3), rs.getString(4));
    private static final RowMapper<UniversityItem> UNIVERSITY_MAPPER = (rs, row) -> new UniversityItem(
            rs.getLong("id"), rs.getString("university_code"), rs.getString("slug"), rs.getString("name_zh"), rs.getString("name_en"),
            rs.getString("country_code"), rs.getString("country_name_zh"), rs.getString("country_name_en"), rs.getString("city_zh"), rs.getString("city_en"),
            rs.getString("description_zh"), rs.getString("description_en"), rs.getString("official_url"), rs.getString("logo_url"), rs.getString("status"),
            rs.getLong("programme_count"), rs.getObject("updated_at", OffsetDateTime.class));
    private static final RowMapper<ProgrammeItem> PROGRAMME_MAPPER = (rs, row) -> new ProgrammeItem(
            rs.getLong("id"), rs.getString("programme_code"), rs.getLong("university_id"), rs.getString("university_name"), rs.getString("slug"),
            rs.getString("name_zh"), rs.getString("name_en"), rs.getLong("subject_category_id"), rs.getString("category_name"),
            nullableLong(rs, "study_level_id"), rs.getString("study_level_name"), nullableLong(rs, "course_mode_id"), rs.getString("course_mode_name"),
            rs.getString("description_zh"), rs.getString("description_en"), nullableInt(rs, "duration_months"), rs.getString("duration_display"),
            rs.getBigDecimal("tuition_min"), rs.getBigDecimal("tuition_max"), rs.getString("tuition_currency"), rs.getString("tuition_display"),
            rs.getString("admissions_zh"), rs.getString("admissions_en"), rs.getString("curriculum_zh"), rs.getString("curriculum_en"),
            rs.getString("official_url"), rs.getString("status"), rs.getObject("updated_at", OffsetDateTime.class));

    private static Long nullableLong(ResultSet rs, String name) throws SQLException { long value = rs.getLong(name); return rs.wasNull() ? null : value; }
    private static Integer nullableInt(ResultSet rs, String name) throws SQLException { int value = rs.getInt(name); return rs.wasNull() ? null : value; }
    private static <T> PageResponse<T> page(List<T> items, int page, int size, long total) { return new PageResponse<>(items, page, size, total, (int) Math.ceil(total / (double) size)); }
    static String trim(String value) { return value == null ? "" : value.trim(); }
    static String blank(String value) { String result = trim(value); return result.isEmpty() ? null : result; }
}
