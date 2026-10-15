package com.yangdoujiao.website.planningagent.plan;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.JsonNode;
import com.yangdoujiao.website.consultation.ConsultationResponse;

@Repository
public class PlanningPlanRepository {
    public record Stored(UUID id,UUID runId,String hash,long version,PlanningPlanService.Snapshot snapshot,JsonNode baseline) {}
    public record Shared(String hash,ConsultationResponse response) {}
    private final JdbcTemplate jdbc;
    private final ObjectMapper json;
    public PlanningPlanRepository(JdbcTemplate jdbc,ObjectMapper json) { this.jdbc=jdbc;this.json=json; }
    public Optional<Stored> find(long owner,UUID id,boolean lock) {
        return jdbc.query("SELECT id,run_id,request_hash,version,snapshot::text,source_baseline::text FROM planning_saved_plans WHERE owner_id=? AND id=?"+(lock?" FOR UPDATE":""),
                (r,i)->new Stored(r.getObject(1,UUID.class),r.getObject(2,UUID.class),r.getString(3),r.getLong(4),
                        json.readValue(r.getString(5),PlanningPlanService.Snapshot.class),json.readTree(r.getString(6))),owner,id).stream().findFirst();
    }
    public Optional<Stored> existing(long owner,UUID session,String key) {
        var ids=jdbc.queryForList("SELECT id FROM planning_saved_plans WHERE owner_id=? AND session_id=? AND request_key=?",UUID.class,owner,session,key);
        return ids.isEmpty()?Optional.empty():find(owner,ids.getFirst(),false);
    }
    public List<PlanningPlanService.Saved> list(long owner) {
        return jdbc.query("SELECT id,version FROM planning_saved_plans WHERE owner_id=? ORDER BY created_at DESC,id",
                (r,i)->new PlanningPlanService.Saved(r.getObject(1,UUID.class),r.getLong(2)),owner);
    }
    public void insert(long owner,UUID id,UUID session,UUID run,String key,String hash,PlanningPlanService.Snapshot snapshot,JsonNode baseline,Instant now) {
        jdbc.update("INSERT INTO planning_saved_plans(id,owner_id,session_id,run_id,request_key,request_hash,snapshot,source_baseline,created_at) VALUES(?,?,?,?,?,?,?::jsonb,?::jsonb,?)",
                id,owner,session,run,key,hash,json.writeValueAsString(snapshot),json.writeValueAsString(baseline),Timestamp.from(now));
        for(var programme:snapshot.plan().programmes()) {
            jdbc.update("INSERT INTO planning_saved_plan_programmes(plan_id,programme_id,snapshot) VALUES(?,?,?::jsonb)",id,programme.programmeId(),json.writeValueAsString(programme));
        }
    }
    public int delete(long owner,UUID id) { return jdbc.update("DELETE FROM planning_saved_plans WHERE owner_id=? AND id=?",owner,id); }
    public Optional<Shared> shared(UUID plan,String key) {
        return jdbc.query("SELECT request_hash,reference_code,submitted_at FROM planning_plan_consultations WHERE plan_id=? AND request_key=?",
                (r,i)->new Shared(r.getString(1),new ConsultationResponse(r.getObject(2,UUID.class),r.getObject(3,java.time.OffsetDateTime.class))),plan,key).stream().findFirst();
    }
    public void share(UUID plan,String key,String hash,ConsultationResponse response) {
        jdbc.update("INSERT INTO planning_plan_consultations(plan_id,request_key,request_hash,reference_code,submitted_at) VALUES(?,?,?,?,?)",
                plan,key,hash,response.referenceCode(),response.submittedAt());
    }
}
