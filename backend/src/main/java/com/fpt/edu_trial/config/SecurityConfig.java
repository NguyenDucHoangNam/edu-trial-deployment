package com.fpt.edu_trial.config;

// Import cho OAuth2 Google login (nếu bạn tích hợp)
// import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
// import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
// import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
// import org.springframework.security.oauth2.core.user.OAuth2User;

import com.fpt.edu_trial.security.CustomAccessDeniedHandler;
import com.fpt.edu_trial.security.CustomUserDetailsService;
import com.fpt.edu_trial.security.jwt.JwtAuthenticationEntryPoint;
import com.fpt.edu_trial.security.jwt.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity // Bật tính năng bảo mật web của Spring Security
@EnableMethodSecurity(securedEnabled = true, jsr250Enabled = true) // Bật bảo mật ở mức phương thức
@RequiredArgsConstructor // Lombok annotation để tự động tạo constructor cho các final fields
public class SecurityConfig {

    private final CustomUserDetailsService customUserDetailsService;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final CustomAccessDeniedHandler customAccessDeniedHandler; // Bạn cần tạo class này

    public static final String ROLE_USER = "USER";
    public static final String ROLE_UNIVERSITY = "UNIVERSITY";
    public static final String ROLE_STAFF = "STAFF";
    public static final String ROLE_ADMIN = "ADMIN";

    private static final String[] PUBLIC_URLS = {
            "/api/v1/auth/**",
            "/v3/api-docs/**",
            "/swagger-ui/**",
            "/swagger-resources/**",
            "/webjars/**",
            "/api/v1/universities/public/**",
            "/api/v1/trial-programs/public/**",
            "/api/v1/university-events/public/**",
            "/api/v1/university-student-life-images/public/**",
            "/api/v1/trial-programs/public/**",
            "/api/v1/documents/public/**",
            "/api/v1/admission-scores/public/**",
            "/api/v1/trial-programs/public/**",
            "/api/v1/chapters/public/**",
            "/api/v1/lessons/public/**",
            "/api/v1/consultations/**",
            "/api/v1/faculties/**"
    };

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .exceptionHandling(exceptionHandling -> exceptionHandling
                        .authenticationEntryPoint(jwtAuthenticationEntryPoint)
                        .accessDeniedHandler(customAccessDeniedHandler)
                )
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authorizeHttpRequests(auth -> auth
//                        .requestMatchers(PUBLIC_URLS).permitAll()
//
//                        .requestMatchers("/api/v1/auth/logout").authenticated()
//                        .requestMatchers("/api/v1/users/**").authenticated()
//
//                        .requestMatchers("/api/universities/private/**").hasRole(ROLE_UNIVERSITY)
//
//                        .requestMatchers("/api/staff/**").hasRole(ROLE_STAFF)
//
//                        .requestMatchers("/api/admin/**").hasRole(ROLE_ADMIN)
//
//                        .anyRequest().authenticated()

                        .anyRequest().permitAll()

                )
                // .oauth2Login(oauth2 -> oauth2
                //         .userInfoEndpoint(userInfo -> userInfo
                //                 .userService(oAuth2UserService()) // Custom OAuth2UserService
                //         )
                //         .successHandler((request, response, authentication) -> {
                //             // Xử lý sau khi đăng nhập Google thành công, ví dụ tạo JWT token
                //             // CustomOAuth2User oAuth2User = (CustomOAuth2User) authentication.getPrincipal();
                //             // String jwt = jwtTokenProvider.generateTokenFromOAuth2User(oAuth2User);
                //             // response.sendRedirect("/some-redirect-url?token=" + jwt);
                //         })
                //         .failureHandler((request, response, exception) -> {
                //             // Xử lý khi đăng nhập Google thất bại
                //             // response.sendRedirect("/login?error=" + exception.getMessage());
                //         })
                // )
                .authenticationProvider(authenticationProvider()) // Cung cấp trình xác thực tùy chỉnh
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class); // Thêm JWT filter

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(customUserDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(
                "http://localhost:3000", // Giữ lại để bạn vẫn có thể chạy local dev
                "http://localhost"      // Thêm vào cho môi trường Docker
        ));        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("authorization", "content-type", "x-auth-token", "Authorization"));
        configuration.setExposedHeaders(List.of("x-auth-token", "Authorization"));
        configuration.setAllowCredentials(true); // Cho phép gửi cookie và thông tin xác thực
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration); // Áp dụng cho tất cả các path
        return source;
    }

    // Bean cho OAuth2 Google Login (nếu bạn tích hợp)
    // @Bean
    // public OAuth2UserService<OAuth2UserRequest, OAuth2User> oAuth2UserService() {
    //     // DefaultOAuth2UserService delegate = new DefaultOAuth2UserService();
    //     // return (userRequest) -> {
    //     //     OAuth2User oAuth2User = delegate.loadUser(userRequest);
    //     //     // Xử lý thông tin người dùng từ Google, ví dụ: lưu vào DB nếu chưa có, tạo CustomOAuth2User
    //     //     // return new CustomOAuth2User(oAuth2User, userRequest.getClientRegistration().getRegistrationId());
    //     //     return oAuth2User; // Tạm thời trả về user gốc
    //     // };
    //     return new DefaultOAuth2UserService(); // Hoặc custom implementation của bạn
    // }
}
