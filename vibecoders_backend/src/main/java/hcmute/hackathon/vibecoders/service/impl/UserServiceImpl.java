package hcmute.hackathon.vibecoders.service.impl;

import hcmute.hackathon.vibecoders.dto.request.SignupRequestDto;
import hcmute.hackathon.vibecoders.entity.User;
import hcmute.hackathon.vibecoders.repository.UserRepository;
import hcmute.hackathon.vibecoders.service.IUserService;
import hcmute.hackathon.vibecoders.util.Enum.Role;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.text.MessageFormat;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements IUserService {
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    public String registerUser(SignupRequestDto signupRequestDto) {
        User userModel = User.builder()
                .fullName(signupRequestDto.getFullName())
                .isActive(true)
                .email(signupRequestDto.getEmail())
                .password(signupRequestDto.getPassword())
                .role(Role.USER)
                .build();

        String hashedPassword = passwordEncoder.encode(userModel.getPassword());
        userModel.setPassword(hashedPassword);
        userModel.setActive(true);
        userRepository.save(userModel);

        String result = MessageFormat.format("Add {0}-{1} successfully", userModel.getId(), userModel.getRole().toString());
        log.info(result);
        return result;
    }
}
