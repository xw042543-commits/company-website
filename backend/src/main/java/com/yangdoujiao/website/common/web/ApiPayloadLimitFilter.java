package com.yangdoujiao.website.common.web;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.unit.DataSize;
import org.springframework.web.util.UriUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import com.yangdoujiao.website.common.api.ApiErrorResponse;

import tools.jackson.databind.ObjectMapper;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ReadListener;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletInputStream;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 10)
public class ApiPayloadLimitFilter extends OncePerRequestFilter {

    private static final String CONSULTATION_PATH = "/api/v1/consultations";
    private static final String AUTH_PATH = "/api/v1/auth/";
    private static final String ACCOUNT_PATH = "/api/v1/account";

    private final ObjectMapper objectMapper;
    private final int consultationBytes;
    private final int authBytes;

    public ApiPayloadLimitFilter(
            ObjectMapper objectMapper,
            @Value("${app.consultation.maximum-body-size:16KB}") DataSize consultationMaximumBodySize,
            @Value("${app.auth.maximum-body-size:8KB}") DataSize authMaximumBodySize
    ) {
        this.objectMapper = objectMapper;
        this.consultationBytes = validatedBytes(consultationMaximumBodySize);
        this.authBytes = validatedBytes(authMaximumBodySize);
    }

    private int validatedBytes(DataSize maximumBodySize) {
        long maximumBodyBytes = maximumBodySize == null ? 0 : maximumBodySize.toBytes();
        if (maximumBodyBytes <= 0 || maximumBodyBytes >= Integer.MAX_VALUE) {
            throw new IllegalArgumentException(
                    "Maximum body size must be between 1 byte and "
                            + (Integer.MAX_VALUE - 1) + " bytes"
            );
        }
        return Math.toIntExact(maximumBodyBytes);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return limitFor(request) == null;
    }

    private Limit limitFor(HttpServletRequest request) {
        String path = normalizedPath(request);
        if (path == null) {
            return null;
        }
        String method = request.getMethod();
        if ("POST".equals(method) && CONSULTATION_PATH.equals(path)) {
            return new Limit(consultationBytes, "CONSULTATION_PAYLOAD_TOO_LARGE",
                    "Consultation request body is too large");
        }
        if ("POST".equals(method) && path.startsWith(AUTH_PATH)) {
            return new Limit(authBytes, "AUTH_PAYLOAD_TOO_LARGE", "Authentication request body is too large");
        }
        if (("PUT".equals(method) || "DELETE".equals(method)) && path.startsWith(ACCOUNT_PATH)) {
            return new Limit(authBytes, "AUTH_PAYLOAD_TOO_LARGE", "Authentication request body is too large");
        }
        return null;
    }

    private String normalizedPath(HttpServletRequest request) {
        String requestUri = request.getRequestURI();
        String contextPath = request.getContextPath();
        if (!contextPath.isEmpty() && requestUri.startsWith(contextPath)) {
            requestUri = requestUri.substring(contextPath.length());
        }

        String decodedPath;
        try {
            decodedPath = UriUtils.decode(requestUri, StandardCharsets.UTF_8);
        } catch (IllegalArgumentException exception) {
            return null;
        }
        String pathWithoutMatrixParameters = Arrays.stream(decodedPath.split("/", -1))
                .map(segment -> {
                    int parameterStart = segment.indexOf(';');
                    return parameterStart < 0 ? segment : segment.substring(0, parameterStart);
                })
                .collect(Collectors.joining("/"));
        return pathWithoutMatrixParameters;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        Limit limit = limitFor(request);
        byte[] body = request.getInputStream().readNBytes(limit.bytes() + 1);
        if (body.length > limit.bytes()) {
            writePayloadTooLarge(response, request, limit);
            return;
        }

        filterChain.doFilter(new CachedBodyRequest(request, body), response);
    }

    private void writePayloadTooLarge(HttpServletResponse response, HttpServletRequest request, Limit limit)
            throws IOException {
        Object traceId = request.getAttribute(RequestTraceFilter.TRACE_ID_ATTRIBUTE);
        ApiErrorResponse error = new ApiErrorResponse(
                limit.code(),
                limit.message(),
                null,
                traceId == null ? "unavailable" : traceId.toString()
        );

        response.setStatus(HttpStatus.CONTENT_TOO_LARGE.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        objectMapper.writeValue(response.getOutputStream(), error);
    }

    private record Limit(int bytes, String code, String message) {}

    private static final class CachedBodyRequest extends HttpServletRequestWrapper {

        private final byte[] body;

        private CachedBodyRequest(HttpServletRequest request, byte[] body) {
            super(request);
            this.body = body;
        }

        @Override
        public ServletInputStream getInputStream() {
            ByteArrayInputStream input = new ByteArrayInputStream(body);
            return new ServletInputStream() {
                @Override
                public boolean isFinished() {
                    return input.available() == 0;
                }

                @Override
                public boolean isReady() {
                    return true;
                }

                @Override
                public void setReadListener(ReadListener readListener) {
                    if (!CachedBodyRequest.this.isAsyncStarted()) {
                        throw new IllegalStateException("Async processing has not started");
                    }
                    throw new UnsupportedOperationException("Async request-body reads are not supported");
                }

                @Override
                public int read() {
                    return input.read();
                }
            };
        }

        @Override
        public BufferedReader getReader() {
            String encoding = getCharacterEncoding();
            Charset charset = encoding == null ? StandardCharsets.UTF_8 : Charset.forName(encoding);
            return new BufferedReader(new InputStreamReader(getInputStream(), charset));
        }

        @Override
        public int getContentLength() {
            return body.length;
        }

        @Override
        public long getContentLengthLong() {
            return body.length;
        }
    }
}
