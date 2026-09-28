package com.yangdoujiao.website.auth.session;

import org.springframework.session.FindByIndexNameSessionRepository;
import org.springframework.session.Session;
import org.springframework.stereotype.Service;

@Service
public class UserSessionService {
    private final FindByIndexNameSessionRepository<? extends Session> sessions;

    public UserSessionService(FindByIndexNameSessionRepository<? extends Session> sessions) {
        this.sessions = sessions;
    }

    public void revokeAll(long userId) {
        sessions.findByIndexNameAndIndexValue(FindByIndexNameSessionRepository.PRINCIPAL_NAME_INDEX_NAME,
                "user:" + userId).keySet().forEach(sessions::deleteById);
    }
}
