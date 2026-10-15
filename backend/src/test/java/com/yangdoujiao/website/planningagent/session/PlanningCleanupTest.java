package com.yangdoujiao.website.planningagent.session;
import static org.assertj.core.api.Assertions.*;
import java.time.*;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import com.yangdoujiao.website.TestContainersConfiguration;

@SpringBootTest(properties="app.planning-agent.scheduling-enabled=false")
@ActiveProfiles("test") @Import(TestContainersConfiguration.class) @Transactional
class PlanningCleanupTest {
    @Autowired JdbcTemplate jdbc;
    @Autowired javax.sql.DataSource dataSource;
    @Test void removesOnlySessionsInactiveForThirtyDays() {
        long owner=jdbc.queryForObject("INSERT INTO user_accounts(full_name,status,agreement_version,privacy_version) VALUES('Cleanup','ACTIVE','v1','v1') RETURNING id",Long.class);
        Instant now=Instant.parse("2041-01-01T00:00:00Z");
        UUID expired=UUID.randomUUID(),recent=UUID.randomUUID();
        jdbc.update("INSERT INTO planning_sessions(id,owner_id,age_band,privacy_version,created_at) VALUES(?,?,'AGE_18_PLUS','v1',?)",expired,owner,java.sql.Timestamp.from(now.minus(Duration.ofDays(31))));
        jdbc.update("INSERT INTO planning_sessions(id,owner_id,age_band,privacy_version,created_at) VALUES(?,?,'AGE_18_PLUS','v1',?)",recent,owner,java.sql.Timestamp.from(now.minus(Duration.ofDays(29))));
        jdbc.update("UPDATE planning_sessions SET last_activity_at=created_at WHERE id IN (?,?)",expired,recent);
        new PlanningCleanup(jdbc,Clock.fixed(now,ZoneOffset.UTC)).clean();
        assertThat(jdbc.queryForList("SELECT id FROM planning_sessions WHERE owner_id=?",UUID.class,owner)).containsExactly(recent);
    }
    @Test void migrationBackfillsLatestExistingMessageProfileAndCreationActivity() {
        long owner=jdbc.queryForObject("INSERT INTO user_accounts(full_name,status,agreement_version,privacy_version) VALUES('Backfill','ACTIVE','v1','v1') RETURNING id",Long.class);
        Instant now=Instant.parse("2041-01-01T00:00:00Z");
        UUID messaged=UUID.randomUUID(),confirmed=UUID.randomUUID(),untouched=UUID.randomUUID(),run=UUID.randomUUID();
        for(UUID id:java.util.List.of(messaged,confirmed,untouched)) {
            jdbc.update("INSERT INTO planning_sessions(id,owner_id,age_band,privacy_version,created_at) VALUES(?,?,'AGE_18_PLUS','v1',?)",id,owner,java.sql.Timestamp.from(now.minus(Duration.ofDays(40))));
        }
        jdbc.update("INSERT INTO planning_profiles(session_id,version,facts,confirmed_at) VALUES(?,1,'{}',?)",confirmed,java.sql.Timestamp.from(now.minus(Duration.ofDays(1))));
        jdbc.update("INSERT INTO planning_runs(id,session_id,request_key,request_hash,intent,status,created_at,deadline) VALUES(?,?,'backfill',?,'CHAT','SUCCEEDED',?,?)",
                run,messaged,"a".repeat(64),java.sql.Timestamp.from(now.minus(Duration.ofDays(4))),java.sql.Timestamp.from(now.minus(Duration.ofDays(4)).plusSeconds(60)));
        jdbc.update("INSERT INTO planning_messages(session_id,run_id,role,text,created_at) VALUES(?,?,'USER','hello',?)",messaged,run,java.sql.Timestamp.from(now.minus(Duration.ofDays(2))));
        jdbc.execute("ALTER TABLE planning_sessions DROP COLUMN IF EXISTS last_activity_at");
        new org.springframework.jdbc.datasource.init.ResourceDatabasePopulator(
                new org.springframework.core.io.ClassPathResource("db/migration/V38__track_planning_session_activity.sql")).execute(dataSource);
        assertThat(activity(messaged)).isEqualTo(now.minus(Duration.ofDays(2)));
        assertThat(activity(confirmed)).isEqualTo(now.minus(Duration.ofDays(1)));
        assertThat(activity(untouched)).isEqualTo(now.minus(Duration.ofDays(40)));
        new PlanningCleanup(jdbc,Clock.fixed(now,ZoneOffset.UTC)).clean();
        assertThat(jdbc.queryForList("SELECT id FROM planning_sessions WHERE owner_id=?",UUID.class,owner)).containsExactlyInAnyOrder(messaged,confirmed);
    }
    Instant activity(UUID id) {
        return jdbc.queryForObject("SELECT last_activity_at FROM planning_sessions WHERE id=?",java.sql.Timestamp.class,id).toInstant();
    }
}
