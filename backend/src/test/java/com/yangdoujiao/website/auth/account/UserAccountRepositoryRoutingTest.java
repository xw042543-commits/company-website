package com.yangdoujiao.website.auth.account;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.CALLS_REAL_METHODS;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.mock;

import java.util.Optional;

import org.junit.jupiter.api.Test;

class UserAccountRepositoryRoutingTest {
    private final UserAccountRepository repository = mock(UserAccountRepository.class, CALLS_REAL_METHODS);

    @Test
    void typedLookupUsesOnlyItsDeclaredColumn() {
        UserAccount emailAccount = new UserAccount("Email", "a@b.co", null, "hash", "terms", "privacy");
        UserAccount phoneAccount = new UserAccount("Phone", null, "+60123456789", "hash", "terms", "privacy");
        doReturn(Optional.of(emailAccount)).when(repository)
                .findByNormalizedEmailAndStatusNot("a@b.co", UserAccountStatus.DELETED);
        doReturn(Optional.of(phoneAccount)).when(repository)
                .findByNormalizedPhoneAndStatusNot("+60123456789", UserAccountStatus.DELETED);

        assertThat(repository.findLoginAccount(new NormalizedIdentifier(AccountIdentifierType.EMAIL, "a@b.co")))
                .containsSame(emailAccount);
        assertThat(repository.findLoginAccount(new NormalizedIdentifier(AccountIdentifierType.PHONE, "+60123456789")))
                .containsSame(phoneAccount);
    }

    @Test
    void malformedTypedLookupNeverQueriesTheDatabase() {
        assertThatThrownBy(() -> repository.findLoginAccount(null)).isInstanceOf(AuthValidationException.class);
        assertThatThrownBy(() -> repository.findLoginAccount(new NormalizedIdentifier(AccountIdentifierType.EMAIL, " ")))
                .isInstanceOf(AuthValidationException.class);
        assertThatThrownBy(() -> repository.findLoginAccount(new NormalizedIdentifier(null, "a@b.co")))
                .isInstanceOf(AuthValidationException.class);
    }
}
