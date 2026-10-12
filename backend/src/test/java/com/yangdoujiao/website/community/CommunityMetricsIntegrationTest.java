package com.yangdoujiao.website.community;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.doThrow;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.OffsetDateTime;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.RedisScript;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import com.yangdoujiao.website.TestContainersConfiguration;
import com.yangdoujiao.website.auth.account.*;
import com.yangdoujiao.website.auth.session.UserPrincipal;
import io.micrometer.core.instrument.MeterRegistry;

@SpringBootTest(properties = {"app.community.enabled=true",
        "app.community.cursor-secret=test-community-metrics-secret-32-bytes",
        "app.community.review-terms=synthetic-review"})
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(TestContainersConfiguration.class)
@Transactional
class CommunityMetricsIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired MeterRegistry registry;
    @Autowired UserAccountRepository accounts;
    @Autowired CommunityPostRepository posts;
    @Autowired CommunityReportRepository reports;
    @MockitoSpyBean StringRedisTemplate redis;

    // Removing HTTP completion instrumentation or tagging content/IDs must break this test.
    @Test void realRequestsRecordLatencyStableResultsAndIdempotencyWithoutPrivateTags() throws Exception {
        var actor = accounts.saveAndFlush(UserAccount.external("Synthetic metrics actor", "load-terms", "load-privacy"));
        String key = UUID.randomUUID().toString();
        long before = timerCount("community.publish", "publish", "none", "success");
        double hits = counter("community.idempotency.hits", "command", "post");
        String response = mvc.perform(post("/api/v1/community/posts").with(user(UserPrincipal.from(actor))).with(csrf())
                .header("Idempotency-Key", key).contentType("application/json").content("{\"body\":\"synthetic metric payload\"}"))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        String id = com.jayway.jsonpath.JsonPath.read(response, "$.id");
        mvc.perform(post("/api/v1/community/posts").with(user(UserPrincipal.from(actor))).with(csrf())
                .header("Idempotency-Key", key).contentType("application/json").content("{\"body\":\"synthetic metric payload\"}"))
                .andExpect(status().isOk());
        mvc.perform(get("/api/v1/community/posts").param("sort", "latest")).andExpect(status().isOk());
        mvc.perform(get("/api/v1/community/posts/" + id)).andExpect(status().isOk());
        String commentKey = UUID.randomUUID().toString();
        double commentHits = counter("community.idempotency.hits", "command", "comment");
        for (int attempt = 0; attempt < 2; attempt++) {
            mvc.perform(post("/api/v1/community/posts/" + id + "/comments").with(user(UserPrincipal.from(actor))).with(csrf())
                    .header("Idempotency-Key", commentKey).contentType("application/json")
                    .content("{\"body\":\"synthetic comment\"}")).andExpect(status().is(attempt == 0 ? 201 : 200));
        }
        String reportKey = UUID.randomUUID().toString();
        double reportHits = counter("community.idempotency.hits", "command", "report");
        for (int attempt = 0; attempt < 2; attempt++) {
            mvc.perform(post("/api/v1/community/reports").with(user(UserPrincipal.from(actor))).with(csrf())
                    .header("Idempotency-Key", reportKey).contentType("application/json")
                    .content("{\"targetType\":\"POST\",\"targetId\":\"" + id + "\",\"reasonCode\":\"SPAM\"}"))
                    .andExpect(status().is(attempt == 0 ? 201 : 200));
        }
        mvc.perform(get("/api/v1/community/posts/9223372036854775807")).andExpect(status().isNotFound());
        assertThat(timerCount("community.publish", "publish", "none", "success")).isEqualTo(before + 2);
        assertThat(timerCount("community.feed", "feed", "latest", "success")).isPositive();
        assertThat(timerCount("community.detail", "detail", "none", "success")).isPositive();
        assertThat(timerCount("community.detail", "detail", "none", "not_found")).isPositive();
        assertThat(timerCount("community.comment", "comment", "none", "success")).isPositive();
        assertThat(counter("community.results", "endpoint", "publish", "sort", "none", "outcome", "success"))
                .isEqualTo(before + 2);
        assertThat(counter("community.idempotency.hits", "command", "post")).isEqualTo(hits + 1);
        assertThat(counter("community.idempotency.hits", "command", "comment")).isEqualTo(commentHits + 1);
        assertThat(counter("community.idempotency.hits", "command", "report")).isEqualTo(reportHits + 1);
        assertThat(registry.getMeters().stream().filter(m -> m.getId().getName().startsWith("community.")))
                .allSatisfy(m -> assertThat(m.getId().getTags()).allSatisfy(t -> {
                    assertThat(t.getKey()).isIn("endpoint", "sort", "command", "outcome");
                    assertThat(t.getValue()).isIn("feed", "latest", "hot", "invalid", "none", "publish", "detail",
                            "comment", "comments", "replies", "post", "report", "success", "not_found",
                            "rate_limited", "unavailable", "validation", "unauthorized", "forbidden", "conflict", "error");
                }));
    }

    // Removing the limiter failure hooks must lose these signals, even outside HTTP.
    @Test void rateLimitAndRedisOutageSignalsComeFromRealLimiterFailures() {
        var actor = accounts.saveAndFlush(UserAccount.external("Synthetic limiter actor", "load-terms", "load-privacy"));
        double limits = counter("community.rate.limited", "command", "post");
        limiter.checkPost(actor.getId(), "192.0.2.20");
        limiter.checkPost(actor.getId(), "192.0.2.20");
        org.assertj.core.api.Assertions.assertThatThrownBy(() -> limiter.checkPost(actor.getId(), "192.0.2.20"))
                .isInstanceOfSatisfying(com.yangdoujiao.website.common.exception.ApiException.class,
                        failure -> assertThat(failure.getCode()).isEqualTo("COMMUNITY_RATE_LIMITED"));
        assertThat(counter("community.rate.limited", "command", "post")).isEqualTo(limits + 1);
        // Spring's real limiter is used below; the Redis boundary alone is made unavailable.
        double before = counter("community.redis.unavailable", "command", "post");
        doThrow(new org.springframework.data.redis.RedisConnectionFailureException("synthetic outage"))
                .when(redis).execute(any(RedisScript.class), anyList(), any(Object[].class));
        org.assertj.core.api.Assertions.assertThatThrownBy(() -> limiter.checkPost(900000L, "192.0.2.10"))
                .isInstanceOf(com.yangdoujiao.website.common.exception.ApiException.class);
        assertThat(counter("community.redis.unavailable", "command", "post")).isEqualTo(before + 1);
    }
    @Autowired CommunityRateLimiter limiter;

    @Test void hotReadOutageRecordsRedisSignalAndUnavailableFeedResult() throws Exception {
        double before = counter("community.redis.unavailable", "command", "hot");
        doThrow(new org.springframework.data.redis.RedisConnectionFailureException("synthetic hot outage"))
                .when(redis).opsForValue();
        mvc.perform(get("/api/v1/community/posts").param("sort", "hot")).andExpect(status().isServiceUnavailable());
        assertThat(counter("community.redis.unavailable", "command", "hot")).isEqualTo(before + 1);
        assertThat(timerCount("community.feed", "feed", "hot", "unavailable")).isPositive();
    }

    @Test void backlogCountsPendingTargetsOnceEvenWithMultipleOpenReports() {
        var actor = accounts.saveAndFlush(UserAccount.external("Synthetic queue actor", "load-terms", "load-privacy"));
        var post = posts.saveAndFlush(CommunityPost.create(actor.getId(), "synthetic-review",
                CommunityContentStatus.PENDING_REVIEW, "RISK_REVIEW", OffsetDateTime.now().minusHours(1)));
        var other = accounts.saveAndFlush(UserAccount.external("Synthetic reporter", "load-terms", "load-privacy"));
        reports.saveAndFlush(CommunityReport.create(actor.getId(), CommunityTargetType.POST, post.getId(), "SPAM", "", OffsetDateTime.now()));
        reports.saveAndFlush(CommunityReport.create(other.getId(), CommunityTargetType.POST, post.getId(), "SPAM", "", OffsetDateTime.now()));
        var backlog = registry.find("community.moderation.backlog").gauge();
        assertThat(backlog).isNotNull();
        assertThat(backlog.value()).isEqualTo(1);
        assertThat(registry.get("community.moderation.oldest.age").gauge().value()).isGreaterThanOrEqualTo(3599);
    }
    @Test void newlyReportedOldPostUsesReportWaitTimeRatherThanPublicationAge() {
        var actor = accounts.saveAndFlush(UserAccount.external("Synthetic age actor", "load-terms", "load-privacy"));
        var post = posts.saveAndFlush(CommunityPost.create(actor.getId(), "Synthetic old post",
                CommunityContentStatus.PUBLISHED, null, OffsetDateTime.now().minusYears(1)));
        reports.saveAndFlush(CommunityReport.create(actor.getId(), CommunityTargetType.POST, post.getId(), "SPAM", "", OffsetDateTime.now()));
        assertThat(registry.get("community.moderation.backlog").gauge().value()).isEqualTo(1);
        assertThat(registry.get("community.moderation.oldest.age").gauge().value()).isBetween(0.0, 2.0);
    }
    private long timerCount(String name, String endpoint, String sort, String outcome) {
        var timer = registry.find(name).tags("endpoint", endpoint, "sort", sort, "outcome", outcome).timer();
        return timer == null ? 0 : timer.count();
    }
    private double counter(String name, String... tags) {
        var counter = registry.find(name).tags(tags).counter();
        return counter == null ? 0 : counter.count();
    }
}
