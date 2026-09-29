package com.yangdoujiao.website.auth.wechat;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import com.yangdoujiao.website.auth.AuthHash;
import com.yangdoujiao.website.common.web.RequestTraceFilter;

import jakarta.servlet.http.HttpServletRequest;

@Component
public class WechatAuthAuditLogger {
    private static final Logger log = LoggerFactory.getLogger(WechatAuthAuditLogger.class);

    public void record(String event, String outcome, String subject, String clientAddress,
            HttpServletRequest request) {
        Object trace = request.getAttribute(RequestTraceFilter.TRACE_ID_ATTRIBUTE);
        log.info("wechatAuth event={} outcome={} traceId={} subjectHash={} addressHash={}",
                safe(event), safe(outcome), trace == null ? "unknown" : trace,
                hash(subject), hash(clientAddress));
    }

    private String hash(String value) {
        return AuthHash.sha256(value == null ? "unknown" : value);
    }

    private String safe(String value) {
        return value == null ? "unknown" : value.replaceAll("[^A-Za-z0-9_-]", "_");
    }
}
