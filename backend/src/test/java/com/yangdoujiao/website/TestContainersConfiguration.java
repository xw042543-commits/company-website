package com.yangdoujiao.website;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.context.annotation.Bean;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.elasticsearch.ElasticsearchContainer;
import org.testcontainers.postgresql.PostgreSQLContainer;

@TestConfiguration(proxyBeanMethods = false)
public class TestContainersConfiguration {

    private static final PostgreSQLContainer POSTGRESQL = new PostgreSQLContainer("postgres:17.11")
            .withDatabaseName("company_website_test");

    private static final GenericContainer<?> REDIS = new GenericContainer<>("redis:8.2.9")
            .withExposedPorts(6379);

    private static final ElasticsearchContainer ELASTICSEARCH = new ElasticsearchContainer(
            "docker.elastic.co/elasticsearch/elasticsearch:9.4.5"
    ).withEnv("xpack.security.enabled", "false");

    @Bean(destroyMethod = "")
    @ServiceConnection
    PostgreSQLContainer postgresqlContainer() {
        return POSTGRESQL;
    }

    @Bean(destroyMethod = "")
    @ServiceConnection(name = "redis")
    GenericContainer<?> redisContainer() {
        return REDIS;
    }

    @Bean(destroyMethod = "")
    @ServiceConnection
    ElasticsearchContainer elasticsearchContainer() {
        return ELASTICSEARCH;
    }
}
