package hcmute.hackathon.vibecoders.repository;

import hcmute.hackathon.vibecoders.entity.Quiz;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface QuizRepository extends MongoRepository<Quiz, String> {
}
