package com.yangdoujiao.website.search.v4.alias;

import java.time.OffsetDateTime;
import java.util.Objects;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(
        name = "search_aliases",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_search_aliases_normalized_target",
                columnNames = {"normalized_alias", "language", "target_type", "target_code"}
        )
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SearchAlias {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String alias;

    @Column(name = "normalized_alias", nullable = false, length = 200)
    private String normalizedAlias;

    @Column(nullable = false, length = 16)
    private String language;

    @Enumerated(EnumType.STRING)
    @Column(name = "target_type", nullable = false, length = 32)
    private SearchAliasTargetType targetType;

    @Column(name = "target_code", nullable = false, length = 64)
    private String targetCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SearchAliasStatus status;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    public SearchAlias(
            String alias,
            String normalizedAlias,
            String language,
            SearchAliasTargetType targetType,
            String targetCode,
            SearchAliasStatus status
    ) {
        this.alias = requireText(alias, "alias");
        this.normalizedAlias = requireText(normalizedAlias, "normalizedAlias");
        this.language = requireText(language, "language");
        this.targetType = Objects.requireNonNull(targetType, "targetType must not be null");
        this.targetCode = requireText(targetCode, "targetCode");
        this.status = Objects.requireNonNull(status, "status must not be null");
    }

    private static String requireText(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(fieldName + " must not be blank");
        }
        return value;
    }
}
