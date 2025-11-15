package hcmute.hackathon.vibecoders.entity;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "flash_cards")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FlashCard {
    @Id
    String id;
    String type;
    List<Card> cards;
    //    String category;
    boolean isSaved;

    @Field("created_at")
    private Instant createdAt;

    @Field("updated_at")
    private Instant updatedAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Card {
        String front;
        String back;
    }
}
