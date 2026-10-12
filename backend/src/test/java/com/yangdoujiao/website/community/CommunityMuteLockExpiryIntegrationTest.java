package com.yangdoujiao.website.community;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import java.time.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.system.*;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@ExtendWith(OutputCaptureExtension.class)
class CommunityMuteLockExpiryIntegrationTest extends CommunityModerationIntegrationFixture {
    @MockitoBean Clock clock;
    final Instant initial=Instant.parse("2026-10-08T00:00:00Z");
    final AtomicReference<Instant> instant=new AtomicReference<>();
    @BeforeEach void resetTime() {
        instant.set(initial);when(clock.getZone()).thenReturn(ZoneOffset.UTC);when(clock.instant()).thenAnswer(invocation->instant.get());
    }
    @Test void muteWhichExpiresWhileWaitingForTargetLockHasNoDecisionSideEffects(CapturedOutput output) throws Exception {
        lockBoundary(output,true);
    }
    @Test void muteBeyondThirtyDaysAtLockAcquisitionHasNoDecisionSideEffects(CapturedOutput output) throws Exception {
        lockBoundary(output,false);
    }
    private void lockBoundary(CapturedOutput output,boolean expire) throws Exception {
        long id=post(CommunityContentStatus.PUBLISHED);
        report(id,actor,"lock-expiry-report","SPAM","").andExpect(status().isCreated());
        long auditsBefore=output.getAll().lines().filter(line->line.contains("community_decision")).count();
        OffsetDateTime ends=OffsetDateTime.ofInstant(expire?initial.plusSeconds(5):initial.plus(Duration.ofDays(30)),ZoneOffset.UTC);
        try(var pool=Executors.newVirtualThreadPerTaskExecutor();var holder=jdbc.getDataSource().getConnection()) {
            holder.setAutoCommit(false);
            try(var lock=holder.prepareStatement("SELECT id FROM community_posts WHERE id=? FOR UPDATE")) {
                lock.setLong(1,id);lock.executeQuery().close();
            }
            var waiting=pool.submit(()->action("POST",id,"MUTE","HARASSMENT",0,ends.toString()).andReturn().getResponse().getStatus());
            boolean observed=false;long deadline=System.nanoTime()+TimeUnit.SECONDS.toNanos(5);
            while(System.nanoTime()<deadline) {
                try(var statement=holder.createStatement()) {
                    statement.execute("SELECT pg_stat_clear_snapshot()");
                    try(var result=statement.executeQuery("SELECT count(*) FROM pg_stat_activity WHERE pid<>pg_backend_pid() AND wait_event_type='Lock' AND query LIKE '%community_posts%'")) {
                        result.next();observed=result.getLong(1)>0;
                    }
                }
                if(observed)break;Thread.sleep(10);
            }
            assertThat(observed).as("initially valid MUTE reached the PostgreSQL post lock").isTrue();
            instant.set(expire?initial.plusSeconds(10):initial.minusSeconds(1));
            holder.commit();
            assertThat(waiting.get(15,TimeUnit.SECONDS)).isEqualTo(400);
        }
        assertThat(jdbc.queryForObject("SELECT count(*) FROM community_user_restrictions WHERE account_id=?",Long.class,actor.getId())).isZero();
        assertThat(jdbc.queryForObject("SELECT count(*) FROM community_moderation_actions WHERE target_id=?",Long.class,id)).isZero();
        assertThat(jdbc.queryForObject("SELECT status FROM community_reports WHERE target_id=?",String.class,id)).isEqualTo("OPEN");
        assertThat(version("POST",id)).isZero();
        assertThat(output.getAll().lines().filter(line->line.contains("community_decision")).count()).isEqualTo(auditsBefore);
    }
    @Test void acceptedMuteUsesTheLockedValidationInstantAsItsStart() throws Exception {
        long id=post(CommunityContentStatus.PUBLISHED);
        OffsetDateTime now=OffsetDateTime.ofInstant(initial,ZoneOffset.UTC);
        action("POST",id,"MUTE","HARASSMENT",0,now.plusDays(30).toString()).andExpect(status().isOk());
        assertThat(jdbc.queryForObject("SELECT starts_at FROM community_user_restrictions WHERE account_id=?",OffsetDateTime.class,actor.getId())).isEqualTo(now);
        assertThat(jdbc.queryForObject("SELECT ends_at FROM community_user_restrictions WHERE account_id=?",OffsetDateTime.class,actor.getId())).isEqualTo(now.plusDays(30));
    }
}
