package com.yangdoujiao.website.auth.api;

import java.io.IOException;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.csrf.CsrfException;
import org.springframework.stereotype.Component;

import com.yangdoujiao.website.common.api.ApiErrorResponse;
import com.yangdoujiao.website.common.web.RequestTraceFilter;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import tools.jackson.databind.ObjectMapper;

@Component
public class AuthSecurityErrorWriter {
    private final ObjectMapper objectMapper;

    public AuthSecurityErrorWriter(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public void writeUnauthorized(HttpServletRequest request, HttpServletResponse response) throws IOException {
        write(request, response, HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Authentication is required");
    }

    public void writeForbidden(HttpServletRequest request, HttpServletResponse response) throws IOException {
        write(request, response, HttpStatus.FORBIDDEN, "FORBIDDEN", "Access is denied");
    }

    public void writeAccessDenied(HttpServletRequest request, HttpServletResponse response,
            AccessDeniedException exception) throws IOException {
        if (exception instanceof CsrfException) {
            write(request, response, HttpStatus.FORBIDDEN, "CSRF_REJECTED", "CSRF token is missing or invalid");
        } else {
            writeForbidden(request, response);
        }
    }

    private void write(HttpServletRequest request, HttpServletResponse response,
            HttpStatus status, String code, String message) throws IOException {
        Object trace = request.getAttribute(RequestTraceFilter.TRACE_ID_ATTRIBUTE);
        String traceId = trace == null ? "unavailable" : trace.toString();
        if (trace != null) {
            response.setHeader(RequestTraceFilter.TRACE_ID_HEADER, traceId);
        }
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        objectMapper.writeValue(response.getOutputStream(), new ApiErrorResponse(code, message, null, traceId));
    }
}
