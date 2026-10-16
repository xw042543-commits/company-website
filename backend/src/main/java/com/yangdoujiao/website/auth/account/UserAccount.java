package com.yangdoujiao.website.auth.account;

import java.time.OffsetDateTime;
import java.util.Set;
import java.util.HashSet;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.FetchType;
import jakarta.persistence.OneToOne;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;

@Entity
@Table(name = "user_accounts")
@org.hibernate.annotations.DynamicUpdate
@Getter
public class UserAccount {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column(name = "normalized_email", length = 254, unique = true)
    private String normalizedEmail;

    @Column(name = "normalized_phone", length = 16, unique = true)
    private String normalizedPhone;

    @Column(name = "password_hash", length = 255)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private UserAccountStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20, updatable = false)
    private UserAccountRole role = UserAccountRole.USER;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_account_permissions", joinColumns = @JoinColumn(name = "user_account_id"))
    @Column(name = "permission", nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private Set<UserAccountRole> permissions = new HashSet<>();

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id", referencedColumnName = "user_account_id", insertable = false, updatable = false)
    private AdvancedAdministratorGrant advancedGrant;

    public Set<UserAccountRole> grantedPermissions() {
        // The legacy column remains a projection; this also preserves in-memory login fixtures.
        return permissions.isEmpty() && role != UserAccountRole.USER ? Set.of(role) : Set.copyOf(permissions);
    }

    public boolean hasPermission(UserAccountRole permission) {
        return (permission == UserAccountRole.ADMIN && advancedGrant != null) || grantedPermissions().contains(permission);
    }

    @Column(name = "email_verified_at")
    private OffsetDateTime emailVerifiedAt;

    @Column(name = "phone_verified_at")
    private OffsetDateTime phoneVerifiedAt;

    @Column(name = "agreement_version", nullable = false, length = 50)
    private String agreementVersion;

    @Column(name = "privacy_version", nullable = false, length = 50)
    private String privacyVersion;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @Column(name = "deleted_at")
    private OffsetDateTime deletedAt;

    @Column(name = "profile_avatar_url", length = 500)
    private String profileAvatarUrl;

    @Column(name = "profile_avatar_overridden", nullable = false)
    private boolean profileAvatarOverridden;

    public String displayAvatar(String legacyAvatar) {
        return profileAvatarOverridden ? profileAvatarUrl : legacyAvatar;
    }

    public void changeAvatar(String url, OffsetDateTime now) {
        profileAvatarUrl = url;
        profileAvatarOverridden = true;
        updatedAt = now;
    }

    protected UserAccount() {
    }

    public UserAccount(String fullName, String normalizedEmail, String normalizedPhone,
            String passwordHash, String agreementVersion, String privacyVersion) {
        this.fullName = fullName;
        this.normalizedEmail = normalizedEmail;
        this.normalizedPhone = normalizedPhone;
        this.passwordHash = passwordHash;
        this.agreementVersion = agreementVersion;
        this.privacyVersion = privacyVersion;
        this.status = UserAccountStatus.PENDING_VERIFICATION;
        this.createdAt = OffsetDateTime.now();
        this.updatedAt = createdAt;
    }

    public static UserAccount external(String fullName, String agreementVersion, String privacyVersion) {
        UserAccount account = new UserAccount();
        account.fullName = fullName;
        account.agreementVersion = agreementVersion;
        account.privacyVersion = privacyVersion;
        account.status = UserAccountStatus.ACTIVE;
        account.createdAt = OffsetDateTime.now();
        account.updatedAt = account.createdAt;
        return account;
    }

    public void verifyEmail(OffsetDateTime now) {
        emailVerifiedAt = now;
        status = UserAccountStatus.ACTIVE;
        updatedAt = now;
    }

    public void verifyPhone(OffsetDateTime now) {
        phoneVerifiedAt = now;
        status = UserAccountStatus.ACTIVE;
        updatedAt = now;
    }

    public void changePassword(String encodedPassword, OffsetDateTime now) {
        passwordHash = encodedPassword;
        updatedAt = now;
    }

    public void delete(OffsetDateTime now) {
        status = UserAccountStatus.DELETED;
        deletedAt = now;
        updatedAt = now;
    }
}
