package hcmute.hackathon.vibecoders.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.Transformation;
import com.cloudinary.utils.ObjectUtils;
import hcmute.hackathon.vibecoders.dto.request.WorkoutTrackerRequestDTO;
import hcmute.hackathon.vibecoders.dto.response.WorkoutTrackerResponse;
import hcmute.hackathon.vibecoders.entity.WorkoutTrackerDocument;
import hcmute.hackathon.vibecoders.repository.WorkoutTrackerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkoutTrackerServiceImpl {
    private final Cloudinary cloudinary;
    private final WebClient webClient;
    private final WorkoutTrackerRepository workoutTrackerRepository;

    public WorkoutTrackerResponse tracker(List<MultipartFile> files) throws IOException {

        if (files == null || files.isEmpty()) {
            throw new RuntimeException("File không được để trống");
        }

        MultipartFile file = files.get(0);
        String pythonUrl = "http://localhost:8082/api/analyze";
        ByteArrayResource fileResource = new ByteArrayResource(file.getBytes()) {
            @Override
            public String getFilename() {
                return file.getOriginalFilename();
            }
        };

        Map<String, Object> response = webClient.post()
                .uri(pythonUrl)
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData("file", fileResource))
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .block();

        if (response == null) {
            throw new RuntimeException("Python service không trả dữ liệu");
        }

        Double point = ((Number) response.get("point")).doubleValue();
        String comment = (String) response.get("comment");

        return WorkoutTrackerResponse.builder()
                .point(point)
                .comment(comment)
                .build();
    }

    public WorkoutTrackerDocument saveTracker(List<MultipartFile> files, WorkoutTrackerRequestDTO dto) {
        Jwt principal = (Jwt) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String email = principal.getClaim("sub").toString();

//        String fileUrls = upload(files.get(0));
        String fileUrls = "upload(files.get(0))";
        WorkoutTrackerDocument document = WorkoutTrackerDocument.builder()
                .email(email)
                .score(dto.getScore())
                .comment(dto.getComment())
                .note(dto.getNote())
                .fileUrl(fileUrls)
                .createdAt(Instant.now())
                .build();

        return workoutTrackerRepository.save(document);
    }
    public Page<WorkoutTrackerDocument> getWorkoutHistory(int page, int size) {
        Jwt principal = (Jwt) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String email = principal.getClaim("sub").toString();

        return workoutTrackerRepository.findByEmailOrderByCreatedAtDesc(email, PageRequest.of(page, size));
    }
    public String upload(MultipartFile multipartFile) {
        try {
            String fileName = multipartFile.getOriginalFilename();
            File file = this.convertToFile(multipartFile, fileName);
            String URL = this.uploadHlsToCloudinary(file);
            if (file.delete()) {
                System.out.println("File deleted successfully");
            } else {
                System.err.println("Failed to delete file");
            }
            return URL;
        } catch (Exception e) {
            e.printStackTrace();
            return "Image couldn't upload, Something went wrong";
        }
    }
    public String uploadHlsToCloudinary(File mp4File) throws IOException {
        if (!mp4File.exists() || !mp4File.isFile()) {
            throw new IllegalArgumentException("File does not exist or is not a file");
        }

        Transformation hlsTransformation = new Transformation()
                .param("streaming_profile", "full_hd");

        Map uploadResult = cloudinary.uploader().uploadLarge(mp4File,
                ObjectUtils.asMap(
                        "resource_type", "video",
                        "folder", "videos/" + UUID.randomUUID(),
                        "public_id", "master",
                        "eager", Arrays.asList(hlsTransformation),
                        "eager_async", true
                ));

        return uploadResult.get("playback_url").toString();
    }
    public File convertToFile(MultipartFile multipartFile, String fileName) throws IOException {
        File tempFile = new File(fileName);
        try (FileOutputStream fos = new FileOutputStream(tempFile)) {
            fos.write(multipartFile.getBytes());
        }
        return tempFile;
    }
}
