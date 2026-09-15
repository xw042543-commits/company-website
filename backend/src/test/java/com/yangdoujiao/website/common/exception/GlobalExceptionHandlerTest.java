package com.yangdoujiao.website.common.exception;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;

import com.yangdoujiao.website.common.api.ApiErrorResponse;
import com.yangdoujiao.website.common.web.RequestTraceFilter;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void mapsTypedExceptionWithoutExposingInternalDetails() {
        ResponseEntity<ApiErrorResponse> response = handler.handleApiException(
                new ResourceNotFoundException("University not found"),
                requestWithTraceId()
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody()).isEqualTo(new ApiErrorResponse(
                "RESOURCE_NOT_FOUND",
                "University not found",
                Map.of(),
                "test-trace"
        ));
    }

    @Test
    void mapsUnexpectedExceptionToSafeMessage() {
        ResponseEntity<ApiErrorResponse> response = handler.handleUnexpected(
                new IllegalStateException("database password must not escape"),
                requestWithTraceId()
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().code()).isEqualTo("INTERNAL_ERROR");
        assertThat(response.getBody().message()).isEqualTo("An unexpected error occurred");
        assertThat(response.getBody().toString()).doesNotContain("database password");
    }

    @Test
    void mapsBodyValidationErrorsByFieldName() {
        MethodArgumentNotValidException exception = mock(MethodArgumentNotValidException.class);
        BindingResult bindingResult = mock(BindingResult.class);
        when(exception.getBindingResult()).thenReturn(bindingResult);
        when(bindingResult.getFieldErrors()).thenReturn(List.of(
                new FieldError("universityRequest", "name", "must not be blank")
        ));

        ResponseEntity<ApiErrorResponse> response = handler.handleBodyValidation(
                exception,
                requestWithTraceId()
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().code()).isEqualTo("VALIDATION_ERROR");
        assertThat(response.getBody().fieldErrors())
                .containsEntry("name", "must not be blank");
        assertThat(response.getBody().traceId()).isEqualTo("test-trace");
    }

    private MockHttpServletRequest requestWithTraceId() {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/test");
        request.setAttribute(RequestTraceFilter.TRACE_ID_ATTRIBUTE, "test-trace");
        return request;
    }
}
