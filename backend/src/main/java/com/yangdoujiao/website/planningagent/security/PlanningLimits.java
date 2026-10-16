package com.yangdoujiao.website.planningagent.security;

import java.time.*;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionTemplate;
import com.yangdoujiao.website.common.exception.ApiException;
import com.yangdoujiao.website.planningagent.config.PlanningAgentProperties;

@Component
public class PlanningLimits {
    private static final ZoneId ZONE=ZoneId.of("Asia/Shanghai");
    private final JdbcTemplate jdbc;
    private final TransactionTemplate transactions;
    private final Clock clock;
    private final PlanningAgentProperties properties;
    public PlanningLimits(JdbcTemplate jdbc,TransactionTemplate transactions,Clock clock,PlanningAgentProperties properties) {
        this.jdbc=jdbc;this.transactions=transactions;this.clock=clock;this.properties=properties;
    }
    /** Called inside the admission transaction, after idempotency lookup. */
    public void admit(long owner,boolean generation) {
        Instant now=clock.instant();
        increment(owner,"minute:"+now.getEpochSecond()/60,20,"MESSAGE_RATE_LIMIT");
        if(generation) increment(owner,"day:"+now.atZone(ZONE).toLocalDate(),10,"GENERATION_DAILY_LIMIT");
    }
    private void increment(long owner,String bucket,int max,String code) {
        jdbc.update("INSERT INTO planning_usage(owner_id,bucket) VALUES(?,?) ON CONFLICT DO NOTHING",owner,bucket);
        if(jdbc.update("UPDATE planning_usage SET used=used+1 WHERE owner_id=? AND bucket=? AND used<?",owner,bucket,max)!=1) throw limit(code);
    }
    /** One conservative full debit per run, retained even if a consumed call fails or times out. */
    public void beforeCall(long owner,UUID session,UUID run) {
        transactions.executeWithoutResult(status->{
            if(jdbc.queryForList("SELECT id FROM user_accounts WHERE id=? AND status='ACTIVE' AND deleted_at IS NULL FOR UPDATE",Long.class,owner).isEmpty())
                throw new ApiException(HttpStatus.UNAUTHORIZED,"AUTH_REQUIRED","Authentication required");
            var owned=jdbc.queryForList("SELECT id FROM planning_sessions WHERE id=? AND owner_id=? AND privacy_version=? FOR UPDATE",session,owner,properties.privacyVersion());
            if(owned.isEmpty()) throw new ApiException(HttpStatus.FORBIDDEN,"PRIVACY_CONSENT_REQUIRED","Confirm the current privacy notice in a new session");
            boolean active=Boolean.TRUE.equals(jdbc.queryForObject("""
                    SELECT EXISTS(SELECT 1 FROM planning_runs WHERE id=? AND session_id=?
                    AND status='RUNNING' AND deadline>?)
                    """,Boolean.class,run,session,java.sql.Timestamp.from(clock.instant())));
            if(!active) throw new ApiException(HttpStatus.CONFLICT,"RUN_NOT_ACTIVE","The run is no longer active");
            var old=jdbc.queryForList("SELECT run_id FROM planning_reservations WHERE run_id=? AND owner_id=?",run,owner);
            if(old.isEmpty()) {
                LocalDate day=clock.instant().atZone(ZONE).toLocalDate();
                jdbc.update("INSERT INTO planning_daily_budget(day) VALUES(?) ON CONFLICT DO NOTHING",day);
                int reserved=jdbc.update("UPDATE planning_daily_budget SET tokens=tokens+?,cost=cost+? WHERE day=? AND tokens+?<=? AND cost+?<=?",
                        properties.reservationTokens(),properties.worstCaseRunCost(),day,properties.reservationTokens(),properties.dailyTokenCap(),properties.worstCaseRunCost(),properties.dailyCostCap());
                if(reserved!=1) throw limit("GLOBAL_BUDGET_EXHAUSTED");
                jdbc.update("INSERT INTO planning_reservations(run_id,owner_id,day,tokens,cost) VALUES(?,?,?,?,?)",run,owner,day,properties.reservationTokens(),properties.worstCaseRunCost());
            }
            if(jdbc.update("UPDATE planning_reservations SET calls=calls+1 WHERE run_id=? AND owner_id=? AND calls<10",run,owner)!=1) throw limit("MODEL_CALL_LIMIT");
        });
    }
    private static ApiException limit(String code) { return new ApiException(HttpStatus.TOO_MANY_REQUESTS,code,code); }
}
