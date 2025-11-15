package hcmute.hackathon.vibecoders.controller;

import hcmute.hackathon.vibecoders.dto.response.ResponseData;
import hcmute.hackathon.vibecoders.entity.User;
import hcmute.hackathon.vibecoders.repository.UserRepository;
import hcmute.hackathon.vibecoders.service.impl.UserServiceImpl;
import hcmute.hackathon.vibecoders.util.PythonUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Objects;

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
    public ResponseData<Map<String, String>> getTextSummary(@RequestPart("files") List<MultipartFile> files) throws IOException {
        String summarizeUrl = PythonUtil.PYTHON_SERVICE_URL + "/summarize";
        String imgOrcUrl = PythonUtil.PYTHON_SERVICE_URL + "/image_ocr";

        MultipartBodyBuilder builder = new MultipartBodyBuilder();

        for (MultipartFile multipartFile : files) {
            builder
                    .part("files", multipartFile.getBytes())   // 🔥 field name = "files"
                    .filename(multipartFile.getOriginalFilename())
                    .contentType(MediaType.parseMediaType(multipartFile.getContentType()));  // 🔥 đúng MIME type
        }

        var recognize = webClient.post()
                .uri(imgOrcUrl)
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData(builder.build()))
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .block();

        assert recognize != null;
        Map<String, String> body = Map.of("text", recognize.get("text").toString());

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
