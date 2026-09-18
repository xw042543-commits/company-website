package com.yangdoujiao.website.search.v4.sync;

import java.time.Clock;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SearchSyncEnqueuer {

    private final SearchSyncJobRepository jobs;
    private final Clock clock;

    public SearchSyncEnqueuer(SearchSyncJobRepository jobs, Clock clock) {
        this.jobs = jobs;
        this.clock = clock;
    }

    @Transactional(propagation = Propagation.MANDATORY)
    public void enqueue(long universityId) {
        jobs.save(new SearchSyncJob(universityId, clock.instant()));
    }
}
