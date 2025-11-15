package hcmute.hackathon.vibecoders.repository;

import hcmute.hackathon.vibecoders.entity.FlashCard;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface FlashCardRepository extends MongoRepository<FlashCard, String> {
}
