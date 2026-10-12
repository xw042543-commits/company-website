package com.yangdoujiao.website.community.media;

import java.nio.file.*;
import java.io.IOException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import static org.junit.jupiter.api.Assertions.*;

class LocalCommunityImageStorageTest {
    @TempDir Path root;
    @Test void survivesNewInstanceAndDeletesIdempotently() throws Exception {
        var image = new CommunityImageCodec().encode(CommunityImageCodecTest.fixture("png", 800, 400));
        var store = new LocalCommunityImageStorage(root);
        String key = store.save(image);
        assertTrue(key.matches("[0-9a-f]{32}"));
        var reopened = new LocalCommunityImageStorage(root);
        assertArrayEquals(image.display(), reopened.read(key, false));
        assertArrayEquals(image.thumbnail(), reopened.read(key, true));
        reopened.delete(key);
        reopened.delete(key);
        assertThrows(IOException.class, () -> reopened.read(key, false));
        try (var entries = Files.list(root)) { assertEquals(0, entries.count()); }
    }
    @Test void rejectsTraversalAndAbsolutePaths() throws Exception {
        var store = new LocalCommunityImageStorage(root);
        for (String key : new String[]{"../secret", "/etc/passwd", "", "a/b", "ABC"}) {
            assertThrows(IllegalArgumentException.class, () -> store.read(key, false));
            assertThrows(IllegalArgumentException.class, () -> store.delete(key));
        }
    }
    @Test void rejectsSymlinkRootDirectoryAndFiles() throws Exception {
        Path actual = Files.createDirectory(root.resolve("actual"));
        Path link = Files.createSymbolicLink(root.resolve("linked"), actual);
        assertThrows(IOException.class, () -> new LocalCommunityImageStorage(link));
        var store = new LocalCommunityImageStorage(actual);
        String key = "a".repeat(32);
        Files.createSymbolicLink(actual.resolve(key), root);
        assertThrows(IOException.class, () -> store.read(key, false));
        assertThrows(IOException.class, () -> store.delete(key));
        Files.delete(actual.resolve(key));
        Files.createDirectory(actual.resolve(key));
        Files.createSymbolicLink(actual.resolve(key).resolve("display.jpg"), root.resolve("outside"));
        assertThrows(IOException.class, () -> store.read(key, false));
    }
    @Test void rejectsFileAsRoot() throws Exception {
        Path file = Files.createFile(root.resolve("file"));
        assertThrows(IOException.class, () -> new LocalCommunityImageStorage(file));
    }
    @Test void failedWriteLeavesNoPartialDirectory() throws Exception {
        var store = new LocalCommunityImageStorage(root);
        assertThrows(NullPointerException.class, () -> store.save(null));
        try (var entries = Files.list(root)) { assertEquals(0, entries.count()); }
    }
}
