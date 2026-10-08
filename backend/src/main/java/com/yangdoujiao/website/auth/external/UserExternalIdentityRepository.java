package com.yangdoujiao.website.auth.external;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserExternalIdentityRepository extends JpaRepository<UserExternalIdentity, Long> {

    @Query("""
            select identity from UserExternalIdentity identity
            join fetch identity.userAccount
            where identity.provider = :provider
              and identity.providerClientId = :clientId
              and identity.providerSubject = :subject
            """)
    Optional<UserExternalIdentity> findDetailed(
            @Param("provider") ExternalIdentityProvider provider,
            @Param("clientId") String clientId,
            @Param("subject") String subject);

    boolean existsByProviderAndUserAccountId(ExternalIdentityProvider provider, Long userAccountId);

    Optional<UserExternalIdentity> findByProviderAndUserAccountId(
            ExternalIdentityProvider provider, Long userAccountId);
}
