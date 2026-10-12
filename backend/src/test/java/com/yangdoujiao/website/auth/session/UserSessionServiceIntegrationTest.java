package com.yangdoujiao.website.auth.session;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.session.FindByIndexNameSessionRepository;
import org.springframework.session.Session;
import org.springframework.test.context.ActiveProfiles;

import com.yangdoujiao.website.TestContainersConfiguration;

@SpringBootTest
@ActiveProfiles("test")
@Import(TestContainersConfiguration.class)
class UserSessionServiceIntegrationTest {
    @Autowired private UserSessionService sessions;
    @Autowired private FindByIndexNameSessionRepository<? extends Session> repository;

    @Test
    void revokeAllDeletesOnlySessionsIndexedToGivenUser() {
        Session first = createIndexed(repository, "user:9000000001");
        Session second = createIndexed(repository, "user:9000000001");
        Session other = createIndexed(repository, "user:9000000002");

        sessions.revokeAll(9_000_000_001L);

        assertThat(repository.findById(first.getId())).isNull();
        assertThat(repository.findById(second.getId())).isNull();
        assertThat(repository.findById(other.getId())).isNotNull();
        repository.deleteById(other.getId());
    }

    private <S extends Session> S createIndexed(FindByIndexNameSessionRepository<S> store, String principal) {
        S session = store.createSession();
        session.setAttribute(FindByIndexNameSessionRepository.PRINCIPAL_NAME_INDEX_NAME, principal);
        store.save(session);
        return session;
    }
}
