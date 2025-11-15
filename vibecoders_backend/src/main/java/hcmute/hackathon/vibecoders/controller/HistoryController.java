package hcmute.hackathon.vibecoders.controller;

import hcmute.hackathon.vibecoders.dto.request.QuizAnswerDto;
import hcmute.hackathon.vibecoders.dto.response.ResponseData;
import hcmute.hackathon.vibecoders.entity.FlashCard;
import hcmute.hackathon.vibecoders.repository.FlashCardRepository;
import hcmute.hackathon.vibecoders.repository.QuizAnswerDtoRepo;
import hcmute.hackathon.vibecoders.service.impl.UserServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/histories")
@RequiredArgsConstructor
public class HistoryController {
    private final UserServiceImpl userService;
    private final FlashCardRepository flashCardRepository;
    private final QuizAnswerDtoRepo quizAnswerDtoRepo;

    @GetMapping("/flashcards")
    public ResponseData<?> getFlashCardHistory() {
        String email = userService.getCurrentUser().getEmail();
        List<FlashCard> flashCardsOfUser = flashCardRepository.findByEmail(email);
        return ResponseData.success(flashCardsOfUser);
    }

    @GetMapping("/flashcards/{id}")
    public ResponseData<?> getFlashcardById(@PathVariable String id) {
        return ResponseData.success(flashCardRepository.findById(id));
    }

    @GetMapping("/quizs")
    public ResponseData<?> getQuizHistory() {
        String email = userService.getCurrentUser().getEmail();
        return ResponseData.success(quizAnswerDtoRepo.findByEmail(email));
    }

    @GetMapping("/quiz/{id}")
    public ResponseData<?> getQuizById(@PathVariable String id) {
        String email = userService.getCurrentUser().getEmail();
       QuizAnswerDto quiz = quizAnswerDtoRepo.findByEmail(email).stream()
               .filter(q -> q.getId().equals(id)).findFirst().orElse(null);
        return ResponseData.success(quiz);
    }

}
