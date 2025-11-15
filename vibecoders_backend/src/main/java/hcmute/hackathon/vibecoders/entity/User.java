package hcmute.hackathon.vibecoders.entity;

import hcmute.hackathon.vibecoders.util.Enum.Role;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "users")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class User {
    @Id
    private String id;
    private String email;
    private String fullName;
    private String gender;
    private int age;
    private String password;
    private boolean isActive;
    private boolean isOnboarding;
    private Role role;

    List<String> summaries;

    @Field("created_at")
    private Instant createdAt;

    @Field("updated_at")
    private Instant updatedAt;

    private Personal personal;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Personal {
        Integer numberOfYears;
        String major;
        List<String> favoriteTopics;
        List<String> personalTopics;
    }
}
