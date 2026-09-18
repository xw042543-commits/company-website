package com.yangdoujiao.website;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class TestContainersConfigurationTest {

    @Test
    void reusesTheSameContainersAcrossSpringTestContexts() {
        var firstContext = new TestContainersConfiguration();
        var secondContext = new TestContainersConfiguration();

        assertThat(secondContext.postgresqlContainer())
                .isSameAs(firstContext.postgresqlContainer());
        assertThat(secondContext.redisContainer())
                .isSameAs(firstContext.redisContainer());
        assertThat(secondContext.elasticsearchContainer())
                .isSameAs(firstContext.elasticsearchContainer());
    }
}
