package com.yangdoujiao.website.search.v4;

import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.Set;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.yangdoujiao.website.catalog.CategoryStatus;
import com.yangdoujiao.website.catalog.SubjectCategory;
import com.yangdoujiao.website.catalog.SubjectCategoryRepository;
import com.yangdoujiao.website.search.v4.model.UniversitySearchCriteria;

@Component
public class SubjectCategoryFilterExpander {

    private final SubjectCategoryRepository repository;

    public SubjectCategoryFilterExpander(SubjectCategoryRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public UniversitySearchCriteria expand(UniversitySearchCriteria criteria) {
        if (criteria.categories().isEmpty()) {
            return criteria;
        }

        Set<String> expandedCategories = new LinkedHashSet<>(criteria.categories());
        for (SubjectCategory category : repository.findAllByStatusOrderBySortOrderAscCodeAsc(CategoryStatus.PUBLISHED)) {
            if (isSelectedOrDescendant(category, criteria.categories())) {
                expandedCategories.add(category.getCode());
            }
        }

        return new UniversitySearchCriteria(
                criteria.keyword(),
                expandedCategories,
                criteria.levels(),
                criteria.countries(),
                criteria.modes(),
                criteria.languages(),
                criteria.durationMonths(),
                criteria.intakeMonth(),
                criteria.tuitionMin(),
                criteria.tuitionMax(),
                criteria.page(),
                criteria.pageSize());
    }

    private static boolean isSelectedOrDescendant(SubjectCategory category, Set<String> selectedCodes) {
        Set<String> visitedCodes = new HashSet<>();
        SubjectCategory current = category;
        while (current != null && visitedCodes.add(current.getCode())) {
            if (selectedCodes.contains(current.getCode())) {
                return true;
            }
            current = current.getParent();
        }
        return false;
    }
}
