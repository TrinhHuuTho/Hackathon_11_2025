package hcmute.hackathon.vibecoders.repository;

import hcmute.hackathon.vibecoders.dto.request.QuizAnswerDto;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;

public interface QuizAnswerDtoRepo extends MongoRepository<QuizAnswerDto, String> {
    List<QuizAnswerDto> findByEmail(String email);

    @Query("{ 'passed': false }")
    List<QuizAnswerDto> findByPassed();
}
