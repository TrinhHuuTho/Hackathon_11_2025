package hcmute.hackathon.vibecoders.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PythonChatRequest {
    private String query;
    @JsonProperty("retrieval_config")
    private RetrievalConfig retrievalConfig;
    @JsonProperty("chat_config")
    private ChatConfig chatConfig;
    @JsonProperty("conversation_id")
    private String conversationId;
}