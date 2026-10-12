package com.yangdoujiao.website;

import java.util.stream.Stream;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.test.context.DynamicPropertyRegistrar;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.elasticsearch.ElasticsearchContainer;
import org.testcontainers.lifecycle.Startables;
import org.testcontainers.postgresql.PostgreSQLContainer;

@TestConfiguration(proxyBeanMethods = false)
public class TestContainersConfiguration {

    @Bean
    DynamicPropertyRegistrar testServiceProperties() {
        return SharedContainers::registerProperties;
    }

    private static final class SharedContainers {

        private static final PostgreSQLContainer POSTGRESQL = new PostgreSQLContainer("postgres:17.11")
                .withDatabaseName("company_website_test");

        private static final GenericContainer<?> REDIS = new GenericContainer<>("redis:8.2.9")
                .withExposedPorts(6379);

        private static final ElasticsearchContainer ELASTICSEARCH = new ElasticsearchContainer(
                "docker.elastic.co/elasticsearch/elasticsearch:9.4.5"
        ).withEnv("xpack.security.enabled", "false");

        static {
            Startables.deepStart(Stream.of(POSTGRESQL, REDIS, ELASTICSEARCH)).join();
        }

        private SharedContainers() {
        }

        private static void registerProperties(org.springframework.test.context.DynamicPropertyRegistry registry) {
            registry.add("spring.datasource.url", POSTGRESQL::getJdbcUrl);
            registry.add("spring.datasource.username", POSTGRESQL::getUsername);
            registry.add("spring.datasource.password", POSTGRESQL::getPassword);
            registry.add("spring.data.redis.host", REDIS::getHost);
            registry.add("spring.data.redis.port", () -> REDIS.getMappedPort(6379));
            registry.add("spring.elasticsearch.uris", ELASTICSEARCH::getHttpHostAddress);
        }
    }
}
