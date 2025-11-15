package hcmute.hackathon.vibecoders.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import hcmute.hackathon.vibecoders.dto.request.PythonAnalysisRequest;
import hcmute.hackathon.vibecoders.dto.request.WHNoteRequestDTO;
import hcmute.hackathon.vibecoders.entity.Event;
import hcmute.hackathon.vibecoders.entity.WHNote;
import hcmute.hackathon.vibecoders.entity.WorkoutTrackerDocument;
import hcmute.hackathon.vibecoders.exception.CustomException;
import hcmute.hackathon.vibecoders.repository.EventRepository;
import hcmute.hackathon.vibecoders.repository.WHNoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.ZoneOffset;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WHNoteService {
    private final WHNoteRepository whNoteRepository;
    private final WebClient webClient;
    private final EventRepository eventRepository;
    private final ObjectMapper objectMapper;
    public WHNote addNote(WHNoteRequestDTO requestDTO){
        Jwt principal = (Jwt) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String email = principal.getClaim("sub").toString();
        WHNote model ;
        boolean isNewNote = requestDTO.getId().contains("temp");
        if(isNewNote){
            model = WHNote.builder()
                    .title(requestDTO.getTitle())
                    .content(requestDTO.getContent())
                    .email(email)
                    .createdAt(Instant.now())
                    .build();
        } else{
            model = whNoteRepository.findById(requestDTO.getId()).orElseThrow(()-> new CustomException("Cant find Note",HttpStatus.BAD_REQUEST));
            model.setTitle(requestDTO.getTitle());
            model.setContent(requestDTO.getContent());
        }

        model.setAddCalendar(requestDTO.isAddCalendar());
        WHNote savedNote = whNoteRepository.save(model);

        if (savedNote.isAddCalendar() && isNewNote) {
            callPythonAnalysis(savedNote);
        }

        return savedNote;
    }
    public String deleteNote(String noteId){
        WHNote note = whNoteRepository.findById(noteId).orElseThrow(()-> new CustomException("Cant find note", HttpStatus.BAD_REQUEST));
        whNoteRepository.delete(note);
        return "Success";
    }

    public Page<WHNote> getWHNote(int page, int size,String keyword) {
        Jwt principal = (Jwt) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String email = principal.getClaim("sub").toString();

        Pageable pageable = PageRequest.of(page, size);

        if (keyword == null || keyword.isBlank()) {
            return whNoteRepository.findByEmailOrderByCreatedAtDesc(email, pageable);
        }

        return whNoteRepository.searchNotes(email, keyword, pageable);
    }

    @Async
    public void callPythonAnalysis(WHNote newNote){
        String userEmail = newNote.getEmail();
        YearMonth currentYearMonth = YearMonth.now();
        LocalDateTime startOfMonth = currentYearMonth.atDay(1).atStartOfDay();
        LocalDateTime endOfMonth = currentYearMonth.atEndOfMonth().atTime(23, 59, 59);

        List<Event> eventsInMonth = eventRepository.findByEmailAndEventDateTimeBetween(userEmail, startOfMonth, endOfMonth);


        PythonAnalysisRequest requestBody = PythonAnalysisRequest.builder()
                .userEmail(userEmail)
                .newNote(newNote)
                .allEventsInMonth(eventsInMonth)
                .build();

        String pythonUrl = "http:/localhost:8000/api/notes/analyze";

        webClient.post()
                .uri(pythonUrl)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .subscribe(
                        jsonResponse -> {
                            System.out.println("Python server responded (raw JSON): " + jsonResponse);
                            try {
                                Event[] eventsArray = objectMapper.readValue(jsonResponse, Event[].class);
                                List<Event> suggestedEvents = Arrays.asList(eventsArray);

                                if (suggestedEvents != null && !suggestedEvents.isEmpty()) {
                                    System.out.println("AI suggested " + suggestedEvents.size() + " new events.");
                                    suggestedEvents.forEach(event -> {
                                        event.setEmail(userEmail);
                                        if (event.getId() == null || event.getId().isBlank()) {
                                            event.setId(UUID.randomUUID().toString());
                                        }
                                        eventRepository.save(event);
                                        System.out.println("Saved AI suggested event: " + event.getTitle());
                                    });
                                } else {
                                    System.out.println("Python server did not suggest any new events.");
                                }

                            } catch (Exception e) {
                                System.err.println("Error deserializing Python response: " + e.getMessage());
                                e.printStackTrace();
                            }
                        },
                        error -> System.err.println("Error calling Python server: " + error.getMessage())
                );
    }
}
