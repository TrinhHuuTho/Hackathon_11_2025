package hcmute.hackathon.vibecoders.service;

import hcmute.hackathon.vibecoders.dto.request.RegisterRequest;
import hcmute.hackathon.vibecoders.dto.response.UserResponse;
import hcmute.hackathon.vibecoders.entity.User;
import hcmute.hackathon.vibecoders.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    public UserResponse registerUser(RegisterRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElse(null);
        if (user!=null)
            throw new RuntimeException("user exists");

        user = User.builder()
                .username(request.getUsername())
                .password(request.getPassword())
                .build();
        User savedUser = userRepository.save(user);
        return UserResponse.builder()
                .name(savedUser.getUsername())
                .build();
    }
}
