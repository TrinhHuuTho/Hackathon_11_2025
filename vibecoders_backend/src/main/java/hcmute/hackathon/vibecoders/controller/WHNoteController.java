package hcmute.hackathon.vibecoders.controller;

import hcmute.hackathon.vibecoders.dto.request.SignupRequestDto;
import hcmute.hackathon.vibecoders.dto.request.WHNoteRequestDTO;
import hcmute.hackathon.vibecoders.dto.response.ResponseData;
import hcmute.hackathon.vibecoders.service.impl.WHNoteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notes")
@RequiredArgsConstructor
public class WHNoteController {
    private final WHNoteService whNoteService;
    @PostMapping()
    public ResponseData<?> addNote(@Valid @RequestBody WHNoteRequestDTO dto) {
        return new ResponseData<>(HttpStatus.CREATED.value(),"Success", whNoteService.addNote(dto));
    }

    @DeleteMapping("/{noteId}")
    public ResponseData<?> deleteNote(@PathVariable String noteId) {
        return new ResponseData<>(HttpStatus.CREATED.value(),"Success", whNoteService.deleteNote(noteId));
    }

    @GetMapping
    public ResponseData<?> getNotes(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String keyword
    ) {
        return new ResponseData<>(
                HttpStatus.OK.value(),
                "Success",
                whNoteService.getWHNote(page, size, keyword)
        );
    }

}
