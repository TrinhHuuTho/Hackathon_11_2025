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
@Document(collection = "ai_feedbacks")
public class AIFeedback {
    @Id
    private String id;

    @Indexed
    @Field("user_id")
    private String userId;

    @Indexed
    private OffsetDateTime timestamp;

    @Indexed
    @Field("feedback_type")
    private String feedbackType; // weekly_summary, workout_tip, nutrition_advice, form_correction

    private String summary; // Tóm tắt ngắn gọn

    // Chi tiết (có thể chứa charts, metrics, trends)
    private Map<String, Object> details;

    // Hành động đề xuất
    private List<String> actions;

    // Reference đến plan/tracking nếu có
    @Field("related_plan_id")
    private String relatedPlanId;

    @Field("related_date")
    private LocalDate relatedDate;

    @Field("created_at")
    private OffsetDateTime createdAt;
}
