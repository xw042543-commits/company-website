package com.yangdoujiao.website.university;

import com.yangdoujiao.website.catalog.CategoryStatus;
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
@Table(name = "university_profile_sections")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UniversityProfileSection {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "university_id", nullable = false)
    private University university;

    @Enumerated(EnumType.STRING)
    @Column(name = "section_type", nullable = false, length = 32)
    private UniversityProfileSectionType sectionType;

    @Column(name = "title_zh", nullable = false, length = 200)
    private String titleZh;

    @Column(name = "title_en", nullable = false, length = 200)
    private String titleEn;

    @Column(name = "body_zh", nullable = false, columnDefinition = "TEXT")
    private String bodyZh;

    @Column(name = "body_en", nullable = false, columnDefinition = "TEXT")
    private String bodyEn;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CategoryStatus status;
}
