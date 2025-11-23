package hcmute.hackathon.vibecoders.config;

import com.nimbusds.jose.jwk.source.ImmutableSecret;
import com.nimbusds.jose.util.Base64;
import hcmute.hackathon.vibecoders.util.SecurityUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.oauth2.jwt.*;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

@Configuration
@EnableMethodSecurity(securedEnabled = true)
@Slf4j
public class JwtConfig {
    @Value("${JWT_SECRET_KEY}")
    private String jwtSecretKey;

    private SecretKey getSecretKey() {
        byte[] keyBytes = Base64.from(jwtSecretKey).decode();
        return new SecretKeySpec(keyBytes, 0, keyBytes.length, SecurityUtil.JWT_ALGORITHM.getName());
    }

    @Bean
    public JwtEncoder jwtEncoder() {
        return new NimbusJwtEncoder(new ImmutableSecret<>(getSecretKey()));
    }

    @Bean
    public JwtDecoder jwtDecoder() {
        NimbusJwtDecoder jwtDecoder = NimbusJwtDecoder.
                withSecretKey(getSecretKey()).
                macAlgorithm(SecurityUtil.JWT_ALGORITHM).
                build();
        return token -> {
            try {
                return jwtDecoder.decode(token);
            } catch (Exception e) {
                return null;
            }
        };
    }

    public Jwt decodeToken(String token) {
        NimbusJwtDecoder jwtDecoder = NimbusJwtDecoder.
                withSecretKey(getSecretKey()).
                macAlgorithm(SecurityUtil.JWT_ALGORITHM).
                build();
        return jwtDecoder.decode(token);
    }


}
