package hcmute.hackathon.vibecoders.service.impl;
import hcmute.hackathon.vibecoders.entity.Event;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;
    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendSimpleMessage(String to, String subject, String text) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);

            mailSender.send(message);
        } catch (Exception e) {
            // Ghi log hoặc xử lý lỗi
            throw new RuntimeException("Lỗi khi gửi email: " + e.getMessage());
        }
    }
    public void sendEventReminderEmail(Event event) throws MessagingException {
        Context context = new Context();

        context.setVariable("event", event);
        context.setVariable("appLink", "http://localhost:3000/calendar");

        DateTimeFormatter formatter = DateTimeFormatter
                .ofPattern("EEEE, dd/MM/yyyy - HH:mm", new Locale("vi", "VN"));
        String formattedTime = event.getEventDateTime().format(formatter);
        context.setVariable("formattedDateTime", formattedTime);

        String htmlBody = templateEngine.process("email-reminder", context);

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        try {
            helper.setFrom(fromEmail);
            helper.setTo(event.getEmail());
            helper.setSubject("Nhắc nhở: " + event.getTitle());
            helper.setText(htmlBody, true);

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new MessagingException("Lỗi khi gửi email HTML: " + e.getMessage());
        }
    }
    public void sendHtmlMessage(String to, String subject, String htmlBody) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();

        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        try {
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);

            helper.setText(htmlBody, true);

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new MessagingException("Lỗi khi gửi email HTML: " + e.getMessage());
        }
    }
}