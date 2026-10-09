package com.yangdoujiao.website.miniapp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public class MiniappWalletRepository {
    private final JdbcTemplate jdbc;
    public MiniappWalletRepository(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    @Transactional
    public WalletSnapshot findOrCreate(long userId) {
        int created = jdbc.update("INSERT INTO miniapp_wallet_accounts(user_account_id) VALUES (?) ON CONFLICT DO NOTHING", userId);
        if (created == 1) jdbc.update("INSERT INTO miniapp_wallet_entries(user_account_id,entry_type,direction,amount,description) VALUES (?,'POINTS','CREDIT',200,'完成注册')", userId);
        return jdbc.queryForObject("SELECT balance_amount, points_balance FROM miniapp_wallet_accounts WHERE user_account_id=?",
                (rs, row) -> new WalletSnapshot(rs.getBigDecimal(1), rs.getLong(2)), userId);
    }

    public List<WalletEntry> entries(long userId) {
        return jdbc.query("SELECT id,entry_type,direction,amount,description,occurred_at FROM miniapp_wallet_entries WHERE user_account_id=? ORDER BY occurred_at DESC,id DESC",
                (rs,row) -> new WalletEntry(rs.getLong(1),rs.getString(2),rs.getString(3),rs.getBigDecimal(4),rs.getString(5),rs.getObject(6,OffsetDateTime.class)), userId);
    }
    public record WalletSnapshot(BigDecimal balance, long points) {}
    public record WalletEntry(long id,String type,String direction,BigDecimal amount,String description,OffsetDateTime occurredAt) {}
}
