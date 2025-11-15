package hcmute.hackathon.vibecoders.dto.request;

import hcmute.hackathon.vibecoders.entity.Event;
import hcmute.hackathon.vibecoders.entity.WHNote;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class PythonAnalysisRequest {
    private String userEmail;
    private WHNote newNote;
    private List<Event> allEventsInMonth;
}