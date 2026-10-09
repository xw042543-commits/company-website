package com.yangdoujiao.website.community;

import java.util.Locale;
import java.util.concurrent.TimeUnit;
import org.springframework.stereotype.Component;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.method.HandlerMethod;
import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.MeterRegistry;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/** Labels are a closed vocabulary. PostgreSQL, never a process-local counter, owns queue state. */
@Component
public class CommunityMetrics {
    public enum Command { POST, COMMENT, REPORT, HOT, CACHE_INVALIDATION }
    private static final String START = CommunityMetrics.class.getName() + ".start";
    private static final String PENDING = """
            FROM (SELECT 'POST' AS type,id,status,created_at FROM community_posts
                  UNION ALL SELECT 'COMMENT',id,status,created_at FROM community_comments) t
            WHERE t.status='PENDING_REVIEW' OR EXISTS
              (SELECT 1 FROM community_reports r WHERE r.target_type=t.type AND r.target_id=t.id AND r.status='OPEN')
            """;
    private final MeterRegistry registry;
    private final JdbcTemplate jdbc;

    public CommunityMetrics(MeterRegistry registry, JdbcTemplate jdbc) {
        this.registry = registry;
        this.jdbc = jdbc;
        Gauge.builder("community.moderation.backlog", this,
                metrics -> metrics.scalar("SELECT count(*) " + PENDING)).register(registry);
        Gauge.builder("community.moderation.oldest.age", this,
                metrics -> metrics.scalar("""
                        SELECT coalesce(greatest(0,extract(epoch FROM (CURRENT_TIMESTAMP-min(least(
                          CASE WHEN t.status='PENDING_REVIEW' THEN t.created_at END,
                          (SELECT min(r.created_at) FROM community_reports r
                           WHERE r.target_type=t.type AND r.target_id=t.id AND r.status='OPEN')
                        ))))),0)
                        """ + PENDING))
                .baseUnit("seconds").register(registry);
    }

    private double scalar(String query) {
        try {
            Double value = jdbc.queryForObject(query, Double.class);
            return value == null ? Double.NaN : value;
        } catch (DataAccessException exception) {
            // An unavailable database must not look like an empty queue.
            return Double.NaN;
        }
    }

    public void rateLimited(Command command) { increment("community.rate.limited", command); }
    public void redisUnavailable(Command command) { increment("community.redis.unavailable", command); }
    public void idempotencyHit(Command command) { increment("community.idempotency.hits", command); }
    private void increment(String name, Command command) {
        registry.counter(name, "command", command.name().toLowerCase(Locale.ROOT)).increment();
    }

    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        request.setAttribute(START, System.nanoTime());
        return true;
    }
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception exception) {
        if (!(handler instanceof HandlerMethod method)
                || !method.getBeanType().getPackageName().equals(CommunityMetrics.class.getPackageName())) return;
        Object start = request.getAttribute(START);
        if (!(start instanceof Long started)) return;
        String endpoint = endpoint(method);
        String sort = "feed".equals(endpoint) ? sort(request.getParameter("sort")) : "none";
        String outcome = outcome(response.getStatus());
        String[] tags = {"endpoint", endpoint, "sort", sort, "outcome", outcome};
        registry.timer("community." + endpoint, tags).record(System.nanoTime() - started, TimeUnit.NANOSECONDS);
        registry.counter("community.results", tags).increment();
    }
    private static String endpoint(HandlerMethod method) {
        if (method.getBeanType() == CommunityPostController.class) return switch (method.getMethod().getName()) {
            case "list" -> "feed";
            case "detail" -> "detail";
            case "create" -> "publish";
            case "comments" -> "comments";
            case "replies" -> "replies";
            default -> "delete";
        };
        if (method.getBeanType() == CommunityCommentController.class)
            return method.getMethod().getName().equals("create") ? "comment" : "delete";
        if (method.getBeanType() == CommunityReactionController.class) return "reaction";
        if (method.getBeanType() == CommunityReportController.class) return "report";
        if (method.getBeanType() == CommunityPersonalController.class) return "personal";
        return "moderation";
    }
    private static String sort(String value) {
        if (value == null || value.equals("latest")) return "latest";
        return value.equals("hot") ? "hot" : "invalid";
    }
    private static String outcome(int status) {
        if (status < 400) return "success";
        return switch (status) {
            case 400, 422 -> "validation";
            case 401 -> "unauthorized";
            case 403 -> "forbidden";
            case 404 -> "not_found";
            case 409 -> "conflict";
            case 429 -> "rate_limited";
            case 503 -> "unavailable";
            default -> "error";
        };
    }
}
