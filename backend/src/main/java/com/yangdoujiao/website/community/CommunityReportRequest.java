package com.yangdoujiao.website.community;

import tools.jackson.databind.JsonNode;

public record CommunityReportRequest(CommunityTargetType targetType, JsonNode targetId,
        CommunityReportReason reasonCode, JsonNode note) {}
