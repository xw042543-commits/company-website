package com.yangdoujiao.website.auth.config;

import java.io.IOException;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.Arrays;
import java.util.Enumeration;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.yangdoujiao.website.common.api.ApiErrorResponse;
import com.yangdoujiao.website.common.web.RequestTraceFilter;
import com.yangdoujiao.website.common.web.TrustedProxySettings;

import jakarta.servlet.DispatcherType;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;
import tools.jackson.databind.ObjectMapper;

@Component
@Profile("prod")
@Order(Ordered.HIGHEST_PRECEDENCE + 1)
public class ProductionHttpsFilter extends OncePerRequestFilter {
    private final ObjectMapper objectMapper;
    private final Set<InetAddress> trustedProxies;

    @Autowired
    public ProductionHttpsFilter(ObjectMapper objectMapper, TrustedProxySettings settings) {
        this(objectMapper, settings.addresses());
    }

    public ProductionHttpsFilter(ObjectMapper objectMapper, String[] trustedProxies) {
        this.objectMapper = objectMapper;
        this.trustedProxies = Arrays.stream(trustedProxies)
                .map(String::trim)
                .filter(value -> !value.isEmpty())
                .map(ProductionHttpsFilter::literalAddress)
                .collect(Collectors.toUnmodifiableSet());
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return request.getDispatcherType() != DispatcherType.REQUEST;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
            FilterChain chain) throws ServletException, IOException {
        HttpServletRequest secureRequest = secureRequestOrNull(request);
        if (secureRequest != null) {
            chain.doFilter(secureRequest, response);
            return;
        }
        Object trace = request.getAttribute(RequestTraceFilter.TRACE_ID_ATTRIBUTE);
        String traceId = trace == null ? "unavailable" : trace.toString();
        response.setStatus(HttpStatus.FORBIDDEN.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        objectMapper.writeValue(response.getOutputStream(),
                new ApiErrorResponse("HTTPS_REQUIRED", "HTTPS is required", null, traceId));
    }

    private HttpServletRequest secureRequestOrNull(HttpServletRequest request) {
        if (request.isSecure()) return request;
        InetAddress peer = literalAddressOrNull(request.getRemoteAddr());
        if (peer != null && trustedProxies.contains(peer)) {
            // The edge proxy must remove client-supplied Forwarded and overwrite X-Forwarded-Proto.
            if (request.getHeader("Forwarded") != null) return null;
            Enumeration<String> protocols = request.getHeaders("X-Forwarded-Proto");
            if (protocols == null || !protocols.hasMoreElements()) return null;
            String protocol = protocols.nextElement();
            if (!"https".equals(protocol) || protocols.hasMoreElements()) return null;
            return new HttpServletRequestWrapper(request) {
                @Override public boolean isSecure() { return true; }
                @Override public String getScheme() { return "https"; }
                @Override public int getServerPort() { return 443; }
            };
        }
        return null;
    }

    private static InetAddress literalAddress(String value) {
        InetAddress address = literalAddressOrNull(value);
        if (address == null) throw new IllegalArgumentException("Trusted proxy must be a literal IP address");
        return address;
    }

    private static InetAddress literalAddressOrNull(String value) {
        if (value == null) return null;
        if (value.contains(":")) {
            if (!value.matches("[0-9A-Fa-f:.]+")) return null;
        } else {
            String[] octets = value.split("\\.", -1);
            if (octets.length != 4) return null;
            for (String octet : octets) {
                if (!octet.matches("0|[1-9][0-9]{0,2}") || Integer.parseInt(octet) > 255) return null;
            }
        }
        try {
            return InetAddress.getByName(value);
        } catch (UnknownHostException exception) {
            return null;
        }
    }
}
