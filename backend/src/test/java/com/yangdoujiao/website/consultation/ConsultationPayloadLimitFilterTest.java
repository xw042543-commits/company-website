package com.yangdoujiao.website.consultation;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;

import java.nio.charset.StandardCharsets;

import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.util.unit.DataSize;

import tools.jackson.databind.ObjectMapper;

class ConsultationPayloadLimitFilterTest {

    @Test
    void limitsEncodedMatrixAndContextPathVariantsOfTheConsultationRoute() throws Exception {
        ConsultationPayloadLimitFilter filter = new ConsultationPayloadLimitFilter(
                mock(ObjectMapper.class),
                DataSize.ofBytes(4)
        );

        assertLimited(filter, "", "/api/v1/%63onsultations");
        assertLimited(filter, "", "/api/v1/consultations;source=web");
        assertLimited(filter, "", "/api;source=web/v1/consultations");
        assertLimited(filter, "", "/api/v1;source=web/consultations");
        assertLimited(filter, "/backend", "/backend/api/v1/consultations");
    }

    @Test
    void rejectsBodyLimitThatCannotBeAppliedSafely() {
        ObjectMapper objectMapper = mock(ObjectMapper.class);

        assertThatThrownBy(() -> new ConsultationPayloadLimitFilter(objectMapper, DataSize.ofBytes(0)))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("body size");
        assertThatThrownBy(() -> new ConsultationPayloadLimitFilter(
                objectMapper,
                DataSize.ofBytes(Integer.MAX_VALUE)
        ))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("body size");
    }

    private void assertLimited(
            ConsultationPayloadLimitFilter filter,
            String contextPath,
            String requestUri
    ) throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", requestUri);
        request.setContextPath(contextPath);
        request.setContent("12345".getBytes(StandardCharsets.UTF_8));
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);

        filter.doFilter(request, response, chain);

        verifyNoInteractions(chain);
        org.assertj.core.api.Assertions.assertThat(response.getStatus()).isEqualTo(413);
    }
}
