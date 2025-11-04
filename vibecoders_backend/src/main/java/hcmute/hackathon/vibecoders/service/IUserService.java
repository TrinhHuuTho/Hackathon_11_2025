package hcmute.hackathon.vibecoders.service;


import hcmute.hackathon.vibecoders.dto.request.SignupRequestDto;

public interface IUserService {
    String registerUser(SignupRequestDto request);
}
