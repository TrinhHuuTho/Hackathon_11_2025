package hcmute.hackathon.vibecoders.entity;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Document(collection = "pose_analysis")
public class PoseAnalysis {
    @Id
    String id;
    @Indexed
    @Field("user_id")
    private String userId;

    @Indexed
    private LocalDate date;

    @Indexed
    @Field("exercise_name")
    private String exerciseName;

    String mediaUrl; // URL của video hoặc hình ảnh phân tích tư thế
    String mediaType; // "video" hoặc "image"
    // Keypoint scores
    @Field("keypoints_score")
    private Map<String, Double> keypointsScore;

    // Phát hiện lỗi
    private List<String> issues;

    // Gợi ý cải thiện
    private List<String> suggestions;

    @Indexed
    @Field("overall_score")
    private Double overallScore; // 0-100

    // Link đến workout log nếu có
    @Field("workout_log_id")
    private String workoutLogId;

    @Field("created_at")
    private OffsetDateTime createdAt;
}
