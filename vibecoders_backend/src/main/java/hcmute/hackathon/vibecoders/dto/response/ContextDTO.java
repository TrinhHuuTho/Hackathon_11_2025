package hcmute.hackathon.vibecoders.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

@Data
public class ContextDTO {
    @JsonProperty("retrieved_count")
    private int retrievedCount;
    @JsonProperty("context_used")
    private boolean contextUsed;
    private List<Object> sources;
    @JsonProperty("context_text")
    private String contextText;
}