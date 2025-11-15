package hcmute.hackathon.vibecoders.service.impl;
import hcmute.hackathon.vibecoders.entity.Event;
import hcmute.hackathon.vibecoders.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final EventRepository eventRepository;

    private final EmailServiceImpl emailService;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");


    @Scheduled(cron = "0 * * * * ?")
    public void sendScheduledEventReminders() {
        LocalDateTime now = LocalDateTime.now();
        System.out.println("Kiểm tra lịch nhắc lúc: " + now);

        List<Event> eventsToSend = eventRepository
                .findByEventDateTimeBeforeAndNotificationSentIsFalse(now);

        if (eventsToSend.isEmpty()) {
            return;
        }

        System.out.println("Tìm thấy " + eventsToSend.size() + " event cần gửi.");

        for (Event event : eventsToSend) {
            try {

                emailService.sendEventReminderEmail(event);

                event.setNotificationSent(true);
                eventRepository.save(event);

                System.out.println("Đã gửi cho: " + event.getTitle());

            } catch (Exception e) {
                System.err.println("Lỗi khi gửi mail cho event ID " + event.getId() + ": " + e.getMessage());

            }
        }
    }
}