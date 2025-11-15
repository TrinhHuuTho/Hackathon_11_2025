package hcmute.hackathon.vibecoders.controller;

import hcmute.hackathon.vibecoders.dto.request.FlashCardRequest;
import hcmute.hackathon.vibecoders.dto.request.WholeFlashCardRequest;
import hcmute.hackathon.vibecoders.dto.response.ResponseData;
import hcmute.hackathon.vibecoders.entity.FlashCard;
import hcmute.hackathon.vibecoders.exception.CustomException;
import hcmute.hackathon.vibecoders.repository.FlashCardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/flashcards")
@RequiredArgsConstructor
public class FlashCardController {
    private final FlashCardRepository flashCardRepository;

    @GetMapping
    public ResponseData<?> getAllFlashCards() {
        return ResponseData.success(flashCardRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseData<?> getFlashCardById(@PathVariable String id) {
        return ResponseData.success(flashCardRepository.findById(id));
    }

    @PostMapping("/whole")
    public ResponseData<?> createWholeFlashCards(@RequestBody WholeFlashCardRequest request) {
        List<FlashCard> flashCards = request.getFlashCards().stream()
                .map(fl -> {
                    FlashCard flashCard = FlashCard.builder()
                            .cards(fl.getCardRequests().stream()
                                    .map(cardRequest -> FlashCard.Card.builder()
                                            .front(cardRequest.getFront())
                                            .back(cardRequest.getBack())
                                            .build()).toList())
                            .createdAt(Instant.now())  // set thời điểm tạo
                            .updatedAt(Instant.now())  // initial = created
                            .isSaved(false)
                            .build();
                    return flashCard;
                }).toList();

        List<FlashCard> saved = flashCardRepository.saveAll(flashCards);
        return ResponseData.success(saved);
    }

    @PostMapping("/single")
    public ResponseData<?> saveFlashCardToReview(@RequestBody FlashCardRequest request) {
        FlashCard flashCard = flashCardRepository.findById(request.getId())
                .orElseThrow(() -> new CustomException("FlashCard not found", HttpStatus.NOT_FOUND));
        flashCard.setSaved(true);
        flashCardRepository.save(flashCard);
        return null;
    }

}
