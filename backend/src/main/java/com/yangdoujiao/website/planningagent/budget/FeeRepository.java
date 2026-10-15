package com.yangdoujiao.website.planningagent.budget;

import java.util.List;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import com.yangdoujiao.website.planningagent.budget.BudgetTypes.Fee;

@Repository
public class FeeRepository {
    private final JdbcTemplate jdbc;
    public FeeRepository(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    public List<Fee> findByProgrammeId(long programmeId) {
        return jdbc.query("""
                SELECT id,programme_id,amount,currency,period,units,evidence_id,included_in,category,coverage_complete
                FROM planning_fees WHERE programme_id=? ORDER BY id
                """, (row,index) -> new Fee(row.getLong("id"),row.getLong("programme_id"),row.getBigDecimal("amount"),
                        row.getString("currency"),row.getString("period"),row.getObject("units",Integer.class),
                        row.getLong("evidence_id"),row.getObject("included_in",Long.class),row.getString("category"),
                        row.getBoolean("coverage_complete")),programmeId);
    }
}
