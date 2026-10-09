package com.yangdoujiao.website.community;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import com.yangdoujiao.website.TestContainersConfiguration;
import com.yangdoujiao.website.auth.account.*;
import com.yangdoujiao.website.auth.session.UserPrincipal;

@SpringBootTest(properties = {"app.community.enabled=true", "app.community.post-per-minute=2", "app.community.post-per-day=3",
        "app.community.cursor-secret=test-shared-community-cursor-key-32-bytes"})
@AutoConfigureMockMvc @ActiveProfiles("test") @Import(TestContainersConfiguration.class) @Transactional
class CommunityRateLimiterTest {
    @Autowired MockMvc mvc;
    @Autowired StringRedisTemplate redis;
    @Autowired UserAccountRepository accounts;
    @Autowired CommunityPostRepository posts;
    @Autowired CommunityIdempotencyRecordRepository idempotency;
    @Autowired CommunityRateLimiter limiter;
    UserAccount author;
    @BeforeEach void setup() {
        var keys = redis.keys("community:limit:v1:*"); if (!keys.isEmpty()) redis.delete(keys);
        author = accounts.saveAndFlush(UserAccount.external("Name", "terms", "privacy"));
    }
    @Test void minuteLimitFailsWith429AndRepeatDoesNotConsumeBudget() throws Exception {
        write(author, "one", "192.0.2.11", 201);
        write(author, "one", "192.0.2.11", 200);
        write(author, "two", "192.0.2.11", 201);
        write(author, "three", "192.0.2.11", 429);
        assertThat(posts.count()).isEqualTo(2);
        assertThat(idempotency.count()).isEqualTo(2);
    }
    @Test void addressBudgetIsSharedAcrossAccountsAndIgnoresUntrustedForwardedAddress() throws Exception {
        write(author, "one", "192.0.2.12", 201);
        write(author, "two", "192.0.2.12", 201);
        var other = accounts.saveAndFlush(UserAccount.external("Other", "terms", "privacy"));
        write(other, "three", "192.0.2.12", 429);
    }
    @Test void dayLimitSurvivesMinuteWindowResetAndEveryBucketHasExpiryAndPrivateKeys() throws Exception {
        write(author, "one", "192.0.2.13", 201);
        write(author, "two", "192.0.2.13", 201);
        var keys = redis.keys("community:limit:v1:*");
        assertThat(keys).hasSize(4);
        for (String key : keys) {
            assertThat(key).doesNotContain("192.0.2.13", ":" + author.getId() + ":", "Name");
            assertThat(redis.getExpire(key, TimeUnit.MILLISECONDS)).isPositive();
            if (key.endsWith(":minute")) redis.delete(key);
        }
        write(author, "three", "192.0.2.13", 201);
        redis.delete(redis.keys("community:limit:v1:*:minute"));
        write(author, "four", "192.0.2.13", 429);
        assertThat(posts.count()).isEqualTo(3);
    }
    @Test void concurrentLuaConsumptionNeverOverAdmitsAndEveryCreatedBucketHasExpiry() throws Exception {
        var executor = java.util.concurrent.Executors.newVirtualThreadPerTaskExecutor();
        try {
            var pending = new java.util.ArrayList<java.util.concurrent.Future<Boolean>>();
            for (int attempt = 0; attempt < 40; attempt++) pending.add(executor.submit(() -> {
                try { limiter.checkPost(author.getId(), "192.0.2.14"); return true; }
                catch (com.yangdoujiao.website.common.exception.ApiException failure) {
                    assertThat(failure.getCode()).isEqualTo("COMMUNITY_RATE_LIMITED"); return false;
                }
            }));
            int admitted = 0;
            for (var future : pending) if (future.get(10, TimeUnit.SECONDS)) admitted++;
            assertThat(admitted).isEqualTo(2);
            var keys = redis.keys("community:limit:v1:*");
            assertThat(keys).hasSize(4);
            for (String key : keys) assertThat(redis.getExpire(key, TimeUnit.MILLISECONDS)).isPositive();
        } finally { executor.shutdownNow(); }
    }
    @Test void reportLimiterEnforcesSharedDayBudgetAndAtomicExpiry() {
        for (int attempt = 0; attempt < 30; attempt++) limiter.checkReport(author.getId(), "192.0.2.15");
        org.assertj.core.api.Assertions.assertThatThrownBy(() -> limiter.checkReport(author.getId(), "192.0.2.15"))
                .isInstanceOfSatisfying(com.yangdoujiao.website.common.exception.ApiException.class,
                        failure -> assertThat(failure.getCode()).isEqualTo("COMMUNITY_RATE_LIMITED"));
        var keys = redis.keys("community:limit:v1:report:*");
        assertThat(keys).hasSize(2);
        for (String key : keys) assertThat(redis.getExpire(key, TimeUnit.SECONDS)).isBetween(86390L, 86400L);
    }
    private void write(UserAccount actor, String key, String address, int expected) throws Exception {
        var request = post("/api/v1/community/posts").with(user(UserPrincipal.from(actor))).with(csrf())
                .with(r -> {r.setRemoteAddr(address); return r;}).header("X-Forwarded-For", "198.51.100.55")
                .header("Idempotency-Key", key).contentType("application/json").content("{\"body\":\"body\"}");
        var result = mvc.perform(request).andExpect(status().is(expected));
        if (expected == 429) result.andExpect(jsonPath("$.code").value("COMMUNITY_RATE_LIMITED"));
    }
}
