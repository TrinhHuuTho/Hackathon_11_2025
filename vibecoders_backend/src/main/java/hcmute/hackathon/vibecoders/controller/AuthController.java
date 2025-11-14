package hcmute.hackathon.vibecoders.controller;


import hcmute.hackathon.vibecoders.dto.request.LoginRequestDto;
import hcmute.hackathon.vibecoders.dto.request.SignupRequestDto;
import hcmute.hackathon.vibecoders.dto.response.ResponseData;
import hcmute.hackathon.vibecoders.service.IAuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@Validated
@Slf4j
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {
    private final IAuthService authService;

    @PostMapping("/login")
    public ResponseData<?> login(@Valid @RequestBody LoginRequestDto loginDTO) {
        return new ResponseData<>(HttpStatus.CREATED.value(), "Đăng nhập thành công", authService.login(loginDTO));

    }


    @PostMapping("/signup")
    public ResponseData<?> signup(@Valid @RequestBody SignupRequestDto signupDTO) {
        boolean isRegistered = authService.register(signupDTO);
        if (isRegistered) {
            return new ResponseData<>(HttpStatus.CREATED.value(), "Đăng ký thành công");
        } else {
            return new ResponseData<>(HttpStatus.BAD_REQUEST.value(), "Đăng ký không thành công");
        }
    }


    @PostMapping("/refresh")
    public ResponseData<?> refreshToken(@RequestHeader("Authorization") String authHeader) {
        String newAccessToken = authService.createNewAccessToken(authHeader);
        return new ResponseData<>(HttpStatus.CREATED.value(), "New access token", newAccessToken);
    }

    @GetMapping("/profile")
    public ResponseData<?> getProfile(@RequestHeader("Authorization") String authHeader) {
        return new ResponseData<>(HttpStatus.CREATED.value(), "UserDTO", authService.getProfile(authHeader));
    }


}
