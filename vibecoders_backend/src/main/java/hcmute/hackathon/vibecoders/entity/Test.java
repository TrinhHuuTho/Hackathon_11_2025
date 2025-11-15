package hcmute.hackathon.vibecoders.entity;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.Instant;
import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "tests")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Test {
    @Id
    String id;
    String question;
    String typeQuest;
    Double score;
    Feedback feedback;

    @Field("created_at")
    private Instant createdAt;

    @Field("updated_at")
    private Instant updatedAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Feedback {
        String aiComment;
        Double aiScore;
        String strengths;
        String weaknesses;
        ReferenceAnswer referenceAnswer;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ReferenceAnswer {
        String answerText;
        String answerAudioUrl;
    }
}
