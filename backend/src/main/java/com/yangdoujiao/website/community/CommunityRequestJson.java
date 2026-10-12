package com.yangdoujiao.website.community;

/** Local enum request parsing: Jackson scalar coercion and enum ordinals are never domain tokens. */
final class CommunityRequestJson {
    private CommunityRequestJson() {}

    static <E extends Enum<E>> E enumToken(Object value, Class<E> type) {
        if (value instanceof String text) {
            try { return Enum.valueOf(type, text); }
            catch (IllegalArgumentException ignored) { }
        }
        // Do not echo the rejected value into exceptions, client errors or logs.
        throw new IllegalArgumentException("Unsupported community enum token");
    }
}
