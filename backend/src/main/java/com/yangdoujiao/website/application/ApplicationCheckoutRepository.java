package com.yangdoujiao.website.application;

import static com.yangdoujiao.website.application.ApplicationModels.*;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.*;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class ApplicationCheckoutRepository {
    private final NamedParameterJdbcTemplate jdbc;

    public ApplicationCheckoutRepository(NamedParameterJdbcTemplate jdbc) { this.jdbc = jdbc; }

    public int createOrder(UUID id, String reference, long userId, String key, String fingerprint) {
        return jdbc.update("""
            INSERT INTO application_payment_orders(id,reference,user_account_id,idempotency_key,request_fingerprint)
            VALUES(:id,:reference,:user,:key,:fingerprint)
            ON CONFLICT(user_account_id,idempotency_key) DO NOTHING
            """, Map.of("id", id, "reference", reference, "user", userId, "key", key, "fingerprint", fingerprint));
    }

    public Optional<Order> findOrder(long userId, String key) {
        return jdbc.query("""
            SELECT id,reference,user_account_id,idempotency_key,request_fingerprint,status,total_amount_fen,currency
            FROM application_payment_orders WHERE user_account_id=:user AND idempotency_key=:key
            """, Map.of("user", userId, "key", key), this::order).stream().findFirst();
    }

    public Optional<Order> findOrderByApplication(long userId, UUID applicationId) {
        return jdbc.query("""
            SELECT o.id,o.reference,o.user_account_id,o.idempotency_key,o.request_fingerprint,o.status,o.total_amount_fen,o.currency
            FROM application_payment_orders o JOIN student_applications a ON a.payment_order_id=o.id
            WHERE o.user_account_id=:user AND a.user_account_id=:user AND a.id=:application
            """, Map.of("user", userId, "application", applicationId), this::order).stream().findFirst();
    }

    public List<Long> publishedProgrammeIds(List<Long> ids) {
        return jdbc.query("""
            SELECT p.id FROM programmes p JOIN universities u ON u.id=p.university_id
            WHERE p.id IN (:ids) AND p.status='PUBLISHED' AND u.status='PUBLISHED' ORDER BY p.id
            """, new MapSqlParameterSource("ids", ids), (row, number) -> row.getLong(1));
    }

    public UUID createApplication(UUID orderId, long userId, long programmeId) {
        UUID applicationId = UUID.randomUUID();
        String reference = "APP" + applicationId.toString().replace("-", "").toUpperCase(Locale.ROOT);
        int inserted = jdbc.update("""
            INSERT INTO student_applications(id,reference,user_account_id,adviser_id,programme_id,status,payment_order_id)
            VALUES(:id,:reference,:user,NULL,:programme,'UNPAID',:order)
            """, Map.of("id", applicationId, "reference", reference, "user", userId,
                "programme", programmeId, "order", orderId));
        if (inserted != 1) throw new IllegalStateException("Application checkout insert failed");
        jdbc.update("""
            INSERT INTO application_payment_items(id,payment_order_id,application_id,programme_id,description,amount_fen)
            VALUES(:id,:order,:application,:programme,'留学申请服务费',NULL)
            """, Map.of("id", UUID.randomUUID(), "order", orderId, "application", applicationId,
                "programme", programmeId));
        return applicationId;
    }

    public List<UUID> applicationIds(UUID orderId, long userId) {
        return jdbc.query("""
            SELECT a.id FROM student_applications a
            WHERE a.payment_order_id=:order AND a.user_account_id=:user ORDER BY a.created_at,a.id
            """, Map.of("order", orderId, "user", userId), (row, number) -> row.getObject(1, UUID.class));
    }

    private Order order(ResultSet row, int number) throws SQLException {
        return new Order(row.getObject("id", UUID.class), row.getString("reference"), row.getLong("user_account_id"),
            row.getString("idempotency_key"), row.getString("request_fingerprint"), row.getString("status"),
            row.getObject("total_amount_fen", Long.class), row.getString("currency"));
    }

    public record Order(UUID id, String reference, long userId, String idempotencyKey, String fingerprint,
        String status, Long amountFen, String currency) {
        Payment payment() { return new Payment(id, reference, status, amountFen, currency, false, missingConfiguration()); }
    }

    public static List<String> missingConfiguration() {
        return List.of("申请服务费价格", "微信支付商户号", "商户API证书序列号", "商户私钥",
            "API v3密钥", "支付回调地址", "微信支付服务端网关");
    }
}
