package com.yangdoujiao.website.community;

import com.yangdoujiao.website.auth.external.*;
import java.time.*;
import java.util.Optional;
import org.junit.jupiter.api.*;
import org.springframework.http.*;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;
import tools.jackson.databind.ObjectMapper;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.*;
import static org.springframework.test.web.client.response.MockRestResponseCreators.*;

class WechatImageReviewGatewayTest {
    final ObjectMapper json=new ObjectMapper();
    final WechatAccessTokenProvider tokens=mock(WechatAccessTokenProvider.class);
    final UserExternalIdentityRepository identities=mock(UserExternalIdentityRepository.class);
    final CommunityImageReviewAccess access=new CommunityImageReviewAccess("https://example.com","fixture-secret-at-least-32-characters",Clock.systemUTC());
    MockRestServiceServer server;
    WechatImageReviewGateway gateway;
    final ch.qos.logback.classic.Logger logger=(ch.qos.logback.classic.Logger)org.slf4j.LoggerFactory.getLogger(WechatImageReviewGateway.class);
    final ch.qos.logback.core.read.ListAppender<ch.qos.logback.classic.spi.ILoggingEvent> events=new ch.qos.logback.core.read.ListAppender<>();
    @BeforeEach void setup() {
        events.start();logger.addAppender(events);
        var builder=RestClient.builder();server=MockRestServiceServer.bindTo(builder).build();
        gateway=new WechatImageReviewGateway(tokens,identities,access,json,builder.build());
        when(tokens.accessToken()).thenReturn(Optional.of("fixture-token"));
        when(identities.findProviderSubjectByProviderAndUserAccountId(ExternalIdentityProvider.WECHAT_MINI_PROGRAM,42L)).thenReturn(Optional.of("fixture-openid"));
    }
    @AfterEach void detachLogs() {logger.detachAppender(events);events.stop();}
    @Test void submitsImageForForumReviewAndReturnsTraceNotPass() {
        server.expect(requestTo("https://api.weixin.qq.com/wxa/media_check_async?access_token=fixture-token"))
            .andExpect(method(HttpMethod.POST)).andExpect(header("Content-Type","application/json"))
            .andExpect(content().json("{\"media_type\":2,\"version\":2,\"scene\":3,\"openid\":\"fixture-openid\"}"))
            .andExpect(request -> {
                var body=json.readTree(((org.springframework.mock.http.client.MockClientHttpRequest)request).getBodyAsBytes());
                var media=java.net.URI.create(body.path("media_url").asText());
                assertEquals("https",media.getScheme());
                assertEquals("example.com",media.getHost());
                assertNull(media.getQuery());
                String[] parts=media.getPath().split("/");
                assertEquals("a".repeat(32),parts[6]);
                assertTrue(parts[8].endsWith(".jpg"));
                assertTrue(access.verify(parts[6],Long.parseLong(parts[7]),parts[8].replace(".jpg","")));
            })
            .andRespond(withSuccess("{\"errcode\":0,\"trace_id\":\"trace-fixture\"}",MediaType.APPLICATION_JSON));
        assertEquals(Optional.of("trace-fixture"),gateway.submit(42L,"a".repeat(32)));server.verify();
    }
    @Test void providerErrorsNeverBecomeSuccessfulSubmissions() {
        server.expect(requestTo("https://api.weixin.qq.com/wxa/media_check_async?access_token=fixture-token"))
            .andRespond(withSuccess("{\"errcode\":61010,\"trace_id\":\"not-accepted\"}",MediaType.APPLICATION_JSON));
        assertTrue(gateway.submit(42L,"a".repeat(32)).isEmpty());server.verify();
    }
    @Test void diagnosticsProbeExactlyTheSubmittedUrlWithoutCredentials() {
        var builder=RestClient.builder();
        server=MockRestServiceServer.bindTo(builder).build();
        gateway=new WechatImageReviewGateway(tokens,identities,access,json,builder.build(),true);
        var probed=new java.util.concurrent.atomic.AtomicReference<String>();
        server.expect(request -> {
            assertEquals(HttpMethod.GET,request.getMethod());
            assertNull(request.getHeaders().getFirst("Authorization"));
            assertNull(request.getURI().getQuery());
            probed.set(request.getURI().toString());
        }).andRespond(withSuccess(new byte[]{(byte)0xff,(byte)0xd8,(byte)0xff},MediaType.IMAGE_JPEG));
        server.expect(requestTo("https://api.weixin.qq.com/wxa/media_check_async?access_token=fixture-token"))
            .andExpect(request -> {
                var body=json.readTree(((org.springframework.mock.http.client.MockClientHttpRequest)request).getBodyAsBytes());
                assertEquals(probed.get(),body.path("media_url").asText());
            }).andRespond(withSuccess("{\"errcode\":0,\"trace_id\":\"trace-fixture\"}",MediaType.APPLICATION_JSON));
        assertEquals(Optional.of("trace-fixture"),gateway.submit(42L,"a".repeat(32)));
        server.verify();
        String logs=events.list.stream().map(e->e.getFormattedMessage()).collect(java.util.stream.Collectors.joining("\n"));
        assertTrue(logs.contains("urlValid=true httpStatus=200 jpegType=true jpegPrefix=true"));
        assertFalse(logs.contains(probed.get()));
        assertFalse(logs.contains("fixture-token"));
        assertFalse(logs.contains("fixture-openid"));
        assertFalse(logs.contains("trace-fixture"));
    }
    @Test void diagnosticDownloadFailureDoesNotPreventProviderSubmission() {
        var builder=RestClient.builder();
        server=MockRestServiceServer.bindTo(builder).build();
        gateway=new WechatImageReviewGateway(tokens,identities,access,json,builder.build(),true);
        server.expect(method(HttpMethod.GET)).andRespond(withException(new java.io.IOException("sensitive-signed-url")));
        server.expect(method(HttpMethod.POST))
            .andRespond(withSuccess("{\"errcode\":0,\"trace_id\":\"trace-fixture\"}",MediaType.APPLICATION_JSON));
        assertEquals(Optional.of("trace-fixture"),gateway.submit(42L,"a".repeat(32)));
        server.verify();
        assertTrue(events.list.stream().anyMatch(e->e.getFormattedMessage().contains("failureType=ResourceAccessException")));
        assertTrue(events.list.stream().allMatch(e->!e.getFormattedMessage().contains("sensitive-signed-url")&&e.getThrowableProxy()==null));
    }
    @Test void callbackRequiresExplicitSuccessAndKnownVerdict() {
        assertEquals("PASS",WechatImageReviewGateway.verdict(json.readTree("{\"errcode\":0,\"result\":{\"suggest\":\"pass\"}}")));
        assertEquals("REVIEW",WechatImageReviewGateway.verdict(json.readTree("{\"errcode\":-1008,\"result\":{\"suggest\":\"pass\"}}")));
        assertEquals("REVIEW",WechatImageReviewGateway.verdict(json.readTree("{\"result\":{\"suggest\":\"pass\"}}")));
        assertEquals("REJECTED",WechatImageReviewGateway.verdict(json.readTree("{\"errcode\":0,\"result\":{\"suggest\":\"risky\"}}")));
    }
}
