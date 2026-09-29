package com.yangdoujiao.website.auth.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.postgresql.util.PSQLException;
import org.postgresql.util.ServerErrorMessage;
import org.springframework.dao.DataIntegrityViolationException;

class RegistrationIntegrityClassifierTest {
    @Test
    void acceptsOnlyNamedAccountUniqueConstraints() {
        assertThat(RegistrationService.isAccountUniqueConflict(error("23505", "uk_user_accounts_email"))).isTrue();
        assertThat(RegistrationService.isAccountUniqueConflict(error("23505", "uk_user_accounts_phone"))).isTrue();
        assertThat(RegistrationService.isAccountUniqueConflict(error("23505", "uk_user_verification_tokens_hash"))).isFalse();
        assertThat(RegistrationService.isAccountUniqueConflict(error("23514", "uk_user_accounts_email"))).isFalse();
        assertThat(RegistrationService.isAccountUniqueConflict(new DataIntegrityViolationException("other"))).isFalse();
    }

    private DataIntegrityViolationException error(String state, String constraint) {
        PSQLException postgres = mock(PSQLException.class);
        ServerErrorMessage server = mock(ServerErrorMessage.class);
        when(postgres.getSQLState()).thenReturn(state);
        when(postgres.getServerErrorMessage()).thenReturn(server);
        when(server.getConstraint()).thenReturn(constraint);
        return new DataIntegrityViolationException("safe wrapper", new IllegalStateException(postgres));
    }
}
