package hcmute.hackathon.vibecoders.controller;

import hcmute.hackathon.vibecoders.dto.response.ResponseData;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/summary")
@RequiredArgsConstructor
public class SummaryController {
//    @PostMapping("/tracker")
//    public ResponseData<?> tracker(@RequestPart(value = "files", required = false) List<MultipartFile> files) throws IOException {
//        return new ResponseData<>(HttpStatus.CREATED.value(), "Success", workoutTrackerService.tracker(files));
//    }
}
