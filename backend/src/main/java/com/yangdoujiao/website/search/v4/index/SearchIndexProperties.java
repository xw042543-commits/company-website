package com.yangdoujiao.website.search.v4.index;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app.search.index")
public class SearchIndexProperties {

    private int batchSize = 200;

    public int getBatchSize() {
        return batchSize;
    }

    public void setBatchSize(int batchSize) {
        if (batchSize < 1) {
            throw new IllegalArgumentException("Search index batch size must be positive");
        }
        this.batchSize = batchSize;
    }
}
