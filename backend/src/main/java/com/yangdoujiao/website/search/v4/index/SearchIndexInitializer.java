package com.yangdoujiao.website.search.v4.index;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(prefix = "app.search.index", name = "initialize-on-startup",
        havingValue = "true", matchIfMissing = true)
public class SearchIndexInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(SearchIndexInitializer.class);

    private final SearchIndexManager manager;
    private final SearchIndexRebuilder rebuilder;

    public SearchIndexInitializer(SearchIndexManager manager, SearchIndexRebuilder rebuilder) {
        this.manager = manager;
        this.rebuilder = rebuilder;
    }

    @Override
    public void run(ApplicationArguments args) {
        try {
            boolean readExists = manager.aliasExists(SearchIndexNames.READ_ALIAS);
            boolean writeExists = manager.aliasExists(SearchIndexNames.WRITE_ALIAS);
            if (!readExists || !writeExists) {
                rebuilder.rebuild();
            }
        } catch (RuntimeException failure) {
            // Client exception messages/causes can contain credentials or indexed business data.
            // Fail the application runner without letting Boot re-log that unsafe cause chain.
            log.error("Search index initialization failed; application startup aborted ({})",
                    failure.getClass().getSimpleName());
            throw new IllegalStateException("Search index initialization failed; application startup aborted");
        }
    }
}
