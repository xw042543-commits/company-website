package com.yangdoujiao.website.planningagent.session;

import java.sql.Timestamp;
import java.time.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class PlanningCleanup {
    private final JdbcTemplate jdbc;
    private final Clock clock;
    public PlanningCleanup(JdbcTemplate jdbc,Clock clock) { this.jdbc=jdbc;this.clock=clock; }
    @Scheduled(cron="${app.planning-agent.cleanup-cron:0 15 3 * * *}",zone="Asia/Shanghai")
    @Transactional
    public void clean() {
        jdbc.update("DELETE FROM planning_sessions WHERE created_at<?",Timestamp.from(clock.instant().minus(Duration.ofDays(30))));
        // Old rate buckets contain no history and are no longer useful.
        jdbc.update("DELETE FROM planning_usage WHERE bucket LIKE 'minute:%' AND bucket<?","minute:"+(clock.instant().getEpochSecond()/60-1440));
    }
    @Transactional
    public void purgeOwner(long owner) {
        jdbc.update("DELETE FROM planning_sessions WHERE owner_id=?",owner);
        jdbc.update("DELETE FROM planning_saved_plans WHERE owner_id=?",owner);
        jdbc.update("DELETE FROM planning_usage WHERE owner_id=?",owner);
        jdbc.update("DELETE FROM planning_reservations WHERE owner_id=?",owner);
    }
}
