package hcmute.hackathon.vibecoders.repository;

import hcmute.hackathon.vibecoders.entity.Test;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface TestRepository extends MongoRepository<Test, String> {
}
