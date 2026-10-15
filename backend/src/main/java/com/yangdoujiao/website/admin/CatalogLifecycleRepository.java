package com.yangdoujiao.website.admin;

import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;
import tools.jackson.databind.ObjectMapper;

@Repository
public class CatalogLifecycleRepository {
    private final JdbcTemplate jdbc;
    private final ObjectMapper json;
    public CatalogLifecycleRepository(JdbcTemplate jdbc,ObjectMapper json){this.jdbc=jdbc;this.json=json;}
    public static String table(AdminImportDtos.EntityType type){return switch(type){case UNIVERSITY->"universities";case PROGRAMME->"programmes";case COURSE->"catalog_courses";};}
    public boolean administrator(long user){return Boolean.TRUE.equals(jdbc.queryForObject("SELECT EXISTS(SELECT 1 FROM user_accounts WHERE id=? AND role='ADMIN' AND status='ACTIVE' AND deleted_at IS NULL)",Boolean.class,user));}
    public boolean advanced(long user){return administrator(user)&&Boolean.TRUE.equals(jdbc.queryForObject("SELECT EXISTS(SELECT 1 FROM catalog_advanced_administrators WHERE user_account_id=?)",Boolean.class,user));}
    public List<Map<String,Object>> records(AdminImportDtos.EntityType type,List<Long> ids,boolean lock){
        return new NamedParameterJdbcTemplate(jdbc).queryForList("SELECT * FROM "+table(type)+" WHERE id IN (:ids) ORDER BY id"+(lock?" FOR UPDATE":""),Map.of("ids",ids));
    }
    public Map<String,Long> impact(AdminImportDtos.EntityType type,long id){
        Map<String,Long> result=new LinkedHashMap<>();
        if(type==AdminImportDtos.EntityType.UNIVERSITY){
            add(result,"关联专业", "SELECT COUNT(*) FROM programmes WHERE university_id=?",id);
            add(result,"关联课程", "SELECT COUNT(*) FROM catalog_courses c JOIN programmes p ON p.id=c.programme_id WHERE p.university_id=?",id);
            add(result,"用户申请", "SELECT COUNT(*) FROM student_applications a JOIN programmes p ON p.id=a.programme_id WHERE p.university_id=?",id);
            add(result,"支付明细", "SELECT COUNT(*) FROM application_payment_items a JOIN programmes p ON p.id=a.programme_id WHERE p.university_id=?",id);
        }else{
            long programme=type==AdminImportDtos.EntityType.PROGRAMME?id:jdbc.queryForObject("SELECT programme_id FROM catalog_courses WHERE id=?",Long.class,id);
            if(type==AdminImportDtos.EntityType.PROGRAMME)add(result,"关联课程","SELECT COUNT(*) FROM catalog_courses WHERE programme_id=?",id);
            add(result,"用户申请","SELECT COUNT(*) FROM student_applications WHERE programme_id=?",programme);
            add(result,"支付明细","SELECT COUNT(*) FROM application_payment_items WHERE programme_id=?",programme);
        }
        // Only known content-owned children may cascade; future business relations fail closed.
        var links=jdbc.queryForList("""
            SELECT ns.nspname schema_name,cl.relname table_name,att.attname column_name
            FROM pg_constraint c JOIN pg_class cl ON cl.oid=c.conrelid
            JOIN pg_namespace ns ON ns.oid=cl.relnamespace
            JOIN pg_attribute att ON att.attrelid=c.conrelid AND att.attnum=c.conkey[1]
            WHERE c.contype='f' AND c.confrelid=to_regclass(?)
            """,table(type));
        for(var link:links){String t=link.get("table_name").toString();
            if(Set.of("university_media","university_detail_sections","programme_media","programme_detail_sections","programme_languages","programme_intakes").contains(t))continue;
            String label=switch(t){case "programmes"->"关联专业";case "catalog_courses"->"关联课程";case "student_applications"->"用户申请";case "application_payment_items"->"支付明细";case "community_posts"->"社区发布";case "miniapp_programme_favorites"->"用户收藏";default->"其他业务关联";};
            add(result,label,"SELECT COUNT(*) FROM "+quote(link.get("schema_name"))+"."+quote(t)+" WHERE "+quote(link.get("column_name"))+"=?",id);
        }
        // Cascading user favourites must not be silently destroyed either.
        if(type==AdminImportDtos.EntityType.PROGRAMME)add(result,"用户收藏","SELECT COUNT(*) FROM miniapp_programme_favorites WHERE programme_id=?",id);
        if(type==AdminImportDtos.EntityType.UNIVERSITY)add(result,"用户收藏","SELECT COUNT(*) FROM miniapp_programme_favorites f JOIN programmes p ON p.id=f.programme_id WHERE p.university_id=?",id);
        return result;
    }
    public void change(AdminImportDtos.EntityType type,long id,String action){String t=table(type);
        switch(action){
            case "TRASH"->jdbc.update("UPDATE "+t+" SET previous_status=status,deleted_at=CURRENT_TIMESTAMP,status='ARCHIVED',updated_at=CURRENT_TIMESTAMP WHERE id=? AND deleted_at IS NULL",id);
            case "RESTORE"->jdbc.update("UPDATE "+t+" SET status=COALESCE(previous_status,'ARCHIVED'),deleted_at=NULL,previous_status=NULL,updated_at=CURRENT_TIMESTAMP WHERE id=? AND deleted_at IS NOT NULL",id);
            case "PURGE"->{
                String column=switch(type){case UNIVERSITY->"university_code";case PROGRAMME->"programme_code";case COURSE->"course_code";};
                jdbc.update("UPDATE catalog_code_reservations SET retired_at=CURRENT_TIMESTAMP WHERE entity_type=? AND code=(SELECT "+column+" FROM "+t+" WHERE id=?)",type.name(),id);
                jdbc.update("DELETE FROM catalog_entity_aliases WHERE entity_type=? AND entity_id=?",type.name(),id);jdbc.update("DELETE FROM "+t+" WHERE id=?",id);}
            default->throw new IllegalArgumentException();
        }
    }
    public void audit(long actor,AdminImportDtos.EntityType type,long id,String action,Map<String,Object> snapshot){
        // JDBC-specific JSON and timestamps are converted to strings for an immutable audit snapshot.
        Map<String,String> safe=new LinkedHashMap<>();snapshot.forEach((k,v)->safe.put(k,Objects.toString(v,"")));
        jdbc.update("INSERT INTO catalog_operation_audit(actor_id,entity_type,entity_id,operation,snapshot) VALUES (?,?,?,?,?::jsonb)",actor,type.name(),id,action,json.writeValueAsString(safe));
    }
    public List<Map<String,Object>> audit(int page,int size){return jdbc.queryForList("SELECT a.id,a.actor_id,COALESCE(u.full_name,'已注销管理员') actor_name,a.entity_type,a.entity_id,a.operation,a.created_at FROM catalog_operation_audit a LEFT JOIN user_accounts u ON u.id=a.actor_id ORDER BY a.id DESC LIMIT ? OFFSET ?",size,(long)(page-1)*size);}
    private void add(Map<String,Long> result,String key,String sql,long id){result.put(key,jdbc.queryForObject(sql,Long.class,id));}
    private static String quote(Object value){return "\""+value.toString().replace("\"","\"\"")+"\"";}
}
