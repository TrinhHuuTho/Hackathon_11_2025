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
public class FlashcardSet {
    private String id;
    private String email;
    private String name;
    private List<Flashcard> flashcards;
    private Meta meta;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Flashcard {
        private String id;
        private String type;
        private String front;
        private String back;
        private String category;
        private String difficulty;
        private List<String> source_sections;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Meta {
        private int total_count;
        private int requested_count;
        private List<String> requested_types;
    }
}