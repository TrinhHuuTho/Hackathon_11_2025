package hcmute.hackathon.vibecoders.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "events")
public class Event {

    @Id
    private String id;
    private String title;
    private String description;
    private String email;
    private String date; // yyyy-MM-dd
    private String time; // HH:mm
    private String color;
    @Field("event_date_time")
    private LocalDateTime eventDateTime;
    private boolean notificationSent;
}