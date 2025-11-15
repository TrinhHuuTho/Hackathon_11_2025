package hcmute.hackathon.vibecoders.config;

import com.cloudinary.Cloudinary;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class CloudinaryConfig {
    @Value("${cloudinary.cloud-name}")
    private String name;
    @Value("${cloudinary.cloud-name}")
    private String secret;
    @Value("${cloudinary.cloud-name}")
    private String key;

    @Bean
    public Cloudinary cloudinary() {
        Map<String, String> config = new HashMap<>();
        config.put("cloud_name", name);
        config.put("api_key", secret);
        config.put("api_secret", key);
        return new Cloudinary(config);
    }
}
