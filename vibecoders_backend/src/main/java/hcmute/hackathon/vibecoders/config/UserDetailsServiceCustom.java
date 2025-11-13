package hcmute.hackathon.vibecoders.config;


import hcmute.hackathon.vibecoders.entity.CustomUserDetail;
import hcmute.hackathon.vibecoders.entity.User;
import hcmute.hackathon.vibecoders.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;

import java.util.Collections;

@Component
@RequiredArgsConstructor
public class UserDetailsServiceCustom implements UserDetailsService {
    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User userModel = userRepository.getUserByEmail(email);

        if (userModel == null) {
            System.out.println("User not found");
            throw new UsernameNotFoundException("User not found");
        }
        SimpleGrantedAuthority authority = new SimpleGrantedAuthority(userModel.getRole().toString());
        return new CustomUserDetail(
                userModel.getEmail(),
                userModel.getPassword(),
                Collections.singletonList(authority),
                userModel.getFullName()
        );
    }
}
