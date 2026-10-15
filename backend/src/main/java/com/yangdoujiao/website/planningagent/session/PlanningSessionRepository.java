package com.yangdoujiao.website.planningagent.session;

import static com.yangdoujiao.website.planningagent.session.PlanningDtos.*;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.Clock;
import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.support.TransactionTemplate;
import com.yangdoujiao.website.planningagent.eligibility.EligibilityTypes.Profile;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.core.type.TypeReference;

@Repository
public class PlanningSessionRepository {
    private final JdbcTemplate jdbc;
    private final TransactionTemplate transactions;
    private final ObjectMapper json;
    private final Clock clock;
    public PlanningSessionRepository(JdbcTemplate jdbc,TransactionTemplate transactions,ObjectMapper json,Clock clock) {
        this.jdbc=jdbc; this.transactions=transactions; this.json=json; this.clock=clock;
    }
    public <T> T transaction(java.util.function.Supplier<T> action) { return transactions.execute(status -> action.get()); }
    /** Same account-before-session order as account deletion, preventing post-purge resurrection. */
    public void lockActiveOwner(long owner) {
        if(jdbc.queryForList("SELECT id FROM user_accounts WHERE id=? AND status='ACTIVE' AND deleted_at IS NULL FOR UPDATE",Long.class,owner).isEmpty())
            throw new com.yangdoujiao.website.common.exception.ApiException(org.springframework.http.HttpStatus.UNAUTHORIZED,
                    "AUTH_REQUIRED","Authentication required");
    }
    public void create(long owner,UUID id,CreateSession request,Instant now) {
        jdbc.update("INSERT INTO planning_sessions(id,owner_id,age_band,privacy_version,created_at,last_activity_at) VALUES(?,?,?,?,?,?)",id,owner,request.ageBand(),request.privacyVersion(),ts(now),ts(now));
    }
    public void touch(long owner,UUID session,Instant now) {
        jdbc.update("UPDATE planning_sessions SET last_activity_at=GREATEST(last_activity_at,?) WHERE owner_id=? AND id=?",ts(now),owner,session);
    }
    public Optional<Long> version(long owner,UUID session,boolean lock) {
        return jdbc.query("SELECT profile_version FROM planning_sessions WHERE owner_id=? AND id=?"+(lock ? " FOR UPDATE" : ""),(r,i) -> r.getLong(1),owner,session).stream().findFirst();
    }
    public boolean currentConsent(long owner,UUID session,String privacyVersion) {
        return Boolean.TRUE.equals(jdbc.queryForObject("SELECT EXISTS(SELECT 1 FROM planning_sessions WHERE owner_id=? AND id=? AND privacy_version=?)",Boolean.class,owner,session,privacyVersion));
    }
    public Optional<RunView> run(long owner,UUID session,UUID run) {
        return jdbc.query("SELECT r.id,r.status,r.result,r.error_code,r.deadline FROM planning_runs r JOIN planning_sessions s ON s.id=r.session_id WHERE s.owner_id=? AND s.id=? AND r.id=?",
                (r,i) -> new RunView(r.getObject(1,UUID.class),r.getString(2),r.getString(3),r.getString(4),r.getTimestamp(5).toInstant()),owner,session,run).stream().findFirst();
    }
    public boolean matchingGeneration(long owner,UUID session,UUID run,long version) {
        return Boolean.TRUE.equals(jdbc.queryForObject("""
                SELECT EXISTS(SELECT 1 FROM planning_runs r JOIN planning_sessions s ON s.id=r.session_id
                WHERE s.owner_id=? AND s.id=? AND r.id=? AND r.intent='GENERATE'
                AND r.profile_version=? AND r.status='SUCCEEDED')
                """,Boolean.class,owner,session,run,version));
    }
    public record Existing(UUID id,String hash,String status,Instant deadline) {}
    public Optional<Existing> existing(long owner,UUID session,String key) {
        return jdbc.query("SELECT r.id,r.request_hash,r.status,r.deadline FROM planning_runs r JOIN planning_sessions s ON s.id=r.session_id WHERE s.owner_id=? AND s.id=? AND r.request_key=?",
                (r,i) -> new Existing(r.getObject(1,UUID.class),r.getString(2),r.getString(3),r.getTimestamp(4).toInstant()),owner,session,key).stream().findFirst();
    }
    public boolean active(long owner,UUID session) {
        return jdbc.queryForObject("SELECT count(*) FROM planning_runs r JOIN planning_sessions s ON s.id=r.session_id WHERE s.owner_id=? AND s.id=? AND r.status IN ('QUEUED','RUNNING')",Integer.class,owner,session)>0;
    }
    public void enqueue(long owner,UUID session,UUID run,MessageRequest request,String hash,long version,Instant now) {
        jdbc.update("""
                INSERT INTO planning_runs(id,session_id,request_key,request_hash,intent,profile_version,status,created_at,deadline)
                SELECT ?,s.id,?,?,?,?, 'QUEUED',?,? FROM planning_sessions s WHERE s.id=? AND s.owner_id=?
                """,run,request.requestKey(),hash,request.intent().name(),version==0 ? null : version,ts(now),ts(now.plusSeconds(60)),session,owner);
        jdbc.update("INSERT INTO planning_messages(session_id,run_id,role,text,created_at) VALUES(?,?,'USER',?,?)",session,run,request.text(),ts(now));
        touch(owner,session,now);
    }
    public void confirm(long owner,UUID session,long version,Map<String,String> facts,Instant now) {
        jdbc.update("INSERT INTO planning_profiles(session_id,version,facts,confirmed_at) SELECT id,?,?::jsonb,? FROM planning_sessions WHERE id=? AND owner_id=?",version,json.writeValueAsString(facts),ts(now),session,owner);
        jdbc.update("UPDATE planning_sessions SET profile_version=? WHERE id=? AND owner_id=?",version,session,owner);
        touch(owner,session,now);
    }
    public Profile profile(long owner,UUID session,long version) {
        if(version==0) return new Profile(0,Map.of());
        return jdbc.queryForObject("SELECT p.facts::text FROM planning_profiles p JOIN planning_sessions s ON s.id=p.session_id WHERE s.owner_id=? AND s.id=? AND p.version=?",
                (r,i) -> new Profile(version,Map.copyOf(json.readValue(r.getString(1),new TypeReference<Map<String,String>>() {}))),owner,session,version);
    }
    public List<Message> messages(long owner,UUID session) {
        return jdbc.query("SELECT m.id,m.role,m.text,m.created_at FROM planning_messages m JOIN planning_sessions s ON s.id=m.session_id WHERE s.owner_id=? AND s.id=? ORDER BY m.id",
                (r,i) -> new Message(r.getLong(1),r.getString(2),r.getString(3),r.getTimestamp(4).toInstant()),owner,session);
    }
    public List<RunView> runs(long owner,UUID session) {
        return jdbc.query("SELECT r.id,r.status,r.result,r.error_code,r.deadline FROM planning_runs r JOIN planning_sessions s ON s.id=r.session_id WHERE s.owner_id=? AND s.id=? ORDER BY r.created_at,r.id",
                (r,i) -> new RunView(r.getObject(1,UUID.class),r.getString(2),r.getString(3),r.getString(4),r.getTimestamp(5).toInstant()),owner,session);
    }
    public int delete(long owner,UUID session) { return jdbc.update("DELETE FROM planning_sessions WHERE owner_id=? AND id=?",owner,session); }

