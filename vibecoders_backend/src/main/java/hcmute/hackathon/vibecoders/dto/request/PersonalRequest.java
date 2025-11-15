package hcmute.hackathon.vibecoders.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PersonalRequest {
    int numberOfYears;
    String major;
    List<String> favoriteTopics;
    List<String> interestedTopics;
}
