package hcmute.hackathon.vibecoders.entity;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Document(collection = "profiles")
public class Profile {
    @Id
    String id;
    Double heightCm;
    Double weightKg;

    @Indexed
    Double bmi;

    String goal;
    String healthCondition;

    @Field("nutrition_preferences")
    NutritionPreferences nutritionPreferences;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NutritionPreferences {
        private Boolean vegetarian; // Ăn chay (có thể ăn trứng, sữa nhưng không ăn thịt)
        private Boolean vegan; // Thuần chay (không ăn bất kỳ sản phẩm nào từ động vật, kể cả trứng, sữa, mật ong, v.v.)
        private Boolean pescatarian; // Ăn chay có cá (không ăn thịt đỏ, nhưng có thể ăn cá và hải sản)
        private Boolean halal; // Ăn theo tiêu chuẩn Halal (tuân thủ quy tắc thực phẩm của đạo Hồi)
        private Boolean kosher; // Ăn theo tiêu chuẩn Kosher (tuân thủ quy tắc thực phẩm của đạo Do Thái)
        private List<String> allergies; // Danh sách các dị ứng thực phẩm, ví dụ ["peanut", "gluten"] — dị ứng với đậu phộng, gluten,...
        private Double dailyBudget; // optional, VND or default currency
    }
}
