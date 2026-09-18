package com.yangdoujiao.website.search.v4;

public class SearchServiceUnavailableException extends RuntimeException {

    public SearchServiceUnavailableException(String message) {
        super(message);
    }

    public SearchServiceUnavailableException(Throwable cause) {
        super("Search service is temporarily unavailable", cause);
    }
}
