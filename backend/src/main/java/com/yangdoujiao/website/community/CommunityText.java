package com.yangdoujiao.website.community;

/** Shared write/read safety: Java Unicode spaces plus ECMAScript's additional BOM whitespace. */
final class CommunityText {
    private CommunityText() {}

    static boolean valid(String text, int maximum) {
        if (text == null || text.codePointCount(0, text.length()) > maximum
                || text.codePoints().allMatch(point -> point == 0xFEFF
                    || Character.isWhitespace(point) || Character.isSpaceChar(point))) return false;
        return text.codePoints().noneMatch(point ->
                (Character.isISOControl(point) && point != '\n' && point != '\t')
                || point >= 0xD800 && point <= 0xDFFF);
    }

    /** Keep the body readable if historical data contains a title that current readers reject. */
    static String readableTitle(String title) {
        return valid(title, 60) ? title : null;
    }
}
