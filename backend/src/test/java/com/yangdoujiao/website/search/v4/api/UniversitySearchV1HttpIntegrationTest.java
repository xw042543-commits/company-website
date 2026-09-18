package com.yangdoujiao.website.search.v4.api;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.IndexOperations;
import org.springframework.data.elasticsearch.core.index.AliasAction;
import org.springframework.data.elasticsearch.core.index.AliasActionParameters;
import org.springframework.data.elasticsearch.core.index.AliasActions;
import org.springframework.data.elasticsearch.core.mapping.IndexCoordinates;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import com.yangdoujiao.website.TestContainersConfiguration;
import com.yangdoujiao.website.search.v4.document.ProgrammeSearchDocument;
import com.yangdoujiao.website.search.v4.document.UniversityProgrammeSearchDocument;
import com.yangdoujiao.website.search.v4.index.SearchIndexNames;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(TestContainersConfiguration.class)
class UniversitySearchV1HttpIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ElasticsearchOperations operations;
    private IndexCoordinates index;

    @BeforeEach
    void createSearchIndex() {
        index = IndexCoordinates.of("universities-v4-http-" + UUID.randomUUID());
        IndexOperations indexOps = operations.indexOps(index);
        indexOps.create(indexOps.createSettings(UniversityProgrammeSearchDocument.class),
                indexOps.createMapping(UniversityProgrammeSearchDocument.class));
        indexOps.alias(new AliasActions(new AliasAction.Add(AliasActionParameters.builder()
                .withIndices(index.getIndexName()).withAliases(SearchIndexNames.READ_ALIAS).build())));
        operations.save(new UniversityProgrammeSearchDocument(1L, "HTTP", "http", null, "HTTP University", "GB", null,
                "United Kingdom", null, null, false, List.of(new ProgrammeSearchDocument(1L, "HTTP-DS", null,
                "History", "HUMANITIES", "MASTER", "ONLINE", List.of("EN"), 12, List.of("2027-09"),
                null, null, "12 months", List.of("September 2027"), "Ask"))), index);
        indexOps.refresh();
    }

    @AfterEach
    void deleteOnlyTheCreatedIndex() {
        if (index != null) {
            operations.indexOps(index).delete();
        }
    }

    @Test
    void sendsSpecialCharacterKeywordsThroughTheRealHttpServiceAndElasticsearchPath() throws Exception {
        mockMvc.perform(get("/api/v1/universities/search").queryParam("q", "c++ (data) AND * : \\\""))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items").isEmpty())
                .andExpect(jsonPath("$.totalItems").value(0));
    }

    @Test
    void aggregatesInvalidNumericParametersOnTheActualHttpServicePath() throws Exception {
        mockMvc.perform(get("/api/v1/universities/search")
                        .queryParam("duration", "0")
                        .queryParam("page", "0")
                        .queryParam("size", "not-a-number"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.duration").value("must be a positive integer"))
                .andExpect(jsonPath("$.fieldErrors.page").value("must be greater than or equal to 1"))
                .andExpect(jsonPath("$.fieldErrors.size").value("must be a positive integer"));
    }
}
