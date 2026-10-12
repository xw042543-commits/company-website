package com.yangdoujiao.website.search.v4.index;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyIterable;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.AdditionalAnswers.delegatesTo;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicLong;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.IndexOperations;
import org.springframework.data.elasticsearch.core.index.AliasAction;
import org.springframework.data.elasticsearch.core.index.AliasActionParameters;
import org.springframework.data.elasticsearch.core.index.AliasActions;
import org.springframework.data.elasticsearch.core.mapping.IndexCoordinates;
import org.springframework.data.elasticsearch.core.query.Query;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.PlatformTransactionManager;

import com.yangdoujiao.website.TestContainersConfiguration;
import com.yangdoujiao.website.search.v4.document.UniversityProgrammeSearchDocument;

@SpringBootTest
@ActiveProfiles("test")
@Import(TestContainersConfiguration.class)
class SearchIndexRebuilderIntegrationTest {

    @Autowired ElasticsearchOperations operations;
    @Autowired JdbcTemplate jdbc;
    @Autowired UniversitySearchProjectionLoader loader;
    @Autowired PlatformTransactionManager transactionManager;

    private final List<String> createdIndices = new ArrayList<>();
    private final List<AliasActions> aliasRequests = new ArrayList<>();
    private final List<Long> fixtureUniversityIds = new ArrayList<>();
    private final List<Long> fixtureCategoryIds = new ArrayList<>();
    private ElasticsearchOperations observedOperations;
    private SearchIndexManager manager;
    private SearchIndexProperties properties;
    private String oldRead;
    private String otherRead;
    private String oldWrite;

    @BeforeEach
    void prepareOldSearchAndObserveRealAliasRequests() {
        jdbc.update("DELETE FROM search_sync_jobs");
        oldRead = oldIndex(901L);
        otherRead = oldIndex(902L);
        oldWrite = oldIndex(903L);
        operations.indexOps(IndexCoordinates.of(oldRead)).alias(new AliasActions(
                add(oldRead, SearchIndexNames.READ_ALIAS, false),
                add(otherRead, SearchIndexNames.READ_ALIAS, false),
                add(oldWrite, SearchIndexNames.WRITE_ALIAS, true)));

        observedOperations = spy(operations);
        doAnswer(call -> {
            IndexCoordinates coordinates = call.getArgument(0);
            IndexOperations real = operations.indexOps(coordinates);
            IndexOperations observed = spy(real);
            if (!createdIndices.contains(coordinates.getIndexName())) {
                createdIndices.add(coordinates.getIndexName());
            }
            doAnswer(aliasCall -> {
                // This executes immediately before the real Elasticsearch _aliases request.
                assertOldAliasesAndSearch();
                aliasRequests.add(aliasCall.getArgument(0));
                return aliasCall.callRealMethod();
            }).when(observed).alias(any(AliasActions.class));
            return observed;
        }).when(observedOperations).indexOps(any(IndexCoordinates.class));
        manager = new SearchIndexManager(observedOperations);
        properties = new SearchIndexProperties();
        properties.setBatchSize(2);
    }

    @AfterEach
    void removeOnlyFixturesCreatedForThisTest() {
        try {
            createdIndices.forEach(name -> operations.indexOps(IndexCoordinates.of(name)).delete());
        } finally {
            jdbc.update("DELETE FROM search_sync_jobs");
            fixtureUniversityIds.forEach(universityId -> {
                jdbc.update("DELETE FROM programmes WHERE university_id = ?", universityId);
                jdbc.update("DELETE FROM universities WHERE id = ?", universityId);
            });
            fixtureCategoryIds.forEach(categoryId ->
                    jdbc.update("DELETE FROM subject_categories WHERE id = ?", categoryId));
        }
    }

