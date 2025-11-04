package hcmute.hackathon.vibecoders.entity;

import lombok.Getter;
import lombok.Setter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;

import java.util.Collection;

@Getter
@Setter
public class CustomUserDetail extends User {
    private String fullName;

    public CustomUserDetail(String username, String password, Collection<? extends GrantedAuthority> authorities, String fullName) {
        super(username, password, authorities);
        this.fullName = fullName;
    }
}
