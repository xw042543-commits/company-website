package com.yangdoujiao.website.auth.account;

import static org.assertj.core.api.Assertions.*;
import com.yangdoujiao.website.common.exception.ApiException;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.util.*;
import javax.imageio.ImageIO;
import org.junit.jupiter.api.Test;

class AvatarImageValidatorTest {
    private final AvatarImageValidator validator = new AvatarImageValidator();
    static final String WEBP = "UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEAAUAmJaQAA3AA/v89WAAAAA==";
    static byte[] image(String type) throws Exception {
        var out = new ByteArrayOutputStream();
        ImageIO.write(new BufferedImage(3, 3, BufferedImage.TYPE_INT_RGB), type, out);
        return out.toByteArray();
    }
    @Test void decodesJpegPngAndWebp() throws Exception {
        for (String type : List.of("jpeg", "png")) {
            byte[] image = image(type);
            assertThat(validator.validate(Base64.getEncoder().encodeToString(image), "image/" + type).content()).isEqualTo(image);
        }
        assertThat(validator.validate(WEBP, "image/webp").contentType()).isEqualTo("image/webp");
    }
    @Test void acceptsExactlyOneMegabyteAndRejectsOneByteOver() throws Exception {
        byte[] bytes = Arrays.copyOf(image("png"), AvatarImageValidator.MAX_BYTES);
        assertThat(validator.validate(Base64.getEncoder().encodeToString(bytes), "image/png").content()).hasSize(1_048_576);
        assertThatThrownBy(() -> validator.validate(Base64.getEncoder().encodeToString(Arrays.copyOf(bytes, bytes.length + 1)), "image/png"))
            .isInstanceOf(ApiException.class).hasMessage("头像大小不能超过1MB");
    }
    @Test void rejectsDisguisedTruncatedSvgGifAndMismatchedTypes() throws Exception {
        for (byte[] content : List.of("<svg xmlns='http://www.w3.org/2000/svg'/>".getBytes(), "<html>not an image</html>".getBytes(), new byte[]{(byte)137,80,78,71,13,10,26,10,1}, image("gif")))
            assertThatThrownBy(() -> validator.validate(Base64.getEncoder().encodeToString(content), "image/png")).isInstanceOf(ApiException.class);
        assertThatThrownBy(() -> validator.validate(Base64.getEncoder().encodeToString(image("png")), "image/jpeg")).isInstanceOf(ApiException.class);
        assertThatThrownBy(() -> validator.validate("not-base64", "image/png")).isInstanceOf(ApiException.class);
    }
}
