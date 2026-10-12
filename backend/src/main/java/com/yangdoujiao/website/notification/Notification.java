package com.yangdoujiao.website.notification;

import java.time.OffsetDateTime;
import jakarta.persistence.*;
import lombok.Getter;

/** Received event content is immutable; only readAt can change. */
@Entity @Table(name="inbox_notifications") @Getter
public class Notification {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(name="recipient_account_id",nullable=false,updatable=false) private Long recipientAccountId;
    @Column(name="event_key",nullable=false,updatable=false,length=200) private String eventKey;
    @Column(nullable=false,updatable=false,length=20) private String category;
    @Column(nullable=false,updatable=false,length=120) private String title;
    @Column(nullable=false,updatable=false,columnDefinition="TEXT") private String body;
    @Column(name="target_type",nullable=false,updatable=false,length=30) private String targetType;
    @Column(name="target_id",updatable=false) private Long targetId;
    @Column(name="created_at",nullable=false,updatable=false) private OffsetDateTime createdAt;
    @Column(name="read_at") private OffsetDateTime readAt;
    protected Notification() {}
}
