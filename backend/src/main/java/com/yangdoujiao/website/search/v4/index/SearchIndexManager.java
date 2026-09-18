package com.yangdoujiao.website.search.v4.index;

import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.IndexOperations;
import org.springframework.data.elasticsearch.core.index.AliasAction;
import org.springframework.data.elasticsearch.core.index.AliasActionParameters;
import org.springframework.data.elasticsearch.core.index.AliasActions;
import org.springframework.data.elasticsearch.core.mapping.IndexCoordinates;
import org.springframework.stereotype.Component;

import com.yangdoujiao.website.search.v4.document.UniversityProgrammeSearchDocument;

@Component
public class SearchIndexManager {

    private static final String INDEX_PREFIX = "universities-v4-";
    private static final DateTimeFormatter VERSION_TIME = DateTimeFormatter.ofPattern("yyyyMMddHHmmssSSS")
            .withZone(ZoneOffset.UTC);

    private final ElasticsearchOperations operations;

    public SearchIndexManager(ElasticsearchOperations operations) {
        this.operations = operations;
    }

    public String createVersionedIndex() {
        String indexName = INDEX_PREFIX + VERSION_TIME.format(Instant.now()) + "-"
                + UUID.randomUUID().toString().replace("-", "").substring(0, 8);
        IndexOperations index = operations.indexOps(IndexCoordinates.of(indexName));
        if (!index.create(index.createSettings(UniversityProgrammeSearchDocument.class),
                index.createMapping(UniversityProgrammeSearchDocument.class))) {
            throw new IllegalStateException("Search index creation was not acknowledged");
        }
        return indexName;
    }

    public boolean aliasExists(String alias) {
        // Listing existing aliases also works on first deployment, when a named lookup would return 404.
        return operations.indexOps(UniversityProgrammeSearchDocument.class).getAliases().values().stream()
                .flatMap(aliases -> aliases.stream()).anyMatch(data -> data.getAlias().equals(alias));
    }

    public void swapAliases(String indexName) {
        AliasActions actions = new AliasActions();
        operations.indexOps(UniversityProgrammeSearchDocument.class).getAliases().forEach((oldIndex, aliases) ->
                aliases.stream().filter(alias -> isRequiredAlias(alias.getAlias())).forEach(alias ->
                        actions.add(new AliasAction.Remove(AliasActionParameters.builder()
                                .withIndices(oldIndex).withAliases(alias.getAlias()).build()))));
        actions.add(new AliasAction.Add(AliasActionParameters.builder()
                .withIndices(indexName).withAliases(SearchIndexNames.READ_ALIAS).build()));
        actions.add(new AliasAction.Add(AliasActionParameters.builder()
                .withIndices(indexName).withAliases(SearchIndexNames.WRITE_ALIAS).withIsWriteIndex(true).build()));
        // A single cluster-state update removes every old binding and adds both new bindings atomically.
        if (!operations.indexOps(IndexCoordinates.of(indexName)).alias(actions)) {
            throw new IllegalStateException("Search alias switch was not acknowledged");
        }
    }

    private boolean isRequiredAlias(String alias) {
        return SearchIndexNames.READ_ALIAS.equals(alias) || SearchIndexNames.WRITE_ALIAS.equals(alias);
    }
}
