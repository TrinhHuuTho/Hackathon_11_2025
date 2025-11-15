package hcmute.hackathon.vibecoders.controller;

import hcmute.hackathon.vibecoders.dto.response.ResponseData;
import hcmute.hackathon.vibecoders.entity.User;
import hcmute.hackathon.vibecoders.repository.UserRepository;
import hcmute.hackathon.vibecoders.service.impl.UserServiceImpl;
import hcmute.hackathon.vibecoders.util.PythonUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/api/generate")
@RequiredArgsConstructor
public class SummaryController {
    private final WebClient webClient = WebClient.builder().build();
    private final UserServiceImpl userService;
    private final UserRepository userRepository;

    @PostMapping("/saveSummary")
    public ResponseData<?> saveSummaryAfterEdit(@RequestParam("summary") String summary){
        User user = userService.getCurrentUser();
        user.setSummaries(Collections.singletonList(summary));
        userRepository.save(user);
        return ResponseData.success("Summary Saved");
    }

    @PostMapping("/summarize")
    public ResponseData<Map<String, String>> getTextSummary(@RequestPart("file") MultipartFile file) {
        String summarizeUrl = PythonUtil.PYTHON_SERVICE_URL + "/summarize";
        String imgOrcUrl = PythonUtil.PYTHON_SERVICE_URL + "/image_ocr";

        var recognize = webClient.post()
                .uri(imgOrcUrl)
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData("file", file.getResource()))
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, String>>() {})
                .block();

        Map<String, String> body = Map.of("text", recognize.get("text"));

        // unwrap Mono tại server
        Map<String, String> result = webClient.post()
                .uri(summarizeUrl)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, String>>() {})
                .block();  // <- unwrap Mono thành Map trực tiếp

        return ResponseData.success(result);
    }

}
