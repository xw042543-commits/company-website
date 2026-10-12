package com.yangdoujiao.website.community.media;

public record EncodedCommunityImage(byte[] display, byte[] thumbnail, int width, int height) {
    public EncodedCommunityImage {
        display = display.clone();
        thumbnail = thumbnail.clone();
    }
    @Override public byte[] display() { return display.clone(); }
    @Override public byte[] thumbnail() { return thumbnail.clone(); }
}
