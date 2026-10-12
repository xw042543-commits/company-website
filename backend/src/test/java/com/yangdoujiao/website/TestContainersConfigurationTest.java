package com.yangdoujiao.website;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Arrays;

import org.junit.jupiter.api.Test;
import org.springframework.context.annotation.Bean;
import org.springframework.test.context.DynamicPropertyRegistrar;
import org.testcontainers.lifecycle.Startable;

class TestContainersConfigurationTest {

    @Test
    void keepsSharedContainersOutsideSpringContextLifecycle() {
        var beanReturnTypes = Arrays.stream(TestContainersConfiguration.class.getDeclaredMethods())
                .filter(method -> method.isAnnotationPresent(Bean.class))
                .<Class<?>>map(method -> method.getReturnType())
                .toList();

        assertThat(beanReturnTypes)
                .contains(DynamicPropertyRegistrar.class)
                .noneMatch(Startable.class::isAssignableFrom);
    }
}
