package hcmute.hackathon.vibecoders.service.impl;

import hcmute.hackathon.vibecoders.entity.Event;
import hcmute.hackathon.vibecoders.exception.CustomException;
import hcmute.hackathon.vibecoders.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class EventService {

    @Autowired
    private EventRepository eventRepository;

    public Event createEvent(Event event) {
        if (event.getId() == null || event.getId().isEmpty()) {
            event.setId(UUID.randomUUID().toString());
        }
        Jwt principal = (Jwt) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String email = principal.getClaim("sub").toString();
        event.setEmail(email);
        event.setNotificationSent(false);
        return eventRepository.save(event);
    }

    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }
    public Page<Event> getEvents(int page, int size, String keyword) {
        Jwt principal = (Jwt) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String email = principal.getClaim("sub").toString();


        Sort sort = Sort.by(Sort.Direction.ASC, "date", "time");

        Pageable pageable = PageRequest.of(page, size, sort);

        if (keyword == null || keyword.isBlank()) {
            return eventRepository.findByEmailOrderByDateAscTimeAsc(email, pageable);
        }

        return eventRepository.searchEvents(email, keyword, pageable);
    }
    public Optional<Event> getEventById(String id) {
        return eventRepository.findById(id);
    }

    public Event updateEvent(Event event) {
        Jwt principal = (Jwt) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String email = principal.getClaim("sub").toString();
        return eventRepository.findById(event.getId())
                .map(existing -> {
                    existing.setTitle(event.getTitle());
                    existing.setDescription(event.getDescription());
                    existing.setDate(event.getDate());
                    existing.setTime(event.getTime());
                    existing.setEmail(email);
                    existing.setColor(event.getColor());
                    return eventRepository.save(existing);
                }).orElseThrow(() -> new CustomException("Event not found with id ", HttpStatus.BAD_REQUEST));
    }

    public String deleteEvent(String id) {
        if (!eventRepository.existsById(id)) {
            throw new RuntimeException("Event not found with id " + id);
        }
        eventRepository.deleteById(id);
        return "Success";
    }
}
