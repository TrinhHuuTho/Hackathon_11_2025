package hcmute.hackathon.vibecoders.service.impl;

import hcmute.hackathon.vibecoders.config.JwtConfig;
import hcmute.hackathon.vibecoders.dto.UserDto;
import hcmute.hackathon.vibecoders.dto.request.LoginRequestDto;
import hcmute.hackathon.vibecoders.dto.request.SignupRequestDto;
import hcmute.hackathon.vibecoders.dto.response.LoginResponseDto;
import hcmute.hackathon.vibecoders.entity.CustomUserDetail;
import hcmute.hackathon.vibecoders.entity.User;
import hcmute.hackathon.vibecoders.exception.CustomException;
import hcmute.hackathon.vibecoders.repository.UserRepository;
import hcmute.hackathon.vibecoders.service.IAuthService;
import hcmute.hackathon.vibecoders.service.IUserService;
import hcmute.hackathon.vibecoders.util.Enum.Role;
import hcmute.hackathon.vibecoders.util.SecurityUtil;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements IAuthService {

    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManagerBuilder authenticationManagerBuilder;
    private final SecurityUtil securityUtil;
    private final JwtConfig jwtConfig;
    private final UserRepository userRepository;

    @Override
    public boolean register(SignupRequestDto signupRequestDto) {
        User user = userRepository.findByEmail(signupRequestDto.getEmail())
                .orElse(new User());

        if (user.getId() != null) {
            throw new CustomException("Email is already in use", HttpStatus.BAD_REQUEST);
        }

        user.setFullName(signupRequestDto.getFullName());
        user.setEmail(signupRequestDto.getEmail());
        user.setPassword(passwordEncoder.encode(signupRequestDto.getPassword()));
        user.setRole(Role.USER);
        userRepository.save(user);

        return true;
    }

    @Override
    public String createNewAccessToken(String refreshToken) {
        if (refreshToken == null || !refreshToken.startsWith("Bearer ")) {
            throw new CustomException("Unauthorized token", HttpStatus.UNAUTHORIZED);
        }
        String rawRefreshToken = refreshToken.substring(7);

        Jwt decodedToken = jwtConfig.decodeToken(rawRefreshToken);
        String email = decodedToken.getSubject();
        List<String> roles = decodedToken.getClaim("role_of_user");
        Collection<GrantedAuthority> authorities = roles.stream()
                .map(role -> role)
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toList());

        CustomUserDetail userDetail = new CustomUserDetail(email, "", authorities, "");
        Authentication authentication = new UsernamePasswordAuthenticationToken(userDetail, null, authorities);

        return securityUtil.createToken(authentication);
    }

    @Override
    public LoginResponseDto login(LoginRequestDto loginDTO) {
        UsernamePasswordAuthenticationToken authenticationToken =
                new UsernamePasswordAuthenticationToken(loginDTO.getEmail(), loginDTO.getPassword());
        Authentication authentication = authenticationManagerBuilder.getObject().authenticate(authenticationToken);

        String accessToken = securityUtil.createToken(authentication);
        String refreshToken = securityUtil.createRefreshToken(authentication);

        User user = userRepository.findByEmail(loginDTO.getEmail())
                .orElseThrow(()->new CustomException("Cant Find User",HttpStatus.BAD_REQUEST));
        UserDto userDto = UserDto.builder().userId(user.getId()).userName(user.getFullName()).email(user.getEmail()).build();
        return new LoginResponseDto(accessToken, refreshToken,userDto);

    }

    @Override
    public UserDto getProfile(String accessToken) {
        String token = accessToken.replace("Bearer ", "");
        var jwt = jwtConfig.decodeToken(token);
        String email = jwt.getClaim("email");
        User user = userRepository.findByEmail(email)
                .orElseThrow(()->new CustomException("Cant Find User",HttpStatus.BAD_REQUEST));
        return UserDto.builder().userId(user.getId()).userName(user.getFullName()).email(user.getEmail())
                .onboarding(user.isOnboarding())
                .build();
    }
}
