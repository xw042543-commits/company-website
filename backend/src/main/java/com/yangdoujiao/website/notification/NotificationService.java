package com.yangdoujiao.website.notification;

import java.time.Clock;
import java.time.OffsetDateTime;
import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.yangdoujiao.website.common.exception.ApiException;

@Service @Transactional
public class NotificationService {
    private final NotificationRepository repository;
    private final Clock clock;
    public NotificationService(NotificationRepository repository,Clock clock) { this.repository=repository;this.clock=clock; }
    @Transactional(readOnly=true)
    public InboxPage list(long recipient,String category,int page,int size) {
        if(category==null||!List.of("ALL","COMMUNITY","SYSTEM","APPLICATION").contains(category)
                ||page<1||size<1||size>48) throw invalid();
        var result=repository.received(recipient,category,PageRequest.of(page-1,size,
                Sort.by(Sort.Order.desc("createdAt"),Sort.Order.desc("id"))));
        return new InboxPage(result.getContent().stream().map(Message::from).toList(),page,size,
                result.getTotalElements(),result.getTotalPages(),unreadCount(recipient));
    }
    @Transactional(readOnly=true)
    public long unreadCount(long recipient) { return repository.countByRecipientAccountIdAndReadAtIsNull(recipient); }
    public void markRead(long recipient,String wireId) {
        long id=decimalId(wireId);
        if(repository.markRead(recipient,id,now())==0&&!repository.existsByIdAndRecipientAccountId(id,recipient))
            throw new ApiException(HttpStatus.NOT_FOUND,"MESSAGE_NOT_FOUND","Message does not exist");
    }
    public void publishSystem(long recipient,String event,String title,String body) {
        publish(recipient,event,"SYSTEM",title,body,"NONE",null);
    }
    public void publishApplication(long recipient,String event,String title,String body) {
        publish(recipient,event,"APPLICATION",title,body,"NONE",null);
    }
    public void publishCommunity(long recipient,long actor,String event,long postId,String title,String body) {
        if(recipient==actor) return;
        if(actor<1||postId<1) throw invalid();
        publish(recipient,event,"COMMUNITY",title,body,"COMMUNITY_POST",postId);
    }
    private void publish(long recipient,String event,String category,String title,String body,String type,Long targetId) {
        if(recipient<1||event==null||!event.matches("[A-Za-z0-9._:-]{1,200}")) throw invalid();
        validateText(title,120);validateText(body,4000);
        repository.publish(recipient,event,category,title,body,type,targetId,now());
    }
    private static void validateText(String value,int max) {
        if(value==null||value.isBlank()||value.codePointCount(0,value.length())>max
                ||value.codePoints().anyMatch(c -> Character.isISOControl(c)&&c!='\n'&&c!='\t'
                    ||c>=0xD800&&c<=0xDFFF)) throw invalid();
    }
    private static long decimalId(String value) {
        if(value==null||!value.matches("[1-9][0-9]{0,18}")) throw invalid();
        try{return Long.parseLong(value);}catch(NumberFormatException e){throw invalid();}
    }
    private OffsetDateTime now() { return OffsetDateTime.now(clock); }
    private static ApiException invalid() { return new ApiException(HttpStatus.BAD_REQUEST,"INVALID_MESSAGE_REQUEST","Invalid message request"); }
    public record Message(String id,String category,String title,String body,OffsetDateTime createdAt,
            OffsetDateTime readAt,String targetType,String targetId) {
        static Message from(Notification n) { return new Message(n.getId().toString(),n.getCategory(),n.getTitle(),n.getBody(),
                n.getCreatedAt(),n.getReadAt(),n.getTargetType(),n.getTargetId()==null?null:n.getTargetId().toString()); }
    }
    public record InboxPage(List<Message> items,int page,int pageSize,long totalItems,int totalPages,long unreadCount) {}
}
