package com.yangdoujiao.website.search.v4;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;

public class SearchValidationException extends RuntimeException {

    private final Map<String, String> fieldErrors;

    public SearchValidationException(Map<String, String> fieldErrors) {
        super("Request validation failed");
        this.fieldErrors = Collections.unmodifiableMap(new LinkedHashMap<>(fieldErrors));
    }

    public Map<String, String> getFieldErrors() {
        return fieldErrors;
    }
}
