package com.yangdoujiao.website.catalog;

import java.util.List;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

/** PostgreSQL visibility fence while asynchronous search projections catch up. */
@Repository
public class CatalogVisibilityRepository {
    private final JdbcTemplate jdbc;
    public CatalogVisibilityRepository(JdbcTemplate jdbc){this.jdbc=jdbc;}
    public List<String> hiddenUniversities(){return jdbc.queryForList("SELECT id::text FROM universities WHERE status<>'PUBLISHED' OR deleted_at IS NOT NULL UNION SELECT entity_id::text FROM catalog_operation_audit WHERE entity_type='UNIVERSITY' AND operation='PURGE'",String.class);}
    public List<String> hiddenProgrammes(){return jdbc.queryForList("SELECT p.id::text FROM programmes p JOIN universities u ON u.id=p.university_id WHERE p.status<>'PUBLISHED' OR p.deleted_at IS NOT NULL OR u.status<>'PUBLISHED' OR u.deleted_at IS NOT NULL UNION SELECT entity_id::text FROM catalog_operation_audit WHERE entity_type='PROGRAMME' AND operation='PURGE'",String.class);}
}
