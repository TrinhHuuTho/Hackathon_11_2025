package hcmute.hackathon.vibecoders.dto.request;

import hcmute.hackathon.vibecoders.entity.FlashCard;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WholeFlashCardRequest {
    List<FlashCardRequest> flashCards;
}
