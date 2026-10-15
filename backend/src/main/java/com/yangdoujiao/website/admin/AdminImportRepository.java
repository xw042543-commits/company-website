package com.yangdoujiao.website.admin;

import static com.yangdoujiao.website.admin.AdminImportDtos.*;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

@Repository
public class AdminImportRepository {
    private final JdbcTemplate jdbc;
    private final ObjectMapper json;

    public AdminImportRepository(JdbcTemplate jdbc, ObjectMapper json) {
        this.jdbc = jdbc;
        this.json = json;
    }

    public UUID createBatch(EntityType type, String filename, long userId) {
        return jdbc.queryForObject("""
                INSERT INTO catalog_import_batches(entity_type,original_filename,uploaded_by_user_id)
                VALUES (?,?,?) RETURNING id
                """, UUID.class, type.name(), filename, userId);
    }

    public void addRow(UUID batchId, int rowNumber, EntityType type, Classification classification,
            Map<String, Object> payload, String normalizedKey, String reason, Long matchId, String error, String parseError) {
        jdbc.update("""
                INSERT INTO catalog_import_rows(batch_id,row_number,entity_type,classification,draft_status,payload,
                    normalized_key,duplicate_reason,matched_record_id,error_message,parse_error)
                VALUES (?,?,?,?,?,?::jsonb,?,?,?,?,?)
                """, batchId, rowNumber, type.name(), classification.name(),
                classification == Classification.NEW ? "DRAFT" : "NOT_DRAFT", toJson(payload),
                normalizedKey, reason, matchId, error, parseError);
    }

    public void refreshCounts(UUID batchId) {
        jdbc.update("""
                UPDATE catalog_import_batches b SET
                    total_rows=x.total_rows,draft_rows=x.draft_rows,exact_duplicate_rows=x.exact_rows,
                    possible_duplicate_rows=x.possible_rows,conflict_rows=x.conflict_rows,
                    invalid_rows=x.invalid_rows,published_rows=x.published_rows,failed_rows=x.failed_rows,
                    status=CASE WHEN x.total_rows=0 OR x.invalid_rows=x.total_rows THEN 'FAILED'
                                WHEN x.draft_rows=0 AND x.published_rows>0 THEN 'PUBLISHED'
                                WHEN x.published_rows>0 THEN 'PARTIALLY_PUBLISHED' ELSE 'PROCESSED' END,
                    published_at=CASE WHEN x.published_rows>0 THEN COALESCE(b.published_at,CURRENT_TIMESTAMP) ELSE b.published_at END,
                    failure_reason=NULL,updated_at=CURRENT_TIMESTAMP
                FROM (SELECT COUNT(*)::int total_rows,
                    COUNT(*) FILTER (WHERE draft_status='DRAFT')::int draft_rows,
                    COUNT(*) FILTER (WHERE classification='EXACT_DUPLICATE')::int exact_rows,
                    COUNT(*) FILTER (WHERE classification='POSSIBLE_DUPLICATE')::int possible_rows,
                    COUNT(*) FILTER (WHERE classification='CONFLICT')::int conflict_rows,
                    COUNT(*) FILTER (WHERE classification='INVALID')::int invalid_rows,
                    COUNT(*) FILTER (WHERE draft_status='PUBLISHED')::int published_rows,
                    COUNT(*) FILTER (WHERE draft_status='FAILED')::int failed_rows
                    FROM catalog_import_rows WHERE batch_id=?) x WHERE b.id=?
                """, batchId, batchId);
    }

    public ImportBatch batch(UUID id) {
        return jdbc.query(batchSql() + " WHERE b.id=?", BATCH_MAPPER, id).stream().findFirst().orElse(null);
    }

    public List<ImportBatch> batches(int page, int limit) {
        return jdbc.query(batchSql() + " ORDER BY b.created_at DESC,b.id DESC LIMIT ? OFFSET ?", BATCH_MAPPER, limit, (page-1)*limit);
    }

    public long batchCount() { return jdbc.queryForObject("SELECT COUNT(*) FROM catalog_import_batches",Long.class); }

    public void failBatch(UUID id, String reason) {
        jdbc.update("UPDATE catalog_import_batches SET status='FAILED',failure_reason=?,updated_at=CURRENT_TIMESTAMP WHERE id=?", reason, id);
    }

    public void publishFailure(UUID id,int count) {
        jdbc.update("UPDATE catalog_import_batches SET status='FAILED',failed_rows=?,failure_reason='发布失败，所选记录已全部回滚，请重新处理或重试。',updated_at=CURRENT_TIMESTAMP WHERE id=?",count,id);
    }