    @Test
    void rebuildsPublishedProjectionsInBatchesAndAtomicallyMovesBothAliasesFromEveryOldIndex() {
        List<Long> publishedIds = seedPublicAndExcludedUniversities();
        SearchIndexRebuilder rebuilder = rebuilder(loader);

        var result = rebuilder.rebuild();

        assertThat(result.indexName()).matches("universities-v4-\\d{17}-[a-f0-9]{8}");
        assertThat(result.indexedUniversities()).isEqualTo(5);
        IndexCoordinates newIndex = IndexCoordinates.of(result.indexName());
        assertThat(operations.indexOps(newIndex).exists()).isTrue();
        Map<?, ?> mappingProperties = (Map<?, ?>) operations.indexOps(newIndex).getMapping().get("properties");
        assertThat(((Map<?, ?>) mappingProperties.get("programmes")).get("type")).isEqualTo("nested");
        assertThat(operations.count(Query.findAll(), UniversityProgrammeSearchDocument.class, newIndex)).isEqualTo(5);
        assertThat(operations.search(Query.findAll(), UniversityProgrammeSearchDocument.class,
                IndexCoordinates.of(SearchIndexNames.READ_ALIAS)).getSearchHits())
                .extracting(hit -> hit.getContent().getId()).containsExactlyInAnyOrderElementsOf(publishedIds);
        assertAliasesPointOnlyTo(result.indexName());
        assertThat(aliasRequests).hasSize(1);
        List<AliasAction> actions = aliasRequests.getFirst().getActions();
        assertThat(actions).hasSize(5);
        assertThat(actions.stream().filter(AliasAction.Remove.class::isInstance)
                .map(action -> action.getParameters().getIndices()[0]).toList())
                .containsExactlyInAnyOrder(oldRead, otherRead, oldWrite);
        assertThat(actions.stream().filter(AliasAction.Add.class::isInstance).toList())
                .hasSize(2).allSatisfy(action -> assertThat(action.getParameters().getIndices())
                        .containsExactly(result.indexName()));
        assertThat(actions.stream().filter(AliasAction.Add.class::isInstance)
                .filter(action -> List.of(action.getParameters().getAliases()).contains(SearchIndexNames.WRITE_ALIAS))
                .findFirst().orElseThrow().getParameters().getWriteIndex()).isTrue();
        verify(observedOperations, times(3)).save(anyIterable(), eq(newIndex));
        assertOldIndicesRemain();
    }

    @Test
    void countMismatchLeavesBothOldAliasesAndAllOldIndicesIntact() {
        seedPublicAndExcludedUniversities();
        doReturn(4L).when(observedOperations).count(any(Query.class),
                eq(UniversityProgrammeSearchDocument.class), any(IndexCoordinates.class));

        assertThatThrownBy(() -> rebuilder(loader).rebuild()).isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("count");

        assertThat(aliasRequests).isEmpty();
        assertOldAliasesAndSearch();
        assertOldIndicesRemain();
    }

    @Test
    void bulkFailureNeverSwitchesAliases() {
        seedPublicAndExcludedUniversities();
        doThrow(new IllegalStateException("Simulated bulk failure")).when(observedOperations)
                .save(anyIterable(), any(IndexCoordinates.class));

        assertThatThrownBy(() -> rebuilder(loader).rebuild()).isInstanceOf(IllegalStateException.class);

        assertThat(aliasRequests).isEmpty();
        assertOldAliasesAndSearch();
        assertOldIndicesRemain();
    }

    @Test
    void projectionDisappearingAfterIdSnapshotFailsWithoutSwitchingAliases() {
        long disappearing = seedPublicAndExcludedUniversities().getFirst();
        UniversitySearchProjectionLoader changingLoader = mock(UniversitySearchProjectionLoader.class,
                delegatesTo(loader));
        doReturn(Optional.empty()).when(changingLoader).loadPublishedUniversity(disappearing);

        assertThatThrownBy(() -> rebuilder(changingLoader).rebuild()).isInstanceOf(IllegalStateException.class);

        assertThat(aliasRequests).isEmpty();
        assertOldAliasesAndSearch();
    }

