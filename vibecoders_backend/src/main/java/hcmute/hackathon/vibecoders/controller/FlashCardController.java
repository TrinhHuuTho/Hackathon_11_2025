package hcmute.hackathon.vibecoders.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import hcmute.hackathon.vibecoders.dto.request.FlashCardRequest;
import hcmute.hackathon.vibecoders.dto.request.FlashCardRequestDto;
import hcmute.hackathon.vibecoders.dto.request.WholeFlashCardRequest;
import hcmute.hackathon.vibecoders.dto.response.FlashcardSet;
import hcmute.hackathon.vibecoders.dto.response.ResponseData;
import hcmute.hackathon.vibecoders.entity.Card;
import hcmute.hackathon.vibecoders.entity.Event;
import hcmute.hackathon.vibecoders.entity.FlashCard;
import hcmute.hackathon.vibecoders.entity.User;
import hcmute.hackathon.vibecoders.exception.CustomException;
import hcmute.hackathon.vibecoders.repository.CardRepository;
import hcmute.hackathon.vibecoders.repository.FlashCardRepository;
import hcmute.hackathon.vibecoders.service.impl.UserServiceImpl;
import hcmute.hackathon.vibecoders.util.PythonUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/flashcards")
@RequiredArgsConstructor
public class FlashCardController {
    private final WebClient webClient = WebClient.builder().build();
    private final FlashCardRepository flashCardRepository;
    private final ObjectMapper objectMapper;
    private final UserServiceImpl userServiceImpl;
    private final CardRepository cardRepository;

    @PostMapping("/saveCard")
    public ResponseData<?> saveCardToReview(@RequestBody Card request) {
        request.setEmail(userServiceImpl.getCurrentUser().getEmail());
        cardRepository.save(request);
        return ResponseData.success("Successfully saved FlashCard");
    }

    @GetMapping("/review")
    public ResponseData<?> getCardsFromReview() {
        return ResponseData.success(
                cardRepository.findByEmail(userServiceImpl.getCurrentUser().getEmail())
        );
    }

    // call python api
    @PostMapping("/generate")
    public ResponseData<?> generateFlashCard(@Valid @RequestBody FlashCardRequestDto dto) {
        String url = PythonUtil.PYTHON_SERVICE_FLASH_CARD + "/generate";

        // Nếu muốn save vào DB thì làm ở đây
        var result = webClient.post()
                .uri(url)
                .bodyValue(dto)
                .retrieve()
                .bodyToMono(FlashcardSet.class)
                .map(FlashcardSet::getFlashcards)
                .block();

        List<FlashCard.Card> flashCards = result.stream()
                .map(fl -> FlashCard.Card.builder()
                        .front(fl.getFront())
                        .back(fl.getBack())
                        .build()).toList();

        FlashCard flashCard = FlashCard.builder()
                .cards(flashCards)
                .email(userServiceImpl.getCurrentUser().getEmail())
                .build();
        flashCardRepository.save(flashCard);

        return ResponseData.success(result);
    }

    @GetMapping
    public ResponseData<?> getAllFlashCards() {
        return ResponseData.success(flashCardRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseData<?> getFlashCardById(@PathVariable String id) {
        return ResponseData.success(flashCardRepository.findById(id));
    }

}
