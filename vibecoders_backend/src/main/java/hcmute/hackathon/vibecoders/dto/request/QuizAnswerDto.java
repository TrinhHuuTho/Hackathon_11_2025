package hcmute.hackathon.vibecoders.dto.request;

import hcmute.hackathon.vibecoders.dto.response.QuizSet;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document("quiz_answer")
public class QuizAnswerDto {
    String id;
    QuizSet quizSets;
    List<String> userAnswers;
    String email;
}