    public record Lease(RunInput input,UUID token) {}
    public Optional<Lease> claim(Instant now) {
        return transaction(() -> {
            // Recovery uses the persisted absolute deadline, including time spent waiting in the queue.
            jdbc.update("UPDATE planning_runs SET status='TIMED_OUT',error_code='DEADLINE_EXCEEDED',lease_token=NULL,lease_until=NULL WHERE status IN ('QUEUED','RUNNING') AND deadline<=?",ts(now));
            var rows=jdbc.query("""
                    SELECT r.id,r.session_id,s.owner_id,r.intent,r.profile_version,r.deadline,m.text
                    FROM planning_runs r JOIN planning_sessions s ON s.id=r.session_id
                    JOIN planning_messages m ON m.run_id=r.id AND m.session_id=s.id AND m.role='USER'
                    WHERE r.status='QUEUED' AND r.deadline>? ORDER BY r.created_at,r.id
                    LIMIT 1 FOR UPDATE OF r SKIP LOCKED
                    """,(r,i) -> new RunInput(r.getObject(1,UUID.class),r.getObject(2,UUID.class),r.getLong(3),Intent.valueOf(r.getString(4)),r.getString(7),
                            profile(r.getLong(3),r.getObject(2,UUID.class),r.getLong(5)),messages(r.getLong(3),r.getObject(2,UUID.class)),r.getTimestamp(6).toInstant()),ts(now));
            if(rows.isEmpty()) return Optional.empty();
            var input=rows.getFirst(); UUID token=UUID.randomUUID();
            jdbc.update("UPDATE planning_runs SET status='RUNNING',lease_token=?,lease_until=deadline WHERE id=? AND status='QUEUED'",token,input.runId());
            return Optional.of(new Lease(input,token));
        });
    }
    public boolean valid(Lease lease,Instant now) {
        var in=lease.input();
        return jdbc.queryForObject("""
                SELECT count(*) FROM planning_runs r JOIN planning_sessions s ON s.id=r.session_id
                WHERE s.owner_id=? AND s.id=? AND r.id=? AND r.status='RUNNING' AND r.lease_token=? AND r.deadline>? AND r.lease_until>?
                """,Integer.class,in.ownerId(),in.sessionId(),in.runId(),lease.token(),ts(now),ts(now))==1;
    }
    public boolean finish(Lease lease,Instant now,String status,String result,String error) {
        return transaction(() -> {
            var in=lease.input();
            // Also serialize completion against DELETE so assistant messages can never outlive their session.
            if(version(in.ownerId(),in.sessionId(),true).isEmpty()) return false;
            // Taking the session lock can consume the remaining budget. Recheck after acquiring it.
            Instant actualNow=clock.instant();
            Instant completedAt=actualNow.isAfter(now) ? actualNow : now;
            boolean expired=!completedAt.isBefore(in.deadline());
            int changed=jdbc.update("""
                    UPDATE planning_runs SET status=?,result=?,error_code=?,lease_token=NULL,lease_until=NULL
                    WHERE id=? AND session_id=? AND status='RUNNING' AND lease_token=?
                    """,expired ? "TIMED_OUT" : status,expired ? null : result,expired ? "DEADLINE_EXCEEDED" : error,in.runId(),in.sessionId(),lease.token());
            if(changed==1 && !expired && "SUCCEEDED".equals(status)) {
                jdbc.update("INSERT INTO planning_messages(session_id,run_id,role,text,created_at) VALUES(?,?,'ASSISTANT',?,?)",in.sessionId(),in.runId(),result,ts(completedAt));
            }
            if(changed==1) touch(in.ownerId(),in.sessionId(),completedAt);
            return changed==1;
        });
    }
    private static Timestamp ts(Instant value) { return Timestamp.from(value); }
}
