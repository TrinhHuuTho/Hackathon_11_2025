package hcmute.hackathon.vibecoders.service.impl;

import hcmute.hackathon.vibecoders.dto.request.WHNoteRequestDTO;
import hcmute.hackathon.vibecoders.entity.WHNote;
import hcmute.hackathon.vibecoders.entity.WorkoutTrackerDocument;
import hcmute.hackathon.vibecoders.exception.CustomException;
import hcmute.hackathon.vibecoders.repository.WHNoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class WHNoteService {
    private final WHNoteRepository whNoteRepository;
    public WHNote addNote(WHNoteRequestDTO requestDTO){
        Jwt principal = (Jwt) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String email = principal.getClaim("sub").toString();
        WHNote model ;
        if(requestDTO.getId().contains("temp")){
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

        return whNoteRepository.save(model);
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
}
