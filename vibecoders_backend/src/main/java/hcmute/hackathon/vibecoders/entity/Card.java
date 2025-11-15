package hcmute.hackathon.vibecoders.entity;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "cards")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Card {
    private String id;
    private String email;
    private String front;
    private String back;
}
