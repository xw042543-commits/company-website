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

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "last_login_at", nullable = false)
    private OffsetDateTime lastLoginAt;

    protected UserExternalIdentity() {
    }

    private UserExternalIdentity(UserAccount userAccount, ExternalIdentityProvider provider,
            String providerClientId, String providerSubject, OffsetDateTime now) {
        this.userAccount = userAccount;
        this.provider = provider;
        this.providerClientId = providerClientId;
        this.providerSubject = providerSubject;
        this.createdAt = now;
        this.lastLoginAt = now;
    }

    public static UserExternalIdentity bind(UserAccount userAccount, ExternalIdentityProvider provider,
            String providerClientId, String providerSubject, OffsetDateTime now) {
        return new UserExternalIdentity(userAccount, provider, providerClientId, providerSubject, now);
    }

    public void markLogin(OffsetDateTime now) {
        lastLoginAt = now;
    }
}
