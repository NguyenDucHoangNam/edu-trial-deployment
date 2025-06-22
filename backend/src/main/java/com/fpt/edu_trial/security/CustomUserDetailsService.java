package com.fpt.edu_trial.security;

import com.fpt.edu_trial.entity.Role;
import com.fpt.edu_trial.entity.User;
import com.fpt.edu_trial.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.Collections;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository; // Inject UserRepository của bạn

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UsernameNotFoundException("User not found with email: " + email));

        Role userRole = user.getRole();
        if (userRole == null || userRole.getName() == null || userRole.getName().trim().isEmpty()) {
            log.error("User {} has no role or an invalid role assigned.", email);
            throw new UsernameNotFoundException("User " + email + " has no valid role assigned.");
        }

        Collection<? extends GrantedAuthority> authorities = Collections.singletonList(
                new SimpleGrantedAuthority("ROLE_" + userRole.getName().toUpperCase())
        );

        // Nếu bạn muốn tích hợp cả Permissions từ Role entity:
        // Set<GrantedAuthority> authorities = new HashSet<>();
        // authorities.add(new SimpleGrantedAuthority("ROLE_" + userRole.getName().toUpperCase()));
        // if (userRole.getPermissions() != null) {
        //     userRole.getPermissions().forEach(permission -> {
        //         if (permission.getName() != null && !permission.getName().trim().isEmpty()) {
        //             authorities.add(new SimpleGrantedAuthority(permission.getName().toUpperCase())); // Không cần ROLE_ cho permissions nếu dùng hasAuthority()
        //         }
        //     });
        // }


        // Trả về đối tượng UserDetails của Spring Security
        // Lưu ý trường 'enabled' của bạn là Boolean, cần xử lý null-safe
        boolean isEnabled = user.getEnabled() != null && user.getEnabled();

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(), // Username là email
                user.getPassword(),
                isEnabled,
                true, // accountNonExpired (bạn có thể thêm trường này vào entity User nếu cần)
                true, // credentialsNonExpired (bạn có thể thêm trường này vào entity User nếu cần)
                true, // accountNonLocked (bạn có thể thêm trường này vào entity User nếu cần)
                authorities
        );
    }
}
