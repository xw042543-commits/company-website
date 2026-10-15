package com.yangdoujiao.website.admin;

import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import tools.jackson.databind.ObjectMapper;
import static com.yangdoujiao.website.admin.AdminCatalogDtos.*;
import static com.yangdoujiao.website.admin.AdminCourseService.*;

@Repository
public class AdminCourseRepository {
    private final JdbcTemplate jdbc; private final ObjectMapper json;
    public AdminCourseRepository(JdbcTemplate jdbc,ObjectMapper json){this.jdbc=jdbc;this.json=json;}
    public PageResponse<CourseItem> list(String q,Long programme,String status,int page,int size){
        String where=" WHERE (?='' OR lower(c.module_data::text||c.course_code) LIKE ?) AND (?::bigint IS NULL OR c.programme_id=?) AND ((?='TRASH' AND c.deleted_at IS NOT NULL) OR (?<>'TRASH' AND c.deleted_at IS NULL AND (?='' OR c.status=?)))";
        Object[] args={q,"%"+q.toLowerCase(Locale.ROOT)+"%",programme,programme,status,status,status,status};
        long total=jdbc.queryForObject("SELECT COUNT(*) FROM catalog_courses c"+where,Long.class,args);
        var all=new ArrayList<Object>(Arrays.asList(args));all.add(size);all.add((long)(page-1)*size);
        return new PageResponse<>(jdbc.query(select()+where+" ORDER BY c.programme_id,c.sort_order,c.id LIMIT ? OFFSET ?",this::map,all.toArray()),page,size,total,(int)Math.ceil(total/(double)size));
    }
    public CourseItem get(long id){return jdbc.query(select()+" WHERE c.id=?",this::map,id).stream().findFirst().orElse(null);}
    public List<CourseItem> forProgramme(long id){return jdbc.query(select()+" WHERE c.programme_id=?",this::map,id);}
    public List<CourseItem> all(){return jdbc.query(select(),this::map);}
    public List<Option> programmes(){return jdbc.query("SELECT p.id,p.programme_code,COALESCE(u.name_zh,u.name_en)||' / '||COALESCE(p.name_zh,p.name_en),p.name_en FROM programmes p JOIN universities u ON u.id=p.university_id WHERE p.deleted_at IS NULL AND u.deleted_at IS NULL ORDER BY p.id",(r,n)->new Option(r.getLong(1),r.getString(2),r.getString(3),r.getString(4)));}
    public long save(Long id,CourseInput in,String code,Map<String,Object> module){
        String key=jdbc.queryForObject("SELECT md5(lower(regexp_replace(?, '\\s+', '', 'g')))",String.class,first(in.officialCode(),in.nameEn(),in.nameZh()));
        if(id==null)return jdbc.queryForObject("INSERT INTO catalog_courses(course_code,programme_id,source_key,module_data,source_type,sort_order) VALUES (?,?,?,?::jsonb,?,?) RETURNING id",Long.class,code,in.programmeId(),key,json.writeValueAsString(module),in.sourceType(),in.sortOrder()==null?0:in.sortOrder());
        jdbc.update("UPDATE catalog_courses SET module_data=?::jsonb,source_key=?,source_type=?,sort_order=?,updated_at=CURRENT_TIMESTAMP WHERE id=?",json.writeValueAsString(module),key,in.sourceType(),in.sortOrder()==null?0:in.sortOrder(),id);return id;
    }
    public void status(long id,boolean enabled){jdbc.update("UPDATE catalog_courses SET status=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND deleted_at IS NULL",enabled?"PUBLISHED":"ARCHIVED",id);}
    public void synchronize(long programme){
        // Skip the inbound collector mirror for this transaction only; never resurrect removed modules.
        jdbc.queryForObject("SELECT set_config('udajo.catalog_course_sync','on',true)",String.class);
        jdbc.update("""
            INSERT INTO programme_detail_sections(programme_id,section_type,title_zh,title_en,sort_order,status,body_zh,source_type,course_modules,curriculum_review_status)
            VALUES (?,'CURRICULUM','专业课程','Curriculum',20,'PUBLISHED','','third_party','[]','PENDING')
            ON CONFLICT (programme_id,section_type) DO NOTHING
            """,programme);
        jdbc.update("""
            UPDATE programme_detail_sections s SET course_modules=COALESCE((
                SELECT jsonb_agg(c.module_data ORDER BY c.sort_order,c.id) FROM catalog_courses c
                WHERE c.programme_id=? AND c.deleted_at IS NULL AND c.status='PUBLISHED' AND c.source_type='official'),'[]'::jsonb),
                curriculum_review_status=CASE WHEN EXISTS(SELECT 1 FROM catalog_courses c WHERE c.programme_id=? AND c.deleted_at IS NULL AND c.status='PUBLISHED' AND c.source_type='official') THEN 'VERIFIED' ELSE 'PENDING' END,
                body_zh=regexp_replace(COALESCE(s.body_zh,''),'(?s)\\n?【后台维护课程】.*$','') || E'\\n【后台维护课程】\\n' || COALESCE((
                    SELECT string_agg(COALESCE(NULLIF(c.module_data->>'nameZh',''),c.module_data->>'nameEn') ||
                        CASE WHEN c.source_type='official' THEN '（学校官网）' ELSE '（参考学习领域，非官方课程表）' END,E'\\n' ORDER BY c.sort_order,c.id)
                    FROM catalog_courses c WHERE c.programme_id=? AND c.deleted_at IS NULL AND c.status='PUBLISHED' AND c.source_type<>'official'),''),
                source_type=CASE WHEN EXISTS(SELECT 1 FROM catalog_courses c WHERE c.programme_id=s.programme_id AND c.deleted_at IS NULL AND c.status='PUBLISHED' AND c.source_type='official') THEN 'official' ELSE 'third_party' END,
                updated_at=CURRENT_TIMESTAMP
            WHERE s.programme_id=? AND s.section_type='CURRICULUM'
            """,programme,programme,programme,programme);
        jdbc.queryForObject("SELECT set_config('udajo.catalog_course_sync','off',true)",String.class);
    }
    private CourseItem map(java.sql.ResultSet r,int n)throws java.sql.SQLException {
        Map<String,Object> m=json.readValue(r.getString("module_data"),new tools.jackson.core.type.TypeReference<>(){});
        return new CourseItem(r.getLong("id"),r.getString("course_code"),r.getLong("programme_id"),r.getString("programme_name"),Objects.toString(m.get("nameZh"),""),Objects.toString(m.get("nameEn"),""),Objects.toString(m.get("courseCode"),""),Objects.toString(m.get("descriptionZh"),""),Objects.toString(m.get("sourceUrl"),""),r.getString("source_type"),r.getInt("sort_order"),r.getString("status"),r.getObject("deleted_at")!=null,m);
    }
    private static String first(String... values){return Arrays.stream(values).filter(v->v!=null&&!v.isBlank()).findFirst().orElse("");}
    private String select(){return "SELECT c.*,COALESCE(u.name_zh,u.name_en)||' / '||COALESCE(p.name_zh,p.name_en) programme_name FROM catalog_courses c JOIN programmes p ON p.id=c.programme_id JOIN universities u ON u.id=p.university_id";}
}
