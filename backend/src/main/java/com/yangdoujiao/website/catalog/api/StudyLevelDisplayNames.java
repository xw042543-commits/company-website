package com.yangdoujiao.website.catalog.api;

import java.util.Arrays;
import java.util.List;
import java.util.Locale;

final class StudyLevelDisplayNames {

    private StudyLevelDisplayNames() {
    }

    static String chineseName(String code, String nameZh, String nameEn) {
        List<String> values = Arrays.stream(new String[] {code, nameZh, nameEn})
                .filter(value -> value != null && !value.isBlank())
                .map(StudyLevelDisplayNames::normalize)
                .toList();
        for (String value : values) {
            if (value.contains("预科") || value.contains("foundation") || value.contains("preuniversity")) {
                return "预科";
            }
            if (value.contains("博士") || value.equals("phd") || value.equals("doctor")
                    || value.contains("doctorate") || value.contains("doctoral")
                    || value.contains("doctorofphilosophy")) {
                return "博士";
            }
            if (value.contains("硕士") || value.contains("master")) {
                return "硕士";
            }
            if (value.contains("本科") || value.contains("bachelor") || value.equals("undergraduate")) {
                return "本科";
            }
            if (value.contains("大专") || value.contains("文凭") || value.contains("diploma")) {
                return "大专";
            }
        }
        return firstNonBlank(nameZh, nameEn, code);
    }

    private static String normalize(String value) {
        return value.trim().toLowerCase(Locale.ENGLISH).replaceAll("[^a-z\\p{IsHan}]", "");
    }

    private static String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value.trim();
            }
        }
        return "";
    }
}
