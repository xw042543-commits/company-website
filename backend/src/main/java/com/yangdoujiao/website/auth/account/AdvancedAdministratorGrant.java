package com.yangdoujiao.website.auth.account;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Column;

/** Read-only view of the existing, separately managed advanced authorization. */
@Entity
@Table(name = "catalog_advanced_administrators")
@org.hibernate.annotations.Immutable
public class AdvancedAdministratorGrant {
    @Id @Column(name = "user_account_id")
    private Long userAccountId;
    protected AdvancedAdministratorGrant() {}
}
