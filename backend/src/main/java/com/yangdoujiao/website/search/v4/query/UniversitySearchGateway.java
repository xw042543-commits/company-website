package com.yangdoujiao.website.search.v4.query;

import com.yangdoujiao.website.common.api.PageResponse;
import com.yangdoujiao.website.search.v4.model.ResolvedSearchTerm;
import com.yangdoujiao.website.search.v4.model.UniversitySearchCriteria;
import com.yangdoujiao.website.search.v4.model.UniversitySearchResult;

public interface UniversitySearchGateway {
    PageResponse<UniversitySearchResult> search(UniversitySearchCriteria criteria, ResolvedSearchTerm resolvedTerm);
}
