package hcmute.hackathon.vibecoders.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "WH_Note")
public class WHNote {
    @Id
    private String id;
    private String title;
    private String content;
    private Instant createdAt;
    private String email;
    private boolean addCalendar;
}
