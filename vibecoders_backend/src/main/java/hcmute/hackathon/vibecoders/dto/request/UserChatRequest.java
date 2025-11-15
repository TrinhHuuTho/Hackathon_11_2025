package hcmute.hackathon.vibecoders.dto.request;

import lombok.Data;

@Data
public class UserChatRequest {
    private String query;
    private String mail;
    private String conversationId;
}