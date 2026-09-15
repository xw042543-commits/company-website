package com.yangdoujiao.website.programme;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.Objects;
import java.util.Set;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import com.yangdoujiao.website.catalog.CategoryStatus;
import com.yangdoujiao.website.catalog.CourseMode;
import com.yangdoujiao.website.catalog.Language;
import com.yangdoujiao.website.catalog.StudyLevel;
import com.yangdoujiao.website.catalog.SubjectCategory;
import com.yangdoujiao.website.university.University;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "programmes")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Programme {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "programme_code", nullable = false, length = 64, unique = true, updatable = false)
    private String programmeCode;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "university_id", nullable = false)
    private University university;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "subject_category_id", nullable = false)
    private SubjectCategory subjectCategory;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "study_level_id")
    private StudyLevel studyLevel;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_mode_id")
    private CourseMode courseMode;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "programme_languages",
            joinColumns = @JoinColumn(name = "programme_id"),
            inverseJoinColumns = @JoinColumn(name = "language_id")
    )
    private Set<Language> languages = new LinkedHashSet<>();

    @Column(nullable = false, length = 200)
    private String slug;

    @Column(name = "name_zh", length = 200)
    private String nameZh;

    @Column(name = "name_en", length = 200)
    private String nameEn;

    @Column(name = "description_zh", columnDefinition = "TEXT")
    private String descriptionZh;

    @Column(name = "description_en", columnDefinition = "TEXT")
    private String descriptionEn;

    @Column(name = "duration_months")
    private Integer durationMonths;

    @Column(name = "duration_display", length = 100)
    private String durationDisplay;

    @Column(name = "tuition_min", precision = 14, scale = 2)
    private BigDecimal tuitionMin;

    @Column(name = "tuition_max", precision = 14, scale = 2)
    private BigDecimal tuitionMax;

    @JdbcTypeCode(SqlTypes.CHAR)
    @Column(name = "tuition_currency", length = 3)
    private String tuitionCurrency;

    @Column(name = "tuition_display", length = 200)
    private String tuitionDisplay;

    @Column(name = "tuition_rmb_min", precision = 14, scale = 2)
    private BigDecimal tuitionRmbMin;

    @Column(name = "tuition_rmb_max", precision = 14, scale = 2)
    private BigDecimal tuitionRmbMax;

    @Column(name = "exchange_rate", precision = 18, scale = 8)
    private BigDecimal exchangeRate;

    @Column(name = "exchange_rate_date")
    private LocalDate exchangeRateDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CategoryStatus status;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @Column(name = "published_at")
    private OffsetDateTime publishedAt;

    public Programme(
            String programmeCode,
            University university,
            SubjectCategory subjectCategory,
            StudyLevel studyLevel,
            CourseMode courseMode,
            String slug,
            String nameZh,
            String nameEn,
            CategoryStatus status
    ) {
        this.programmeCode = programmeCode;
        this.university = university;
        this.subjectCategory = subjectCategory;
        this.studyLevel = studyLevel;
        this.courseMode = courseMode;
        this.slug = slug;
        this.nameZh = nameZh;
        this.nameEn = nameEn;
        this.status = status;
    }

    public void addLanguage(Language language) {
        languages.add(Objects.requireNonNull(language));
    }

    public Set<Language> getLanguages() {
        return Collections.unmodifiableSet(languages);
    }
}
