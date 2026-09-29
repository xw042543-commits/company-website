package com.yangdoujiao.website.common.web;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.fail;

import java.nio.charset.StandardCharsets;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.util.unit.DataSize;

import tools.jackson.databind.ObjectMapper;

class ApiPayloadLimitFilterTest {

    private final ApiPayloadLimitFilter filter = new ApiPayloadLimitFilter(
            new ObjectMapper(), DataSize.ofKilobytes(16), DataSize.ofKilobytes(8));

    @Test
    void rejectsAuthenticationPayloadAboveEightKilobytes() throws Exception {
        MockHttpServletRequest request = request("POST", "/api/v1/auth/register", 8_193);
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, (ignoredRequest, ignoredResponse) -> fail("must stop"));

        assertThat(response.getStatus()).isEqualTo(413);
        assertThat(response.getContentAsString()).contains("AUTH_PAYLOAD_TOO_LARGE");
    }

    @Test
    void limitsEncodedMatrixAndContextPathVariantsOfAuthenticationRoutes() throws Exception {
        assertAuthenticationRouteLimited("", "/api/v1/%61uth/register");
        assertAuthenticationRouteLimited("", "/api/v1/auth;source=web/register");
        assertAuthenticationRouteLimited("/backend", "/backend/api/v1/auth/register");
    }

    @Test
    void limitsAccountWritesAndPreservesTraceId() throws Exception {
        for (String method : new String[] {"PUT", "DELETE"}) {
            MockHttpServletRequest request = request(method, "/api/v1/account/profile", 8_193);
            request.setAttribute(RequestTraceFilter.TRACE_ID_ATTRIBUTE, "test-trace");
            MockHttpServletResponse response = new MockHttpServletResponse();

            filter.doFilter(request, response, (ignoredRequest, ignoredResponse) -> fail("must stop"));

            assertThat(response.getStatus()).isEqualTo(413);
            assertThat(response.getContentAsString())
                    .contains("AUTH_PAYLOAD_TOO_LARGE")
                    .contains("test-trace");
        }
    }

    @Test
    void acceptsAuthBodyAtLimitAndKeepsItsBytesAvailable() throws Exception {
        MockHttpServletRequest request = request("POST", "/api/v1/auth/login", 8_192);
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, (wrappedRequest, ignoredResponse) -> {
            assertThat(wrappedRequest.getInputStream().readAllBytes()).hasSize(8_192);
            assertThat(wrappedRequest.getInputStream().readAllBytes()).hasSize(8_192);
        });

        assertThat(response.getStatus()).isEqualTo(200);
    }

    @Test
    void retainsSixteenKilobyteConsultationLimit() throws Exception {
        MockHttpServletRequest request = request("POST", "/api/v1/consultations", 16_385);
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, (ignoredRequest, ignoredResponse) -> fail("must stop"));

        assertThat(response.getStatus()).isEqualTo(413);
        assertThat(response.getContentAsString()).contains("CONSULTATION_PAYLOAD_TOO_LARGE");
    }

    private MockHttpServletRequest request(String method, String path, int bodySize) {
        MockHttpServletRequest request = new MockHttpServletRequest(method, path);
        request.setContentType(MediaType.APPLICATION_JSON_VALUE);
        request.setContent("x".repeat(bodySize).getBytes(StandardCharsets.UTF_8));
        return request;
    }

    private void assertAuthenticationRouteLimited(String contextPath, String requestUri) throws Exception {
        MockHttpServletRequest request = request("POST", requestUri, 8_193);
        request.setContextPath(contextPath);
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, (ignoredRequest, ignoredResponse) -> fail("must stop"));

        assertThat(response.getStatus()).isEqualTo(413);
        assertThat(response.getContentAsString()).contains("AUTH_PAYLOAD_TOO_LARGE");
    }
}
