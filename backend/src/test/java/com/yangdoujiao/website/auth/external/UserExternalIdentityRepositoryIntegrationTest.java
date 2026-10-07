package com.yangdoujiao.website.auth.external;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.OffsetDateTime;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import com.yangdoujiao.website.TestContainersConfiguration;
import com.yangdoujiao.website.auth.account.UserAccount;
import com.yangdoujiao.website.auth.account.UserAccountRepository;

import jakarta.persistence.EntityManager;

@SpringBootTest
@ActiveProfiles("test")
@Import(TestContainersConfiguration.class)
@Transactional
class UserExternalIdentityRepositoryIntegrationTest {

    @Autowired
    private UserAccountRepository accounts;

    @Autowired
    private UserExternalIdentityRepository identities;

    @Autowired
    private JdbcTemplate jdbc;

    @Autowired
    private EntityManager entityManager;

    @Test
    void savesAndLoadsWechatIdentityWithItsAccount() {
        UserAccount account = accounts.findById(insertAccount("wechat-repository@example.test")).orElseThrow();
        OffsetDateTime boundAt = OffsetDateTime.parse("2026-09-29T05:00:00Z");

        identities.saveAndFlush(UserExternalIdentity.bind(
                account,
                ExternalIdentityProvider.WECHAT,
                "wechat-app",
                "wechat-subject",
                "小王",
                "https://thirdwx.qlogo.cn/mmopen/example/132",
                boundAt));
        entityManager.clear();

        UserExternalIdentity saved = identities.findDetailed(
                ExternalIdentityProvider.WECHAT,
                "wechat-app",
                "wechat-subject").orElseThrow();

        assertThat(saved.getUserAccount().getId()).isEqualTo(account.getId());
        assertThat(saved.getProvider()).isEqualTo(ExternalIdentityProvider.WECHAT);
        assertThat(saved.getProviderClientId()).isEqualTo("wechat-app");
        assertThat(saved.getProviderSubject()).isEqualTo("wechat-subject");
        assertThat(saved.getDisplayName()).isEqualTo("小王");
        assertThat(saved.getAvatarUrl()).isEqualTo("https://thirdwx.qlogo.cn/mmopen/example/132");
        assertThat(saved.getCreatedAt()).isEqualTo(boundAt);
        assertThat(saved.getLastLoginAt()).isEqualTo(boundAt);
        assertThat(identities.existsByProviderAndUserAccountId(
                ExternalIdentityProvider.WECHAT,
                account.getId())).isTrue();
    }

    @Test
    void updatesLastLoginWithoutChangingBindingIdentity() {
        UserAccount account = accounts.findById(insertAccount("wechat-last-login@example.test")).orElseThrow();
        OffsetDateTime boundAt = OffsetDateTime.parse("2026-09-29T05:00:00Z");
        OffsetDateTime loggedInAt = OffsetDateTime.parse("2026-09-29T06:30:00Z");
        UserExternalIdentity identity = identities.saveAndFlush(UserExternalIdentity.bind(
                account,
                ExternalIdentityProvider.WECHAT,
                "wechat-app",
                "wechat-last-login-subject",
                boundAt));

        identity.updateProfile("Updated name", "https://wx.qlogo.cn/mmopen/updated/132", loggedInAt);
        identities.saveAndFlush(identity);
        entityManager.clear();

        UserExternalIdentity updated = identities.findDetailed(
                ExternalIdentityProvider.WECHAT,
                "wechat-app",
                "wechat-last-login-subject").orElseThrow();
        assertThat(updated.getCreatedAt()).isEqualTo(boundAt);
        assertThat(updated.getLastLoginAt()).isEqualTo(loggedInAt);
        assertThat(updated.getProviderSubject()).isEqualTo("wechat-last-login-subject");
        assertThat(updated.getDisplayName()).isEqualTo("Updated name");
        assertThat(updated.getAvatarUrl()).isEqualTo("https://wx.qlogo.cn/mmopen/updated/132");
    }

    private long insertAccount(String email) {
        return jdbc.queryForObject("""
                INSERT INTO user_accounts (
                    full_name, normalized_email, password_hash, status,
                    agreement_version, privacy_version
                ) VALUES ('WeChat Repository Test', ?, 'test-only-hash', 'ACTIVE', 'terms-v1', 'privacy-v1')
                RETURNING id
                """, Long.class, email);
    }
}
