package hcmute.hackathon.vibecoders.repository;

import hcmute.hackathon.vibecoders.entity.WHNote;
import hcmute.hackathon.vibecoders.entity.WorkoutTrackerDocument;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface WHNoteRepository extends MongoRepository<WHNote, String> {
    Page<WHNote> findByEmailOrderByCreatedAtDesc(String email, Pageable pageable);
    @Query("{ 'email': ?0, $or: [ { 'title': { $regex: ?1, $options: 'i' } }, { 'content': { $regex: ?1, $options: 'i' } } ] }")
    Page<WHNote> searchNotes(String email, String keyword, Pageable pageable);
}
