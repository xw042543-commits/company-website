package com.yangdoujiao.website.auth.session;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class UserSessionService {
    private final JdbcTemplate jdbc;

    public UserSessionService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public void revokeAll(long userId) {
        jdbc.update("DELETE FROM spring_session WHERE principal_name = ?", "user:" + userId);
    }
}
