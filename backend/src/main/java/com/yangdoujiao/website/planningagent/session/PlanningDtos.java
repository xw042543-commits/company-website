package com.yangdoujiao.website.planningagent.session;

import java.time.Instant;
import java.util.*;
import com.yangdoujiao.website.planningagent.eligibility.EligibilityTypes.Profile;
import jakarta.validation.constraints.*;

public final class PlanningDtos {
    private PlanningDtos() {}
    public enum Intent { CHAT, GENERATE }
    public record CreateSession(@NotBlank String ageBand,@NotBlank @Size(max=50) String privacyVersion) {}
    public record SessionCreated(UUID id) {}
    public record MessageRequest(@NotBlank @Size(max=100) String requestKey,@NotBlank @Size(max=4000) String text,Intent intent) {
        public MessageRequest { if(intent==null) intent=Intent.CHAT; }
    }
    public record RunAccepted(UUID runId,String status) {}
    public record RunView(UUID runId,String status,String result,String errorCode) {}
    public record Message(long id,String role,String text,Instant createdAt) {}
    public record ProfileConfirmation(@Min(0) long version,@NotNull Map<String,String> facts) {}
    public record ProfileConfirmed(long confirmedVersion) {}
    public record SessionView(UUID id,Profile profile,List<Message> messages,List<RunView> runs) {}
    public record RunInput(UUID runId,UUID sessionId,long ownerId,Intent intent,String text,Profile profile,
            List<Message> messages,Instant deadline) {}
}