    public void lockCatalog() {
        jdbc.execute("LOCK TABLE universities, programmes IN SHARE ROW EXCLUSIVE MODE");
    }

    public void lockBatch(UUID id) {
        jdbc.queryForObject("SELECT id FROM catalog_import_batches WHERE id=? FOR UPDATE", UUID.class, id);
    }

    public void setCampus(long id, String campus) {
        jdbc.update("UPDATE programmes SET campus=? WHERE id=?", AdminCatalogRepository.blank(campus), id);
    }

    public List<String> publishedProgrammeAliases(long id) {
        return jdbc.queryForList("SELECT alias FROM search_aliases WHERE target_type='PROGRAMME' AND target_code=(SELECT programme_code FROM programmes WHERE id=?) AND status='PUBLISHED'", String.class, id);
    }

    public List<ImportRow> rows(UUID batchId) {
        return jdbc.query("""
                SELECT id,batch_id,row_number,entity_type,classification,draft_status,payload,duplicate_reason,
                       matched_record_id,published_record_id,error_message,updated_at,parse_error
                FROM catalog_import_rows WHERE batch_id=? ORDER BY row_number
                """, this::mapRow, batchId);
    }

    public List<ImportRow> lockRows(UUID batchId, List<Long> ids) {
        if (ids.isEmpty()) return List.of();
        String placeholders = String.join(",", java.util.Collections.nCopies(ids.size(), "?"));
        List<Object> args = new ArrayList<>(); args.add(batchId); args.addAll(ids);
        return jdbc.query("""
                SELECT id,batch_id,row_number,entity_type,classification,draft_status,payload,duplicate_reason,
                       matched_record_id,published_record_id,error_message,updated_at,parse_error
                FROM catalog_import_rows WHERE batch_id=? AND id IN (%s) ORDER BY row_number FOR UPDATE
                """.formatted(placeholders), this::mapRow, args.toArray());
    }

    public void updateRow(long id, Map<String, Object> payload, Classification classification,
            String normalizedKey, String reason, Long matchId, String error) {
        jdbc.update("""
                UPDATE catalog_import_rows SET payload=?::jsonb,classification=?,draft_status=?,normalized_key=?,
                    duplicate_reason=?,matched_record_id=?,error_message=?,updated_at=CURRENT_TIMESTAMP WHERE id=?
                """, toJson(payload), classification.name(), classification == Classification.NEW ? "DRAFT" : "NOT_DRAFT",
                normalizedKey, reason, matchId, error, id);
    }

    public void clearParseError(long id) { jdbc.update("UPDATE catalog_import_rows SET parse_error=NULL WHERE id=?",id); }

    public void removeRow(UUID batchId, long id) {
        jdbc.update("UPDATE catalog_import_rows SET draft_status='REMOVED',updated_at=CURRENT_TIMESTAMP WHERE batch_id=? AND id=? AND draft_status='DRAFT'",
                batchId, id);
    }

    public void markPublished(long rowId, long recordId) {
        jdbc.update("UPDATE catalog_import_rows SET draft_status='PUBLISHED',published_record_id=?,updated_at=CURRENT_TIMESTAMP WHERE id=?",
                recordId, rowId);
    }

    public void saveAlias(EntityType type, long entityId, String alias, String normalized) {
        jdbc.update("""
                INSERT INTO catalog_entity_aliases(entity_type,entity_id,alias,normalized_alias)
                VALUES (?,?,?,?) ON CONFLICT DO NOTHING
                """, type.name(), entityId, alias, normalized);
    }

    public List<ExistingUniversity> universities() {
        return jdbc.query("""
                SELECT u.id,u.university_code,u.slug,c.code,u.name_zh,u.name_en,
                    array_append(array_append(COALESCE(array_agg(a.alias) FILTER (WHERE a.alias IS NOT NULL),'{}'),u.name),u.university_code) aliases
                FROM universities u LEFT JOIN countries c ON c.id=u.country_id
                LEFT JOIN catalog_entity_aliases a ON a.entity_type='UNIVERSITY' AND a.entity_id=u.id
                GROUP BY u.id,c.code
                """, (rs, row) -> new ExistingUniversity(rs.getLong(1),rs.getString(2),rs.getString(3),rs.getString(4),
                        rs.getString(5),rs.getString(6), java.util.Arrays.asList((String[]) rs.getArray(7).getArray())));
    }

