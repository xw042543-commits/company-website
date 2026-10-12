package com.yangdoujiao.website.community;

import java.util.List;

public record CommunityCursorPage<T>(List<T> items, String nextCursor) {}
