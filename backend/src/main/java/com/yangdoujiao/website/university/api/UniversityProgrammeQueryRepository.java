package com.yangdoujiao.website.university.api;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Repository;

import com.yangdoujiao.website.catalog.CategoryStatus;
import com.yangdoujiao.website.programme.Programme;
import com.yangdoujiao.website.programme.ProgrammeIntake;
import com.yangdoujiao.website.search.v4.model.UniversitySearchCriteria;

import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.CommonAbstractCriteria;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;

@Repository
public class UniversityProgrammeQueryRepository {

    private final EntityManager entityManager;

    public UniversityProgrammeQueryRepository(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    public Page<Long> findPageIds(Long universityId, UniversitySearchCriteria criteria) {
        CriteriaBuilder builder = entityManager.getCriteriaBuilder();
        CriteriaQuery<Long> idQuery = builder.createQuery(Long.class);
        Root<Programme> programme = idQuery.from(Programme.class);
        idQuery.select(programme.get("id"))
                .where(predicates(builder, idQuery, programme, universityId, criteria).toArray(Predicate[]::new))
                .orderBy(
                        builder.asc(builder.coalesce(
                                programme.<String>get("nameEn"),
                                programme.<String>get("nameZh")
                        )),
                        builder.asc(builder.coalesce(
                                programme.<String>get("nameZh"),
                                programme.<String>get("nameEn")
                        )),
                        builder.asc(programme.get("id"))
                );

        TypedQuery<Long> pageQuery = entityManager.createQuery(idQuery);
        pageQuery.setFirstResult((criteria.page() - 1) * criteria.pageSize());
        pageQuery.setMaxResults(criteria.pageSize());

        CriteriaQuery<Long> countQuery = builder.createQuery(Long.class);
        Root<Programme> countProgramme = countQuery.from(Programme.class);
        countQuery.select(builder.countDistinct(countProgramme))
                .where(predicates(builder, countQuery, countProgramme, universityId, criteria)
                        .toArray(Predicate[]::new));
        long total = entityManager.createQuery(countQuery).getSingleResult();

        return new PageImpl<>(
                pageQuery.getResultList(),
                PageRequest.of(criteria.page() - 1, criteria.pageSize()),
                total
        );
    }

    private static List<Predicate> predicates(
            CriteriaBuilder builder,
            CommonAbstractCriteria query,
            Root<Programme> programme,
            Long universityId,
            UniversitySearchCriteria criteria
    ) {
        List<Predicate> predicates = new ArrayList<>();
        predicates.add(builder.equal(programme.get("university").get("id"), universityId));
        predicates.add(builder.equal(programme.get("university").get("status"), CategoryStatus.PUBLISHED));
        predicates.add(builder.equal(programme.get("status"), CategoryStatus.PUBLISHED));
        if (!criteria.countries().isEmpty()) {
            predicates.add(programme.get("university")
                    .get("countryReference")
                    .get("code")
                    .in(criteria.countries()));
        }
        if (criteria.keyword() != null) {
            String keywordPattern = "%" + escapeLikePattern(
                    criteria.keyword().toLowerCase(Locale.ROOT)
            ) + "%";
            predicates.add(builder.or(
                    builder.like(builder.lower(programme.get("nameZh")), keywordPattern, '\\'),
                    builder.like(builder.lower(programme.get("nameEn")), keywordPattern, '\\')
            ));
        }
        if (!criteria.categories().isEmpty()) {
            predicates.add(programme.get("subjectCategory").get("code").in(criteria.categories()));
        }
        if (!criteria.levels().isEmpty()) {
            predicates.add(programme.get("studyLevel").get("code").in(criteria.levels()));
        }
        if (!criteria.modes().isEmpty()) {
            predicates.add(programme.get("courseMode").get("code").in(criteria.modes()));
        }
        if (!criteria.languages().isEmpty()) {
            Subquery<Integer> languageMatch = query.subquery(Integer.class);
            Root<Programme> correlatedProgramme = languageMatch.correlate(programme);
            languageMatch.select(builder.literal(1))
                    .where(correlatedProgramme.join("languages").get("code").in(criteria.languages()));
            predicates.add(builder.exists(languageMatch));
        }
        if (criteria.durationMonths() != null) {
            predicates.add(builder.equal(programme.get("durationMonths"), criteria.durationMonths()));
        }
        if (criteria.intakeMonth() != null) {
            LocalDate monthStart = criteria.intakeMonth().atDay(1);
            LocalDate nextMonthStart = criteria.intakeMonth().plusMonths(1).atDay(1);
            Subquery<Integer> intakeMatch = query.subquery(Integer.class);
            Root<ProgrammeIntake> intake = intakeMatch.from(ProgrammeIntake.class);
            intakeMatch.select(builder.literal(1)).where(
                    builder.equal(intake.get("programme").get("id"), programme.get("id")),
                    builder.greaterThanOrEqualTo(intake.get("intakeDate"), monthStart),
                    builder.lessThan(intake.get("intakeDate"), nextMonthStart)
            );
            predicates.add(builder.exists(intakeMatch));
        }
        if (criteria.tuitionMin() != null || criteria.tuitionMax() != null) {
            predicates.add(builder.isNotNull(programme.get("tuitionTotalRmbMin")));
            predicates.add(builder.isNotNull(programme.get("tuitionTotalRmbMax")));
        }
        if (criteria.tuitionMin() != null) {
            predicates.add(builder.greaterThanOrEqualTo(
                    programme.<BigDecimal>get("tuitionTotalRmbMax"),
                    criteria.tuitionMin()
            ));
        }
        if (criteria.tuitionMax() != null) {
            predicates.add(builder.lessThanOrEqualTo(
                    programme.<BigDecimal>get("tuitionTotalRmbMin"),
                    criteria.tuitionMax()
            ));
        }
        return predicates;
    }

    private static String escapeLikePattern(String value) {
        return value
                .replace("\\", "\\\\")
                .replace("%", "\\%")
                .replace("_", "\\_");
    }
}
