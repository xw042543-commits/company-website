package com.yangdoujiao.website.miniapp;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;

@Entity
@Table(name = "miniapp_study_plans")
@Getter
class MiniappStudyPlan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_account_id", nullable = false)
    private Long userAccountId;

    @Column(nullable = false, length = 30)
    private String goal;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(nullable = false, columnDefinition = "jsonb")
    private List<String> subjects = new ArrayList<>();

    @Column(nullable = false, length = 100)
    private String country;

    @Column(length = 100)
    private String intake;

    @Column(nullable = false, length = 100)
    private String education;

    @Column(length = 100)
    private String grade;

    @Column(length = 100)
    private String language;

    @Column(length = 100)
    private String budget;

    @Column(nullable = false, length = 20)
    private String status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    protected MiniappStudyPlan() {
    }

    MiniappStudyPlan(long userAccountId, MiniappStudyPlanRequest request) {
        this.userAccountId = userAccountId;
        this.createdAt = OffsetDateTime.now(ZoneOffset.UTC);
        update(request);
    }

    void update(MiniappStudyPlanRequest request) {
        this.goal = request.goal().strip();
        this.subjects = request.subjects() == null ? new ArrayList<>() : request.subjects().stream()
                .map(String::strip).filter(value -> !value.isEmpty()).distinct().toList();
        this.country = request.country().strip();
        this.intake = clean(request.intake());
        this.education = request.education().strip();
        this.grade = clean(request.grade());
        this.language = clean(request.language());
        this.budget = clean(request.budget());
        this.status = "PLANNING";
        this.updatedAt = OffsetDateTime.now(ZoneOffset.UTC);
    }

    private static String clean(String value) {
        if (value == null || value.isBlank()) return null;
        return value.strip();
    }
}
