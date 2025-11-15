package hcmute.hackathon.vibecoders.controller;

import hcmute.hackathon.vibecoders.dto.request.PersonalRequest;
import hcmute.hackathon.vibecoders.dto.request.RegisterRequest;
import hcmute.hackathon.vibecoders.dto.response.ResponseData;
import hcmute.hackathon.vibecoders.entity.User;
import hcmute.hackathon.vibecoders.exception.CustomException;
import hcmute.hackathon.vibecoders.repository.UserRepository;
import hcmute.hackathon.vibecoders.service.impl.UserServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserServiceImpl userService;
    private final UserRepository userRepository;

    @PostMapping("/onboarding")
    public ResponseData<?> onboardingUser(@RequestBody PersonalRequest request){
        User.Personal personal = User.Personal.builder()
                .numberOfYears(request.getNumberOfYears())
                .major(request.getMajor())
                .favoriteTopics(request.getFavoriteTopics())
                .personalTopics(request.getInterestedTopics())
                .build();

        User user = userService.getCurrentUser();
        user.setPersonal(personal);
        user.setOnboarding(true);

        var savedUser = userRepository.save(user);

        return ResponseData.builder()
                .data(Boolean.TRUE)
                .build();

    }
}
