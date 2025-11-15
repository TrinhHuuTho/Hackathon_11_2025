package hcmute.hackathon.vibecoders.dto.request;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizCardRequestDTO {
    List<Section> sections;
    Config config;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Section{
        String id;
        String summary;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Config {
        int n_questions;
        List<String> types;
    }
}

