package hcmute.hackathon.vibecoders.repository;

import hcmute.hackathon.vibecoders.entity.Event;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.time.LocalDateTime;
import java.util.List;

public interface EventRepository extends MongoRepository<Event, String> {
    Page<Event> findByEmailOrderByDateAscTimeAsc(String email, Pageable pageable);
    List<Event> findByEventDateTimeBeforeAndNotificationSentIsFalse(LocalDateTime now);
    @Query("{ 'email': ?0, $or: [ { 'title': { $regex: ?1, $options: 'i' } }, { 'description': { $regex: ?1, $options: 'i' } } ] }")
    Page<Event> searchEvents(String email, String keyword, Pageable pageable);
}