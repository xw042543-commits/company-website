package com.yangdoujiao.website.community;

import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.*;
import org.springframework.mock.http.client.MockClientHttpRequest;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;
import tools.jackson.databind.ObjectMapper;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.*;
import static org.springframework.test.web.client.response.MockRestResponseCreators.*;

class WechatDirectImageReviewGatewayTest {
    private final WechatAccessTokenProvider tokens=mock(WechatAccessTokenProvider.class);
    private final CommunityImageAttachments images=mock(CommunityImageAttachments.class);
    private MockRestServiceServer server;
    private WechatDirectImageReviewGateway gateway;
    private final String id="a".repeat(32);
    private final ch.qos.logback.classic.Logger logger=(ch.qos.logback.classic.Logger)org.slf4j.LoggerFactory.getLogger(WechatDirectImageReviewGateway.class);
    private final ch.qos.logback.core.read.ListAppender<ch.qos.logback.classic.spi.ILoggingEvent> events=new ch.qos.logback.core.read.ListAppender<>();
    @BeforeEach void setup() throws Exception {
        events.start();logger.addAppender(events);
        var builder=RestClient.builder();
        server=MockRestServiceServer.bindTo(builder).build();
        gateway=new WechatDirectImageReviewGateway(tokens,images,new ObjectMapper(),builder.build());
        when(tokens.accessToken()).thenReturn(Optional.of("fixture-token"));
        when(images.read(id,true,null,true)).thenReturn(new byte[]{(byte)0xff,(byte)0xd8,(byte)0xff,(byte)0xd9});
    }
    @org.junit.jupiter.api.AfterEach void detachLogs() {logger.detachAppender(events);events.stop();}
    @Test void uploadsImageBytesAndAcceptsOnlyExplicitPass() {
        server.expect(requestTo("https://api.weixin.qq.com/wxa/img_sec_check?access_token=fixture-token"))
            .andExpect(method(HttpMethod.POST))
            .andExpect(request->{
                assertTrue(request.getHeaders().getContentType().isCompatibleWith(MediaType.MULTIPART_FORM_DATA));
                String body=new String(((MockClientHttpRequest)request).getBodyAsBytes(),java.nio.charset.StandardCharsets.ISO_8859_1);
                assertTrue(body.contains("name=\"media\""));
                assertTrue(body.contains("filename=\"review.jpg\""));
                assertTrue(body.contains("image/jpeg"));
                assertTrue(body.contains("\u00ff\u00d8\u00ff\u00d9"));
            }).andRespond(withSuccess("{\"errcode\":0}",MediaType.APPLICATION_JSON));
        assertEquals(Optional.of("PASS"),gateway.check(id));
        server.verify();
    }
    @Test void rejectsRiskyContentAndNeverPassesUnknownCodes() {
        server.expect(requestTo("https://api.weixin.qq.com/wxa/img_sec_check?access_token=fixture-token"))
            .andRespond(withSuccess("{\"errcode\":87014}",MediaType.APPLICATION_JSON));
        server.expect(requestTo("https://api.weixin.qq.com/wxa/img_sec_check?access_token=fixture-token"))
            .andRespond(withSuccess("{\"errcode\":-1008}",MediaType.APPLICATION_JSON));
        assertEquals(Optional.of("REJECTED"),gateway.check(id));
        assertTrue(gateway.check(id).isEmpty());
        server.verify();
        String logs=events.list.stream().map(e->e.getFormattedMessage()).collect(java.util.stream.Collectors.joining("\n"));
        assertTrue(logs.contains("providerCode=-1008"));
        assertFalse(logs.contains("fixture-token"));
        assertFalse(logs.contains(id));
    }
    @Test void missingTokenOrInvalidImageNeverCallsWechat() throws Exception {
        when(tokens.accessToken()).thenReturn(Optional.empty());
        assertTrue(gateway.check(id).isEmpty());
        when(tokens.accessToken()).thenReturn(Optional.of("fixture-token"));
        when(images.read(id,true,null,true)).thenReturn(new byte[]{1,2,3});
        assertTrue(gateway.check(id).isEmpty());
        server.verify();
    }
    @Test void logsOnlySanitizedHttpFailure() {
        server.expect(requestTo("https://api.weixin.qq.com/wxa/img_sec_check?access_token=fixture-token"))
            .andRespond(withStatus(HttpStatus.FORBIDDEN));
        assertTrue(gateway.check(id).isEmpty());
        server.verify();
        String logs=events.list.stream().map(e->e.getFormattedMessage()).collect(java.util.stream.Collectors.joining("\n"));
        assertTrue(logs.contains("failureType=HttpStatus403"));
        assertFalse(logs.contains("fixture-token"));
        assertFalse(logs.contains(id));
    }
    @Test void logsOnlySanitizedInvalidResponseFailure() {
        server.expect(requestTo("https://api.weixin.qq.com/wxa/img_sec_check?access_token=fixture-token"))
            .andRespond(withSuccess("{}",MediaType.APPLICATION_JSON));
        assertTrue(gateway.check(id).isEmpty());
        server.verify();
        String logs=events.list.stream().map(e->e.getFormattedMessage()).collect(java.util.stream.Collectors.joining("\n"));
        assertTrue(logs.contains("failureType=InvalidProviderResponse"));
        assertFalse(logs.contains("fixture-token"));
        assertFalse(logs.contains(id));
    }
}
