package hcmute.hackathon.vibecoders.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import hcmute.hackathon.vibecoders.dto.request.WorkoutTrackerRequestDTO;
import hcmute.hackathon.vibecoders.dto.response.ResponseData;
import hcmute.hackathon.vibecoders.entity.WorkoutTrackerDocument;
import hcmute.hackathon.vibecoders.service.impl.WorkoutTrackerServiceImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
@RestController
@RequestMapping("/api/workout-tracker")
@RequiredArgsConstructor
public class WorkoutTrackerController {
    private final WorkoutTrackerServiceImpl workoutTrackerService;
    @PostMapping("/tracker")
    public ResponseData<?> tracker(@RequestPart(value = "files", required = false) List<MultipartFile> files) throws IOException {
        return new ResponseData<>(HttpStatus.CREATED.value(), "Success", workoutTrackerService.tracker(files));
    }

    @PostMapping("/save-tracker")
    public ResponseData<?> saveTracker(@RequestPart("workoutTrackerDTO") @Valid String requestDTOJson,
                                       @RequestPart(value = "files", required = false) List<MultipartFile> files) throws IOException {
        ObjectMapper objectMapper = new ObjectMapper();
        WorkoutTrackerRequestDTO dto = objectMapper.readValue(requestDTOJson, WorkoutTrackerRequestDTO.class);
        return new ResponseData<>(HttpStatus.CREATED.value(), "Success", workoutTrackerService.saveTracker(files,dto));
    }

    @GetMapping("/history")
    public ResponseData<?> getWorkoutHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Page<WorkoutTrackerDocument> historyPage = workoutTrackerService.getWorkoutHistory(page, size);
        return new ResponseData<>(HttpStatus.OK.value(), "Success", historyPage);
    }
}
