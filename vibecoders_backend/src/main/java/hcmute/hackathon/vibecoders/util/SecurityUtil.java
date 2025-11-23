package hcmute.hackathon.vibecoders.util;


import hcmute.hackathon.vibecoders.entity.CustomUserDetail;
import hcmute.hackathon.vibecoders.util.Enum.Role;
import lombok.RequiredArgsConstructor;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class SecurityUtil {
    public static MacAlgorithm JWT_ALGORITHM = MacAlgorithm.HS512;
    private final JwtEncoder jwtEncoder;
    private final long JWR_EXPIRATION_ACCESSTOKEN = 10 * 60;
    private final long JWR_EXPIRATION_REFRESHTOKEN = 7 * 24 * 60 * 60;


    public String createToken(Authentication authentication) {
        Instant now = Instant.now();
        Instant validity = Instant.now().plus(JWR_EXPIRATION_ACCESSTOKEN, ChronoUnit.SECONDS);

        var role = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());
        CustomUserDetail currentUserDetail = (CustomUserDetail) authentication.getPrincipal();

        JwtClaimsSet claims = JwtClaimsSet.builder().
                issuedAt(now).
                expiresAt(validity).
                claim("roles", role).
                claim("fullName", currentUserDetail.getFullName()).
                claim("email", currentUserDetail.getUsername()).
                subject(authentication.getName())
                .build();
        JwsHeader jwsHeader = JwsHeader.with(JWT_ALGORITHM).build();
        return jwtEncoder.encode(JwtEncoderParameters.from(jwsHeader, claims)).getTokenValue();
    }

    public String createAccessTokenForOauth(Role role, String fullName, String email) {
        Instant now = Instant.now();
        Instant validity = now.plus(JWR_EXPIRATION_ACCESSTOKEN, ChronoUnit.SECONDS);
        JwtClaimsSet claims = JwtClaimsSet.builder().
                issuedAt(now).
                expiresAt(validity).
                claim("roles", List.of(role)).
                claim("fullName", fullName).
                claim("email", email).
                subject(email)
                .build();
        JwsHeader jwsHeader = JwsHeader.with(JWT_ALGORITHM).build();
        return jwtEncoder.encode(JwtEncoderParameters.from(jwsHeader, claims)).getTokenValue();
    }

    public String createRefreshToken(Authentication authentication) {
        Instant now = Instant.now();
        Instant validity = now.plus(JWR_EXPIRATION_REFRESHTOKEN, ChronoUnit.SECONDS);
        var role = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuedAt(now)
                .expiresAt(validity)
                .claim("role_of_user", role)
                .claim("roles", "REFRESH_TOKEN")
                .subject(authentication.getName())
                .build();

        JwsHeader jwsHeader = JwsHeader.with(JWT_ALGORITHM).build();
        return jwtEncoder.encode(JwtEncoderParameters.from(jwsHeader, claims)).getTokenValue();
    }

    public String createRefreshTokenOauth(Role role, String email) {
        Instant now = Instant.now();
        Instant validity = now.plus(JWR_EXPIRATION_REFRESHTOKEN, ChronoUnit.SECONDS);
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuedAt(now)
                .expiresAt(validity)
                .claim("role_of_user", List.of(role))
                .claim("roles", "REFRESH_TOKEN")
                .subject(email)
                .build();
        JwsHeader jwsHeader = JwsHeader.with(JWT_ALGORITHM).build();
        return jwtEncoder.encode(JwtEncoderParameters.from(jwsHeader, claims)).getTokenValue();
    }

    public String createResetPasswordToken(String email) {
        Instant now = Instant.now();
        Instant validity = now.plus(JWR_EXPIRATION_REFRESHTOKEN, ChronoUnit.SECONDS);
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuedAt(now)
                .expiresAt(validity)
                .claim("roles", "REFRESH_PASSWORD_TOKEN")
                .subject(email)
                .build();
        JwsHeader jwsHeader = JwsHeader.with(JWT_ALGORITHM).build();
        return jwtEncoder.encode(JwtEncoderParameters.from(jwsHeader, claims)).getTokenValue();
    }

}
