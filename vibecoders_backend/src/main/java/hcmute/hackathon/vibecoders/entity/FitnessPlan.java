package hcmute.hackathon.vibecoders.entity;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Document(collection = "fitness_plans")
public class FitnessPlan {
    @Id
    String id;
    @Indexed
    @Field("user_id")
    String userId;
    String goal;
    String type;
    Integer durationWeeks;
    LocalDate startDate;
    LocalDate endDate;
    Boolean isActive;

    Map<String, String> metadata;
    List<WorkoutDay> workoutDays;
    List<MealDay> mealDays;
    PlanStats planStats;

    // --- WorkoutDay ---
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WorkoutDay {
        Integer dayNumber;
        DayOfWeek dayOfWeek;
        String note;
        List<Exercise> exercises;
        Integer durationMinutes; // Tổng thời gian dự kiến cho ngày tập

        @Data
        @Builder
        @NoArgsConstructor
        @AllArgsConstructor
        public static class Exercise {
            String id;
            String name;
            String targetMuscleGroup;
            String equipment;

            // Steps & reps
            Integer sets;
            Integer reps; // Null nếu là bài tập theo thời gian
            Integer restSeconds; // Nghỉ giữa các sets
            Integer durationSeconds; // Thời gian thực hiện nếu là bài tập theo thời gian

            List<String> instructions;
            List<String> cues; // Lời khuyên kỹ thuật

            private Double estimatedCaloriesBurn;
        }
    }

    // --- MealDay ---
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MealDay {
        Integer dayNumber;
        DayOfWeek dayOfWeek;
        Double totalCalories;
        List<Meal> meals;

        @Data
        @Builder
        @NoArgsConstructor
        @AllArgsConstructor
        public static class Meal {
            private String name;  // "Cháo yến mạch với chuối"
            private String mealType;  // "breakfast" | "lunch" | "dinner" | "snack"
            private List<Ingredient> ingredients;
            private NutritionInfo nutrition;
            private String recipeId;  // Link đến DB công thức nấu ăn
            private String notes;  // "Có thể thay chuối bằng dâu tây"

            @Data
            @Builder
            @NoArgsConstructor
            @AllArgsConstructor
            public static class Ingredient {
                private String name;
                private Double quantity;
                private String unit;  // "g" | "cup" | "piece" | "tbsp"
                private Double priceEstimate;  // VND
            }

            @Data
            @Builder
            @NoArgsConstructor
            @AllArgsConstructor
            public static class NutritionInfo {
                private Double calories;
                private Double proteinGr;
                private Double carbsGr;
                private Double fatGr;
                private Map<String, Double> micros;  // {"vitamin_c": 50.0, "iron": 5.0}
            }
        }
    }

    // --- PlanStats ---
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PlanStats {
        private Double dailyCaloriesTarget;
        private Double estimatedWeeklyWeightChangeKg;  // Âm = giảm, dương = tăng
        private Double avgDailyProteinGr;
        private Double avgDailyCarbsGr;
        private Double avgDailyFatGr;
    }
}