    @Test
    void emptyPublishedDatasetCanReplaceStaleSearchWithAnEmptyValidIndex() {
        var result = rebuilder(loader).rebuild();

        assertThat(result.indexedUniversities()).isZero();
        assertThat(operations.count(Query.findAll(), UniversityProgrammeSearchDocument.class,
                IndexCoordinates.of(result.indexName()))).isZero();
        assertAliasesPointOnlyTo(result.indexName());
        assertThat(aliasRequests).hasSize(1);
        assertOldIndicesRemain();
    }

    @Test
    void firstDeploymentCreatesBothAliasesWhenNoneExist() {
        operations.indexOps(IndexCoordinates.of(oldRead)).alias(new AliasActions(
                remove(oldRead, SearchIndexNames.READ_ALIAS), remove(otherRead, SearchIndexNames.READ_ALIAS),
                remove(oldWrite, SearchIndexNames.WRITE_ALIAS)));
        SearchIndexManager firstDeploymentManager = new SearchIndexManager(operations);
        assertThat(firstDeploymentManager.aliasExists(SearchIndexNames.READ_ALIAS)).isFalse();
        assertThat(firstDeploymentManager.aliasExists(SearchIndexNames.WRITE_ALIAS)).isFalse();

        var result = new SearchIndexRebuilder(firstDeploymentManager, loader, operations, jdbc, properties,
                transactionManager).rebuild();
        createdIndices.add(result.indexName());

        assertAliasesPointOnlyTo(result.indexName());
        assertThat(firstDeploymentManager.aliasExists(SearchIndexNames.READ_ALIAS)).isTrue();
        assertThat(firstDeploymentManager.aliasExists(SearchIndexNames.WRITE_ALIAS)).isTrue();
    }

    @Test
    void rebuildSchedulesReconciliationForUniversitiesPresentBeforeOrAfterItsSnapshot() {
        List<Long> publishedIds = seedPublicAndExcludedUniversities();
        long removedDuringRebuild = publishedIds.getFirst();
        long categoryId = fixtureCategoryIds.getFirst();
        AtomicBoolean changed = new AtomicBoolean();
        AtomicLong addedDuringRebuild = new AtomicLong();
        UniversitySearchProjectionLoader changingLoader = mock(UniversitySearchProjectionLoader.class,
                delegatesTo(loader));
        doAnswer(invocation -> {
            Optional<UniversityProgrammeSearchDocument> projection =
                    loader.loadPublishedUniversity(removedDuringRebuild);
            if (changed.compareAndSet(false, true)) {
                jdbc.update("DELETE FROM programmes WHERE university_id = ?", removedDuringRebuild);
                jdbc.update("DELETE FROM universities WHERE id = ?", removedDuringRebuild);
                long added = jdbc.queryForObject("""
                        INSERT INTO universities (name, slug, country, university_code, name_en, status)
                        VALUES ('Late university', 'late-university', 'Test country',
                                'REBUILD_LATE', 'Late university', 'PUBLISHED')
                        RETURNING id
                        """, Long.class);
                fixtureUniversityIds.add(added);
                jdbc.update("""
                        INSERT INTO programmes (
                            university_id, subject_category_id, programme_code, slug, name_en, status
                        )
                        VALUES (?, ?, 'REBUILD_LATE_PROGRAMME', 'late-programme',
                                'Late programme', 'PUBLISHED')
                        """, added, categoryId);
                addedDuringRebuild.set(added);
            }
            return projection;
        }).when(changingLoader).loadPublishedUniversity(removedDuringRebuild);

        rebuilder(changingLoader).rebuild();

        assertThat(addedDuringRebuild.get()).isPositive();
        assertThat(jdbc.queryForList("""
                SELECT university_id
                FROM search_sync_jobs
                WHERE university_id IN (?, ?)
                ORDER BY university_id
                """, Long.class, removedDuringRebuild, addedDuringRebuild.get()))
                .containsExactlyInAnyOrder(removedDuringRebuild, addedDuringRebuild.get());
    }

    private SearchIndexRebuilder rebuilder(UniversitySearchProjectionLoader projectionLoader) {
        return new SearchIndexRebuilder(manager, projectionLoader, observedOperations, jdbc, properties,
                transactionManager);
    }

