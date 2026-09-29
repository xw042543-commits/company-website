package com.yangdoujiao.website.auth.account;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;

import java.util.Optional;

import org.junit.jupiter.api.Test;

class UserAccountLookupTest {
    private final UserAccountRepository repository = mock(UserAccountRepository.class);
    private final UserAccountLookup lookup = new UserAccountLookup(repository, new AccountIdentifierNormalizer());

    @Test
    void typedLookupUsesOnlyItsDeclaredColumn() {
        UserAccount emailAccount = new UserAccount("Email", "a@b.co", null, "hash", "terms", "privacy");
        UserAccount phoneAccount = new UserAccount("Phone", null, "+60123456789", "hash", "terms", "privacy");
        doReturn(Optional.of(emailAccount)).when(repository)
                .findByNormalizedEmailAndStatusNot("a@b.co", UserAccountStatus.DELETED);
        doReturn(Optional.of(phoneAccount)).when(repository)
                .findByNormalizedPhoneAndStatusNot("+60123456789", UserAccountStatus.DELETED);

        assertThat(lookup.findLoginAccount(new NormalizedIdentifier(AccountIdentifierType.EMAIL, "a@b.co")))
                .containsSame(emailAccount);
        assertThat(lookup.findLoginAccount(new NormalizedIdentifier(AccountIdentifierType.PHONE, "+60123456789")))
                .containsSame(phoneAccount);
    }

    @Test
    void malformedTypedLookupNeverQueriesTheDatabaseOrEchoesInput() {
        for (NormalizedIdentifier invalid : new NormalizedIdentifier[] {
                new NormalizedIdentifier(AccountIdentifierType.EMAIL, " "),
                new NormalizedIdentifier(null, "a@b.co"),
                new NormalizedIdentifier(AccountIdentifierType.EMAIL, "+60123456789"),
                new NormalizedIdentifier(AccountIdentifierType.PHONE, "a@b.co")
        }) {
            assertThatThrownBy(() -> lookup.findLoginAccount(invalid))
                    .isInstanceOf(AuthValidationException.class)
                    .hasMessage("Invalid account identifier");
        }
        assertThatThrownBy(() -> lookup.findLoginAccount(null)).isInstanceOf(AuthValidationException.class);
        verifyNoInteractions(repository);
    }
}
