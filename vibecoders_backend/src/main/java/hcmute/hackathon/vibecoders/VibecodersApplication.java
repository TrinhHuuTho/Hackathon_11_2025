package hcmute.hackathon.vibecoders;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class VibecodersApplication {

	public static void main(String[] args) {
		SpringApplication.run(VibecodersApplication.class, args);
	}

}
