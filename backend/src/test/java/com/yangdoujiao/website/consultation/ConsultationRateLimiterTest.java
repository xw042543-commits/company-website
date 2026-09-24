package com.yangdoujiao.website.consultation;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;

import java.time.Duration;

import org.junit.jupiter.api.Test;
import org.springframework.data.redis.RedisConnectionFailureException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.RedisScript;

import com.yangdoujiao.website.common.exception.ApiException;

class ConsultationRateLimiterTest {

    @Test
    void rejectsNonPositiveRateLimitConfiguration() {
        StringRedisTemplate redis = mock(StringRedisTemplate.class);

        assertThatThrownBy(() -> new ConsultationRateLimiter(redis, 0, Duration.ofMinutes(10)))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("maximum submissions");
        assertThatThrownBy(() -> new ConsultationRateLimiter(redis, 5, Duration.ZERO))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("window");
        assertThatThrownBy(() -> new ConsultationRateLimiter(redis, 5, Duration.ofNanos(1)))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("millisecond");
    }

    @Test
    @SuppressWarnings("unchecked")
    void refusesSubmissionWhenRedisCannotEnforceTheLimit() {
        StringRedisTemplate redis = mock(StringRedisTemplate.class);
        doThrow(new RedisConnectionFailureException("Redis is unavailable"))
                .when(redis)
                .execute(any(RedisScript.class), anyList(), any());
        ConsultationRateLimiter limiter = new ConsultationRateLimiter(
                redis,
                5,
                Duration.ofMinutes(10)
        );

        assertThatThrownBy(() -> limiter.check("203.0.113.10"))
                .isInstanceOfSatisfying(ApiException.class, exception -> {
                    assertThat(exception.getStatus().value()).isEqualTo(503);
                    assertThat(exception.getCode()).isEqualTo("CONSULTATION_SUBMISSION_UNAVAILABLE");
                });
    }
}
