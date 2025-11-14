package hcmute.hackathon.vibecoders.repository;

import hcmute.hackathon.vibecoders.entity.WorkoutTrackerDocument;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface WorkoutTrackerRepository extends MongoRepository<WorkoutTrackerDocument, String> {
    Page<WorkoutTrackerDocument> findByEmailOrderByCreatedAtDesc(String email, Pageable pageable);
}
