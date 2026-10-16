package com.yangdoujiao.website.community;

import java.net.URI;
import java.time.Clock;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

class CommunityImageReviewMediaControllerTest {
    static final String ID="a".repeat(32);
    static final CommunityImageReviewAccess ACCESS=new CommunityImageReviewAccess(
        "https://example.com","test-review-signature-secret-32-characters",Clock.systemUTC());

    @Test void legacySignedLinksRemainReadableDuringDeployment() throws Exception {
        var images=mock(CommunityImageAttachments.class);
        byte[] bytes={(byte)0xff,(byte)0xd8,(byte)0xff,(byte)0xd9};
        when(images.read(ID,false,null,true)).thenReturn(bytes);
        var mvc=MockMvcBuilders.standaloneSetup(new CommunityImageReviewMediaController(ACCESS,images))
            .setControllerAdvice(new com.yangdoujiao.website.common.exception.GlobalExceptionHandler()).build();
        String[] parts=URI.create(ACCESS.url(ID)).getPath().split("/");
        String legacy="/api/v1/community/image-review/media/"+ID;
        mvc.perform(get(legacy).param("expires",parts[7]).param("signature",parts[8].replace(".jpg","")))
            .andExpect(status().isOk()).andExpect(content().bytes(bytes));
        mvc.perform(head(legacy)).andExpect(status().isNotFound());
        mvc.perform(get(legacy).param("expires",parts[7]).param("signature","bad"))
            .andExpect(status().isNotFound());
    }

    @Test void signedJpegPathServesImageForGetAndHead() throws Exception {
        var images=mock(CommunityImageAttachments.class);
        byte[] bytes={(byte)0xff,(byte)0xd8,(byte)0xff,(byte)0xd9};
        when(images.read(ID,false,null,true)).thenReturn(bytes);
        var mvc=MockMvcBuilders.standaloneSetup(new CommunityImageReviewMediaController(ACCESS,images)).build();
        URI signed=URI.create(ACCESS.url(ID));

        mvc.perform(get(signed)).andExpect(status().isOk()).andExpect(content().contentType("image/jpeg"))
            .andExpect(header().string("Content-Length","4"))
            .andExpect(content().bytes(bytes));
        mvc.perform(head(signed)).andExpect(status().isOk()).andExpect(content().contentType("image/jpeg"))
            .andExpect(header().string("Content-Length","4"));
    }
}
