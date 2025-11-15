package hcmute.hackathon.vibecoders.repository;

import hcmute.hackathon.vibecoders.entity.Card;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface CardRepository extends MongoRepository<Card, String> {
    List<Card> findByEmail(String email);
}
