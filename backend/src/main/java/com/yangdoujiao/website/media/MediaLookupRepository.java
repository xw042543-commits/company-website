package com.yangdoujiao.website.media;

import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class MediaLookupRepository {

    private final NamedParameterJdbcTemplate jdbc;

    public MediaLookupRepository(NamedParameterJdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public Map<Long, String> findUniversityImageUrls(Collection<Long> universityIds) {
        if (universityIds.isEmpty()) return Collections.emptyMap();
        return query("""
                SELECT DISTINCT ON (university_id) university_id AS owner_id, asset_url
                FROM university_media
                WHERE status = 'PUBLISHED' AND university_id IN (:ids)
                ORDER BY university_id,
                    CASE kind WHEN 'UNIVERSITY_IMAGE' THEN 0 WHEN 'LOGO' THEN 1 ELSE 2 END,
                    sort_order, id
                """, universityIds);
    }

    public Map<Long, String> findProgrammeImageUrls(Collection<Long> programmeIds) {
        if (programmeIds.isEmpty()) return Collections.emptyMap();
        return query("""
                SELECT DISTINCT ON (programme_id) programme_id AS owner_id, asset_url
                FROM programme_media
                WHERE status = 'PUBLISHED' AND programme_id IN (:ids)
                ORDER BY programme_id, sort_order, id
                """, programmeIds);
    }

    private Map<Long, String> query(String sql, Collection<Long> ids) {
        Map<Long, String> result = new HashMap<>();
        jdbc.query(sql, Map.of("ids", ids), row -> {
            result.put(row.getLong("owner_id"), row.getString("asset_url"));
        });
        return result;
    }
}
