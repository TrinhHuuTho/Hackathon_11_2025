# 📚 Tài Liệu Phân Tích Entities - VibeCoder Backend

## 📋 Mục Lục

1. [Tổng Quan](#tổng-quan)
2. [Entity User](#1-entity-user)
3. [Entity Profile](#2-entity-profile)
4. [Entity FitnessPlan](#3-entity-fitnessplan)
5. [Entity PoseAnalysis](#4-entity-poseanalysis)
6. [Entity AIFeedback](#5-entity-aifeedback)
7. [Enum DayOfWeek](#6-enum-dayofweek)
8. [Giải Thích Annotations](#giải-thích-annotations)
9. [Chiến Lược Indexing](#chiến-lược-indexing)

---

## Tổng Quan

Hệ thống sử dụng **MongoDB** làm cơ sở dữ liệu chính với Spring Data MongoDB. Các entity được thiết kế để quản lý:

- Người dùng và hồ sơ sức khỏe
- Kế hoạch tập luyện và dinh dưỡng
- Phân tích tư thế tập luyện
- Phản hồi AI thông minh

---

## 1. Entity: User

### 📝 Mô Tả

Entity `User` quản lý thông tin người dùng của hệ thống, bao gồm thông tin cơ bản, xác thực, và liên kết với hồ sơ sức khỏe.

### 🗂️ Collection MongoDB

```java
@Document(collection = "users")
```

**Ý nghĩa**: Dữ liệu sẽ được lưu trong collection có tên `users` trong MongoDB.

### 📊 Cấu Trúc Dữ Liệu

```java
public class User {
    @Id
    private String id;                    // ID tự động tạo bởi MongoDB
    private String email;                 // Email đăng nhập
    private String fullName;              // Họ và tên đầy đủ
    private String gender;                // Giới tính
    private int age;                      // Tuổi
    private String password;              // Mật khẩu đã mã hóa
    private boolean isActive;             // Trạng thái kích hoạt tài khoản
    private Role role;                    // Vai trò: USER, ADMIN, etc.

    private Profile profile;              // Hồ sơ sức khỏe nhúng

    @Field("current_plan_id")
    @Indexed
    private String currentPlanId;         // ID kế hoạch đang theo dõi

    @Field("created_at")
    private OffsetDateTime createdAt;     // Thời gian tạo tài khoản

    @Field("updated_at")
    private OffsetDateTime updatedAt;     // Thời gian cập nhật cuối
}
```

### 🎯 Nested Class: Profile

**Mục đích**: Lưu thông tin sức khỏe và mục tiêu của người dùng

```java
public static class Profile {
    @Id
    String id;
    Double heightCm;                      // Chiều cao (cm)
    Double weightKg;                      // Cân nặng (kg)

    @Indexed
    Double bmi;                           // Chỉ số BMI (Body Mass Index)

    String goal;                          // Mục tiêu: giảm cân, tăng cân, duy trì
    String healthCondition;               // Tình trạng sức khỏe hiện tại

    @Field("nutrition_preferences")
    NutritionPreferences nutritionPreferences; // Sở thích ăn uống
}
```

### 🥗 Nested Class: NutritionPreferences

**Mục đích**: Quản lý các ràng buộc dinh dưỡng và chế độ ăn

```java
public static class NutritionPreferences {
    private Boolean vegetarian;           // Ăn chay (có trứng, sữa)
    private Boolean vegan;                // Thuần chay (không động vật)
    private Boolean pescatarian;          // Ăn chay + cá/hải sản
    private Boolean halal;                // Thực phẩm Halal (Hồi giáo)
    private Boolean kosher;               // Thực phẩm Kosher (Do Thái)
    private List<String> allergies;       // Danh sách dị ứng: ["peanut", "gluten"]
    private Double dailyBudget;           // Ngân sách hàng ngày (VND)
}
```

### 🏷️ Annotations Sử Dụng

| Annotation            | Vị Trí | Ý Nghĩa                                                       |
| --------------------- | ------ | ------------------------------------------------------------- |
| `@Data`               | Class  | Lombok: Tự động tạo getter/setter, toString, equals, hashCode |
| `@NoArgsConstructor`  | Class  | Lombok: Tạo constructor không tham số                         |
| `@AllArgsConstructor` | Class  | Lombok: Tạo constructor với tất cả tham số                    |
| `@Builder`            | Class  | Lombok: Pattern Builder để tạo object dễ dàng                 |
| `@Document`           | Class  | Spring Data MongoDB: Đánh dấu entity và tên collection        |
| `@Id`                 | Field  | Đánh dấu trường là Primary Key                                |
| `@Field`              | Field  | Mapping tên field trong Java với tên field trong MongoDB      |
| `@Indexed`            | Field  | Tạo index trên field để tăng tốc độ truy vấn                  |

### 🔍 Indexes Được Tạo

1. **`currentPlanId`**: Index đơn giản

   - **Mục đích**: Tìm kiếm user theo kế hoạch hiện tại
   - **Query tối ưu**: `db.users.find({ current_plan_id: "plan123" })`

2. **`profile.bmi`**: Index đơn giản
   - **Mục đích**: Tìm user theo khoảng BMI
   - **Query tối ưu**: `db.users.find({ "profile.bmi": { $gte: 18.5, $lte: 24.9 } })`

---

## 2. Entity: Profile

### 📝 Mô Tả

Entity `Profile` độc lập để quản lý hồ sơ sức khỏe chi tiết. Có thể tồn tại riêng hoặc nhúng trong `User`.

### 🗂️ Collection MongoDB

```java
@Document(collection = "profiles")
```

### 📊 Cấu Trúc Dữ Liệu

Tương tự như nested class `User.Profile`, nhưng có thể lưu độc lập trong collection riêng.

### 🎯 Use Case

- Khi cần lưu lịch sử thay đổi profile qua thời gian
- Khi profile có dữ liệu quá lớn, tách riêng để tối ưu
- Khi nhiều user có thể share profile template

### 🏷️ Annotation Đặc Biệt

```java
@FieldDefaults(level = AccessLevel.PRIVATE)
```

**Ý nghĩa**: Lombok tự động đặt tất cả fields thành `private`, giảm boilerplate code.

---

## 3. Entity: FitnessPlan

### 📝 Mô Tả

Entity `FitnessPlan` quản lý kế hoạch tập luyện và dinh dưỡng chi tiết cho người dùng.

### 🗂️ Collection MongoDB

```java
@Document(collection = "fitness_plans")
```

### 📊 Cấu Trúc Dữ Liệu

```java
public class FitnessPlan {
    @Id
    String id;

    @Indexed
    @Field("user_id")
    String userId;                        // Liên kết với User

    String goal;                          // Mục tiêu: "lose_weight", "build_muscle"
    String type;                          // Loại plan: "beginner", "advanced"
    Integer durationWeeks;                // Thời lượng (tuần)
    LocalDate startDate;                  // Ngày bắt đầu
    LocalDate endDate;                    // Ngày kết thúc
    Boolean isActive;                     // Đang hoạt động hay không

    Map<String, String> metadata;         // Dữ liệu mở rộng
    List<WorkoutDay> workoutDays;         // Danh sách ngày tập
    List<MealDay> mealDays;               // Danh sách ngày ăn
    PlanStats planStats;                  // Thống kê tổng quan
}
```

### 🏋️ Nested Class: WorkoutDay

**Mục đích**: Quản lý lịch tập luyện theo từng ngày

```java
public static class WorkoutDay {
    Integer dayNumber;                    // Ngày thứ mấy trong plan (1, 2, 3...)
    DayOfWeek dayOfWeek;                  // Thứ trong tuần (MONDAY, TUESDAY...)
    String note;                          // Ghi chú đặc biệt
    List<Exercise> exercises;             // Danh sách bài tập
    Integer durationMinutes;              // Tổng thời gian dự kiến
}
```

### 💪 Nested Class: Exercise

**Mục đích**: Chi tiết từng bài tập

```java
public static class Exercise {
    String id;                            // ID bài tập
    String name;                          // Tên: "Push-up", "Squat"
    String targetMuscleGroup;             // Nhóm cơ: "chest", "legs"
    String equipment;                     // Dụng cụ: "dumbbell", "barbell"

    Integer sets;                         // Số hiệp (sets)
    Integer reps;                         // Số lần lặp mỗi hiệp (null nếu theo thời gian)
    Integer restSeconds;                  // Thời gian nghỉ giữa các sets
    Integer durationSeconds;              // Thời gian thực hiện (cho bài tập như Plank)

    List<String> instructions;            // Hướng dẫn từng bước
    List<String> cues;                    // Mẹo kỹ thuật
    Double estimatedCaloriesBurn;         // Ước tính calories đốt cháy
}
```

### 🍽️ Nested Class: MealDay

**Mục đích**: Lịch trình dinh dưỡng theo ngày

```java
public static class MealDay {
    Integer dayNumber;
    DayOfWeek dayOfWeek;
    Double totalCalories;                 // Tổng calories trong ngày
    List<Meal> meals;                     // Danh sách bữa ăn
}
```

### 🥘 Nested Class: Meal

**Mục đích**: Chi tiết từng bữa ăn

```java
public static class Meal {
    private String name;                  // "Cháo yến mạch với chuối"
    private String mealType;              // "breakfast", "lunch", "dinner", "snack"
    private List<Ingredient> ingredients; // Danh sách nguyên liệu
    private NutritionInfo nutrition;      // Thông tin dinh dưỡng
    private String recipeId;              // Link công thức nấu ăn
    private String notes;                 // Ghi chú thay thế
}
```

### 🥕 Nested Class: Ingredient

```java
public static class Ingredient {
    private String name;                  // "Yến mạch"
    private Double quantity;              // 50.0
    private String unit;                  // "g", "cup", "piece", "tbsp"
    private Double priceEstimate;         // Giá ước tính (VND)
}
```

### 📊 Nested Class: NutritionInfo

```java
public static class NutritionInfo {
    private Double calories;              // Tổng calories
    private Double proteinGr;             // Protein (gram)
    private Double carbsGr;               // Carbohydrate (gram)
    private Double fatGr;                 // Fat (gram)
    private Map<String, Double> micros;   // Vitamin & khoáng chất
                                          // {"vitamin_c": 50.0, "iron": 5.0}
}
```

### 📈 Nested Class: PlanStats

**Mục đích**: Thống kê tổng quan của plan

```java
public static class PlanStats {
    private Double dailyCaloriesTarget;           // Mục tiêu calories/ngày
    private Double estimatedWeeklyWeightChangeKg; // Dự đoán thay đổi cân nặng/tuần
                                                  // Âm = giảm, dương = tăng
    private Double avgDailyProteinGr;             // Trung bình protein/ngày
    private Double avgDailyCarbsGr;               // Trung bình carbs/ngày
    private Double avgDailyFatGr;                 // Trung bình fat/ngày
}
```

### 🔍 Indexes Được Tạo

1. **`userId`**: Index đơn giản
   - **Mục đích**: Tìm tất cả plan của một user
   - **Query tối ưu**: `db.fitness_plans.find({ user_id: "user123" })`

---

## 4. Entity: PoseAnalysis

### 📝 Mô Tả

Entity `PoseAnalysis` lưu trữ kết quả phân tích tư thế tập luyện từ AI/ML model, giúp người dùng cải thiện kỹ thuật.

### 🗂️ Collection MongoDB

```java
@Document(collection = "pose_analysis")
```

### 📊 Cấu Trúc Dữ Liệu

```java
public class PoseAnalysis {
    @Id
    String id;

    @Indexed
    @Field("user_id")
    private String userId;                // User được phân tích

    @Indexed
    private LocalDate date;               // Ngày phân tích

    @Indexed
    @Field("exercise_name")
    private String exerciseName;          // Tên bài tập: "squat", "deadlift"

    String mediaUrl;                      // URL video/ảnh phân tích
    String mediaType;                     // "video" hoặc "image"

    @Field("keypoints_score")
    private Map<String, Double> keypointsScore; // Điểm các điểm khớp
                                                // {"left_knee": 0.85, "right_elbow": 0.92}

    private List<String> issues;          // Danh sách lỗi phát hiện
                                          // ["Lưng cong", "Đầu gối vượt mũi chân"]

    private List<String> suggestions;     // Gợi ý cải thiện
                                          // ["Giữ lưng thẳng", "Thu hông về phía sau"]

    @Indexed
    @Field("overall_score")
    private Double overallScore;          // Điểm tổng thể (0-100)

    @Field("workout_log_id")
    private String workoutLogId;          // Link đến workout log

    @Field("created_at")
    private OffsetDateTime createdAt;     // Thời gian tạo
}
```

### 🎯 Use Cases

1. **Theo dõi tiến bộ**: So sánh điểm số qua thời gian
2. **Cảnh báo chấn thương**: Phát hiện tư thế nguy hiểm
3. **Huấn luyện ảo**: Cung cấp feedback real-time
4. **Phân tích xu hướng**: Tìm lỗi thường xuyên nhất

### 🔍 Indexes Được Tạo

1. **`userId`**: Tìm tất cả phân tích của user
2. **`date`**: Truy vấn theo khoảng thời gian
3. **`exerciseName`**: Lọc theo bài tập cụ thể
4. **`overallScore`**: Sắp xếp theo điểm số

### 📌 Compound Index Tiềm Năng

Nên thêm để tối ưu query phức tạp:

```java
@CompoundIndexes({
    @CompoundIndex(name = "user_date_idx", def = "{'user_id': 1, 'date': -1}"),
    @CompoundIndex(name = "user_exercise_idx", def = "{'user_id': 1, 'exercise_name': 1, 'overall_score': -1}")
})
```

**Ý nghĩa**:

- `user_date_idx`: Lấy phân tích của user theo thời gian mới nhất
- `user_exercise_idx`: Lấy top phân tích điểm cao nhất của user theo bài tập

---

## 5. Entity: AIFeedback

### 📝 Mô Tả

Entity `AIFeedback` lưu các phản hồi và khuyến nghị thông minh từ AI, giúp user cải thiện hiệu quả tập luyện.

### 🗂️ Collection MongoDB

```java
@Document(collection = "ai_feedbacks")
```

### 📊 Cấu Trúc Dữ Liệu

```java
public class AIFeedback {
    @Id
    private String id;

    @Indexed
    @Field("user_id")
    private String userId;                // User nhận feedback

    @Indexed
    private OffsetDateTime timestamp;     // Thời điểm tạo feedback

    @Indexed
    @Field("feedback_type")
    private String feedbackType;          // Loại feedback:
                                          // "weekly_summary" - Tổng kết tuần
                                          // "workout_tip" - Mẹo tập luyện
                                          // "nutrition_advice" - Tư vấn dinh dưỡng
                                          // "form_correction" - Sửa lỗi tư thế

    private String summary;               // Tóm tắt ngắn gọn

    private Map<String, Object> details;  // Chi tiết đầy đủ (JSON động)
                                          // Có thể chứa: charts, metrics, trends
                                          // VD: {"avg_workout_time": 45, "calories_burned": [200, 250, 300]}

    private List<String> actions;         // Hành động đề xuất
                                          // ["Tăng protein lên 120g/ngày", "Thêm 1 ngày rest"]

    @Field("related_plan_id")
    private String relatedPlanId;         // Liên kết đến FitnessPlan

    @Field("related_date")
    private LocalDate relatedDate;        // Ngày liên quan (cho weekly summary)

    @Field("created_at")
    private OffsetDateTime createdAt;
}
```

### 🤖 Các Loại Feedback Type

| Type               | Mô Tả             | Ví Dụ                                                    |
| ------------------ | ----------------- | -------------------------------------------------------- |
| `weekly_summary`   | Tổng kết tuần     | "Bạn đã hoàn thành 5/7 ngày tập, đốt cháy 2000 calories" |
| `workout_tip`      | Mẹo tập luyện     | "Thử tăng trọng lượng dumbbell lên 2kg để thách thức cơ" |
| `nutrition_advice` | Tư vấn dinh dưỡng | "Protein của bạn thấp, nên ăn thêm trứng hoặc ức gà"     |
| `form_correction`  | Sửa tư thế        | "Tư thế squat của bạn cần cải thiện góc đầu gối"         |

### 🎯 Use Cases

1. **Động viên user**: Gửi thông báo khích lệ khi hoàn thành mục tiêu
2. **Cảnh báo sớm**: Phát hiện user không tuân thủ plan
3. **Tối ưu hóa plan**: Đề xuất điều chỉnh dựa trên kết quả
4. **Personalization**: Học từ hành vi để cải thiện gợi ý

### 🔍 Indexes Được Tạo

1. **`userId`**: Lấy tất cả feedback của user
2. **`timestamp`**: Sắp xếp theo thời gian
3. **`feedbackType`**: Lọc theo loại feedback

### 📌 Compound Index Đề Xuất

```java
@CompoundIndexes({
    @CompoundIndex(name = "user_type_time_idx", def = "{'user_id': 1, 'feedback_type': 1, 'timestamp': -1}")
})
```

**Query tối ưu**: Lấy 10 feedback mới nhất của user theo loại cụ thể.

---

## 6. Enum: DayOfWeek

### 📝 Mô Tả

Enum `DayOfWeek` đại diện cho các ngày trong tuần với label tiếng Việt.

### 📊 Cấu Trúc

```java
@Getter
public enum DayOfWeek {
    MONDAY("Thứ Hai"),
    TUESDAY("Thứ Ba"),
    WEDNESDAY("Thứ Tư"),
    THURSDAY("Thứ Năm"),
    FRIDAY("Thứ Sáu"),
    SATURDAY("Thứ Bảy"),
    SUNDAY("Chủ Nhật");

    private final String label;
}
```

### 🎯 Sử Dụng

```java
// Trong code
DayOfWeek day = DayOfWeek.MONDAY;
System.out.println(day.getLabel()); // Output: "Thứ Hai"

// Trong MongoDB sẽ lưu là: "MONDAY"
// UI hiển thị: "Thứ Hai"
```

### 🏷️ Annotation

- **`@Getter`**: Lombok tự động tạo method `getLabel()` cho tất cả enum values.

---

## Giải Thích Annotations

### 🏷️ Lombok Annotations

| Annotation                                    | Mục Đích                                       | Ví Dụ Code Sinh Ra                            |
| --------------------------------------------- | ---------------------------------------------- | --------------------------------------------- |
| `@Data`                                       | Tạo getter, setter, toString, equals, hashCode | `user.getName()`, `user.setName("John")`      |
| `@Builder`                                    | Pattern Builder để tạo object                  | `User.builder().name("John").age(25).build()` |
| `@NoArgsConstructor`                          | Constructor không tham số                      | `new User()`                                  |
| `@AllArgsConstructor`                         | Constructor đầy đủ tham số                     | `new User("id", "email", "name"...)`          |
| `@FieldDefaults(level = AccessLevel.PRIVATE)` | Tự động đặt fields thành private               | `private String name;`                        |
| `@Getter`                                     | Chỉ tạo getter methods                         | `user.getName()`                              |
| `@Setter`                                     | Chỉ tạo setter methods                         | `user.setName("John")`                        |

### 🗄️ Spring Data MongoDB Annotations

| Annotation                        | Vị Trí | Mục Đích                                       |
| --------------------------------- | ------ | ---------------------------------------------- |
| `@Document(collection = "users")` | Class  | Đánh dấu entity và tên collection MongoDB      |
| `@Id`                             | Field  | Định danh Primary Key (tự động ObjectId)       |
| `@Field("field_name")`            | Field  | Map tên field Java sang MongoDB (snake_case)   |
| `@Indexed`                        | Field  | Tạo index đơn giản để tăng tốc query           |
| `@CompoundIndex`                  | Class  | Tạo index phức hợp trên nhiều field            |
| `@DBRef`                          | Field  | Tham chiếu đến document khác (như Foreign Key) |

### 📌 Ví Dụ Cụ Thể

```java
@Document(collection = "users")  // → Collection name trong MongoDB
public class User {
    @Id  // → _id trong MongoDB (ObjectId tự động)
    private String id;

    @Field("created_at")  // → Java: createdAt, MongoDB: created_at
    private OffsetDateTime createdAt;

    @Indexed  // → Tạo index trên field này
    private String email;
}
```

**MongoDB Document Tương Ứng**:

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "created_at": "2025-11-13T10:30:00Z"
}
```

---

## Chiến Lược Indexing

### 🎯 Nguyên Tắc Chọn Index

1. **Index các field được query thường xuyên**

   - `userId` trong tất cả entities liên quan
   - `email` trong User (cho đăng nhập)
   - `date`, `timestamp` (cho query theo thời gian)

2. **Index các field dùng để sort**

   - `overallScore` trong PoseAnalysis
   - `createdAt` trong các entities

3. **Compound Index cho query phức tạp**
   - `{userId: 1, date: -1}` - Lấy data mới nhất của user
   - `{userId: 1, exerciseName: 1}` - Lọc theo user và bài tập

### 📊 Index Hiện Tại Trong Hệ Thống

| Entity       | Field           | Index Type | Mục Đích               |
| ------------ | --------------- | ---------- | ---------------------- |
| User         | `currentPlanId` | Single     | Tìm user theo plan     |
| User         | `profile.bmi`   | Single     | Query theo khoảng BMI  |
| FitnessPlan  | `userId`        | Single     | Lấy plan của user      |
| PoseAnalysis | `userId`        | Single     | Lấy phân tích của user |
| PoseAnalysis | `date`          | Single     | Query theo thời gian   |
| PoseAnalysis | `exerciseName`  | Single     | Lọc theo bài tập       |
| PoseAnalysis | `overallScore`  | Single     | Sort theo điểm         |
| AIFeedback   | `userId`        | Single     | Lấy feedback của user  |
| AIFeedback   | `timestamp`     | Single     | Sort theo thời gian    |
| AIFeedback   | `feedbackType`  | Single     | Lọc theo loại          |

### 🚀 Đề Xuất Compound Indexes

```java
// Trong PoseAnalysis.java
@CompoundIndexes({
    @CompoundIndex(name = "user_date_idx",
                   def = "{'user_id': 1, 'date': -1}"),
    @CompoundIndex(name = "user_exercise_score_idx",
                   def = "{'user_id': 1, 'exercise_name': 1, 'overall_score': -1}")
})
```

```java
// Trong AIFeedback.java
@CompoundIndexes({
    @CompoundIndex(name = "user_type_time_idx",
                   def = "{'user_id': 1, 'feedback_type': 1, 'timestamp': -1}")
})
```

```java
// Trong User.java
@CompoundIndexes({
    @CompoundIndex(name = "email_active_idx",
                   def = "{'email': 1, 'isActive': 1}",
                   unique = true)
})
```

### ⚠️ Lưu Ý Về Index

1. **Quá nhiều index = Chậm khi write**

   - Mỗi index phải update khi insert/update/delete
   - Chỉ tạo index cho query thực sự cần

2. **Index order quan trọng**

   - `{userId: 1, date: -1}` ≠ `{date: -1, userId: 1}`
   - Rule: Field thường query = trước, field sort = sau

3. **Monitor index usage**
   - Dùng MongoDB Compass hoặc `explain()` để kiểm tra
   - Xóa index không dùng đến

---

## 🔗 Mối Quan Hệ Giữa Các Entities

```
┌──────────┐
│   User   │
└────┬─────┘
     │
     ├─────► Profile (embedded hoặc referenced)
     │
     ├─────► FitnessPlan (via currentPlanId)
     │        └─► WorkoutDay
     │             └─► Exercise
     │        └─► MealDay
     │             └─► Meal
     │                  └─► Ingredient
     │                  └─► NutritionInfo
     │
     ├─────► PoseAnalysis (via userId)
     │
     └─────► AIFeedback (via userId)
```

---

## 📚 Best Practices

### ✅ Nên Làm

1. **Sử dụng @Field cho snake_case naming**

   ```java
   @Field("created_at")
   private OffsetDateTime createdAt;
   ```

2. **Index các foreign key**

   ```java
   @Indexed
   @Field("user_id")
   private String userId;
   ```

3. **Dùng Builder pattern cho complex objects**

   ```java
   User user = User.builder()
       .email("test@example.com")
       .fullName("John Doe")
       .age(25)
       .build();
   ```

4. **Validate dữ liệu với Bean Validation**

   ```java
   @Email
   private String email;

   @NotNull
   @Min(1)
   @Max(150)
   private Integer age;
   ```

### ❌ Không Nên Làm

1. **Không index mọi field**
2. **Không lưu password plain text** (đã hash trong code)
3. **Không dùng ID số nguyên tự tăng** (dùng ObjectId của MongoDB)
4. **Không quên timezone** (dùng OffsetDateTime thay vì LocalDateTime)

---

## 🎓 Kết Luận

Hệ thống entities được thiết kế với:

- ✅ **Tính mở rộng cao**: Sử dụng Map, List cho dữ liệu động
- ✅ **Performance tốt**: Index strategy hợp lý
- ✅ **Maintainability**: Lombok giảm boilerplate code
- ✅ **Flexibility**: MongoDB schema linh hoạt
- ✅ **Best practices**: Follow Spring Data MongoDB conventions

---

**Tài liệu này được cập nhật**: 13/11/2025  
**Version**: 1.0  
**Người soạn**: GitHub Copilot (AI Assistant)
