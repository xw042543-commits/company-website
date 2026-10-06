package com.yangdoujiao.website.auth.external;

import java.time.OffsetDateTime;

import com.yangdoujiao.website.auth.account.UserAccount;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;

@Entity
@Table(name = "user_external_identities")
@Getter
public class UserExternalIdentity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_account_id", nullable = false)
    private UserAccount userAccount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ExternalIdentityProvider provider;

    @Column(name = "provider_client_id", nullable = false, length = 128)
    private String providerClientId;

    @Column(name = "provider_subject", nullable = false, length = 128)
    private String providerSubject;

    @Column(name = "display_name", length = 100)
    private String displayName;

    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "last_login_at", nullable = false)
    private OffsetDateTime lastLoginAt;

    protected UserExternalIdentity() {
    }

    private UserExternalIdentity(UserAccount userAccount, ExternalIdentityProvider provider,
            String providerClientId, String providerSubject, String displayName,
            String avatarUrl, OffsetDateTime now) {
        this.userAccount = userAccount;
        this.provider = provider;
        this.providerClientId = providerClientId;
        this.providerSubject = providerSubject;
        this.displayName = displayName;
        this.avatarUrl = avatarUrl;
        this.createdAt = now;
        this.lastLoginAt = now;
    }

    public static UserExternalIdentity bind(UserAccount userAccount, ExternalIdentityProvider provider,
            String providerClientId, String providerSubject, OffsetDateTime now) {
        return bind(userAccount, provider, providerClientId, providerSubject, null, null, now);
    }

    public static UserExternalIdentity bind(UserAccount userAccount, ExternalIdentityProvider provider,
            String providerClientId, String providerSubject, String displayName,
            String avatarUrl, OffsetDateTime now) {
        return new UserExternalIdentity(userAccount, provider, providerClientId, providerSubject,
                displayName, avatarUrl, now);
    }

    public void markLogin(OffsetDateTime now) {
        lastLoginAt = now;
    }

    public void updateProfile(String displayName, String avatarUrl, OffsetDateTime now) {
        if (displayName != null) this.displayName = displayName;
        if (avatarUrl != null) this.avatarUrl = avatarUrl;
        this.lastLoginAt = now;
    }
}
