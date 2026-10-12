package com.yangdoujiao.website.community.media;

import java.io.IOException;
import java.nio.file.*;
import java.util.Objects;
import java.util.UUID;

/** Private service-owned directory; never expose it through a static web server. */
public final class LocalCommunityImageStorage implements CommunityImageStorage {
    private final Path root;

    public LocalCommunityImageStorage(Path root) throws IOException {
        Path normalized = root.toAbsolutePath().normalize();
        // The configured root itself must not be a link. Resolve trusted OS aliases
        // in its parents (for example macOS /var) before accepting storage keys.
        if (Files.isSymbolicLink(normalized)) throw new IOException("Storage root must not be a symbolic link");
        Files.createDirectories(normalized);
        this.root = normalized.toRealPath();
    }

    @Override public String save(EncodedCommunityImage image) throws IOException {
        Objects.requireNonNull(image);
        rejectSymlinks(root);
        String key = UUID.randomUUID().toString().replace("-", "");
        Path temporary = Files.createTempDirectory(root, ".upload-");
        try {
            Files.write(temporary.resolve("display.jpg"), image.display(), StandardOpenOption.CREATE_NEW);
            Files.write(temporary.resolve("thumbnail.jpg"), image.thumbnail(), StandardOpenOption.CREATE_NEW);
            Files.move(temporary, directory(key), StandardCopyOption.ATOMIC_MOVE);
            return key;
        } finally {
            // Only these two owned files can exist in this newly created directory.
            Files.deleteIfExists(temporary.resolve("display.jpg"));
            Files.deleteIfExists(temporary.resolve("thumbnail.jpg"));
            Files.deleteIfExists(temporary);
        }
    }

    @Override public byte[] read(String key, boolean thumbnail) throws IOException {
        Path file = directory(key).resolve(thumbnail ? "thumbnail.jpg" : "display.jpg");
        rejectSymlinks(file);
        try (var input = Files.newInputStream(file, LinkOption.NOFOLLOW_LINKS)) {
            return input.readAllBytes();
        }
    }

    @Override public void delete(String key) throws IOException {
        Path directory = directory(key);
        rejectSymlinks(directory);
        for (String variant : new String[]{"display.jpg", "thumbnail.jpg"}) {
            Path file = directory.resolve(variant);
            rejectSymlinks(file);
        }
        Files.deleteIfExists(directory.resolve("display.jpg"));
        Files.deleteIfExists(directory.resolve("thumbnail.jpg"));
        Files.deleteIfExists(directory);
    }

    private Path directory(String key) throws IOException {
        if (key == null || !key.matches("[0-9a-f]{32}")) throw new IllegalArgumentException("Invalid storage key");
        rejectSymlinks(root);
        return root.resolve(key);
    }

    private static void rejectSymlinks(Path path) throws IOException {
        for (Path current = path; current != null; current = current.getParent()) {
            if (Files.isSymbolicLink(current)) throw new IOException("Symbolic links are not allowed in media storage");
        }
    }
}
