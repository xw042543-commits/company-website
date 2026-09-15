package com.yangdoujiao.website.search;

import java.util.List;

import org.springframework.data.elasticsearch.annotations.Query;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

public interface UniversitySearchRepository
        extends ElasticsearchRepository<UniversitySearchDocument, String> {

    @Query("""
            {
              "multi_match": {
                "query": "?0",
                "fields": ["name", "country"]
              }
            }
            """)
    List<UniversitySearchDocument> search(String query);
}
