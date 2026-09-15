package com.yangdoujiao.website.catalog;

import java.time.OffsetDateTime;

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
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "course_modes")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CourseMode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 64, unique = true, updatable = false)
    private String code;

    @Column(name = "name_zh", length = 200)
    private String nameZh;

    @Column(name = "name_en", length = 200)
    private String nameEn;

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

    public CourseMode(
            String code,
            String nameZh,
            String nameEn,
            int sortOrder,
            CategoryStatus status
    ) {
        this.code = code;
        this.nameZh = nameZh;
        this.nameEn = nameEn;
        this.sortOrder = sortOrder;
        this.status = status;
    }
}
