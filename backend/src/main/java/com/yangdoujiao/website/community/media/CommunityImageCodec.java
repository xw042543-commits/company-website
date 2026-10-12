package com.yangdoujiao.website.community.media;

import java.awt.Color;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import javax.imageio.ImageIO;
import javax.imageio.stream.MemoryCacheImageInputStream;

/** Decodes bounded input and writes new pixels without copying source metadata. */
public final class CommunityImageCodec {
    public EncodedCommunityImage encode(byte[] input) {
        if (input == null || input.length == 0 || input.length > 5 * 1024 * 1024) {
            throw new IllegalArgumentException("Unsupported image size");
        }
        try (var stream = new MemoryCacheImageInputStream(new ByteArrayInputStream(input))) {
            var readers = ImageIO.getImageReaders(stream);
            if (!readers.hasNext()) throw new IllegalArgumentException("Unsupported image format");
            var reader = readers.next();
            try {
                String format = reader.getFormatName();
                if (!format.equalsIgnoreCase("JPEG") && !format.equalsIgnoreCase("PNG")) {
                    throw new IllegalArgumentException("Unsupported image format");
                }
                if (format.equalsIgnoreCase("PNG")) rejectPngAnimation(input);
                reader.setInput(stream);
                int width = reader.getWidth(0), height = reader.getHeight(0);
                if (width <= 0 || height <= 0 || (long) width * height > 20_000_000L) {
                    throw new IllegalArgumentException("Unsupported image dimensions");
                }
                if (reader.getNumImages(true) != 1) throw new IllegalArgumentException("Animated images unsupported");
                BufferedImage source = reader.read(0);
                BufferedImage display = resize(source, 1600);
                return new EncodedCommunityImage(jpeg(display), jpeg(resize(display, 480)),
                    display.getWidth(), display.getHeight());
            } finally {
                reader.dispose();
            }
        } catch (IOException e) {
            throw new IllegalArgumentException("Invalid image", e);
        }
    }

    private static void rejectPngAnimation(byte[] input) {
        int offset = 8;
        while (offset <= input.length - 12) {
            int length = java.nio.ByteBuffer.wrap(input, offset, 4).getInt();
            if (length < 0 || length > input.length - offset - 12) {
                throw new IllegalArgumentException("Invalid PNG chunk");
            }
            String type = new String(input, offset + 4, 4, java.nio.charset.StandardCharsets.US_ASCII);
            if (type.equals("acTL") || type.equals("fcTL") || type.equals("fdAT")) {
                throw new IllegalArgumentException("Animated images unsupported");
            }
            offset += length + 12;
            if (type.equals("IEND")) return;
        }
        throw new IllegalArgumentException("Incomplete PNG");
    }

    private static BufferedImage resize(BufferedImage source, int limit) {
        double ratio = Math.min(1d, (double) limit / Math.max(source.getWidth(), source.getHeight()));
        var target = new BufferedImage(Math.max(1, (int) Math.round(source.getWidth() * ratio)),
            Math.max(1, (int) Math.round(source.getHeight() * ratio)), BufferedImage.TYPE_INT_RGB);
        var graphics = target.createGraphics();
        try {
            graphics.setColor(Color.WHITE);
            graphics.fillRect(0, 0, target.getWidth(), target.getHeight());
            graphics.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC);
            graphics.drawImage(source, 0, 0, target.getWidth(), target.getHeight(), null);
        } finally { graphics.dispose(); }
        return target;
    }

    private static byte[] jpeg(BufferedImage image) throws IOException {
        var output = new ByteArrayOutputStream();
        if (!ImageIO.write(image, "JPEG", output)) throw new IOException("JPEG writer unavailable");
        return output.toByteArray();
    }
}
