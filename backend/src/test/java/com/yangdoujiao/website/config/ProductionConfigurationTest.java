package com.yangdoujiao.website.config;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import org.junit.jupiter.api.Test;

class ProductionConfigurationTest {

    @Test
    void productionProfileRequiresExternalServicesAndRestrictsManagementEndpoints() throws IOException {
        String configuration = Files.readString(Path.of("src/main/resources/application-prod.yml"));

        assertThat(configuration)
                .contains("${POSTGRES_HOST}")
                .contains("${POSTGRES_PORT}")
                .contains("${POSTGRES_DB}")
                .contains("${POSTGRES_USER}")
                .contains("${POSTGRES_PASSWORD}")
                .contains("${REDIS_HOST}")
                .contains("${REDIS_PORT}")
                .contains("${REDIS_PASSWORD}")
                .contains("${ELASTICSEARCH_URL}")
                .contains("${CORS_ALLOWED_ORIGINS}")
                .doesNotContain("localhost")
                .contains("forward-headers-strategy: none")
                .contains("secure: ${APP_SESSION_COOKIE_SECURE:false}")
                .contains("include: health")
                .contains("probes:")
                .contains("enabled: true")
                .contains("include-message: never")
                .contains("include-stacktrace: never")
                .contains("submission-enabled: ${APP_CONSULTATION_SUBMISSION_ENABLED:false}");
    }

    @Test
    void backendIncludesActuatorForContainerHealthChecks() throws IOException {
        String pom = Files.readString(Path.of("pom.xml"));
        assertThat(pom).contains("spring-boot-starter-actuator");
    }
}
