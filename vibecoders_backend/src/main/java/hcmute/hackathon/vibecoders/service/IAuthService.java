package hcmute.hackathon.vibecoders.service;


import hcmute.hackathon.vibecoders.dto.UserDto;
import hcmute.hackathon.vibecoders.dto.request.LoginRequestDto;
import hcmute.hackathon.vibecoders.dto.request.SignupRequestDto;
import hcmute.hackathon.vibecoders.dto.response.LoginResponseDto;

public interface IAuthService {
    boolean register(SignupRequestDto signupRequestDto);

    String createNewAccessToken(String refreshToken);

    LoginResponseDto login(LoginRequestDto loginRequestDto);
    UserDto getProfile(String accessToken);
}
