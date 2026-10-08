package com.yangdoujiao.website.community;

import java.util.Map;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.yangdoujiao.website.common.web.RequestTraceFilter;
import jakarta.servlet.http.HttpServletRequest;

/** Module-scoped extension of the common error envelope; other errors keep the global handler. */
@RestControllerAdvice(assignableTypes={CommunityPostController.class,CommunityCommentController.class,
        CommunityReactionController.class,CommunityReportController.class})
@Order(Ordered.HIGHEST_PRECEDENCE)
public class CommunityRestrictionExceptionHandler {
    @ExceptionHandler(CommunityRestrictedException.class)
    public ResponseEntity<Error> restricted(CommunityRestrictedException exception,HttpServletRequest request) {
        var trace=request.getAttribute(RequestTraceFilter.TRACE_ID_ATTRIBUTE);
        return ResponseEntity.status(exception.getStatus()).body(new Error(exception.getCode(),exception.getMessage(),Map.of(),
                trace==null?"unavailable":trace.toString(),exception.details()));
    }
    public record Error(String code,String message,Map<String,String> fieldErrors,String traceId,CommunityRestrictedException.Details details) {}
}
