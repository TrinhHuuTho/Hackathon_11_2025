package hcmute.hackathon.vibecoders.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "workout_tracker")
public class WorkoutTrackerDocument {

    @Id
    private String id;

    private String email;
    private Double score;
    private String comment;
    private String feedBack;
    private String fileUrl;
    private Instant createdAt;
}
