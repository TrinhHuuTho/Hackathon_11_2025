package hcmute.hackathon.vibecoders.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WHNoteRequestDTO {
    private String id;
    private String title;
    private String content;
    private LocalDateTime createdAt;
    private boolean addCalendar;
}
