package hcmute.hackathon.vibecoders.controller;

import hcmute.hackathon.vibecoders.dto.request.FlashCardRequestDto;
import hcmute.hackathon.vibecoders.dto.request.QuizAnswerDto;
import hcmute.hackathon.vibecoders.dto.request.QuizCardRequestDTO;
import hcmute.hackathon.vibecoders.dto.request.QuizRequestDto;
import hcmute.hackathon.vibecoders.dto.response.FlashcardSet;
import hcmute.hackathon.vibecoders.dto.response.QuizSet;
import hcmute.hackathon.vibecoders.dto.response.ResponseData;
import hcmute.hackathon.vibecoders.repository.QuizAnswerDtoRepo;
import hcmute.hackathon.vibecoders.repository.QuizRepository;
import hcmute.hackathon.vibecoders.service.impl.UserServiceImpl;
import hcmute.hackathon.vibecoders.util.PythonUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.client.WebClient;

@RestController
@RequestMapping("/api/quiz")
@RequiredArgsConstructor
public class QuizController {
    private final WebClient webClient = WebClient.builder().build();
    private final QuizRepository quizRepository;
    private final QuizAnswerDtoRepo quizAnswerDtoRepo;
    private final UserServiceImpl userService;

    @PostMapping("/save")
    public ResponseData<?> saveQuizAndAnswer(@RequestBody @Valid QuizAnswerDto requestDto) {
        requestDto.setEmail(userService.getCurrentUser().getEmail());
        return ResponseData.success(quizAnswerDtoRepo.save(requestDto));
    }

    // call python api
    @PostMapping("/generate")
    public ResponseData<?> generateFlashCard(@Valid @RequestBody QuizCardRequestDTO dto) {
        String url = PythonUtil.PYTHON_SERVICE_QUIZ + "/generate";

        // Nếu muốn save vào DB thì làm ở đây
        var result = webClient.post()
                .uri(url)
                .bodyValue(dto)
                .retrieve()
                .bodyToMono(QuizSet.class)
                .map(QuizSet::getQuestions)
                .block();
        return ResponseData.success(result);

    }
}