    private List<Long> seedPublicAndExcludedUniversities() {
        long category = jdbc.queryForObject("""
                INSERT INTO subject_categories (code, name_en, status)
                VALUES ('REBUILD_TEST', 'Rebuild test', 'PUBLISHED') RETURNING id
                """, Long.class);
        fixtureCategoryIds.add(category);
        List<Long> expected = new ArrayList<>();
        for (int i = 0; i < 8; i++) {
            String code = "REBUILD_" + i;
            long university = jdbc.queryForObject("""
                    INSERT INTO universities (name, slug, country, university_code, name_en, status)
                    VALUES (?, ?, 'Test country', ?, ?, ?) RETURNING id
                    """, Long.class, code, code.toLowerCase(), code, code, i == 5 ? "DRAFT" : "PUBLISHED");
            fixtureUniversityIds.add(university);
            if (i != 7) {
                jdbc.update("""
                        INSERT INTO programmes (university_id, subject_category_id, programme_code, slug, name_en, status)
                        VALUES (?, ?, ?, ?, ?, ?)
                        """, university, category, code, code.toLowerCase(), code, i == 6 ? "DRAFT" : "PUBLISHED");
            }
            if (i < 5) expected.add(university);
        }
        return expected;
    }

    private String oldIndex(long documentId) {
        String name = "task5-old-" + UUID.randomUUID();
        createdIndices.add(name);
        IndexOperations index = operations.indexOps(IndexCoordinates.of(name));
        index.create(index.createSettings(UniversityProgrammeSearchDocument.class),
                index.createMapping(UniversityProgrammeSearchDocument.class));
        operations.save(new UniversityProgrammeSearchDocument(documentId, "OLD", "old-" + documentId,
                null, "Old university", "MY", null, "Malaysia", null, null, false, List.of()), IndexCoordinates.of(name));
        index.refresh();
        return name;
    }

    private void assertOldAliasesAndSearch() {
        assertThat(operations.indexOps(UniversityProgrammeSearchDocument.class)
                .getAliases(SearchIndexNames.READ_ALIAS)).containsOnlyKeys(oldRead, otherRead);
        assertThat(operations.indexOps(UniversityProgrammeSearchDocument.class)
                .getAliases(SearchIndexNames.WRITE_ALIAS)).containsOnlyKeys(oldWrite);
        assertThat(operations.count(Query.findAll(), UniversityProgrammeSearchDocument.class,
                IndexCoordinates.of(SearchIndexNames.READ_ALIAS))).isEqualTo(2);
    }

    private void assertAliasesPointOnlyTo(String newIndex) {
        IndexOperations index = operations.indexOps(UniversityProgrammeSearchDocument.class);
        assertThat(index.getAliases(SearchIndexNames.READ_ALIAS)).containsOnlyKeys(newIndex);
        assertThat(index.getAliases(SearchIndexNames.WRITE_ALIAS)).containsOnlyKeys(newIndex);
        assertThat(index.getAliases(SearchIndexNames.WRITE_ALIAS).get(newIndex))
                .anySatisfy(alias -> assertThat(alias.isWriteIndex()).isTrue());
    }

    private void assertOldIndicesRemain() {
        for (String name : List.of(oldRead, otherRead, oldWrite)) {
            assertThat(operations.indexOps(IndexCoordinates.of(name)).exists()).isTrue();
            assertThat(operations.count(Query.findAll(), UniversityProgrammeSearchDocument.class,
                    IndexCoordinates.of(name))).isEqualTo(1);
        }
    }

    private AliasAction.Add add(String index, String alias, boolean write) {
        return new AliasAction.Add(AliasActionParameters.builder().withIndices(index).withAliases(alias)
                .withIsWriteIndex(write).build());
    }

    private AliasAction.Remove remove(String index, String alias) {
        return new AliasAction.Remove(AliasActionParameters.builder().withIndices(index).withAliases(alias).build());
    }
}
