package com.yangdoujiao.website.community;

import com.yangdoujiao.website.TestContainersConfiguration;
import java.net.URI;
import java.time.Clock;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import({TestContainersConfiguration.class,CommunityImageReviewMediaHttpIntegrationTest.MediaConfiguration.class})
class CommunityImageReviewMediaHttpIntegrationTest {
    @Autowired MockMvc mvc;
    @MockitoBean CommunityImageAttachments images;
    static final String ID="a".repeat(32);
    static final CommunityImageReviewAccess ACCESS=new CommunityImageReviewAccess(
        "https://example.com","test-review-signature-secret-32-characters",Clock.systemUTC());

    @TestConfiguration
    static class MediaConfiguration {
        @Bean CommunityImageReviewMediaController reviewMedia(CommunityImageAttachments images) {
            return new CommunityImageReviewMediaController(ACCESS,images);
        }
    }

    @Test void validSignatureAllowsAnonymousHeadAndGetWithoutOpeningUnsignedReads() throws Exception {
        byte[] bytes={(byte)0xff,(byte)0xd8,(byte)0xff,(byte)0xd9};
        when(images.read(ID,false,null,true)).thenReturn(bytes);
        URI signed=URI.create(ACCESS.url(ID));
        mvc.perform(get(signed)).andExpect(status().isOk()).andExpect(content().contentType("image/jpeg"))
            .andExpect(content().bytes(bytes));
        mvc.perform(head(signed)).andExpect(status().isOk()).andExpect(content().contentType("image/jpeg"));
        clearInvocations(images);
        String value=signed.toString();
        int signatureEnd=value.length()-".jpg".length();
        char replacement=value.charAt(signatureEnd-1)=='0'?'1':'0';
        URI invalid=URI.create(value.substring(0,signatureEnd-1)+replacement+value.substring(signatureEnd));
        mvc.perform(head(invalid)).andExpect(status().isNotFound());
        mvc.perform(get(invalid)).andExpect(status().isNotFound());
        mvc.perform(head("/api/v1/community/image-review/media/"+ID)).andExpect(status().isNotFound());
        mvc.perform(post(signed)).andExpect(status().isForbidden());
        verifyNoInteractions(images);
    }
}
