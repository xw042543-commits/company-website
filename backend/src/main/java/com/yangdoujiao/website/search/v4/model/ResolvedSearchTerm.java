package com.yangdoujiao.website.search.v4.model;

import com.yangdoujiao.website.search.v4.alias.SearchAliasTargetType;

public record ResolvedSearchTerm(String text, SearchAliasTargetType targetType, String targetCode) {
    public boolean isAlias() {
        return targetType != null;
    }
}
