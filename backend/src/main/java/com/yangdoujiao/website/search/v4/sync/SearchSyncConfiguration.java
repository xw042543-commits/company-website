package com.yangdoujiao.website.search.v4.sync;

import java.time.Clock;
import java.time.Duration;

import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

@Configuration(proxyBeanMethods = false)
@EnableConfigurationProperties(SearchSyncConfiguration.SearchSyncProperties.class)
public class SearchSyncConfiguration {

    @Bean
    @ConditionalOnMissingBean
    Clock clock() {
        return Clock.systemUTC();
    }

    @Configuration(proxyBeanMethods = false)
    @EnableScheduling
    @ConditionalOnProperty(prefix = "app.search.sync", name = "scheduling-enabled",
            havingValue = "true", matchIfMissing = true)
    static class SchedulingConfiguration {
    }

    @ConfigurationProperties(prefix = "app.search.sync")
    public static class SearchSyncProperties {

        private int batchSize = 50;
        private long pollIntervalMs = 5000;
        private int maxAttempts = 3;
        private Duration retryDelay = Duration.ofSeconds(30);
        private Duration lockTimeout = Duration.ofMinutes(5);

        public int getBatchSize() {
            return batchSize;
        }

        public void setBatchSize(int batchSize) {
            if (batchSize < 1) {
                throw new IllegalArgumentException("Search sync batch size must be positive");
            }
            this.batchSize = batchSize;
        }

        public long getPollIntervalMs() {
            return pollIntervalMs;
        }

        public void setPollIntervalMs(long pollIntervalMs) {
            if (pollIntervalMs < 1) {
                throw new IllegalArgumentException("Search sync poll interval must be positive");
            }
            this.pollIntervalMs = pollIntervalMs;
        }

        public int getMaxAttempts() {
            return maxAttempts;
        }

        public void setMaxAttempts(int maxAttempts) {
            if (maxAttempts < 1) {
                throw new IllegalArgumentException("Search sync max attempts must be positive");
            }
            this.maxAttempts = maxAttempts;
        }

        public Duration getRetryDelay() {
            return retryDelay;
        }

        public void setRetryDelay(Duration retryDelay) {
            if (retryDelay == null || retryDelay.isNegative() || retryDelay.isZero()) {
                throw new IllegalArgumentException("Search sync retry delay must be positive");
            }
            this.retryDelay = retryDelay;
        }

        public Duration getLockTimeout() {
            return lockTimeout;
        }

        public void setLockTimeout(Duration lockTimeout) {
            if (lockTimeout == null || lockTimeout.isNegative() || lockTimeout.isZero()) {
                throw new IllegalArgumentException("Search sync lock timeout must be positive");
            }
            this.lockTimeout = lockTimeout;
        }
    }
}
