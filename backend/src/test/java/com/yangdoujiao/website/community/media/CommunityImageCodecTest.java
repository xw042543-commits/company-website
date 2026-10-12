package com.yangdoujiao.website.community.media;

import java.awt.image.BufferedImage;
import java.io.*;
import javax.imageio.ImageIO;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class CommunityImageCodecTest {
    @Test void rejectsTruncatedJpegInsteadOfPublishingRecoveredPixels() throws Exception {
        byte[] jpeg = fixture("jpg", 100, 100);
        byte[] truncated = java.util.Arrays.copyOf(jpeg, jpeg.length - 2);
        assertThrows(IllegalArgumentException.class, () -> new CommunityImageCodec().encode(truncated));
    }
    @Test void acceptsExactPixelLimit() throws Exception {
        var result = new CommunityImageCodec().encode(fixture("png", 5000, 4000));
        assertEquals(1600, result.width());
        assertEquals(1280, result.height());
    }
    @Test void removesSourceExifFromBothOutputs() throws Exception {
        byte[] jpeg = fixture("jpg", 20, 10);
        var output = new ByteArrayOutputStream();
        var data = new DataOutputStream(output);
        data.write(jpeg, 0, 2);
        byte[] exif = new byte[]{'E','x','i','f',0,0,'I','I',42,0,8,0,0,0,0,0,0,0,0,0};
        data.writeShort(0xffe1);
        data.writeShort(exif.length + 2);
        data.write(exif);
        data.write(jpeg, 2, jpeg.length - 2);
        var result = new CommunityImageCodec().encode(output.toByteArray());
        for (byte[] bytes : new byte[][]{result.display(), result.thumbnail()}) {
            assertFalse(new String(bytes, java.nio.charset.StandardCharsets.ISO_8859_1).contains("Exif"));
            assertNotNull(ImageIO.read(new ByteArrayInputStream(bytes)));
        }
    }
    @Test void rejectsInvalidInput() {
        var codec = new CommunityImageCodec();
        for (byte[] input : new byte[][] {new byte[0], new byte[5 * 1024 * 1024 + 1], "<svg/>".getBytes(), {1, 2, 3}}) {
            assertThrows(IllegalArgumentException.class, () -> codec.encode(input));
        }
    }
    @Test void rejectsGif() throws Exception {
        assertThrows(IllegalArgumentException.class, () -> new CommunityImageCodec().encode(fixture("gif", 10, 10)));
    }
    @Test void rejectsAnimatedPngEvenWhenReaderOnlySeesFirstFrame() throws Exception {
        byte[] png = fixture("png", 10, 10);
        var output = new ByteArrayOutputStream();
        output.write(png, 0, 33);
        var chunk = java.nio.ByteBuffer.allocate(12).put("acTL".getBytes(java.nio.charset.StandardCharsets.US_ASCII))
            .putInt(2).putInt(0).array();
        var crc = new java.util.zip.CRC32();
        crc.update(chunk);
        var data = new DataOutputStream(output);
        data.writeInt(8);
        data.write(chunk);
        data.writeInt((int) crc.getValue());
        output.write(png, 33, png.length - 33);
        assertThrows(IllegalArgumentException.class, () -> new CommunityImageCodec().encode(output.toByteArray()));
    }
    @Test void boundsBothVariantsWithoutStretching() throws Exception {
        var result = new CommunityImageCodec().encode(fixture("png", 2000, 1000));
        assertEquals(1600, result.width());
        assertEquals(800, result.height());
        var display = ImageIO.read(new ByteArrayInputStream(result.display()));
        var thumbnail = ImageIO.read(new ByteArrayInputStream(result.thumbnail()));
        assertEquals(1600, display.getWidth());
        assertEquals(480, thumbnail.getWidth());
        assertEquals(240, thumbnail.getHeight());
        assertFalse(display.getColorModel().hasAlpha());
        assertEquals(0xffffff, display.getRGB(0, 0) & 0xffffff);
    }
    @Test void doesNotEnlargeSmallJpegAndDefendsBytes() throws Exception {
        byte[] source = fixture("jpg", 20, 10);
        byte[] before = source.clone();
        var result = new CommunityImageCodec().encode(source);
        assertArrayEquals(before, source);
        assertEquals(20, result.width());
        assertEquals(20, ImageIO.read(new ByteArrayInputStream(result.thumbnail())).getWidth());
        byte[] exposed = result.display();
        exposed[0] = 0;
        assertNotEquals(0, result.display()[0]);
    }
    @Test void rejectsTooManyPixelsBeforeDecoding() throws Exception {
        byte[] png = fixture("png", 1, 1);
        java.nio.ByteBuffer.wrap(png, 16, 8).putInt(5000).putInt(5000);
        var crc = new java.util.zip.CRC32();
        crc.update(png, 12, 17);
        java.nio.ByteBuffer.wrap(png, 29, 4).putInt((int) crc.getValue());
        assertThrows(IllegalArgumentException.class, () -> new CommunityImageCodec().encode(png));
    }
    static byte[] fixture(String format, int width, int height) throws IOException {
        var pixels = new BufferedImage(width, height, format.equals("png") ? BufferedImage.TYPE_INT_ARGB : BufferedImage.TYPE_INT_RGB);
        var output = new ByteArrayOutputStream();
        assertTrue(ImageIO.write(pixels, format, output));
        return output.toByteArray();
    }
}
