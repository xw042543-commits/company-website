package com.yangdoujiao.website.university;

import java.io.Serial;
import java.io.Serializable;
import java.time.OffsetDateTime;

import org.hibernate.annotations.UpdateTimestamp;

import com.yangdoujiao.website.catalog.CategoryStatus;
import com.yangdoujiao.website.catalog.Country;

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
@Table(name = "universities")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class University implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(nullable = false, length = 200, unique = true)
    private String slug;

    @Column(nullable = false, length = 100)
    private String country;

    @Column(name = "university_code", length = 64, unique = true, updatable = false)
    private String universityCode;

    @Column(name = "name_zh", length = 200)
    private String nameZh;

    @Column(name = "name_en", length = 200)
    private String nameEn;

    @Column(name = "city_zh", length = 200)
    private String cityZh;

    @Column(name = "city_en", length = 200)
    private String cityEn;

    @Column(name = "description_zh", columnDefinition = "TEXT")
    private String descriptionZh;

    @Column(name = "description_en", columnDefinition = "TEXT")
    private String descriptionEn;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "country_id")
    private Country countryReference;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CategoryStatus status;

    @Column(nullable = false)
    private boolean popular;

    @Column(name = "created_at", nullable = false, insertable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @Column(name = "published_at")
    private OffsetDateTime publishedAt;
}
