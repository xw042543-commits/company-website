package com.yangdoujiao.website.auth.config;

/** Implemented only by an accepted production email/SMS provider integration. */
public interface ProductionNotificationReadiness {
    boolean isReady();
}
