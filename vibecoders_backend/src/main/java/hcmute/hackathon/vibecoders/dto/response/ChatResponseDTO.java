package hcmute.hackathon.vibecoders.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatResponseDTO {
    private String answer;
    private ContextDTO context;
    @JsonProperty("conversation_id")
    private String conversationId;
    private String timestamp;
    @JsonProperty("processing_time")
    private double processingTime;
    @JsonProperty("retrieved_documents")
    private List<Object> retrievedDocuments;
}
