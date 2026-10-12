package com.yangdoujiao.website.search.v4.alias;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SearchAliasRepository extends JpaRepository<SearchAlias, Long> {

    List<SearchAlias> findAllByNormalizedAliasAndStatus(
            String normalizedAlias,
            SearchAliasStatus status
    );
}
