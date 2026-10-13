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
    @BeforeEach void setup() {
        var builder=RestClient.builder();server=MockRestServiceServer.bindTo(builder).build();
        gateway=new WechatImageReviewGateway(tokens,identities,access,json,builder.build());
        when(tokens.accessToken()).thenReturn(Optional.of("fixture-token"));
        when(identities.findProviderSubjectByProviderAndUserAccountId(ExternalIdentityProvider.WECHAT_MINI_PROGRAM,42L)).thenReturn(Optional.of("fixture-openid"));
    }
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
    @Test void callbackRequiresExplicitSuccessAndKnownVerdict() {
        assertEquals("PASS",WechatImageReviewGateway.verdict(json.readTree("{\"errcode\":0,\"result\":{\"suggest\":\"pass\"}}")));
        assertEquals("REVIEW",WechatImageReviewGateway.verdict(json.readTree("{\"errcode\":-1008,\"result\":{\"suggest\":\"pass\"}}")));
        assertEquals("REVIEW",WechatImageReviewGateway.verdict(json.readTree("{\"result\":{\"suggest\":\"pass\"}}")));
        assertEquals("REJECTED",WechatImageReviewGateway.verdict(json.readTree("{\"errcode\":0,\"result\":{\"suggest\":\"risky\"}}")));
    }
}
