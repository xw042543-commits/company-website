package com.yangdoujiao.website.notification;

import java.time.OffsetDateTime;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;

public interface NotificationRepository extends JpaRepository<Notification,Long> {
    @Query("select n from Notification n where n.recipientAccountId=:recipient and (:category='ALL' or n.category=:category)")
    Page<Notification> received(long recipient,String category,Pageable page);
    long countByRecipientAccountIdAndReadAtIsNull(long recipient);
    boolean existsByIdAndRecipientAccountId(long id,long recipient);
    @Modifying
    @Query("update Notification n set n.readAt=:now where n.id=:id and n.recipientAccountId=:recipient and n.readAt is null")
    int markRead(long recipient,long id,OffsetDateTime now);
    @Modifying
    @Query(value="""
        INSERT INTO inbox_notifications(recipient_account_id,event_key,category,title,body,target_type,target_id,created_at)
        VALUES (:recipient,:event,:category,:title,:body,:targetType,:targetId,:now)
        ON CONFLICT (recipient_account_id,event_key) DO NOTHING
        """,nativeQuery=true)
    int publish(long recipient,String event,String category,String title,String body,String targetType,Long targetId,OffsetDateTime now);
}
