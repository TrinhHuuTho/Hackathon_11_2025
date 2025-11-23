package hcmute.hackathon.vibecoders.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Map;

@RestController
@RequestMapping("/api/python")
@RequiredArgsConstructor
public class JavaCallPythonController {
    private final WebClient webClient = WebClient.builder().build();

    private final static String PYTHON_SERVICE_URL = "http://127.0.0.1:8000";
    private final static String RAG_SERVICE_URL = "http://127.0.0.1:8006";


    public void updateVectorDB() {

    }

    @GetMapping("/summarize")
    public Mono<Map<String,String>> getSummaryText() {
        String url = PYTHON_SERVICE_URL + "/summarize";

        Map<String, String> body = Map.of(
                "text", "OOP là viết tắt của Object-Oriented Programming (Lập trình hướng đối tượng), là một mô hình lập trình dựa trên khái niệm \"đối tượng\". Nó giúp tổ chức mã nguồn thành các đối tượng (chứa cả dữ liệu và hành vi) để dễ quản lý, tái sử dụng và bảo trì, đặc biệt hiệu quả cho các dự án phức tạp. \n" +
                        "Khái niệm chính\n" +
                        "Đối tượng (Object): Là một thực thể bao gồm dữ liệu (thuộc tính) và các hành vi (phương thức) mà đối tượng có thể thực hiện.\n" +
                        "Lớp (Class): Là một bản thiết kế, một khuôn mẫu để tạo ra các đối tượng. Các đối tượng được tạo ra từ cùng một lớp sẽ có các thuộc tính và phương thức giống nhau. "
        );

        return webClient.post()
                .uri(url)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, String>>() {});
    }

    @GetMapping("/image_ocr")
    public Mono<Map<String,String>> getTextByOCR(@RequestPart("file") MultipartFile file) {
        String url = PYTHON_SERVICE_URL + "/image_ocr";

        return webClient.post()
                .uri(url)
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData("file", file.getResource()))
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, String>>() {});
    }

}
