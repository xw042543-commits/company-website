package com.yangdoujiao.website.search;

import java.util.List;

import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

public interface UniversitySearchRepository
        extends ElasticsearchRepository<UniversitySearchDocument, String> {

    List<UniversitySearchDocument> findByNameContainingOrCountryContaining(
            String name,
            String country
    );
}