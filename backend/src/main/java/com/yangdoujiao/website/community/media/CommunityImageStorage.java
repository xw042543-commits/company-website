package com.yangdoujiao.website.community.media;

import java.io.IOException;

public interface CommunityImageStorage {
    String save(EncodedCommunityImage image) throws IOException;
    byte[] read(String key, boolean thumbnail) throws IOException;
    void delete(String key) throws IOException;
}