    public List<ExistingProgramme> programmes() {
        return jdbc.query("""
                SELECT p.id,p.programme_code,p.university_id,p.slug,sl.code,p.campus,p.name_zh,p.name_en,
                    COALESCE(array_agg(a.alias) FILTER (WHERE a.alias IS NOT NULL),'{}') || ARRAY(SELECT sa.alias FROM search_aliases sa WHERE sa.target_type='PROGRAMME' AND sa.target_code=p.programme_code AND sa.status='PUBLISHED') aliases
                FROM programmes p LEFT JOIN study_levels sl ON sl.id=p.study_level_id
                LEFT JOIN catalog_entity_aliases a ON a.entity_type='PROGRAMME' AND a.entity_id=p.id
                GROUP BY p.id,sl.code
                """, (rs, row) -> new ExistingProgramme(rs.getLong(1),rs.getString(2),rs.getLong(3),rs.getString(4),
                        rs.getString(5),rs.getString(6),rs.getString(7),rs.getString(8),
                        List.of((String[]) rs.getArray(9).getArray())));
    }

    public Map<String, Long> countryIds() { return codeMap("SELECT code,id FROM countries"); }
    public Map<String, Long> categoryIds() { return codeMap("SELECT code,id FROM subject_categories WHERE status='PUBLISHED'"); }
    public Map<String, Long> studyLevelIds() { return codeMap("SELECT code,id FROM study_levels WHERE status='PUBLISHED'"); }
    public Map<String, Long> courseModeIds() { return codeMap("SELECT code,id FROM course_modes WHERE status='PUBLISHED'"); }
    public Map<String, Long> universityIds() { return codeMap("SELECT COALESCE(university_code,slug),id FROM universities"); }

    private Map<String, Long> codeMap(String sql) {
        return jdbc.query(sql, rs -> { var result = new java.util.HashMap<String, Long>(); while (rs.next()) result.put(rs.getString(1).toUpperCase(),rs.getLong(2)); return result; });
    }

    private ImportRow mapRow(ResultSet rs, int row) throws SQLException {
        try {
            Object raw = rs.getObject("payload");
            String value = String.valueOf(raw);
            return new ImportRow(rs.getLong("id"),rs.getObject("batch_id",UUID.class),rs.getInt("row_number"),
                    EntityType.valueOf(rs.getString("entity_type")),Classification.valueOf(rs.getString("classification")),
                    rs.getString("draft_status"),json.readValue(value,new TypeReference<>() {}),rs.getString("duplicate_reason"),
                    nullableLong(rs,"matched_record_id"),nullableLong(rs,"published_record_id"),rs.getString("error_message"),
                    rs.getObject("updated_at",OffsetDateTime.class),rs.getString("parse_error"));
        } catch (RuntimeException exception) { throw new SQLException("Invalid stored import payload", exception); }
    }

    private String toJson(Map<String, Object> payload) {
        try { return json.writeValueAsString(payload); }
        catch (RuntimeException exception) { throw new IllegalArgumentException("Invalid import payload", exception); }
    }

    private static Long nullableLong(ResultSet rs,String column) throws SQLException { long value=rs.getLong(column); return rs.wasNull()?null:value; }
    private static String batchSql() { return """
            SELECT b.id,b.entity_type,b.original_filename,b.uploaded_by_user_id,u.full_name,b.status,b.total_rows,
                b.draft_rows,b.exact_duplicate_rows,b.possible_duplicate_rows,b.conflict_rows,b.invalid_rows,
                b.published_rows,b.failed_rows,b.failure_reason,b.created_at,b.updated_at,b.published_at
            FROM catalog_import_batches b JOIN user_accounts u ON u.id=b.uploaded_by_user_id
            """; }
    private static final org.springframework.jdbc.core.RowMapper<ImportBatch> BATCH_MAPPER=(rs,row)->new ImportBatch(
            rs.getObject(1,UUID.class),EntityType.valueOf(rs.getString(2)),rs.getString(3),rs.getLong(4),rs.getString(5),
            rs.getString(6),rs.getInt(7),rs.getInt(8),rs.getInt(9),rs.getInt(10),rs.getInt(11),rs.getInt(12),
            rs.getInt(13),rs.getInt(14),rs.getString(15),rs.getObject(16,OffsetDateTime.class),
            rs.getObject(17,OffsetDateTime.class),rs.getObject(18,OffsetDateTime.class));
}
