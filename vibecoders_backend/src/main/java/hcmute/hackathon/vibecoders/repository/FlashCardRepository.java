package hcmute.hackathon.vibecoders.repository;

import hcmute.hackathon.vibecoders.entity.FlashCard;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface FlashCardRepository extends MongoRepository<FlashCard, String> {

    List<FlashCard> findByEmail(String email);
}
