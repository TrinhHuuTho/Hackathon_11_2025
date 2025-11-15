package hcmute.hackathon.vibecoders.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ChatConfig {
    private double temperature;
    @JsonProperty("top_p")
    private double topP;
    @JsonProperty("max_tokens")
    private int maxTokens;
    @JsonProperty("max_context_docs")
    private int maxContextDocs;
    @JsonProperty("include_sources")
    private boolean includeSources;
    @JsonProperty("response_style")
    private String responseStyle;
}