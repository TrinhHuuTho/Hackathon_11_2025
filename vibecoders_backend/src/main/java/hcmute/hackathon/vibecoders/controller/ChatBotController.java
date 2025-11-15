package hcmute.hackathon.vibecoders.controller;

import hcmute.hackathon.vibecoders.dto.request.UserChatRequest;
import hcmute.hackathon.vibecoders.dto.response.ChatResponseDTO;
import hcmute.hackathon.vibecoders.dto.response.ResponseData;
import hcmute.hackathon.vibecoders.entity.Event;
import hcmute.hackathon.vibecoders.service.impl.ChatBotService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Validated
@Slf4j
@RequiredArgsConstructor
@RequestMapping("/api/chatbot")
public class ChatBotController {
    private final ChatBotService chatBotService;
    @PostMapping
    public ResponseData<ChatResponseDTO> handleChat(@RequestBody UserChatRequest userRequest) {
        ChatResponseDTO response = chatBotService.getChatBotResponse(userRequest);
        return new ResponseData<>(HttpStatus.CREATED.value(),"Success",response);
    }
}
