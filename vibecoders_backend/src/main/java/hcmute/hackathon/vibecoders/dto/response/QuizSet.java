package hcmute.hackathon.vibecoders.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizSet {
    private String id;
    private List<QuestionResponse> questions;
    private Meta meta;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Meta {
        private int source_count;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuestionResponse {

        private String id;
        private String type;
        private String stem;
        private List<String> options;     // null nếu fill_blank
        private String answer;
        private String difficulty;        // null thì để String là được
        private List<String> source_sections;
    }
}
