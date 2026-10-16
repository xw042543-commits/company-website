package com.yangdoujiao.website.auth.account;

import com.yangdoujiao.website.common.exception.ApiException;
import java.io.ByteArrayInputStream;
import java.util.Base64;
import java.util.Locale;
import javax.imageio.ImageIO;
import javax.imageio.stream.MemoryCacheImageInputStream;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

/** Checks the decoded image, not the filename or a browser-supplied MIME alone. */
@Component
public class AvatarImageValidator {
    public static final int MAX_BYTES = 1_048_576;
    public record Image(String contentType, byte[] content) {}
    public Image validate(String encoded, String claimedType) {
        if (encoded != null && encoded.length() > 1_398_104) throw tooLarge();
        if (encoded == null || encoded.isBlank()) throw invalid();
        byte[] bytes;
        try { bytes = Base64.getDecoder().decode(encoded); }
        catch (IllegalArgumentException e) { throw invalid(); }
        if (bytes.length > MAX_BYTES) throw tooLarge();
        if (bytes.length == 0) throw invalid();
        try (var stream = new MemoryCacheImageInputStream(new ByteArrayInputStream(bytes))) {
            var readers = ImageIO.getImageReaders(stream);
            if (!readers.hasNext()) throw invalid();
            var reader = readers.next();
            try {
                String type = switch (reader.getFormatName().toLowerCase(Locale.ROOT)) {
                    case "jpeg", "jpg" -> "image/jpeg";
                    case "png" -> "image/png";
                    case "webp" -> "image/webp";
                    default -> throw invalid();
                };
                if (claimedType == null || !type.equals(claimedType.toLowerCase(Locale.ROOT))) throw invalid();
                reader.setInput(stream, true, true);
                int width = reader.getWidth(0), height = reader.getHeight(0);
                if (width < 1 || height < 1 || width > 8192 || height > 8192 || (long)width * height > 32_000_000)
                    throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_AVATAR", "图片分辨率过大，请先裁剪后上传");
                if (reader.read(0) == null) throw invalid();
                return new Image(type, bytes);
            } finally { reader.dispose(); }
        } catch (ApiException e) { throw e; }
        catch (java.io.IOException | RuntimeException e) { throw invalid(); }
    }
    private static ApiException tooLarge() { return new ApiException(HttpStatus.BAD_REQUEST, "AVATAR_TOO_LARGE", "头像大小不能超过1MB"); }
    private static ApiException invalid() { return new ApiException(HttpStatus.BAD_REQUEST, "INVALID_AVATAR", "请选择真实有效的JPG、PNG或WebP图片"); }
}
