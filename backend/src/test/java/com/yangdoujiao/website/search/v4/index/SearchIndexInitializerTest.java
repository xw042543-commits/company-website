package com.yangdoujiao.website.search.v4.index;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.test.system.CapturedOutput;
import org.springframework.boot.test.system.OutputCaptureExtension;

@ExtendWith({MockitoExtension.class, OutputCaptureExtension.class})
class SearchIndexInitializerTest {

    @Mock SearchIndexManager manager;
    @Mock SearchIndexRebuilder rebuilder;

    @ParameterizedTest
    @CsvSource({"true,true,0", "true,false,1", "false,true,1", "false,false,1"})
    void rebuildsExactlyOnceOnlyWhenEitherRequiredAliasIsMissing(boolean readExists, boolean writeExists,
            int rebuildCount) {
        when(manager.aliasExists(SearchIndexNames.READ_ALIAS)).thenReturn(readExists);
        when(manager.aliasExists(SearchIndexNames.WRITE_ALIAS)).thenReturn(writeExists);

        new SearchIndexInitializer(manager, rebuilder).run(null);

        verify(rebuilder, org.mockito.Mockito.times(rebuildCount)).rebuild();
    }

    @Test
    void rebuildFailurePreventsStartupAndLogsOnlySafeError(CapturedOutput output) {
        when(manager.aliasExists(SearchIndexNames.READ_ALIAS)).thenReturn(false);
        when(manager.aliasExists(SearchIndexNames.WRITE_ALIAS)).thenReturn(false);
        when(rebuilder.rebuild()).thenThrow(new IllegalStateException("password=secret-business-payload"));

        assertThatThrownBy(() -> new SearchIndexInitializer(manager, rebuilder).run(null))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("initialization failed").hasNoCause();

        verify(rebuilder).rebuild();
        assertThat(output.getAll()).contains("Search index initialization failed")
                .doesNotContain("secret-business-payload");
    }

    @Test
    void aliasLookupFailureAlsoPreventsStartupWithoutGuessingOrRebuilding(CapturedOutput output) {
        when(manager.aliasExists(SearchIndexNames.READ_ALIAS))
                .thenThrow(new IllegalStateException("https://user:secret-password@internal-host"));

        assertThatThrownBy(() -> new SearchIndexInitializer(manager, rebuilder).run(null))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("initialization failed").hasNoCause();

        verifyNoInteractions(rebuilder);
        assertThat(output.getAll()).contains("Search index initialization failed")
                .doesNotContain("secret-password", "internal-host");
    }
}
