package com.yangdoujiao.website.consultation;

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
import com.yangdoujiao.website.common.web.RequestTraceFilter;

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
public class ConsultationPayloadLimitFilter extends OncePerRequestFilter {

    private static final String CONSULTATION_PATH = "/api/v1/consultations";

    private final ObjectMapper objectMapper;
    private final int maximumBodyBytes;

    public ConsultationPayloadLimitFilter(
            ObjectMapper objectMapper,
            @Value("${app.consultation.maximum-body-size:16KB}") DataSize maximumBodySize
    ) {
        long maximumBodyBytes = maximumBodySize == null ? 0 : maximumBodySize.toBytes();
        if (maximumBodyBytes <= 0 || maximumBodyBytes >= Integer.MAX_VALUE) {
            throw new IllegalArgumentException(
                    "Consultation maximum body size must be between 1 byte and "
                            + (Integer.MAX_VALUE - 1) + " bytes"
            );
        }
        this.objectMapper = objectMapper;
        this.maximumBodyBytes = Math.toIntExact(maximumBodyBytes);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !"POST".equals(request.getMethod()) || !isConsultationPath(request);
    }

    private boolean isConsultationPath(HttpServletRequest request) {
        String requestUri = request.getRequestURI();
        String contextPath = request.getContextPath();
        if (!contextPath.isEmpty() && requestUri.startsWith(contextPath)) {
            requestUri = requestUri.substring(contextPath.length());
        }

        String decodedPath;
        try {
            decodedPath = UriUtils.decode(requestUri, StandardCharsets.UTF_8);
        } catch (IllegalArgumentException exception) {
            return false;
        }
        String pathWithoutMatrixParameters = Arrays.stream(decodedPath.split("/", -1))
                .map(segment -> {
                    int parameterStart = segment.indexOf(';');
                    return parameterStart < 0 ? segment : segment.substring(0, parameterStart);
                })
                .collect(Collectors.joining("/"));
        return CONSULTATION_PATH.equals(pathWithoutMatrixParameters);
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        byte[] body = request.getInputStream().readNBytes(maximumBodyBytes + 1);
        if (body.length > maximumBodyBytes) {
            writePayloadTooLarge(response, request);
            return;
        }

        filterChain.doFilter(new CachedBodyRequest(request, body), response);
    }

    private void writePayloadTooLarge(HttpServletResponse response, HttpServletRequest request) throws IOException {
        Object traceId = request.getAttribute(RequestTraceFilter.TRACE_ID_ATTRIBUTE);
        ApiErrorResponse error = new ApiErrorResponse(
                "CONSULTATION_PAYLOAD_TOO_LARGE",
                "Consultation request body is too large",
                null,
                traceId == null ? "unavailable" : traceId.toString()
        );

        response.setStatus(HttpStatus.CONTENT_TOO_LARGE.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        objectMapper.writeValue(response.getOutputStream(), error);
    }

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
