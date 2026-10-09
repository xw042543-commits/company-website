package com.yangdoujiao.website.application;

import static com.yangdoujiao.website.application.ApplicationModels.*;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.OffsetDateTime;
import java.util.*;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class ApplicationRepository {
    private final NamedParameterJdbcTemplate jdbc;
    public ApplicationRepository(NamedParameterJdbcTemplate jdbc) { this.jdbc=jdbc; }
    private static final String SUMMARY = """
        SELECT a.*,u.slug university_slug,COALESCE(u.name_zh,u.name_en) university_name,
        COALESCE(p.name_zh,p.name_en) programme_name,COALESCE(l.name_zh,l.name_en,'') level,
        COALESCE(c.name_en,c.name_zh,'') subject
        FROM student_applications a JOIN programmes p ON p.id=a.programme_id
        JOIN universities u ON u.id=p.university_id LEFT JOIN study_levels l ON l.id=p.study_level_id
        LEFT JOIN subject_categories c ON c.id=p.subject_category_id
        """;
    public List<Summary> list(long actor, boolean adviser, String status, int page) {
        String owner=adviser?"a.adviser_id":"a.user_account_id";
        return jdbc.query(SUMMARY+" WHERE "+owner+"=:actor "+(status==null?"":status.equals("IN_PROGRESS")?"AND a.status IN ('IN_PROGRESS','SUBMITTED') ":"AND a.status=:status ")+
            "ORDER BY a.created_at DESC,a.id DESC LIMIT 21 OFFSET :offset",
            new org.springframework.jdbc.core.namedparam.MapSqlParameterSource().addValue("actor",actor).addValue("status",status).addValue("offset",page*20),this::summary);
    }
    public Optional<Summary> owned(UUID id,long actor,boolean adviser) {
        return jdbc.query(SUMMARY+" WHERE a.id=:id AND "+(adviser?"a.adviser_id":"a.user_account_id")+"=:actor",
            Map.of("id",id,"actor",actor),this::summary).stream().findFirst();
    }
    public void lock(UUID id) { jdbc.queryForObject("SELECT id FROM student_applications WHERE id=:id FOR UPDATE",Map.of("id",id),UUID.class); }
    public int create(UUID id,String reference,long actor,Create request) {
        return jdbc.update("""
          INSERT INTO student_applications(id,reference,user_account_id,adviser_id,programme_id)
          SELECT :id,:reference,:user,:actor,p.id FROM programmes p JOIN universities u ON u.id=p.university_id
          WHERE p.id=:programme AND p.status='PUBLISHED' AND u.status='PUBLISHED'
          AND EXISTS (SELECT 1 FROM user_accounts WHERE id=:user)
          """,Map.of("id",id,"reference",reference,"user",request.userId(),"actor",actor,"programme",request.programmeId()));
    }
    public void progress(UUID id,Progress value) {
        jdbc.update("UPDATE student_applications SET status=:status,stage=:stage,note=:note,updated_at=CURRENT_TIMESTAMP WHERE id=:id",
            Map.of("id",id,"status",value.status().name(),"stage",value.stage(),"note",value.note()));
    }
    public List<Document> documents(UUID id) {
        return jdbc.query("SELECT id,title,stage,status,review_note,filename,updated_at FROM application_documents WHERE application_id=:id ORDER BY stage,title,id",
            Map.of("id",id),(r,n)->new Document(r.getObject("id",UUID.class),r.getString("title"),r.getInt("stage"),DocumentStatus.valueOf(r.getString("status")),r.getString("review_note"),r.getString("filename"),r.getObject("updated_at",OffsetDateTime.class)));
    }
    public void addDocument(UUID id,UUID documentId,DocumentRequest value) {
        jdbc.update("INSERT INTO application_documents(id,application_id,title,stage) VALUES(:document,:id,:title,:stage)",
            Map.of("document",documentId,"id",id,"title",value.title(),"stage",value.stage()));
    }
    public int upload(UUID id,UUID documentId,String filename,byte[] bytes) {
        return jdbc.update("""
          UPDATE application_documents SET content=:content,filename=:filename,status='SUBMITTED',review_note='',updated_at=CURRENT_TIMESTAMP
          WHERE id=:document AND application_id=:id AND status IN ('MISSING','REJECTED')
          """,Map.of("id",id,"document",documentId,"filename",filename,"content",bytes));
    }
    public Optional<File> file(UUID id,UUID documentId) {
        return jdbc.query("SELECT filename,content FROM application_documents WHERE id=:document AND application_id=:id AND content IS NOT NULL",
            Map.of("id",id,"document",documentId),(r,n)->new File(r.getString("filename"),Base64.getEncoder().encodeToString(r.getBytes("content")))).stream().findFirst();
    }
    public int review(UUID id,UUID documentId,Review value) {
        return jdbc.update("UPDATE application_documents SET status=:status,review_note=:note,updated_at=CURRENT_TIMESTAMP WHERE id=:document AND application_id=:id AND content IS NOT NULL",
            Map.of("id",id,"document",documentId,"status",value.status().name(),"note",value.note()));
    }
    public List<Fee> fees(UUID id) {
        return jdbc.query("SELECT * FROM application_fees WHERE application_id=:id ORDER BY stage,title,id",Map.of("id",id),
            (r,n)->new Fee(r.getObject("id",UUID.class),r.getString("title"),r.getBigDecimal("amount"),r.getString("currency"),FeeStatus.valueOf(r.getString("status")),r.getInt("stage")));
    }
    public int fee(UUID id,UUID feeId,FeeRequest value) {
        return jdbc.update("""
          INSERT INTO application_fees(id,application_id,title,amount,currency,status,stage) VALUES(:fee,:id,:title,:amount,:currency,:status,:stage)
          ON CONFLICT(id) DO UPDATE SET title=EXCLUDED.title,amount=EXCLUDED.amount,currency=EXCLUDED.currency,status=EXCLUDED.status,stage=EXCLUDED.stage
          WHERE application_fees.application_id=EXCLUDED.application_id
          """,Map.of("id",id,"fee",feeId,"title",value.title(),"amount",value.amount(),"currency",value.currency(),"status",value.status().name(),"stage",value.stage()));
    }
    public List<Event> history(UUID id) {
        return jdbc.query("SELECT * FROM application_events WHERE application_id=:id ORDER BY created_at DESC,id DESC",Map.of("id",id),
            (r,n)->new Event(r.getObject("id",UUID.class),r.getInt("stage"),r.getString("message"),r.getObject("created_at",OffsetDateTime.class)));
    }
    public void event(UUID id,int stage,String message) {
        jdbc.update("INSERT INTO application_events(id,application_id,stage,message) VALUES(:event,:id,:stage,:message)",Map.of("event",UUID.randomUUID(),"id",id,"stage",stage,"message",message));
    }
    private Summary summary(ResultSet r,int n) throws SQLException {
        return new Summary(r.getObject("id",UUID.class),r.getString("reference"),r.getString("university_slug"),r.getString("university_name"),
            r.getString("programme_name"),r.getString("level"),r.getString("subject"),Status.valueOf(r.getString("status")),r.getInt("stage"),r.getString("note"),r.getObject("created_at",OffsetDateTime.class));
    }
}
