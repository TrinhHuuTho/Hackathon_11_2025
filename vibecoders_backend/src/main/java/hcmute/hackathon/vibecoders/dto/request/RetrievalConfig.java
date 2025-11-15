package hcmute.hackathon.vibecoders.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RetrievalConfig {
    @JsonProperty("top_k")
    private int topK;
    @JsonProperty("similarity_threshold")
    private double similarityThreshold;
    @JsonProperty("chunk_size")
    private int chunkSize;
    @JsonProperty("chunk_overlap")
    private int chunkOverlap;
    @JsonProperty("user_filter")
    private String userFilter;
    @JsonProperty("topic_filter")
    private String topicFilter;
    @JsonProperty("include_metadata")
    private boolean includeMetadata;
}