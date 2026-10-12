package com.yangdoujiao.website.catalog;

import java.time.OffsetDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

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
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "subject_categories")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SubjectCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 64, unique = true, updatable = false)
    private String code;

    @Column(name = "name_zh", length = 200)
    private String nameZh;

    @Column(name = "name_en", length = 200)
    private String nameEn;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private SubjectCategory parent;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CategoryStatus status;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    public SubjectCategory(
            String code,
            String nameZh,
            String nameEn,
            SubjectCategory parent,
            int sortOrder,
            CategoryStatus status
    ) {
        this.code = code;
        this.nameZh = nameZh;
        this.nameEn = nameEn;
        this.parent = parent;
        this.sortOrder = sortOrder;
        this.status = status;
    }
}
