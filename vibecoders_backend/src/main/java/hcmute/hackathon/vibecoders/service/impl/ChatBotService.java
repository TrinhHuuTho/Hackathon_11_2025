package hcmute.hackathon.vibecoders.service.impl;

import hcmute.hackathon.vibecoders.dto.request.ChatConfig;
import hcmute.hackathon.vibecoders.dto.request.PythonChatRequest;
import hcmute.hackathon.vibecoders.dto.request.RetrievalConfig;
import hcmute.hackathon.vibecoders.dto.request.UserChatRequest;
import hcmute.hackathon.vibecoders.dto.response.ChatResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class ChatBotService {
    private final WebClient webClient;
    public ChatResponseDTO getChatBotResponse(UserChatRequest userRequest) {
        Jwt principal = (Jwt) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String email = principal.getClaim("sub").toString();

        PythonChatRequest pythonRequest = PythonChatRequest.builder()
                .query(userRequest.getQuery())
                .conversationId(userRequest.getConversationId() != null ? userRequest.getConversationId() : "")
                .build();

        String pythonUrl = "http://localhost:8006/chat";
        ChatResponseDTO response = webClient.post()
                .uri(pythonUrl)
                .bodyValue(pythonRequest)
                .retrieve()
                .bodyToMono(ChatResponseDTO.class)
                .block();

        return response;
    }
}
