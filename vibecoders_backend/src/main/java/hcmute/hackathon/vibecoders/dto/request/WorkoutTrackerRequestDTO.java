package hcmute.hackathon.vibecoders.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkoutTrackerRequestDTO {
    private Double score;
    private String comment;
    private String note;
}
