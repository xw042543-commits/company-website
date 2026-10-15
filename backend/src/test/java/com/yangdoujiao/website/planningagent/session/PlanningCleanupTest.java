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
    @Test void removesOnlySessionsOlderThanThirtyDays() {
        long owner=jdbc.queryForObject("INSERT INTO user_accounts(full_name,status,agreement_version,privacy_version) VALUES('Cleanup','ACTIVE','v1','v1') RETURNING id",Long.class);
        Instant now=Instant.parse("2041-01-01T00:00:00Z");
        UUID expired=UUID.randomUUID(),recent=UUID.randomUUID();
        jdbc.update("INSERT INTO planning_sessions(id,owner_id,age_band,privacy_version,created_at) VALUES(?,?,'AGE_18_PLUS','v1',?)",expired,owner,java.sql.Timestamp.from(now.minus(Duration.ofDays(31))));
        jdbc.update("INSERT INTO planning_sessions(id,owner_id,age_band,privacy_version,created_at) VALUES(?,?,'AGE_18_PLUS','v1',?)",recent,owner,java.sql.Timestamp.from(now.minus(Duration.ofDays(29))));
        new PlanningCleanup(jdbc,Clock.fixed(now,ZoneOffset.UTC)).clean();
        assertThat(jdbc.queryForList("SELECT id FROM planning_sessions WHERE owner_id=?",UUID.class,owner)).containsExactly(recent);
    }
}
