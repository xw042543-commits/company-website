package com.yangdoujiao.website.search.v4.sync;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SearchSyncJobRepository extends JpaRepository<SearchSyncJob, Long> {

    List<SearchSyncJob> findAllByOrderByIdAsc();

    long countByStatus(SearchSyncJobStatus status);
}
