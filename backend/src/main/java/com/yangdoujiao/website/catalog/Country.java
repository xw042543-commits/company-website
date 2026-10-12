package com.yangdoujiao.website.catalog;

import java.time.OffsetDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "countries")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Country {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 2, unique = true, updatable = false)
    private String code;

    @Column(name = "name_zh", length = 200)
    private String nameZh;

    @Column(name = "name_en", length = 200)
    private String nameEn;

    @Column(name = "continent_code", nullable = false, length = 32)
    private String continentCode;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    public Country(String code, String nameZh, String nameEn, String continentCode) {
        this.code = code;
        this.nameZh = nameZh;
        this.nameEn = nameEn;
        this.continentCode = continentCode;
    }
}
