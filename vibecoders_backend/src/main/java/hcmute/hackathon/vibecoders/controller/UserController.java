package hcmute.hackathon.vibecoders.controller;

import hcmute.hackathon.vibecoders.dto.request.RegisterRequest;
import hcmute.hackathon.vibecoders.dto.response.ApiResponse;
import hcmute.hackathon.vibecoders.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @PostMapping("/register")
    ApiResponse<?> register(@RequestBody RegisterRequest registerRequest) {
        return ApiResponse.builder()
                .data(userService.registerUser(registerRequest))
                .message("User registered successfully")
                .build();
    }
}
