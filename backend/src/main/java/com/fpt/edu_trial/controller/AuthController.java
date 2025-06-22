package com.fpt.edu_trial.controller;


import com.fpt.edu_trial.dto.request.LoginRequest;
import com.fpt.edu_trial.dto.request.OtpVerificationRequest;
import com.fpt.edu_trial.dto.request.RegistrationRequest;
import com.fpt.edu_trial.dto.response.ApiResponse;
import com.fpt.edu_trial.dto.response.AuthResponse;
import com.fpt.edu_trial.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse> registerUser(@Valid @RequestBody RegistrationRequest registrationRequest) {
        log.info("Yêu cầu đăng ký cho email: {}", registrationRequest.getEmail());
        String message = authService.registerUser(registrationRequest);
        return ResponseEntity.status(HttpStatus.CREATED) // 201 Created
                .body(new ApiResponse(true, message));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse> verifyOtp(@Valid @RequestBody OtpVerificationRequest otpVerificationRequest) {
        log.info("Yêu cầu xác thực OTP cho email: {}", otpVerificationRequest.getEmail());
        String message = authService.verifyOtp(otpVerificationRequest);
        return ResponseEntity.ok(new ApiResponse(true, message));
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<ApiResponse> resendOtp(@RequestParam @Email String email) {
        // Thêm validation cho email ở đây nếu cần, ví dụ: @Email
        log.info("Yêu cầu gửi lại OTP cho email: {}", email);
        String message = authService.resendOtp(email);
        return ResponseEntity.ok(new ApiResponse(true, message));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> loginUser(@Valid @RequestBody LoginRequest loginRequest) {
        log.info("Yêu cầu đăng nhập cho email: {}", loginRequest.getEmail());
        AuthResponse authResponse = authService.loginUser(loginRequest);
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/logout")
    @PreAuthorize("isAuthenticated()") // Yêu cầu người dùng phải đăng nhập để đăng xuất
    public ResponseEntity<ApiResponse> logoutUser(HttpServletRequest request) {
        String userEmail = request.getUserPrincipal() != null ? request.getUserPrincipal().getName() : "N/A";
        log.info("Yêu cầu đăng xuất từ người dùng: {}", userEmail);

        // === Phần tùy chọn: Token Blacklisting ===
        // Nếu bạn muốn triển khai blacklisting:
        // 1. Lấy token từ header Authorization
        // String headerAuth = request.getHeader("Authorization");
        // if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
        //     String token = headerAuth.substring(7);
        //     try {
        //         // authService.blacklistToken(token); // Hoặc gọi tokenBlacklistService.blacklist(token);
        //         log.info("Token cho người dùng {} đã được thêm vào danh sách đen (nếu có).", userEmail);
        //     } catch (Exception e) {
        //         log.error("Lỗi khi thêm token vào danh sách đen cho người dùng {}: {}", userEmail, e.getMessage());
        //         // Không nên ném lỗi ra client chỉ vì blacklisting thất bại, nhưng cần log lại
        //     }
        // }
        // === Kết thúc phần Token Blacklisting ===

        // SecurityContextHolder.clearContext(); // Không thực sự cần thiết cho JWT stateless nếu client xóa token

        return ResponseEntity.ok(new ApiResponse(true, "Đăng xuất thành công. Vui lòng xóa token ở phía client."));
    }

}