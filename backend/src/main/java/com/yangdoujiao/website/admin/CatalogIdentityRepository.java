package com.yangdoujiao.website.admin;

import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class CatalogIdentityRepository {
    private final JdbcTemplate jdbc;
    public CatalogIdentityRepository(JdbcTemplate jdbc) { this.jdbc=jdbc; }

    public String generate(String type) {
        String prefix=switch(type) {case "UNIVERSITY"->"U_";case "PROGRAMME"->"P_";case "COURSE"->"C_";default->throw new IllegalArgumentException();};
        for(int attempt=0;attempt<10;attempt++) {
            String code=prefix+UUID.randomUUID().toString().replace("-","").toUpperCase(Locale.ROOT);
            if(jdbc.update("INSERT INTO catalog_code_reservations(entity_type,code) VALUES (?,?) ON CONFLICT DO NOTHING",type,code)==1)return code;
        }
        throw new IllegalStateException("暂时无法生成编码，请重试");
    }
    public void reserve(String type,String code) {
        if(Boolean.TRUE.equals(jdbc.queryForObject("SELECT EXISTS(SELECT 1 FROM catalog_code_reservations WHERE entity_type=? AND code=? AND retired_at IS NOT NULL)",Boolean.class,type,code)))throw new com.yangdoujiao.website.common.exception.ApiException(org.springframework.http.HttpStatus.CONFLICT,"DUPLICATE_DATA","此编码属于已永久删除的记录，不能重复使用；请留空自动生成新编码");
        jdbc.update("INSERT INTO catalog_code_reservations(entity_type,code) VALUES (?,?) ON CONFLICT DO NOTHING",type,code);
    }
    public void lockCatalog() { jdbc.execute("LOCK TABLE universities, programmes, catalog_courses IN SHARE ROW EXCLUSIVE MODE"); }
}
